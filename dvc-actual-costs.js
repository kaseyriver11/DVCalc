// Owner-entered actual ownership costs (Prompt 6, migration 028): money
// parsing, the saved-actuals index the value model reads, and the change
// set a save sends. Pure -- window.DVCActualCosts in the browser,
// require()-able for node --test.
//
// Money is handled in whole cents end to end: typed text -> integer cents
// -> "1234.50" strings to the database (numeric(12,2)) -> cents back. The
// value model divides by 100 only when adding into its dollar totals, so a
// saved actual never picks up binary-float drift.
(function () {
  const KINDS = ["dues", "closing", "interest"];

  // "1,234.5" / "$1234.56" / "0" -> { cents }; "" -> { blank: true } (use
  // the estimate); anything else -> { error }.
  function parseMoney(raw) {
    const s = String(raw ?? "").trim().replace(/[$,\s]/g, "");
    if (s === "") return { blank: true };
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return { error: "Enter dollars and cents, like 1234.56." };
    const [whole, frac = ""] = s.split(".");
    const cents = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
    if (!Number.isSafeInteger(cents) || cents > 1000000000) return { error: "That amount is more than $10,000,000." };
    return { cents };
  }
  // A database numeric ("1234.50" or 1234.5) -> integer cents, exactly.
  function toCents(value) {
    const r = parseMoney(String(value));
    return r.cents ?? 0;
  }
  const centsText = cents => `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
  const empty = () => ({ dues: {}, interest: {}, closing: null });

  // ownership_costs rows -> { [contractId]: { dues: {year: cents},
  // interest: {year: cents}, closing: cents | null } }.
  function index(rows) {
    const out = {};
    for (const r of rows || []) {
      const a = out[r.contract_id] ||= empty();
      const cents = toCents(r.amount);
      if (r.kind === "closing") a.closing = cents;
      else if (r.kind === "dues" || r.kind === "interest") a[r.kind][r.year] = cents;
    }
    return out;
  }

  // The edits one contract's form makes against what's saved.
  //   form: { dues: {year: raw}, interest: {year: raw}, closing: raw }
  // Returns { entries: [{kind, year, amount}], errors: [{kind, year,
  // message}] }. amount is a "123.45" string, or null to remove an actual
  // (blank = go back to the estimate). Unchanged fields aren't sent.
  function changes(saved, form) {
    saved = saved || empty();
    const entries = [], errors = [];
    const consider = (kind, year, raw, before) => {
      const r = parseMoney(raw);
      if (r.error) { errors.push({ kind, year, message: r.error }); return; }
      const after = r.blank ? null : r.cents;
      if (after === (before ?? null)) return;
      entries.push({ kind, year, amount: after == null ? null : centsText(after) });
    };
    for (const kind of ["dues", "interest"]) {
      for (const [year, raw] of Object.entries(form[kind] || {})) consider(kind, Number(year), raw, saved[kind][year]);
    }
    if ("closing" in form) consider("closing", null, form.closing, saved.closing);
    return { entries, errors };
  }

  // Apply a successful save's entries to a saved index (for a caller that
  // doesn't re-read). Returns a new index.
  function applied(savedIndex, contractId, entries) {
    const next = JSON.parse(JSON.stringify(savedIndex || {}));
    const a = next[contractId] ||= empty();
    for (const e of entries) {
      const cents = e.amount == null ? null : toCents(e.amount);
      if (e.kind === "closing") a.closing = cents;
      else if (cents == null) delete a[e.kind][e.year];
      else a[e.kind][e.year] = cents;
    }
    return next;
  }

  const api = { KINDS, parseMoney, toCents, centsText, index, changes, applied };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCActualCosts = api;
})();
