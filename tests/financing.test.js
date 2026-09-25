const test = require('node:test'), assert = require('node:assert/strict');
const F = require('../js/dvc-financing.js');

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

test('monthly payment matches the standard amortization formula', () => {
  // $20,000 at 12% for 10 years: $286.94/mo.
  near(F.monthlyPayment(20000, 0.12, 120), 286.94);
  near(F.monthlyPayment(12000, 0, 12), 1000);
  assert.equal(F.monthlyPayment(0, 0.12, 120), 0);
});

test('total interest is every payment minus the principal', () => {
  const pay = F.monthlyPayment(20000, 0.12, 120);
  near(F.totalInterest(20000, 0.12, 120), pay * 120 - 20000, 0.05);
  assert.equal(F.totalInterest(20000, 0, 120), 0);
});

test('interest paid so far is front-loaded and capped at the term', () => {
  const firstYear = F.interestPaid(20000, 0.12, 120, 12);
  const lastYear = F.totalInterest(20000, 0.12, 120) - F.interestPaid(20000, 0.12, 120, 108);
  assert.ok(firstYear > lastYear * 3);
  near(F.interestPaid(20000, 0.12, 120, 500), F.totalInterest(20000, 0.12, 120));
});

test('payments made count whole months since the loan started', () => {
  assert.equal(F.paymentsMadeBy('2025-01-15', '2026-01-15'), 12);
  assert.equal(F.paymentsMadeBy('2025-01-15', '2026-01-14'), 11);
  assert.equal(F.paymentsMadeBy('2026-05-01', '2026-01-01'), 0);
  near(F.interestPaidThrough({ principal: 20000, apr: 0.12, months: 120, startDate: '2025-01-15', asOf: '2026-01-15' }),
       F.interestPaid(20000, 0.12, 120, 12));
});
