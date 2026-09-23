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

  function nightsOf(checkIn, checkOut) {
    const nights = [];
    if (!checkOut || checkOut <= checkIn) return [checkIn];
    for (let ms = Date.parse(checkIn + "T00:00:00Z"); ms < Date.parse(checkOut + "T00:00:00Z"); ms += 86400000) {
      nights.push(new Date(ms).toISOString().slice(0, 10));
    }
    return nights;
  }

  // One contract's share of a stay, divided between the use years its
  // nights fall in -- each night is paid from the use year it belongs to,
  // same grouping as the calendar's stayYearGroups(). Split by each
  // cycle's chart points (nights when a chart value is missing), whole
  // points by largest remainder so the parts always sum to `points`.
  // Returns [{ label, points, nights }] in use-year order.
  function splitByUseYear({ points, useYear, checkIn, checkOut, nightPoints }) {
    const groups = new Map();
    const nights = nightsOf(checkIn, checkOut);
    const priced = nights.map(date => ({ date, pts: nightPoints ? nightPoints(date) : null }));
    const useChart = priced.every(n => Number.isFinite(n.pts) && n.pts > 0);
    for (const n of priced) {
      const label = useYearLabelFor(useYear, n.date);
      const g = groups.get(label) || { label, weight: 0, nights: 0 };
      g.weight += useChart ? n.pts : 1;
      g.nights += 1;
      groups.set(label, g);
    }
    const list = [...groups.values()].sort((a, b) => a.label - b.label);
    const totalWeight = list.reduce((s, g) => s + g.weight, 0);
    let assigned = 0;
    const parts = list.map(g => {
      const exact = points * g.weight / totalWeight;
      const whole = Math.floor(exact);
      assigned += whole;
      return { label: g.label, points: whole, nights: g.nights, frac: exact - whole };
    });
    [...parts].sort((a, b) => b.frac - a.frac || a.label - b.label).slice(0, points - assigned).forEach(p => { p.points += 1; });
    return parts.map(({ frac, ...p }) => p);
  }

  // status: "ready" (will deduct), "no-balance" (no confirmed balance for
  // that use year -- nothing to deduct from), "ended" (that use year is
  // over, so its points are gone either way), or "short" (not enough
  // recorded points; left alone rather than zeroing the row out).
  //
  // A stay crossing a contract's use-year boundary yields one entry per use
  // year (split: true). overrides["contractId|label"] replaces the automatic
  // split for that contract when the owner's amounts still add up to its
  // allocation; otherwise the automatic split stands (splitAdjusted: false).
  function planTripDeduction({ allocations, contracts, rows, checkIn, checkOut, today, nightPoints, overrides }) {
    if (!checkIn) return [];
    return (allocations || [])
      .filter(a => Number.isSafeInteger(a.points) && a.points > 0)
      .flatMap(a => {
        const contract = contracts.find(c => c.id === a.contract_id);
        if (!contract?.use_year) return [];
        let parts = splitByUseYear({ points: a.points, useYear: contract.use_year, checkIn, checkOut, nightPoints });
        const split = parts.length > 1;
        let splitAdjusted = false;
        if (split && overrides) {
          const owned = parts.map(p => overrides[contract.id + "|" + p.label]);
          if (owned.every(n => Number.isSafeInteger(n) && n >= 0) && owned.reduce((s, n) => s + n, 0) === a.points) {
            parts = parts.map((p, i) => ({ ...p, points: owned[i] }));
            splitAdjusted = true;
          }
        }
        return parts.filter(p => p.points > 0).map(p => {
          const base = { contract, contract_id: contract.id, label: p.label, points: p.points, nights: p.nights, split, splitAdjusted, contractPoints: a.points };
          if (useYearEndsOn(contract.use_year, p.label) < today) return { ...base, status: "ended" };
          const row = rows.find(r => r.contract_id === contract.id && r.use_year_label === p.label);
          if (!row || !row.balance_confirmed_at) return { ...base, status: "no-balance" };
          const result = drawPoints(bucketsOf(row), p.points);
          return { ...base, row, ...result, status: result.shortfall ? "short" : "ready" };
        });
      });
  }

  // Ledger rows as they'd be with a booking's current receipts put back --
  // what an edit is re-planned against, since saving the edit restores
  // those receipts before drawing again (save_trip_booking, migration 024).
  function rowsWithReceiptsRestored(rows, receipts) {
    return rows.map(r => {
      const mine = (receipts || []).filter(d => d.contract_id === r.contract_id && d.use_year_label === r.use_year_label);
      if (!mine.length) return r;
      const add = k => mine.reduce((s, d) => s + (d[k] || 0), 0);
      return {
        ...r,
        points_holding: (r.points_holding || 0) + add("points_holding"),
        points_banked: (r.points_banked || 0) + add("points_banked"),
        points_borrowed: (r.points_borrowed || 0) + add("points_borrowed"),
        points_remaining: (r.points_remaining || 0) + add("points_remaining"),
      };
    });
  }

  // The p_deductions payload for save_trip_booking: only "ready" entries.
  function deductionsPayload(plans) {
    return plans.filter(p => p.status === "ready").map(p => ({ contract_id: p.contract_id, use_year_label: p.label, points: p.points }));
  }

  // What a Disney cancellation today does to a booking's points, by days
  // before check-in (DVC On-Line Booking T&C; server applies the same rule
  // in delete_trip_booking): 31+ back to their use year, 1-30 Holding, 0 or
  // later forfeited.
  function cancellationEffect(checkIn, today) {
    const days = Math.round((Date.parse(checkIn + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / 86400000);
    return days >= 31 ? "restore" : days >= 1 ? "holding" : "forfeit";
  }

  function receiptTotal(d) {
    return (d.points_holding || 0) + (d.points_banked || 0) + (d.points_borrowed || 0) + (d.points_remaining || 0);
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

  // "20 banked + 19 current" for a stored receipt (trip_deductions row).
  function describeReceipt(d) {
    return describeDraw({ holding: d.points_holding || 0, banked: d.points_banked || 0, borrowed: d.points_borrowed || 0, remaining: d.points_remaining || 0 });
  }

  const api = { drawPoints, useYearLabelFor, useYearEndsOn, splitByUseYear, planTripDeduction, rowsWithReceiptsRestored,
    deductionsPayload, cancellationEffect, receiptTotal, describeReceipt, ledgerRowAfter, describeDraw };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCTripDeduct = api;
})();
