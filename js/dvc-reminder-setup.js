// The reminder offer My Contracts shows once, right after an owner saves
// their first current or next use-year balance. It offers the three email
// reminders the app already sends (banking deadline, use-year expiration,
// Holding points), all opt-in, reading and writing the same profile
// columns Notification Settings uses. Pure, so node --test can check it
// (window.DVCReminderSetup in the browser).
(function () {
  const TYPES = [
    { key: "banking", column: "reminder_opt_in", label: "Banking deadline",
      line: "Before a banking deadline, if you've recorded current points you could bank." },
    { key: "expiration", column: "expiration_reminder_opt_in", label: "Use-year expiration",
      line: "Before a use year ends, if you've recorded points that can only be used now." },
    { key: "holding", column: "holding_reminder_opt_in", label: "Holding points",
      line: "Before a use year ends, if you've recorded Holding points." },
  ];

  // Only types whose column exists on this profile can be offered: the
  // expiration and Holding columns arrive with db/migrations/026, and a
  // control that can't save must not be shown. Each carries its saved
  // setting (never pre-checked beyond that).
  function options(profile) {
    if (!profile) return [];
    return TYPES.filter(t => t.column in profile).map(t => ({ ...t, checked: profile[t.column] === true }));
  }

  // pending: a first balance was just saved this visit. done: the owner
  // already saved or dismissed this offer. Nothing to offer once every
  // available reminder is already on.
  function shouldOffer({ profile, pending, done }) {
    if (!pending || done) return false;
    const opts = options(profile);
    return opts.length > 0 && opts.some(o => !o.checked);
  }

  // selections: { banking: bool, ... }. Writes only the opt-in columns this
  // profile has, and never touches lead times or any other setting.
  function patch(profile, selections) {
    const out = {};
    for (const o of options(profile)) out[o.column] = selections[o.key] === true;
    return out;
  }

  // True when this save is the owner's first current or next use-year
  // balance: before it, no active contract had one confirmed, and at least
  // one of the saved years is that contract's current or next use year.
  // rowsBefore: { contractId: rows } as they were before saving.
  // saved: [{ contractId, year }]. currentYear(contract) -> use-year label.
  function isFirstBalance(contracts, rowsBefore, saved, currentYear) {
    const nearYear = (contract, year) => { const cur = currentYear(contract); return year === cur || year === cur + 1; };
    const byId = new Map(contracts.map(c => [c.id, c]));
    const hadOne = contracts.filter(c => c.is_active).some(c =>
      (rowsBefore[c.id] || []).some(r => r.balance_confirmed_at && nearYear(c, Number(r.use_year_label))));
    if (hadOne) return false;
    return saved.some(s => byId.has(s.contractId) && nearYear(byId.get(s.contractId), Number(s.year)));
  }

  const doneKey = userId => `dvc_reminder_setup_done:${userId || "anon"}`;

  const api = { TYPES, options, shouldOffer, patch, isFirstBalance, doneKey };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCReminderSetup = api;
})();
