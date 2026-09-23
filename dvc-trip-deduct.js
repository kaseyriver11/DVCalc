// Turns a trip's contract point allocations into ledger withdrawals, so
// logging a booking can take its points out of contract_year_points instead
// of leaving the owner to mirror it by hand with "Adjust balance". Plain
// <script> exposing window.DVCTripDeduct, or a Node module for tests --
// same convention as dvc-trip-funding.js.
(function () {
  const DEFAULT_START_MONTH = { Feb: 2, Mar: 3, Apr: 4, Jun: 6, Aug: 8, Sep: 9, Oct: 10, Dec: 12 };
  const startMonths = () => (typeof window !== "undefined" && window.DVCDates?.USE_YEAR_START_MONTH) || DEFAULT_START_MONTH;

  // Least flexible bucket first: holding can't be banked or borrowed, banked
  // points expire with this use year and can't move again, borrowed points
  // are already committed, and current points are the only ones that could
  // still be banked forward. Same order as the calendar's Suggested draw.
  function drawPoints(row, need) {
    const drawHolding = Math.min(row.holding, need); need -= drawHolding;
    const drawBanked = Math.min(row.banked, need); need -= drawBanked;
    const drawBorrowed = Math.min(row.borrowed, need); need -= drawBorrowed;
    const drawRemaining = Math.min(row.remaining, need); need -= drawRemaining;
    return {
      draws: { holding: drawHolding, banked: drawBanked, borrowed: drawBorrowed, remaining: drawRemaining },
      shortfall: Math.max(0, need),
      after: {
        holding: row.holding - drawHolding,
        banked: row.banked - drawBanked,
        borrowed: row.borrowed - drawBorrowed,
        remaining: row.remaining - drawRemaining,
      },
    };
  }

  // Deposit-year label of the use-year cycle a YYYY-MM-DD date falls in --
  // a Sep 2026 check-in on a Dec contract draws from the "2025" cycle.
  function useYearLabelFor(useYear, dateStr) {
    const [year, month] = dateStr.split("-").map(Number);
    return month >= startMonths()[useYear] ? year : year - 1;
  }

  // A use year's last usable day, as YYYY-MM-DD.
  function useYearEndsOn(useYear, label) {
    const d = new Date(Date.UTC(label + 1, startMonths()[useYear] - 1, 0));
    return d.toISOString().slice(0, 10);
  }

  const bucketsOf = row => ({
    holding: row.points_holding || 0,
    banked: row.points_banked || 0,
    borrowed: row.points_borrowed || 0,
    remaining: row.points_remaining || 0,
  });

  // status: "ready" (will deduct), "no-balance" (no confirmed balance for
  // that use year -- nothing to deduct from), "ended" (that use year is
  // over, so its points are gone either way), or "short" (not enough
  // recorded points; left alone rather than zeroing the row out).
  function planTripDeduction({ allocations, contracts, rows, checkIn, today }) {
    if (!checkIn) return [];
    return (allocations || [])
      .filter(a => Number.isSafeInteger(a.points) && a.points > 0)
      .map(a => {
        const contract = contracts.find(c => c.id === a.contract_id);
        if (!contract?.use_year) return null;
        const label = useYearLabelFor(contract.use_year, checkIn);
        const base = { contract, contract_id: contract.id, label, points: a.points };
        if (useYearEndsOn(contract.use_year, label) < today) return { ...base, status: "ended" };
        const row = rows.find(r => r.contract_id === contract.id && r.use_year_label === label);
        if (!row || !row.balance_confirmed_at) return { ...base, status: "no-balance" };
        const result = drawPoints(bucketsOf(row), a.points);
        return { ...base, row, ...result, status: result.shortfall ? "short" : "ready" };
      })
      .filter(Boolean);
  }

  // The contract_year_points upsert for one "ready" plan entry.
  function ledgerRowAfter(plan, confirmedAt) {
    return {
      contract_id: plan.contract_id,
      use_year_label: plan.label,
      points_remaining: plan.after.remaining,
      points_banked: plan.after.banked,
      points_borrowed: plan.after.borrowed,
      points_holding: plan.after.holding,
      points_holding_entered_at: plan.after.holding > 0 ? plan.row.points_holding_entered_at || null : null,
      balance_confirmed_at: confirmedAt,
    };
  }

  // "20 banked + 19 current" -- which buckets a draw came out of.
  function describeDraw(draws) {
    const parts = [];
    if (draws.holding) parts.push(`${draws.holding} holding`);
    if (draws.banked) parts.push(`${draws.banked} banked`);
    if (draws.borrowed) parts.push(`${draws.borrowed} borrowed`);
    if (draws.remaining) parts.push(`${draws.remaining} current`);
    return parts.join(" + ");
  }

  const api = { drawPoints, useYearLabelFor, useYearEndsOn, planTripDeduction, ledgerRowAfter, describeDraw };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCTripDeduct = api;
})();
