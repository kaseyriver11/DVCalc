// Plain node:test + node:assert -- no framework/dependency, no build step,
// consistent with the rest of this repo (vanilla JS, no package.json). Run
// with: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const { validateBorrowedPoints, pointsEnterHolding, holdingRebookDeadline, MAX_BORROW_RATIO, HOLDING_REBOOK_DAYS } = require("../dvc-ledger.js");

const DAY = 86400000;

test("validateBorrowedPoints: at exactly 100% of next year's allotment is valid", () => {
  const result = validateBorrowedPoints(200, 200);
  assert.equal(result.valid, true);
  assert.equal(result.maxAllowed, 200);
});

test("validateBorrowedPoints: one point over next year's full allotment is invalid", () => {
  const result = validateBorrowedPoints(201, 200);
  assert.equal(result.valid, false);
  assert.equal(result.maxAllowed, 200);
});

test("validateBorrowedPoints: zero borrowed is always valid", () => {
  assert.equal(validateBorrowedPoints(0, 50).valid, true);
});

test("validateBorrowedPoints: halfway through next year's allotment is valid (no 50% cap anymore)", () => {
  // The 50% cap was a temporary COVID-era restriction (Apr-Jul 2020),
  // since lifted -- DVC's standing rule allows up to 100%.
  const result = validateBorrowedPoints(76, 151);
  assert.equal(result.maxAllowed, 151);
  assert.equal(result.valid, true);
});

test("MAX_BORROW_RATIO is DVC's standing 100% rule, not the old temporary 50% COVID-era cap", () => {
  assert.equal(MAX_BORROW_RATIO, 1.0);
});

test("pointsEnterHolding: 31 days before check-in is a normal cancellation, not holding", () => {
  assert.equal(pointsEnterHolding(31), false);
});

test("pointsEnterHolding: 30 days before check-in is the outer edge of the holding window", () => {
  assert.equal(pointsEnterHolding(30), true);
});

test("pointsEnterHolding: 1 day before check-in is the inner edge of the holding window", () => {
  assert.equal(pointsEnterHolding(1), true);
});

test("pointsEnterHolding: mid-window (e.g. 15 days) enters holding", () => {
  assert.equal(pointsEnterHolding(15), true);
});

test("pointsEnterHolding: same-day (0 days) is a no-show, not holding", () => {
  assert.equal(pointsEnterHolding(0), false);
});

test("pointsEnterHolding: negative days (after check-in) is not holding", () => {
  assert.equal(pointsEnterHolding(-3), false);
});

test("holdingRebookDeadline: null entered date means no deadline to compute", () => {
  assert.equal(holdingRebookDeadline(null, Date.UTC(2026, 10, 30), Date.UTC(2026, 9, 1)), null);
});

test("holdingRebookDeadline: 60 days from entry, well before use-year expiration", () => {
  const entered = Date.UTC(2026, 9, 1); // Oct 1, 2026
  const useYearExpires = Date.UTC(2027, 8, 30); // Sep 30, 2027 -- far out
  const today = entered;
  const result = holdingRebookDeadline(entered, useYearExpires, today);
  assert.equal(result.ms, entered + HOLDING_REBOOK_DAYS * DAY);
  assert.equal(result.daysUntil, HOLDING_REBOOK_DAYS);
});

test("holdingRebookDeadline: capped at use-year expiration when that comes first", () => {
  const entered = Date.UTC(2026, 9, 1); // Oct 1, 2026
  const useYearExpires = Date.UTC(2026, 9, 15); // Oct 15, 2026 -- expires in 14 days, well inside the 60-day window
  const today = entered;
  const result = holdingRebookDeadline(entered, useYearExpires, today);
  assert.equal(result.ms, useYearExpires);
  assert.equal(result.daysUntil, 14);
});

test("holdingRebookDeadline: daysUntil counts down as today advances", () => {
  const entered = Date.UTC(2026, 9, 1);
  const useYearExpires = Date.UTC(2027, 8, 30);
  const today = entered + 45 * DAY;
  const result = holdingRebookDeadline(entered, useYearExpires, today);
  assert.equal(result.daysUntil, 15);
});
