const test = require("node:test");
const assert = require("node:assert/strict");
const { findStays } = require("../dvc-leftover-points.js");

// Weekday 10 pts, Fri/Sat 14 pts; OKW is cheaper at 8/12.
const weekend = s => [5, 6].includes(new Date(s + "T00:00:00Z").getUTCDay());
const prices = { okw: [8, 12], ssr: [10, 14] };
const pointsFor = (resortId, roomTypeId, s) => roomTypeId === "studio" ? prices[resortId][weekend(s) ? 1 : 0] : null;
const resorts = [
  { resortId: "ssr", maxCheckIn: "2026-11-30", roomTypeIds: ["studio", "1br"] },
  { resortId: "okw", maxCheckIn: "2026-11-30", roomTypeIds: ["studio"] },
];

test("finds the longest stay per resort, most nights first", () => {
  // Mon 2026-10-05 .. : 20 pts = 2 weekday nights at SSR, 2 at OKW (16) with 4 left
  const stays = findStays({ points: 20, fromDate: "2026-10-05", lastNightDate: "2026-10-31", resorts, pointsFor });
  assert.equal(stays.length, 2);
  assert.deepEqual(stays.map(s => [s.resortId, s.nights]), [["ssr", 2], ["okw", 2]]);
  assert.equal(stays[0].pointsUsed, 20);
});

test("ties on nights prefer the stay that strands fewer points", () => {
  const [top] = findStays({ points: 12, fromDate: "2026-10-05", lastNightDate: "2026-10-31", resorts: [resorts[1]], pointsFor });
  assert.equal(top.nights, 1);
  assert.equal(top.pointsUsed, 12); // a Fri/Sat night beats an 8-pt weekday night
});

test("too few points for any night returns nothing", () => {
  assert.deepEqual(findStays({ points: 4, fromDate: "2026-10-05", lastNightDate: "2026-10-31", resorts, pointsFor }), []);
});

test("nights never run past the use year's last day", () => {
  const stays = findStays({ points: 200, fromDate: "2026-11-28", lastNightDate: "2026-11-30", resorts, pointsFor });
  for (const s of stays) assert.ok(s.checkOut <= "2026-12-01");
  assert.equal(stays[0].nights, 3);
});

test("check-in respects each resort's booking-window limit", () => {
  const limited = [{ resortId: "okw", maxCheckIn: "2026-10-06", roomTypeIds: ["studio"] }];
  const stays = findStays({ points: 12, fromDate: "2026-10-05", lastNightDate: "2026-10-31", resorts: limited, pointsFor });
  assert.ok(stays[0].checkIn <= "2026-10-06");
});

test("missing chart data ends a stay instead of pricing it at zero", () => {
  const stays = findStays({ points: 100, fromDate: "2026-10-05", lastNightDate: "2026-10-31", resorts: [{ resortId: "ssr", maxCheckIn: "2026-10-31", roomTypeIds: ["1br"] }], pointsFor });
  assert.deepEqual(stays, []);
});

test("caps a single stay at maxNights", () => {
  const [top] = findStays({ points: 1000, fromDate: "2026-10-05", lastNightDate: "2026-11-30", resorts: [resorts[1]], pointsFor, maxNights: 14 });
  assert.equal(top.nights, 14);
});

// ---- availability odds (short-notice realism) ----
const { bookingWindowKey, keyDatesPeriod, availabilityScore, oddsLabel } = require("../dvc-leftover-points.js");
const avail = { ssr: 1.6, okw: 0.7 }; // avg days open out of 7, flat for the test
const availabilityFor = resortId => avail[resortId] ?? null;

test("with availability, a stay only qualifies at Good+ odds (score >= 0.75 x nights)", () => {
  // SSR 1.6 days: 2 nights ok (1.6 >= 1.5), 3 nights not; OKW 0.7 < 0.75 never qualifies
  const stays = findStays({ points: 100, fromDate: "2026-10-05", lastNightDate: "2026-10-31", resorts, pointsFor, availabilityFor });
  assert.deepEqual(stays.map(s => [s.resortId, s.nights]), [["ssr", 2]]);
  assert.equal(stays[0].availability, 1.6);
});

test("unknown availability never qualifies", () => {
  assert.deepEqual(findStays({ points: 100, fromDate: "2026-10-05", lastNightDate: "2026-10-31", resorts, pointsFor, availabilityFor: () => null }), []);
});

test("across resorts, most reliably available ranks first even when shorter", () => {
  const odds = { ssr: 1.6, okw: 5 };
  const stays = findStays({ points: 100, fromDate: "2026-10-05", lastNightDate: "2026-10-31", resorts, pointsFor, availabilityFor: r => odds[r] });
  assert.equal(stays[0].resortId, "okw");
});

test("odds label: Excellent when typical opening covers the whole stay, else Good", () => {
  assert.equal(oddsLabel(2.1, 2), "Excellent");
  assert.equal(oddsLabel(1.6, 2), "Good");
});

test("booking window: nearest of 11/7/5/3/1 months, ties toward the nearer window", () => {
  assert.equal(bookingWindowKey(10), "1Mo");
  assert.equal(bookingWindowKey(60), "1Mo"); // 1.97 mo: 0.97 from 1Mo vs 1.03 from 3Mo
  assert.equal(bookingWindowKey(61), "3Mo");
  assert.equal(bookingWindowKey(100), "3Mo");
  assert.equal(bookingWindowKey(213), "7Mo");
});

test("key-dates period mapping matches app.js getKeyDatesPeriod", () => {
  assert.equal(keyDatesPeriod("2026-12-28", "saratogaSprings"), "newYears");
  assert.equal(keyDatesPeriod("2027-01-10", "saratogaSprings"), "marathon");
  assert.equal(keyDatesPeriod("2027-01-10", "veroBeach"), "presidents");
  assert.equal(keyDatesPeriod("2026-10-10", "saratogaSprings"), "foodAndWine");
  assert.equal(keyDatesPeriod("2026-10-10", "aulani"), "thanksgiving");
  assert.equal(keyDatesPeriod("2026-11-10", "oldKeyWest"), "thanksgiving");
  assert.equal(keyDatesPeriod("2026-12-10", "oldKeyWest"), "christmas");
});

test("availabilityScore reads resort/room/period/window and is null when missing", () => {
  const data = { ssr: { studio: { foodAndWine: { "1Mo": 1.6 } } } };
  assert.equal(availabilityScore(data, "ssr", "studio", "2026-10-10", "1Mo"), 1.6);
  assert.equal(availabilityScore(data, "ssr", "studio", "2026-11-10", "1Mo"), null);
  assert.equal(availabilityScore(null, "ssr", "studio", "2026-10-10", "1Mo"), null);
});

test("Walt Disney World resorts rank ahead of off-site ones, even with worse odds", () => {
  const offsite = [...resorts, { resortId: "veroBeach", maxCheckIn: "2026-11-30", roomTypeIds: ["studio"] }];
  const price = (r, room, s) => pointsFor(r === "veroBeach" ? "okw" : r, room, s);
  const odds = { ssr: 1.6, okw: 0.9, veroBeach: 2.5 };
  const stays = findStays({ points: 100, fromDate: "2026-10-05", lastNightDate: "2026-10-31", resorts: offsite, pointsFor: price, availabilityFor: r => odds[r] });
  assert.deepEqual(stays.map(s => s.resortId), ["ssr", "okw", "veroBeach"]);
});
