// Renting points out: is a stay worth more than renting its points, and
// what renting brings in. Pure; plain <script> exposing window.DVCRental,
// also require()-able by Node for tests.
//
// The rental price per point is the rental kind of dvc-point-value.js
// ($20 default), never the $30 value per point: that one measures points
// against Disney's cash price, this one is what another member pays.
(function () {
  // Within this many $/pt of the rental price, neither choice clearly wins.
  const CLOSE_CALL_PER_POINT = 1;

  // cashValue: Disney's cash price for the stay. points: its point cost.
  // rentalRate: $/pt the owner could rent those points for.
  // verdict: "use" (the stay beats renting), "rent" (renting the points out
  // and paying cash comes out ahead) or "close". null without cash data.
  function useOrRent({ cashValue, points, rentalRate }) {
    if (!(cashValue > 0) || !(points > 0) || !(rentalRate > 0)) return null;
    const stayPerPoint = cashValue / points;
    const rentalIncome = points * rentalRate;
    const diffPerPoint = stayPerPoint - rentalRate;
    const verdict = Math.abs(diffPerPoint) < CLOSE_CALL_PER_POINT ? "close" : diffPerPoint > 0 ? "use" : "rent";
    return { stayPerPoint, rentalRate, rentalIncome, verdict, rentAdvantage: Math.max(0, rentalIncome - cashValue) };
  }

  // Spending points on something with a cash price (a cruise, a Disney
  // hotel, any booking): what each point bought. cashFees are paid in cash
  // on top of the points (a cruise's per-booking exchange fee), so they
  // come off the value the points delivered.
  function spendValue({ cashPrice, points, cashFees = 0 }) {
    if (!(cashPrice > 0) || !(points > 0)) return null;
    const netValue = Math.max(0, cashPrice - Math.max(0, cashFees || 0));
    return { netValue, perPoint: netValue / points };
  }

  // Whole points to rent out at rentalRate to cover `dues` dollars.
  function pointsToCoverDues(dues, rentalRate) {
    if (!(dues > 0) || !(rentalRate > 0)) return 0;
    return Math.ceil(dues / rentalRate - 1e-9);
  }

  const api = { CLOSE_CALL_PER_POINT, useOrRent, spendValue, pointsToCoverDues };
  if (typeof window !== "undefined") window.DVCRental = api;
  if (typeof module !== "undefined") module.exports = api;
})();
