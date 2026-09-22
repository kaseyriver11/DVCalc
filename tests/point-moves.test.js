const test = require('node:test');
const assert = require('node:assert/strict');
const { preview, total } = require('../dvc-point-moves.js');
const row = (year, remaining, extras = {}) => ({ use_year_label: year, points_remaining: remaining, points_banked: 0, points_borrowed: 0, points_holding: 0, balance_confirmed_at: '2026-09-22T00:00:00Z', ...extras });
test('banking subtracts current points and adds banked points in the next year', () => {
  const rows = [row(2026,120,{points_holding:10}),row(2027,200,{points_banked:5})];
  const p = preview('bank',2026,50,rows);
  assert.equal(p.afterFrom.points_remaining,70);
  assert.equal(p.afterTo.points_banked,55);
  assert.equal(p.afterTo.points_remaining,200);
  assert.equal(total(p.afterFrom)+total(p.afterTo),335);
  assert.equal(rows[0].points_remaining,120);
});
test('borrowing subtracts next year current points and adds borrowed points this year', () => {
  const p = preview('borrow',2026,100,[row(2026,0),row(2027,200)]);
  assert.equal(p.afterFrom.use_year_label,2027);
  assert.equal(p.afterFrom.points_remaining,100);
  assert.equal(p.afterTo.points_borrowed,100);
  assert.equal(p.afterTo.points_remaining,0);
});
test('cannot move banked, borrowed or holding points again', () => {
  assert.match(preview('bank',2026,2,[row(2026,1,{points_banked:100,points_borrowed:100,points_holding:100}),row(2027,0)]).error,/Only 1/);
});
test('unknown destination is not treated as zero or annual allotment', () => {
  assert.deepEqual(preview('bank',2026,10,[row(2026,100)]).missing,[2027]);
  assert.deepEqual(preview('borrow',2026,10,[row(2026,0),row(2027,200,{balance_confirmed_at:null})]).missing,[2027]);
});
test('zero destination is valid; empty, fractional, negative and oversized moves are not', () => {
  const rows = [row(2026,100),row(2027,0)];
  assert.equal(preview('bank',2026,100,rows).afterTo.points_banked,100);
  for (const amount of ['',0,-1,1.5,'oops',101,Infinity]) assert.ok(preview('bank',2026,amount,rows).error);
});
