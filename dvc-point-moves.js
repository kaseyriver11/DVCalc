// Pure previews. Saving uses one atomic database operation for both years.
(function () {
  const keys = ['points_remaining', 'points_banked', 'points_borrowed', 'points_holding'];
  const total = row => keys.reduce((sum, key) => sum + (row[key] || 0), 0);
  function preview(kind, year, amount, rows) {
    if (!['bank', 'borrow'].includes(kind)) return { error: 'Choose banking or borrowing.' };
    const fromYear = kind === 'bank' ? year : year + 1;
    const toYear = kind === 'bank' ? year + 1 : year;
    const from = rows.find(r => r.use_year_label === fromYear);
    const to = rows.find(r => r.use_year_label === toYear);
    if (!from?.balance_confirmed_at || !to?.balance_confirmed_at) return { error: 'Add both year balances before recording a move.', missing: [fromYear, toYear].filter(y => !rows.find(r => r.use_year_label === y)?.balance_confirmed_at) };
    const points = Number(amount);
    if (!Number.isSafeInteger(points) || points <= 0 || points > 2147483647) return { error: 'Enter a positive whole number of points.' };
    if (points > from.points_remaining) return { error: `Only ${from.points_remaining} current points are available in ${fromYear}. Banked, borrowed and holding points cannot move again.` };
    const bucket = kind === 'bank' ? 'points_banked' : 'points_borrowed';
    if (to[bucket] + points > 2147483647) return { error: 'The resulting balance is too large.' };
    return { fromYear, toYear, points, bucket, from, to, afterFrom: { ...from, points_remaining: from.points_remaining - points }, afterTo: { ...to, [bucket]: to[bucket] + points } };
  }
  const api = { preview, total };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.DVCPointMoves = api;
})();
