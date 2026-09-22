// Plain node:test + node:assert -- no framework/dependency, no build step,
// consistent with the rest of this repo (vanilla JS, no package.json). Run
// with: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const { validateBorrowedPoints, pointsEnterHolding, holdingExpiration, MAX_BORROW_RATIO, HOLDING_BOOKING_WINDOW_DAYS } = require("../dvc-ledger.js");

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

test("holding expiration uses the full use year, never a 60-day entry clock", () => {
  const expires = Date.UTC(2027, 8, 30), today = Date.UTC(2026, 9, 1);
  assert.equal(holdingExpiration(expires, today).ms, expires);
  assert.ok(holdingExpiration(expires, today).daysUntil > 60);
});
test("holding expiry countdown uses UTC dates", () => {
  assert.equal(holdingExpiration(Date.UTC(2026, 9, 15), Date.UTC(2026, 9, 1)).daysUntil, 14);
});
test("holding expiry is due today on the last use-year day", () => {
  const date = Date.UTC(2026, 8, 30);
  assert.equal(holdingExpiration(date, date).daysUntil, 0);
});
test("60 days describes the booking window", () => {
  assert.equal(HOLDING_BOOKING_WINDOW_DAYS, 60);
});
