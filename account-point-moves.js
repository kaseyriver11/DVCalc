// Contract screen sheets. The API records a move already made with Disney.
let pointMove = null;
function pointMoveHTML() {
  return `<div class="modal-overlay" id="point-move-modal"><section class="modal-box balance-setup-box" role="dialog" aria-modal="true" aria-labelledby="point-move-title">
    <div class="modal-header"><h3 id="point-move-title"></h3><button class="modal-close" id="point-move-close" aria-label="Close" onclick="closePointMove()">&times;</button></div>
    <p id="point-move-contract"></p><p class="balance-setup-intro">Already completed this with Disney? Record it here to update both years. This does not move points with Disney.</p>
    <p class="balance-card-hint">Use balances from before the move. If your balances already include it, choose Adjust balance instead.</p>
    <p class="point-move-deadline" id="point-move-deadline" role="note" hidden></p>
    <label class="balance-total" for="point-move-amount"><input id="point-move-amount" type="number" min="1" step="1" inputmode="numeric" placeholder="0" oninput="renderPointMovePreview()"><span>points to record</span></label>
    <div id="point-move-preview" aria-live="polite"></div>
    <p id="point-move-error" role="alert" hidden></p>
    <div class="balance-setup-actions"><button class="save-btn" id="point-move-save" onclick="savePointMove()">Record move</button><button class="cancel-btn" id="point-move-cancel" onclick="closePointMove()">Cancel</button></div>
  </section></div>`;
}
function pointMoveStorageKey(contractId, year, kind) {
  const owner = window.DVCAuth.getSession()?.user?.id;
  return `dvc-point-move:${owner}:${contractId}:${year}:${kind}`;
}
function openPointMove(kind, year) {
  const contract = balanceSetupContracts.find(c => c.id === activeWalletCardId);
  if (!contract) return;
  pointMove = { contract, kind, year, busy: false, rows: balanceSetupRows[contract.id] || [] };
  pointMove.storageKey = pointMoveStorageKey(contract.id, year, kind);
  try {
    const pending = JSON.parse(sessionStorage.getItem(pointMove.storageKey) || 'null');
    if (pending?.p_contract === contract.id && pending.p_kind === kind && pending.p_year === year) {
      pointMove.payload = pending;
      pointMove.rows = [pending.p_expected_from, pending.p_expected_to];
    }
  } catch (_) { /* Storage errors are shown before any write is attempted. */ }
  document.getElementById('point-move-title').textContent = kind === 'bank' ? 'Record banking' : 'Record borrowing';
  document.getElementById('point-move-contract').textContent = contract.nickname || resortName(contract.home_resort_id);
  // Disney won't bank after the deadline. Recording a move made before it is
  // still valid, so this warns rather than blocks.
  const deadlineNote = document.getElementById('point-move-deadline');
  const bankingClosed = kind === 'bank' && !isBankingWindowOpen(contract.use_year, year, todayInEastern());
  deadlineNote.hidden = !bankingClosed;
  if (bankingClosed) deadlineNote.textContent = `The banking deadline for ${year} points was ${formatDeadlineDate(window.DVCDates.deadlineForCycle(contract.use_year, year))}. Only record this if you banked with Disney before then.`;
  const input = document.getElementById('point-move-amount');
  input.value = pointMove.payload?.p_points || '';
  input.disabled = !!pointMove.payload;
  document.getElementById('point-move-error').hidden = true;
  document.getElementById('point-move-modal').classList.add('open');
  renderPointMovePreview();
  document.getElementById('point-move-close').focus();
}
function renderPointMovePreview() {
  if (!pointMove) return;
  const { kind, year, rows, contract, payload } = pointMove;
  const input = document.getElementById('point-move-amount');
  const preview = DVCPointMoves.preview(kind, year, input.value, rows);
  const container = document.getElementById('point-move-preview');
  container.replaceChildren();
  const save = document.getElementById('point-move-save');
  save.disabled = !!preview.error;
  save.textContent = payload ? 'Retry this save' : kind === 'bank' ? 'Record banking' : 'Record borrowing';
  document.getElementById('point-move-cancel').textContent = payload ? 'Close for now' : 'Cancel';
  if (preview.error) {
    const note = document.createElement('p');
    note.className = 'balance-card-hint';
    note.textContent = preview.error;
    container.append(note);
    if (preview.missing) {
      const add = document.createElement('button');
      add.className = 'cancel-btn';
      add.textContent = 'Add missing balances';
      add.onclick = () => {
        document.getElementById('point-move-modal').classList.remove('open');
        pointMove = null;
        openBalanceSetup(contract.id, year, false, [year, year + 1]);
      };
      container.append(add);
    }
    return;
  }
  for (const [before, after, label] of [[preview.from, preview.afterFrom, 'From'], [preview.to, preview.afterTo, 'To']]) {
    const y = before.use_year_label;
    const card = document.createElement('div');
    card.className = 'balance-year-card point-move-card';
    const range = `${formatDeadlineDate(dateOnlyUTC(y, USE_YEAR_START_MONTH[contract.use_year], 1))} – ${formatDeadlineDate(useYearExpiration(contract.use_year, y))}`;
    card.innerHTML = `<strong>${label} ${y} use year</strong><p class="balance-card-hint">${range}</p><div class="point-move-numbers">${DVCPointMoves.total(before)} <span aria-label="becomes">→</span> ${DVCPointMoves.total(after)} <small>points left</small></div><p class="balance-card-hint">${label === 'From' ? `${before.points_remaining} → ${after.points_remaining} current points` : `${before[preview.bucket]} → ${after[preview.bucket]} ${kind === 'bank' ? 'banked' : 'borrowed'} points`}</p>`;
    container.append(card);
  }
  if (payload) {
    const note = document.createElement('p');
    note.className = 'balance-card-hint';
    note.textContent = 'This may already be saved. Retry to confirm the result without moving points twice. Closing does not undo a saved move.';
    container.append(note);
  }
}
async function savePointMove() {
  if (!pointMove || pointMove.busy) return;
  const move = pointMove;
  const error = document.getElementById('point-move-error');
  error.hidden = true;
  const preview = DVCPointMoves.preview(move.kind, move.year, document.getElementById('point-move-amount').value, move.rows);
  if (preview.error) return;
  move.payload ||= { p_id: crypto.randomUUID(), p_contract: move.contract.id, p_kind: move.kind, p_year: move.year, p_points: preview.points, p_expected_from: preview.from, p_expected_to: preview.to };
  try {
    // Persist the retry key before sending. A lost response must not create a new move.
    sessionStorage.setItem(move.storageKey, JSON.stringify(move.payload));
  } catch (_) {
    move.payload = null;
    error.textContent = 'This browser cannot keep a safe retry reference. Allow session storage and try again. Nothing was sent.';
    error.hidden = false;
    return;
  }
  move.busy = true;
  document.querySelectorAll('#point-move-modal button, #point-move-modal input').forEach(el => el.disabled = true);
  document.getElementById('point-move-save').textContent = 'Saving both years…';
  let success = false;
  try {
    const result = await window.DVCAuth.recordPointMovement(move.payload);
    if (result.error) {
      // These server rejections happen before writes; refresh is required.
      if (/Balances changed|Add both year balances|Not enough current|Contract not found|Invalid point movement/.test(result.error)) {
        sessionStorage.removeItem(move.storageKey);
        move.payload = null;
      }
      throw new Error(result.error);
    }
    sessionStorage.removeItem(move.storageKey);
    success = true;
  } catch (e) {
    error.textContent = `${e.message || 'Could not confirm the save.'}${move.payload ? ' Your entries are kept. Retry this save to confirm the result.' : ''}`;
    error.hidden = false;
  } finally {
    move.busy = false;
    document.querySelectorAll('#point-move-modal button').forEach(el => el.disabled = false);
    document.getElementById('point-move-amount').disabled = !!move.payload;
    renderPointMovePreview();
  }
  if (success) {
    await closePointMove();
    const status = document.querySelector(`[data-status-for="${move.contract.id}"]`);
    if (status) { status.setAttribute('role', 'status'); status.textContent = `${preview.points} points ${move.kind === 'bank' ? 'banked' : 'borrowed'} recorded. Both years updated.`; }
  }
}
async function closePointMove() {
  if (pointMove?.busy) return;
  document.getElementById('point-move-modal').classList.remove('open');
  pointMove = null;
  await renderSignedIn();
  document.querySelector('[data-point-action]')?.focus();
}
document.addEventListener('keydown', e => {
  const modal = document.getElementById('point-move-modal');
  if (!modal?.classList.contains('open')) return;
  if (e.key === 'Escape') { e.preventDefault(); closePointMove(); }
  if (e.key !== 'Tab') return;
  const items = [...modal.querySelectorAll('button,input')].filter(el => !el.disabled && el.getClientRects().length);
  if (!items.length) { e.preventDefault(); return; }
  if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1).focus(); }
  else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus(); }
});
