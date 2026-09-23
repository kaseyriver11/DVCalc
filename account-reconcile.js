// "Reconcile with Disney" sheet on My Contracts (Prompt 2). The owner reads
// their points on Disney's member site and enters them here; DVC Companion
// compares, then marks the use year checked or saves a correction with a
// reason through reconcile_points (migration 025). Nothing here talks to
// Disney. Same retry pattern as account-point-moves.js: the payload (with
// its retry key) is kept in sessionStorage before sending, so a lost
// response can be retried without a second correction.
let reconcile = null;

function reconcileHTML() {
  return `<div class="modal-overlay" id="reconcile-modal"><section class="modal-box balance-setup-box reconcile-box" role="dialog" aria-modal="true" aria-labelledby="reconcile-title">
    <div class="modal-header"><h3 id="reconcile-title">Reconcile with Disney</h3><button type="button" class="modal-close" id="reconcile-close" aria-label="Close" onclick="closeReconcile()">&times;</button></div>
    <p class="reconcile-contract" id="reconcile-contract"></p>
    <p class="balance-setup-intro">Open Disney's member site and enter the points it shows for this use year. This only updates DVC Companion.</p>
    <p class="reconcile-notice" id="reconcile-notice" role="status" hidden></p>
    <div class="reconcile-fields" id="reconcile-fields"></div>
    <div id="reconcile-diff" aria-live="polite"></div>
    <fieldset class="reconcile-reason" id="reconcile-reason" hidden>
      <legend>Why is it different?</legend>
      <div class="reconcile-reason-chips">${DVCReconcile.REASONS.map(([k, label]) => `<label><input type="radio" name="reconcile-reason" value="${k}" onchange="renderReconcile()"><span>${label}</span></label>`).join("")}</div>
      <label class="reconcile-notes-label" for="reconcile-notes">Notes (optional)</label>
      <textarea id="reconcile-notes" rows="2" maxlength="500"></textarea>
    </fieldset>
    <p class="reconcile-error" id="reconcile-error" role="alert" hidden></p>
    <div class="balance-setup-actions"><button type="button" class="save-btn" id="reconcile-save" onclick="saveReconcile()">Save</button><button type="button" class="cancel-btn" id="reconcile-cancel" onclick="closeReconcile()">Cancel</button></div>
  </section></div>`;
}

function reconcileStorageKey(contractId, year) {
  return `dvc-reconcile:${window.DVCAuth.getSession()?.user?.id}:${contractId}:${year}`;
}

// The ledger row exactly as read -- the conflict check compares against it.
function reconcileRawRow(contractId, year) {
  return (balanceSetupRows[contractId] || []).find(r => Number(r.use_year_label) === year) || null;
}
function reconcileExpected(row) {
  return row ? { updated_at: row.updated_at, points_remaining: row.points_remaining, points_banked: row.points_banked, points_borrowed: row.points_borrowed, points_holding: row.points_holding, balance_confirmed_at: row.balance_confirmed_at } : null; // a copy, never the live row
}

// entered: optional raw values to restore (after a conflict reload).
function openReconcile(year, { entered = null, notice = null } = {}) {
  const contract = balanceSetupContracts.find(c => c.id === activeWalletCardId);
  if (!contract) return;
  const row = reconcileRawRow(contract.id, year);
  // Snapshot the row now: the conflict check must compare against the
  // balance as this sheet showed it, not whatever that object holds later.
  const expected = reconcileExpected(row);
  reconcile = { contract, year, expected, recorded: DVCReconcile.recordedBuckets(expected), busy: false, storageKey: reconcileStorageKey(contract.id, year) };
  try {
    const pending = JSON.parse(sessionStorage.getItem(reconcile.storageKey) || "null");
    if (pending?.p_contract === contract.id && pending.p_year === year) reconcile.payload = pending;
  } catch (_) { /* storage problems surface on save */ }
  const range = `${formatDeadlineDate(dateOnlyUTC(year, USE_YEAR_START_MONTH[contract.use_year], 1))} – ${formatDeadlineDate(useYearExpiration(contract.use_year, year))}`;
  document.getElementById("reconcile-contract").innerHTML = `<strong>${contract.nickname || resortName(contract.home_resort_id)}</strong> &middot; ${year} use year<br><span>${range}</span>`;
  const values = reconcile.payload ? reconcile.payload.p_after : entered || {};
  document.getElementById("reconcile-fields").innerHTML = DVCReconcile.BUCKETS.map(([k, label]) => `
    <label class="reconcile-field" for="reconcile-${k}">
      <span class="reconcile-field-label">${label}</span>
      <input id="reconcile-${k}" data-bucket="${k}" type="number" min="0" step="1" inputmode="numeric" placeholder="0" value="${values[k] ?? ""}" oninput="renderReconcile()" ${reconcile.payload ? "disabled" : ""}>
      <span class="reconcile-field-recorded">${reconcile.recorded ? `Recorded here: ${reconcile.recorded[k].toLocaleString()}` : "Not recorded here"}</span>
    </label>`).join("");
  const reason = reconcile.payload?.p_reason;
  document.querySelectorAll('input[name="reconcile-reason"]').forEach(r => { r.checked = r.value === reason; r.disabled = !!reconcile.payload; });
  document.getElementById("reconcile-notes").value = reconcile.payload?.p_notes || "";
  const noticeEl = document.getElementById("reconcile-notice");
  noticeEl.hidden = !notice;
  noticeEl.textContent = notice || "";
  document.getElementById("reconcile-error").hidden = true;
  document.getElementById("reconcile-modal").classList.add("open");
  renderReconcile();
  document.getElementById("reconcile-close").focus();
}

function readReconcileEntry() {
  return Object.fromEntries(DVCReconcile.BUCKETS.map(([k]) => [k, document.getElementById("reconcile-" + k).value]));
}

function renderReconcile() {
  if (!reconcile) return;
  const parsed = DVCReconcile.parseEntry(readReconcileEntry());
  const diffEl = document.getElementById("reconcile-diff");
  const save = document.getElementById("reconcile-save");
  const reasonBox = document.getElementById("reconcile-reason");
  document.getElementById("reconcile-cancel").textContent = reconcile.payload ? "Close for now" : "Cancel";
  if (parsed.error) {
    diffEl.innerHTML = `<p class="balance-card-hint">${parsed.error}</p>`;
    reasonBox.hidden = true;
    save.disabled = true;
    save.textContent = reconcile.payload ? "Retry this save" : "Save";
    return;
  }
  const diff = DVCReconcile.difference(reconcile.recorded, parsed.values);
  reconcile.diff = diff;
  const sign = n => n > 0 ? `+${n}` : String(n);
  diffEl.innerHTML = diff.matched
    ? `<div class="reconcile-match">Matches what's recorded here &mdash; ${diff.totalAfter.toLocaleString()} points.</div>`
    : `<div class="reconcile-diff-card">
        ${diff.unknownBefore ? `<p class="balance-card-hint">No balance is recorded here yet. Saving sets it to ${diff.totalAfter.toLocaleString()} points.</p>` : ""}
        ${diff.rows.filter(r => diff.unknownBefore || r.delta).map(r => `<div class="reconcile-diff-row"><span>${r.label}</span><span>${r.before == null ? "&mdash;" : r.before.toLocaleString()} &rarr; <strong>${r.after.toLocaleString()}</strong>${r.delta ? ` <em class="${r.delta > 0 ? "up" : "down"}">${sign(r.delta)}</em>` : ""}</span></div>`).join("")}
        <div class="reconcile-diff-row total"><span>Total</span><span>${diff.totalBefore == null ? "&mdash;" : diff.totalBefore.toLocaleString()} &rarr; <strong>${diff.totalAfter.toLocaleString()}</strong>${diff.totalDelta ? ` <em class="${diff.totalDelta > 0 ? "up" : "down"}">${sign(diff.totalDelta)}</em>` : ""}</span></div>
      </div>`;
  reasonBox.hidden = diff.matched;
  const reason = document.querySelector('input[name="reconcile-reason"]:checked')?.value;
  save.disabled = !!DVCReconcile.saveProblem(diff, reason);
  save.textContent = reconcile.payload ? "Retry this save" : diff.matched ? "Mark as checked" : "Save correction";
}

async function saveReconcile() {
  if (!reconcile || reconcile.busy) return;
  const r = reconcile;
  const errorEl = document.getElementById("reconcile-error");
  errorEl.hidden = true;
  const parsed = DVCReconcile.parseEntry(readReconcileEntry());
  if (parsed.error) return;
  const diff = DVCReconcile.difference(r.recorded, parsed.values);
  const reason = document.querySelector('input[name="reconcile-reason"]:checked')?.value || null;
  if (DVCReconcile.saveProblem(diff, reason)) return;
  r.payload ||= {
    p_id: crypto.randomUUID(), p_contract: r.contract.id, p_year: r.year, p_expected: r.expected,
    p_after: parsed.values, p_reason: diff.matched ? null : reason, p_notes: document.getElementById("reconcile-notes").value.trim() || null,
  };
  try {
    // Keep the retry key before sending; a lost response must not create a second correction.
    sessionStorage.setItem(r.storageKey, JSON.stringify(r.payload));
  } catch (_) {
    r.payload = null;
    errorEl.textContent = "This browser can't keep a safe retry reference. Allow session storage and try again. Nothing was sent.";
    errorEl.hidden = false;
    return;
  }
  r.busy = true;
  document.querySelectorAll("#reconcile-modal button, #reconcile-modal input, #reconcile-modal textarea").forEach(el => el.disabled = true);
  document.getElementById("reconcile-save").textContent = "Saving…";
  let success = false, conflict = false;
  try {
    const result = await window.DVCAuth.reconcilePoints(r.payload);
    if (result.error) {
      // Rejected before any write: the retry key is spent, fix and resend.
      if (/Balances changed|Choose why|Enter whole|Contract not found|Invalid reconciliation/.test(result.error)) {
        sessionStorage.removeItem(r.storageKey);
        conflict = /Balances changed/.test(result.error);
        r.payload = null;
      }
      throw new Error(result.error);
    }
    sessionStorage.removeItem(r.storageKey);
    success = true;
  } catch (e) {
    if (!conflict) {
      errorEl.textContent = `${e.message || "Couldn't confirm the save."}${r.payload ? " Your entries are kept and nothing new is recorded yet. Retry this save to confirm the result." : ""}`;
      errorEl.hidden = false;
    }
  } finally {
    r.busy = false;
    document.querySelectorAll("#reconcile-modal button, #reconcile-modal textarea").forEach(el => el.disabled = false);
    document.querySelectorAll("#reconcile-modal input").forEach(el => el.disabled = !!r.payload);
    if (!conflict) renderReconcile();
  }
  if (conflict) {
    // A booking deduction, point move or other edit landed while the sheet
    // was open. Reload, then show the new difference against what the owner
    // already typed -- never overwrite the newer balance silently.
    const entered = parsed.values;
    document.getElementById("reconcile-modal").classList.remove("open");
    reconcile = null;
    await renderSignedIn();
    openReconcile(r.year, { entered, notice: "This balance changed since you opened it (for example a booking or point move). Review the new difference, then save again." });
    return;
  }
  if (success) {
    await closeReconcile();
    const status = document.querySelector(`[data-status-for="${r.contract.id}"]`);
    if (status) { status.setAttribute("role", "status"); status.textContent = diff.matched ? `${r.year} marked as checked against Disney.` : `${r.year} updated to match Disney.`; }
  }
}

async function closeReconcile() {
  if (reconcile?.busy) return;
  document.getElementById("reconcile-modal")?.classList.remove("open");
  reconcile = null;
  await renderSignedIn();
  document.querySelector("[data-reconcile]")?.focus();
}

document.addEventListener("keydown", e => {
  const modal = document.getElementById("reconcile-modal");
  if (!modal?.classList.contains("open")) return;
  if (e.key === "Escape") { e.preventDefault(); closeReconcile(); }
  if (e.key !== "Tab") return;
  const items = [...modal.querySelectorAll("button,input,textarea")].filter(el => !el.disabled && el.getClientRects().length);
  if (!items.length) { e.preventDefault(); return; }
  if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1).focus(); }
  else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus(); }
});
