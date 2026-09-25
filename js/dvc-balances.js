// The owner enters what is left, not a reconstruction of past transactions.
(function () {
  function fromTotal(raw, parts) {
    const keys = ['points_banked', 'points_borrowed', 'points_holding'];
    const buckets = Object.fromEntries(keys.map(k => [k, parts[k] === '' || parts[k] == null ? 0 : Number(parts[k])]));
    if (Object.values(buckets).some(n => !Number.isSafeInteger(n) || n < 0)) return { error: 'Use zero or a positive whole number for each point amount.' };
    if (raw === '' || raw == null) return Object.values(buckets).some(n => n > 0)
      ? { error: 'Enter the total points left, including these extra points, or clear the details to skip this year.' }
      : { skipped: true };
    const total = Number(raw);
    if (!Number.isSafeInteger(total) || total < 0) return { error: 'Enter zero or a positive whole number of points left.' };
    const extra = Object.values(buckets).reduce((a,b) => a+b,0);
    if (extra > total) return { error: 'These details are part of your total. They cannot exceed the points left.' };
    return { row: { points_remaining: total-extra, ...buckets } };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { fromTotal };
  else window.DVCBalances = { fromTotal };
})();
