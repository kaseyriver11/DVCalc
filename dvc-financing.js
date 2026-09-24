// Loan math for a financed DVC purchase: a standard fixed-rate loan paid
// monthly. Pure; plain <script> exposing window.DVCFinancing, also
// require()-able by Node for tests.
//
// Contract Value adds totalInterest() to the buy-in; Add/Edit Contract
// uses interestPaidThrough() to fill "financing interest paid to date".
// Interest only -- the purchase price already covers the principal.
(function () {
  // principal: amount borrowed. apr: annual rate as a fraction (0.12).
  // months: loan term.
  function monthlyPayment(principal, apr, months) {
    if (!(principal > 0) || !(months > 0)) return 0;
    const r = apr / 12;
    if (!(r > 0)) return principal / months;
    return principal * r / (1 - Math.pow(1 + r, -months));
  }

  // Interest paid over the first `paymentsMade` payments (default: all).
  function interestPaid(principal, apr, months, paymentsMade = months) {
    if (!(principal > 0) || !(months > 0)) return 0;
    const n = Math.max(0, Math.min(months, Math.floor(paymentsMade)));
    const payment = monthlyPayment(principal, apr, months);
    const r = apr / 12;
    let balance = principal, interest = 0;
    for (let i = 0; i < n; i++) {
      const due = balance * r;
      interest += due;
      balance -= payment - due;
    }
    return interest;
  }

  const totalInterest = (principal, apr, months) => interestPaid(principal, apr, months);

  // Monthly payments made from the loan's start (first payment a month
  // after it) through `asOf`. Dates are "YYYY-MM-DD" strings or Dates.
  // "YYYY-MM-DD" is read as a local date: new Date() would read it as UTC
  // midnight, the previous evening in US time zones.
  const toDate = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)
    ? new Date(+v.slice(0, 4), +v.slice(5, 7) - 1, +v.slice(8, 10))
    : new Date(v);
  function paymentsMadeBy(startDate, asOf) {
    const start = toDate(startDate), end = toDate(asOf);
    if (isNaN(start) || isNaN(end) || end <= start) return 0;
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) months--;
    return Math.max(0, months);
  }

  function interestPaidThrough({ principal, apr, months, startDate, asOf = new Date() }) {
    return interestPaid(principal, apr, months, paymentsMadeBy(startDate, asOf));
  }

  const api = { monthlyPayment, interestPaid, totalInterest, paymentsMadeBy, interestPaidThrough };
  if (typeof window !== "undefined") window.DVCFinancing = api;
  if (typeof module !== "undefined") module.exports = api;
})();
