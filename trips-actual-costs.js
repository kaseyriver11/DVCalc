// "My actual costs" on Membership Value (Prompt 6, migration 028). Uses
// trips.html's globals (contracts, trips, userSettings, fmt, contractLabel,
// resortArtCardStyle, renderSignedIn, contractCostBreakdown). Rules live in
// dvc-actual-costs.js (money, change sets) and dvc-owner-value.js (which
// figure is actual, published or projected).
//
// A blank field means "use the estimate"; 0 is an actual zero. A failed
// save keeps what was typed and leaves the page's saved figures untouched
// until a retry succeeds.
let costActuals = {};
let costsMissing = false;
let costsReadFailed = false;
let costEditor = null; // { contractId, drafts: {contractId: form}, busy }
let costsOpenedFromUrl = false;
let costsPageWired = false;

const AC = () => window.DVCActualCosts;
const costEsc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

async function loadOwnershipCosts() {
  const r = await window.DVCAuth.getOwnershipCosts();
  costActuals = AC().index(r.rows);
  costsMissing = r.missing;
  costsReadFailed = window.DVCAuth.readFailed("ownership_costs");
}

// "Actual costs entered for X of Y years; the rest are estimated" -- which
// payback inputs are the owner's own, which are public rates, which are
// assumptions.
function costSourceNoteHTML(stats) {
  const s = stats.costSources;
  if (!s || !stats.perContract.length) return "";
  const parts = [s.actualDuesYears
    ? `Actual dues entered for ${s.actualDuesYears} of ${plural(s.duesYears, "year")}; the rest use published rates.`
    : `Dues use published rates for all ${plural(s.duesYears, "year")} so far.`];
  if (s.closingActual && s.closingEstimated) parts.push(`Closing costs: actual for ${s.closingActual}, estimated for ${s.closingEstimated}.`);
  else if (s.closingEstimated) parts.push("Closing costs are estimated.");
  else if (s.closingActual) parts.push("Closing costs are your actual figures.");
  if (s.interestYears) parts.push(`Includes financing interest you entered for ${plural(s.interestYears, "year")}.`);
  if (s.estimatedPrices) parts.push(`Purchase price estimated for ${plural(s.estimatedPrices, "contract")} with none entered.`);
  if (s.estimatedStarts) parts.push(`Start year assumed for ${plural(s.estimatedStarts, "contract")} with no purchase date.`);
  parts.push("Future years use projected dues.");
  const first = stats.perContract.find(b => b.contract.is_active) || stats.perContract[0];
  return `<div class="cost-source-note" id="cost-source-note">
      <p>${parts.join(" ")}</p>
      ${costsReadFailed ? `<p class="cost-source-warn" role="alert">Couldn't load your actual costs, so estimates are shown. Nothing has been lost.</p>` : ""}
      ${costsMissing ? "" : `<button type="button" class="cost-edit-btn" data-edit-costs="${first.contract.id}">My actual costs</button>`}
    </div>`;
}

// ---- Per-contract cost card (Cost of Ownership) ----
function contractCostCardHTML(b) {
  const c = b.contract;
  const buyIn = b.price + b.closing;
  const total = b.totalToDate;
  const duesPct = total > 0 ? Math.round((b.duesTotal / total) * 100) : 0;
  const sources = [
    `Dues: ${b.actualDuesYears ? `${b.actualDuesYears} of ${plural(b.years.length, "year")} actual` : "published rates"}`,
    `Price: ${b.priceSource === "entered" ? "entered" : "estimated"}`,
    `Closing: ${b.closingSource === "actual" ? "actual" : "estimated"}`,
    b.interestTotal ? `Interest: ${fmt(b.interestTotal)} entered` : "",
  ].filter(Boolean).join(" &middot; ");
  const rows = b.years.slice().reverse().map(y => `<tr><td>${y.year}</td><td>${fmt(y.dues)}</td><td>${y.duesSource === "actual" ? "Actual" : `$${y.publishedRate.toFixed(2)}/pt`}</td></tr>`).join("");
  return `
    <div class="contract-cost-card payback-info-anchor" style="${resortArtCardStyle(c.home_resort_id)}">
      <div class="contract-cost-header">
        <div class="contract-cost-name">${contractLabel(c)}</div>
        <div class="contract-cost-owned-since">Owned since ${b.startYear}${b.startEstimated ? " (assumed: no purchase date)" : ""} &middot; ${plural(b.years.length, "yr")}</div>
      </div>
      <div class="cost-card-tiles">
        <div class="cost-card-tile">
          <div class="cost-card-tile-value">${fmt(b.duesTotal)}</div>
          <div class="cost-card-tile-label">Dues to Date
            <button type="button" class="payback-info-trigger" aria-label="Show dues by year" aria-expanded="false"><span class="payback-info-trigger-glyph">i</span></button></div>
        </div>
        <div class="cost-card-tile">
          <div class="cost-card-tile-value">${fmt(buyIn)}</div>
          <div class="cost-card-tile-label">Buy-In</div>
        </div>
        <div class="cost-card-tile net">
          <div class="cost-card-tile-value">${fmt(total)}</div>
          <div class="cost-card-tile-label">Total Spent</div>
        </div>
      </div>
      <div class="ledger-bar cost-card-bar">
        <div class="ledger-bar-seg cost-seg-dues" style="flex-grow:${b.duesTotal}"></div>
        <div class="ledger-bar-seg cost-seg-buyin" style="flex-grow:${buyIn + b.interestTotal}"></div>
      </div>
      <div class="cost-card-bar-legend">
        <span><i class="cost-legend-dot cost-seg-dues"></i>Dues (${duesPct}%)</span>
        <span><i class="cost-legend-dot cost-seg-buyin"></i>Buy-in${b.interestTotal ? " + interest" : ""} (${100 - duesPct}%)</span>
      </div>
      <div class="cost-card-sources">${sources}</div>
      ${costsMissing ? "" : `<button type="button" class="cost-edit-btn small" data-edit-costs="${c.id}">Edit my actual costs</button>`}
      <div class="payback-breakdown-card">
        <div class="payback-breakdown-header"><span>Dues by Year</span><button type="button" class="payback-breakdown-close" aria-label="Close">&times;</button></div>
        <div class="dues-breakdown-table-wrap">
          <table class="dues-breakdown-table">
            <thead><tr><th>Year</th><th>Dues</th><th>Source</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr><td>Total</td><td colspan="2">${fmt(b.duesTotal)}</td></tr></tfoot>
          </table>
        </div>
        <div class="payback-breakdown-footnote">Your actual dues where entered; otherwise that year's published per-point rate.</div>
      </div>
    </div>`;
}

// ---- Editor ----
function costsModalHTML() {
  return `<div class="modal-overlay" id="costs-modal">
      <div class="modal-box costs-box" role="dialog" aria-modal="true" aria-labelledby="costs-title">
        <div class="modal-header"><h3 id="costs-title">My actual costs</h3><button type="button" class="modal-close" id="costs-close" aria-label="Close">&times;</button></div>
        <div class="costs-chips" id="costs-contracts" role="group" aria-label="Contract"></div>
        <p class="costs-intro">Enter what you actually paid. Leave a field blank to use the estimate shown; enter 0 if you paid nothing.</p>
        <div id="costs-fields"></div>
        <p class="costs-error" id="costs-error" role="alert" hidden></p>
        <div class="form-actions"><button type="button" class="save-btn" id="costs-save">Save</button><button type="button" class="cancel-btn" id="costs-cancel">Cancel</button></div>
      </div>
    </div>`;
}

const savedText = cents => (cents == null ? "" : AC().centsText(cents));
function costFieldHTML(id, label, value, hint) {
  return `<label class="cost-field" for="${id}"><span class="cost-field-label">${label}</span>
      <span class="cost-field-input"><span aria-hidden="true">$</span><input id="${id}" type="text" inputmode="decimal" autocomplete="off" value="${costEsc(value)}"></span>
      <span class="cost-field-hint" id="${id}-hint">${hint}</span></label>`;
}

function renderCostFields() {
  const cid = costEditor.contractId;
  const c = contracts.find(x => x.id === cid);
  const saved = costActuals[cid] || { dues: {}, interest: {}, closing: null };
  const draft = costEditor.drafts[cid];
  const est = contractCostBreakdown(c, null); // the estimates, for the hints
  const value = (kind, year) => draft ? (kind === "closing" ? draft.closing : draft[kind][year]) ?? "" : savedText(kind === "closing" ? saved.closing : saved[kind][year]);
  const years = est.years.slice().reverse();
  const hasInterest = draft ? Object.values(draft.interest).some(v => String(v).trim() !== "") : Object.keys(saved.interest).length > 0;
  document.getElementById("costs-contracts").innerHTML = contracts.length > 1
    ? contracts.map(x => `<button type="button" class="cost-chip" data-cost-contract="${x.id}" aria-pressed="${x.id === cid}">${contractLabel(x)}</button>`).join("")
    : `<div class="costs-contract-name">${contractLabel(c)}</div>`;
  document.getElementById("costs-fields").innerHTML = `
    ${est.priceSource === "estimated" || est.startEstimated ? `<p class="costs-notice">${est.priceSource === "estimated" ? `No purchase price is entered, so ${fmt(est.price)} is estimated. ` : ""}${est.startEstimated ? `No purchase date is entered, so ownership is assumed to start in ${est.startYear}. ` : ""}<a href="account.html?contract=${encodeURIComponent(c.id)}">Add them on My Contracts</a>.</p>` : ""}
    <fieldset class="costs-group"><legend>Annual dues paid</legend>
      ${years.map(y => costFieldHTML(`cost-dues-${y.year}`, `${y.year} dues`, value("dues", y.year), `Published estimate: ${fmt(y.dues)} ($${y.publishedRate.toFixed(2)}/pt &times; ${c.points_per_year})`)).join("")}
    </fieldset>
    <fieldset class="costs-group"><legend>Closing costs (one time)</legend>
      ${costFieldHTML("cost-closing", "Closing costs", value("closing"), `Estimate: ${fmt(est.closing)} (${c.purchase_type === "resale" ? "typical resale closing" : "none for a direct purchase"})`)}
    </fieldset>
    <details class="costs-group costs-interest"${hasInterest ? " open" : ""}><summary>Financing interest (optional)</summary>
      <p class="cost-field-hint">Interest only. Your purchase price already counts the loan principal.</p>
      ${years.map(y => costFieldHTML(`cost-interest-${y.year}`, `${y.year} interest`, value("interest", y.year), "No estimate: counted only if you enter it")).join("")}
    </details>`;
}

function readCostForm() {
  const c = contracts.find(x => x.id === costEditor.contractId);
  const years = contractCostBreakdown(c, null).years.map(y => y.year);
  const val = id => document.getElementById(id)?.value ?? "";
  return {
    dues: Object.fromEntries(years.map(y => [y, val(`cost-dues-${y}`)])),
    interest: Object.fromEntries(years.map(y => [y, val(`cost-interest-${y}`)])),
    closing: val("cost-closing"),
  };
}

function openCostEditor(contractId) {
  if (!contracts.some(c => c.id === contractId)) return;
  costEditor = { contractId, drafts: {}, busy: false };
  document.getElementById("costs-error").hidden = true;
  renderCostFields();
  document.getElementById("costs-modal").classList.add("open");
  document.getElementById("costs-close").focus();
}
function closeCostEditor() {
  if (costEditor?.busy) return;
  costEditor = null;
  document.getElementById("costs-modal")?.classList.remove("open");
}

async function saveCostEditor() {
  if (!costEditor || costEditor.busy) return;
  const cid = costEditor.contractId;
  const form = readCostForm();
  costEditor.drafts[cid] = form;
  const { entries, errors } = AC().changes(costActuals[cid], form);
  const errorEl = document.getElementById("costs-error");
  document.querySelectorAll("#costs-fields input").forEach(i => i.removeAttribute("aria-invalid"));
  if (errors.length) {
    for (const e of errors) document.getElementById(e.kind === "closing" ? "cost-closing" : `cost-${e.kind}-${e.year}`)?.setAttribute("aria-invalid", "true");
    errorEl.textContent = `${errors[0].message} Check the highlighted ${errors.length === 1 ? "field" : "fields"}.`;
    errorEl.hidden = false;
    return;
  }
  if (!entries.length) { closeCostEditor(); return; }
  const btn = document.getElementById("costs-save");
  costEditor.busy = true;
  btn.disabled = true;
  btn.textContent = "Saving…";
  let result;
  try {
    result = await window.DVCAuth.saveOwnershipCosts(cid, entries);
  } catch (e) {
    result = { error: e.message || "Couldn't reach the server." };
  } finally {
    costEditor.busy = false;
    btn.disabled = false;
    btn.textContent = "Save";
  }
  if (result.error) {
    // The page keeps showing the last saved figures; the form keeps the
    // new ones for a retry (setting a value twice is harmless).
    errorEl.textContent = `Couldn't save: ${result.error} Your entries are still here; tap Save to retry.`;
    errorEl.hidden = false;
    return;
  }
  costEditor = null;
  document.getElementById("costs-modal").classList.remove("open");
  renderSignedIn();
}

function wireCostEditor() {
  const modal = document.getElementById("costs-modal");
  if (!modal) return;
  document.getElementById("costs-save").addEventListener("click", saveCostEditor);
  document.getElementById("costs-cancel").addEventListener("click", closeCostEditor);
  document.getElementById("costs-close").addEventListener("click", closeCostEditor);
  modal.addEventListener("click", e => {
    if (e.target.id === "costs-modal") closeCostEditor();
    const chip = e.target.closest("[data-cost-contract]");
    if (chip && costEditor && !costEditor.busy) {
      costEditor.drafts[costEditor.contractId] = readCostForm();
      costEditor.contractId = chip.dataset.costContract;
      document.getElementById("costs-error").hidden = true;
      renderCostFields();
    }
  });
  modal.addEventListener("keydown", e => { if (e.key === "Escape") closeCostEditor(); });
  // "My actual costs" buttons (source note and each cost card). #page-content
  // outlives re-renders, so this is wired once.
  if (!costsPageWired) {
    costsPageWired = true;
    document.getElementById("page-content").addEventListener("click", e => {
      const b = e.target.closest("[data-edit-costs]");
      if (b) openCostEditor(b.dataset.editCosts);
    });
  }
  // Entry from a contract on My Contracts: trips.html?costs=<contract id>.
  const fromUrl = new URLSearchParams(location.search).get("costs");
  if (fromUrl && !costsOpenedFromUrl && !costsMissing) { costsOpenedFromUrl = true; openCostEditor(fromUrl); }
}
