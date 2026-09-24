// Selling a contract resale, and whether keeping it beats selling today.
// Pure; plain <script> exposing window.DVCResale, also require()-able by
// Node for tests. Contract Value prices end-of-plan resale with the same
// curve, so a deed is worth the same thing on both pages.
(function () {
  // Listing broker's cut of the sale price (brokers charge 6.9-10%, most
  // 9.5-10%) and Disney's estoppel fee, both paid by the seller (2026).
  const BROKER_FEE = 0.10;
  const ESTOPPEL_FEE = 150;

  // Share of a long deed's price a contract keeps with `yearsLeft` on it:
  // 1 - e^(-yearsLeft / 10). The 10-year constant is a least-squares fit of
  // RESORT_INVESTMENT_DATA's WDW resale prices against years left (2026
  // data), which level off rather than falling in a straight line -- 2042
  // deeds with 16 years left trade near deeds with 40+. Only ratios of this
  // are used, so a resort's own price level carries through.
  const DECAY_YEARS = 10;
  function valueFraction(yearsLeft) {
    return yearsLeft > 0 ? 1 - Math.exp(-yearsLeft / DECAY_YEARS) : 0;
  }

  // Today's $/pt for a deed with `yearsLeftNow` left, moved along the curve
  // to when it has `yearsLeftThen` left.
  function pricePerPointAt(pricePerPointNow, yearsLeftNow, yearsLeftThen) {
    const now = valueFraction(yearsLeftNow);
    return now > 0 ? pricePerPointNow * valueFraction(yearsLeftThen) / now : 0;
  }

  // What the seller walks away with.
  function netSale(points, pricePerPoint) {
    return Math.max(0, points * pricePerPoint * (1 - BROKER_FEE) - ESTOPPEL_FEE);
  }

  // Keep for `years`, then sell -- vs sell today. In today's dollars: point
  // value holds steady, dues grow at duesGrowth net of valueGrowth (hotel
  // inflation), resale follows the curve, and every future dollar is
  // discounted at discountRate (0 = none).
  //   contracts: [{ points, pricePerPoint, yearsLeft, duesPerPoint }]
  //   usage: share of each year's points used on stays (0-1); unused
  //   points are counted as worth nothing.
  // Keeping is linear in usage, so breakEvenUsage is the usage share at
  // which keeping and selling come out equal (null if keeping wins even at
  // 0% or loses even at 100%).
  function keepOrSell({ contracts, years, usage, pointValue, duesGrowth = 0, valueGrowth = 0, discountRate = 0 }) {
    let sellNow = 0, stayValue = 0, dues = 0, saleLater = 0, heldYears = 0;
    const realDues = (1 + duesGrowth) / (1 + valueGrowth);
    for (const c of contracts) {
      sellNow += netSale(c.points, c.pricePerPoint);
      const n = Math.max(0, Math.min(years, c.yearsLeft));
      heldYears = Math.max(heldYears, n);
      for (let t = 0; t < n; t++) {
        const d = Math.pow(1 + discountRate, t);
        stayValue += c.points * pointValue / d;
        dues += c.points * c.duesPerPoint * Math.pow(realDues, t) / d;
      }
      saleLater += netSale(c.points, pricePerPointAt(c.pricePerPoint, c.yearsLeft, c.yearsLeft - n)) / Math.pow(1 + discountRate, n);
    }
    const keep = stayValue * usage - dues + saleLater;
    const u = stayValue > 0 ? (sellNow + dues - saleLater) / stayValue : null;
    return {
      sellNow, keep, advantage: keep - sellNow,
      verdict: keep >= sellNow ? "keep" : "sell",
      stayValue: stayValue * usage, dues, saleLater, heldYears,
      breakEvenUsage: u != null && u > 0 && u <= 1 ? u : null,
    };
  }

  const api = { BROKER_FEE, ESTOPPEL_FEE, DECAY_YEARS, valueFraction, pricePerPointAt, netSale, keepOrSell };
  if (typeof window !== "undefined") window.DVCResale = api;
  if (typeof module !== "undefined") module.exports = api;
})();
