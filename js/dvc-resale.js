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

  const api = { BROKER_FEE, ESTOPPEL_FEE, DECAY_YEARS, valueFraction, pricePerPointAt, netSale };
  if (typeof window !== "undefined") window.DVCResale = api;
  if (typeof module !== "undefined") module.exports = api;
})();
