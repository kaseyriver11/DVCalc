// Shared trip attribution. Version 2 lives in trips.points_source_breakdown;
// earlier optional metadata is never treated as confirmed contract funding.
(function () {
  const outsideKeys = ["one_time", "transferred", "other"];
  function validate(total, funding, contracts) {
    const fail = error => ({ valid: false, error, owned: 0, outside: 0, share: 0 });
    if (!Number.isSafeInteger(total) || total <= 0) return fail("Enter a positive whole number of points used.");
    if (!funding || funding.version !== 2 || !Array.isArray(funding.allocations)) {
      return fail("Review this trip's point sources before counting it toward membership value.");
    }
    const known = new Set(contracts.map(c => c.id));
    const seen = new Set();
    let owned = 0, outside = 0;
    for (const row of funding.allocations) {
      if (!row || !known.has(row.contract_id)) return fail("Choose an owned contract for every allocation. A previously linked contract may have been removed.");
      if (seen.has(row.contract_id)) return fail("Each contract can appear only once.");
      if (!Number.isSafeInteger(row.points) || row.points <= 0) return fail("Enter a positive whole number of points for each selected contract.");
      seen.add(row.contract_id);
      owned += row.points;
    }
    for (const key of outsideKeys) {
      if (!Number.isSafeInteger(funding[key]) || funding[key] < 0) return fail("Outside points must be zero or a positive whole number.");
      outside += funding[key];
    }
    if (owned + outside !== total) return fail(`Assign exactly ${total} points across your contracts and outside sources (${owned + outside} assigned).`);
    return { valid: true, error: null, owned, outside, share: owned / total };
  }
  function summary(trip, contracts) {
    return validate(trip.points_used, trip.points_source_breakdown, contracts);
  }
  function credit(trip, cash, contracts) {
    const funding = summary(trip, contracts);
    if (!funding.valid || !Number.isFinite(cash) || cash < 0) return null;
    return {
      cash: cash * funding.share,
      totalCash: cash,
      ownedPoints: funding.owned,
      outsidePoints: funding.outside,
      share: funding.share,
      byContract: trip.points_source_breakdown.allocations.map(row => ({
        contract_id: row.contract_id, points: row.points, cash: cash * row.points / trip.points_used,
      })),
    };
  }
  const api = { validate, summary, credit };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCTripFunding = api;
})();
