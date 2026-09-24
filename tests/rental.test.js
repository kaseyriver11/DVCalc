const test = require('node:test'), assert = require('node:assert/strict');
const R = require('../dvc-rental.js');

test('a stay worth more per point than renting says use the points', () => {
  const r = R.useOrRent({ cashValue: 3000, points: 100, rentalRate: 20 });
  assert.equal(r.verdict, 'use');
  assert.equal(r.stayPerPoint, 30);
  assert.equal(r.rentAdvantage, 0);
});

test('a stay worth less than renting says rent, with the dollar gap', () => {
  const r = R.useOrRent({ cashValue: 1400, points: 100, rentalRate: 20 });
  assert.equal(r.verdict, 'rent');
  assert.equal(r.rentalIncome, 2000);
  assert.equal(r.rentAdvantage, 600);
});

test('within $1/pt is a close call either way', () => {
  assert.equal(R.useOrRent({ cashValue: 2050, points: 100, rentalRate: 20 }).verdict, 'close');
  assert.equal(R.useOrRent({ cashValue: 1950, points: 100, rentalRate: 20 }).verdict, 'close');
});

test('no cash price, no points, or no rental rate gives no verdict', () => {
  assert.equal(R.useOrRent({ cashValue: 0, points: 100, rentalRate: 20 }), null);
  assert.equal(R.useOrRent({ cashValue: 1000, points: 0, rentalRate: 20 }), null);
  assert.equal(R.useOrRent({ cashValue: 1000, points: 100, rentalRate: 0 }), null);
});

test('spending points: cash fees on top come off what the points bought', () => {
  // A $4,095 cruise for 400 points plus a $95 fee: $10/pt.
  assert.deepEqual(R.spendValue({ cashPrice: 4095, points: 400, cashFees: 95 }), { netValue: 4000, perPoint: 10 });
  assert.equal(R.spendValue({ cashPrice: 3000, points: 100 }).perPoint, 30);
  assert.equal(R.spendValue({ cashPrice: 0, points: 100 }), null);
});

test('points to cover dues round up to a whole point', () => {
  assert.equal(R.pointsToCoverDues(1500, 20), 75);
  assert.equal(R.pointsToCoverDues(1501, 20), 76);
  assert.equal(R.pointsToCoverDues(0, 20), 0);
});
