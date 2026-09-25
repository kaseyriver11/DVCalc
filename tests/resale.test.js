const test = require('node:test'), assert = require('node:assert/strict');
const S = require('../dvc-resale.js');

const near = (a, b, tol = 0.5) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

test('a sale nets the broker fee and Disney estoppel fee', () => {
  near(S.netSale(150, 100), 150 * 100 * 0.9 - 150);
  assert.equal(S.netSale(1, 1), 0);
});

test('resale value follows the curve and reaches zero at expiry', () => {
  near(S.pricePerPointAt(120, 40, 40), 120, 1e-9);
  assert.ok(S.pricePerPointAt(120, 40, 30) < 120);
  assert.equal(S.pricePerPointAt(120, 16, 0), 0);
});
