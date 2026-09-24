const test = require('node:test'), assert = require('node:assert/strict');
const S = require('../dvc-resale.js');

const near = (a, b, tol = 0.5) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);
const base = { years: 10, usage: 1, pointValue: 30 };
const deed = { points: 150, pricePerPoint: 120, yearsLeft: 40, duesPerPoint: 10 };

test('a sale nets the broker fee and Disney estoppel fee', () => {
  near(S.netSale(150, 100), 150 * 100 * 0.9 - 150);
  assert.equal(S.netSale(1, 1), 0);
});

test('resale value follows the curve and reaches zero at expiry', () => {
  near(S.pricePerPointAt(120, 40, 40), 120, 1e-9);
  assert.ok(S.pricePerPointAt(120, 40, 30) < 120);
  assert.equal(S.pricePerPointAt(120, 16, 0), 0);
});

test('an owner using every point keeps; one using none sells', () => {
  const r = S.keepOrSell({ ...base, contracts: [deed] });
  assert.equal(r.verdict, 'keep');
  const none = S.keepOrSell({ ...base, usage: 0, contracts: [deed] });
  assert.equal(none.verdict, 'sell');
});

test('at the break-even usage, keeping and selling come out equal', () => {
  const r = S.keepOrSell({ ...base, contracts: [deed] });
  assert.ok(r.breakEvenUsage > 0 && r.breakEvenUsage < 1);
  const at = S.keepOrSell({ ...base, usage: r.breakEvenUsage, contracts: [deed] });
  near(at.keep, at.sellNow, 0.01);
});

test('years kept are capped at the deed, which then sells for nothing', () => {
  const short = { ...deed, yearsLeft: 3 };
  const r = S.keepOrSell({ ...base, years: 10, contracts: [short] });
  assert.equal(r.heldYears, 3);
  assert.equal(r.saleLater, 0);
});

test('discounting future years makes keeping worth less', () => {
  const plain = S.keepOrSell({ ...base, contracts: [deed] });
  const disc = S.keepOrSell({ ...base, discountRate: 0.07, contracts: [deed] });
  assert.ok(disc.keep < plain.keep);
});
