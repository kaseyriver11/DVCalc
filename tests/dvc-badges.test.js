// Plain node:test + node:assert -- no framework/dependency, no build step,
// consistent with the rest of this repo. Run with:
//   node --test tests/*.test.js
//
// dvc-badges.js is an IIFE that assigns window.DVCBadges (the same plain-
// <script> convention as dvc-dates.js/dvc-ui.js), not a CommonJS module,
// so it can't be require()d the way dvc-ledger.js is. vm.runInThisContext
// evaluates it against the real global object instead, which is also what
// lets data/data.js's top-level `const RESORTS` become visible to it --
// exactly how the browser wires these two files together. Loading the real
// data.js (rather than a fixture) is deliberate: several of these badges
// key off actual resort ids and room-type NAMES, so a fixture could pass
// while the shipped data quietly stopped matching.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
global.window = {
  DVCAuth: { upsertUserBadge: () => Promise.resolve() },
  // Badges that read a trip's point-source attribution aren't under test
  // here; a stub that reports "not broken down" keeps them all locked
  // without needing fixture allocations.
  DVCTripFunding: { summary: () => ({ valid: false, owned: 0 }) },
};
for (const f of ["data/data.js", "data/resort_shorthand.js", "data/disney_events.js", "js/dvc-dates.js", "js/dvc-badges.js"]) {
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), "utf8"), { filename: f });
}
const B = window.DVCBadges;
const D = window.DVCDates;

const trip = (resortId, roomTypeId) => ({
  resort_id: resortId,
  room_type_id: roomTypeId,
  check_in: "2026-05-01",
  check_out: "2026-05-05",
});
const contract = (over = {}) => ({
  id: "c1", is_active: true, points_per_year: 150, home_resort_id: "saratogaSprings",
  purchase_type: "resale", purchase_date: "2024-01-01", ...over,
});
const evaluate = (contracts, trips) =>
  B.evaluateUserBadges(contracts, trips, [], { paybackPct: 0 }, null, []);
const badge = (contracts, trips, id) => evaluate(contracts, trips).find(b => b.id === id);

const WILDERNESS = ["boulderRidge", "copperCreek", "animalKingdomVillas", "fortWildernessCabins"];
const MONORAIL = ["bayLakeTower", "grandFloridian", "polynesianVillas"];
const EPCOT = ["beachClubVillas", "boardwalkVillas", "rivieraResort"];
const staysAt = ids => ids.map(id => trip(id, "s"));

// ---------------------------------------------------------------------
// The Odyssey
// ---------------------------------------------------------------------

test("Odyssey: visiting one resort in a region does not complete that region", () => {
  // The bug this replaces: groupsCovered used .some(), so a single stay
  // anywhere in a region counted the whole region as done.
  const b = badge([], staysAt(["rivieraResort"]), "odyssey");
  assert.equal(b.tierNumber, 0);
  assert.equal(b.unlocked, false);
});

test("Odyssey: a tier is never labelled with a region the member hasn't finished", () => {
  // The headline bug: a Riviera-only member was shown "Tier 1: The
  // Monorail Loop" -- a region they had never set foot in -- because
  // tierNumber was a COUNT but tierLabel indexed ODYSSEY_GROUPS by it.
  for (const visited of [["rivieraResort"], EPCOT, [...EPCOT, ...WILDERNESS]]) {
    const b = badge([], staysAt(visited), "odyssey");
    for (const label of ["The Monorail Loop", "The Epcot Crescent", "The Wilderness"]) {
      assert.notEqual(b.tierLabel, label, `tierLabel claimed "${label}" for ${visited.join("+")}`);
    }
  }
});

test("Odyssey: finishing only the Epcot Crescent still earns tier 1", () => {
  const b = badge([], staysAt(EPCOT), "odyssey");
  assert.equal(b.tierNumber, 1);
  assert.equal(b.tierLabel, "One Region");
});

test("Odyssey: progress names the region and the resorts still missing", () => {
  // Gemini's stated test case: 3 of 4 visited, told exactly what's left.
  const b = badge([], staysAt(WILDERNESS.slice(0, 3)), "odyssey");
  assert.equal(b.valueLabel, "3 of 4 The Wilderness resorts visited");
  assert.match(b.nextStepText, /Fort Wilderness Cabins/);
  assert.match(b.nextStepText, /The Wilderness/);
  assert.equal(b.customProgressPct, 75);
});

test("Odyssey: the region nearest completion is the one surfaced", () => {
  // 2 of 3 Monorail beats 1 of 3 Epcot, regardless of declaration order.
  const b = badge([], staysAt([...MONORAIL.slice(0, 2), "rivieraResort"]), "odyssey");
  assert.match(b.valueLabel, /The Monorail Loop/);
  assert.match(b.nextStepText, /Polynesian/);
});

test("Odyssey: Fort Wilderness Cabins is part of The Wilderness region", () => {
  const withoutCabins = badge([], staysAt(WILDERNESS.slice(0, 3)), "odyssey");
  const withCabins = badge([], staysAt(WILDERNESS), "odyssey");
  assert.equal(withoutCabins.tierNumber, 0);
  assert.equal(withCabins.tierNumber, 1);
});

test("Odyssey: all three regions is tier 3; Global Citizen needs every resort", () => {
  const allRegions = badge([], staysAt([...MONORAIL, ...EPCOT, ...WILDERNESS]), "odyssey");
  assert.equal(allRegions.tierNumber, 3);
  // Old Key West and Saratoga Springs sit outside every region, so the
  // final tier genuinely is not reachable by finishing regions alone.
  assert.match(allRegions.nextStepText, /resorts you haven't stayed at yet|stay at/);

  const everyResort = [...new Set(RESORTS.map(r => r.id))];
  const global = badge([], staysAt(everyResort), "odyssey");
  assert.equal(global.tierNumber, 4);
  assert.equal(global.tierLabel, "Global Citizen");
  assert.equal(global.next, null);
  assert.equal(global.customProgressPct, 100);
});

test("Odyssey: the sticky floor cannot reintroduce a false region claim", () => {
  // applyBadgePersistence rebuilds tierLabel from tiers[storedTier - 1]
  // when live data regresses below a stored tier -- with counting labels
  // that restored label stays true no matter which regions are done.
  const live = badge([], staysAt(["rivieraResort"]), "odyssey");
  const restored = B.applyBadgePersistence([live], [{ badge_id: "odyssey", tier: 2 }])[0];
  assert.equal(restored.unlocked, true);
  assert.equal(restored.tierNumber, 2);
  assert.equal(restored.tierLabel, "Two Regions");
});

// ---------------------------------------------------------------------
// Points Whale / Century Club
// ---------------------------------------------------------------------

test("Points Whale: a 150-point contract reaches Century Club", () => {
  // 150 is DVC's direct minimum and a very common resale size; the old
  // 250-point first tier meant it unlocked nothing at all.
  const b = badge([contract({ points_per_year: 150 })], [], "points-whale");
  assert.equal(b.unlocked, true);
  assert.equal(b.tierLabel, "Century Club");
});

test("Points Whale: tiers climb 100/200/500/1000 and 99 points stays locked", () => {
  const tierAt = pts => badge([contract({ points_per_year: pts })], [], "points-whale");
  assert.equal(tierAt(99).unlocked, false);
  assert.equal(tierAt(100).tierNumber, 1);
  assert.equal(tierAt(200).tierNumber, 2);
  assert.equal(tierAt(500).tierNumber, 3);
  assert.equal(tierAt(1000).tierNumber, 4);
});

test("Points Whale: sums across contracts rather than counting them", () => {
  const b = badge(
    [contract({ id: "a", points_per_year: 120 }), contract({ id: "b", points_per_year: 100 })],
    [], "points-whale",
  );
  assert.equal(b.value, 220);
  assert.equal(b.tierNumber, 2);
});

test("Points Whale: inactive contracts do not count", () => {
  const b = badge([contract({ points_per_year: 400, is_active: false })], [], "points-whale");
  assert.equal(b.unlocked, false);
});

// ---------------------------------------------------------------------
// Grand Villa / Treehouse
// ---------------------------------------------------------------------

test("Grand Villa: a Saratoga Springs Treehouse Villa counts", () => {
  // data.js names it "Three-Bedroom Treehouse Villa", so the old
  // "grand villa" substring missed it -- despite being that resort's
  // largest, rarest unit, and Saratoga Springs having no Grand Villa for
  // it to be losing out to.
  const b = badge([], [trip("saratogaSprings", "treehouse")], "grand-villa");
  assert.equal(b.unlocked, true);
});

test("Grand Villa: a real Grand Villa still counts, a 2-Bedroom still does not", () => {
  const grand = RESORTS.find(r => r.id === "bayLakeTower")
    .roomTypes.find(rt => rt.name.toLowerCase().includes("grand villa"));
  assert.ok(grand, "expected Bay Lake Tower to define a Grand Villa room type");
  assert.equal(badge([], [trip("bayLakeTower", grand.id)], "grand-villa").unlocked, true);

  const twoBed = RESORTS.find(r => r.id === "bayLakeTower")
    .roomTypes.find(rt => rt.name.toLowerCase().includes("two-bedroom"));
  assert.equal(badge([], [trip("bayLakeTower", twoBed.id)], "grand-villa").unlocked, false);
});

test("Villa Royalty stays the broader 2BR+ badge, distinct from Grand Villa", () => {
  const twoBed = RESORTS.find(r => r.id === "bayLakeTower")
    .roomTypes.find(rt => rt.name.toLowerCase().includes("two-bedroom"));
  const all = evaluate([], [trip("bayLakeTower", twoBed.id)]);
  assert.equal(all.find(b => b.id === "villa-royalty").unlocked, true);
  assert.equal(all.find(b => b.id === "grand-villa").unlocked, false);
});

// ---------------------------------------------------------------------
// Locked-state criteria
// ---------------------------------------------------------------------

test("every locked special badge states its unlock criteria on the tile", () => {
  // Tiered badges get this from badgeProgressHTML()'s progress line; a
  // locked special badge used to render nothing but its name and the word
  // "Locked", leaving the criteria modal-only.
  const all = [...evaluate([], []), ...B.evaluateEventBadges([])];
  const lockedSpecials = all.filter(b => b.kind === "special" && !b.unlocked);
  assert.ok(lockedSpecials.length >= 15, "expected a meaningful number of locked special badges");
  for (const b of lockedSpecials) {
    assert.ok(b.requirement, `${b.name} has no requirement text`);
    assert.notEqual(B.badgeRequirementHTML(b), "", `${b.name} renders no requirement line`);
    assert.ok(B.buildTrophyTileHTML(b).includes(b.requirement), `${b.name}'s tile omits its requirement`);
  }
});

test("requirement text is terse enough for a tile", () => {
  const all = [...evaluate([], []), ...B.evaluateEventBadges([])];
  for (const b of all.filter(x => x.kind === "special")) {
    assert.ok(b.requirement.length <= 60, `${b.name}: "${b.requirement}" is ${b.requirement.length} chars`);
  }
});

test("an unlocked badge is not told how to unlock itself", () => {
  const b = badge([contract()], [], "welcome-home");
  assert.equal(b.unlocked, true);
  assert.equal(B.badgeRequirementHTML(b), "");
});

test("tiered badges carry no requirement line (their progress bar states it)", () => {
  const b = badge([contract()], [], "points-whale");
  assert.equal(B.badgeRequirementHTML(b), "");
  assert.match(B.badgeProgressHTML(b), /Tier 2/);
});

// ---------------------------------------------------------------------
// Unlock detection (trips.html's celebration banner)
// ---------------------------------------------------------------------

test("unlockedBadgeIds: diffing before/after a trip surfaces what it unlocked", () => {
  const contracts = [contract({ home_resort_id: "bayLakeTower" })];
  const before = B.unlockedBadgeIds(evaluate(contracts, []));
  const after = B.unlockedBadgeIds(evaluate(contracts, [trip("saratogaSprings", "treehouse")]));
  const gained = [...after].filter(id => !before.has(id));
  assert.ok(gained.includes("grand-villa"), "Grand Villa should be newly unlocked");
  assert.ok(gained.includes("villa-royalty"), "Villa Royalty should be newly unlocked");
  assert.ok(!gained.includes("welcome-home"), "already-unlocked badges must not re-fire");
});

test("unlockedBadgeIds: an unrelated trip unlocks nothing new", () => {
  const contracts = [contract()];
  const trips = [trip("saratogaSprings", "treehouse")];
  const before = B.unlockedBadgeIds(evaluate(contracts, trips));
  const after = B.unlockedBadgeIds(evaluate(contracts, [...trips, trip("saratogaSprings", "treehouse")]));
  assert.deepEqual([...after].filter(id => !before.has(id)), []);
});

// ---------------------------------------------------------------------
// 11-Month Sniper
// ---------------------------------------------------------------------

// A fixed "today" so these never depend on the real clock. Mid-month and
// mid-year deliberately, to keep the arithmetic away from month-end
// rollover, which has its own test below.
const TODAY = { year: 2026, month: 6, day: 15 };

test("isInFinalWindowMonth: the day the 11-month window opens counts", () => {
  // Exactly 11 months out is the sniper moment itself -- inclusive.
  assert.equal(D.monthsFromDate(11, TODAY), "2027-05-15");
  assert.equal(D.isInFinalWindowMonth("2027-05-15", 11, TODAY), true);
});

test("isInFinalWindowMonth: the whole 10-to-11-month stretch counts", () => {
  // From 2026-06-15 that stretch is (2027-04-15, 2027-05-15].
  assert.equal(D.monthsFromDate(10, TODAY), "2027-04-15");
  for (const d of ["2027-04-16", "2027-05-01", "2027-05-14", "2027-05-15"]) {
    assert.equal(D.isInFinalWindowMonth(d, 11, TODAY), true, `${d} should be inside`);
  }
});

test("isInFinalWindowMonth: outside 10-11 months does not count", () => {
  // Too far out -- the 11-month window hasn't opened for this stay yet.
  assert.equal(D.isInFinalWindowMonth("2027-05-16", 11, TODAY), false);
  assert.equal(D.isInFinalWindowMonth("2028-01-01", 11, TODAY), false);
  // Exactly 10 months is the near edge, which is exclusive.
  assert.equal(D.isInFinalWindowMonth("2027-04-15", 11, TODAY), false);
  // Well inside the window -- it opened months ago, so this isn't sniping.
  assert.equal(D.isInFinalWindowMonth("2026-12-01", 11, TODAY), false);
  assert.equal(D.isInFinalWindowMonth("2026-06-20", 11, TODAY), false);
});

test("isInFinalWindowMonth: adjacent windows never claim the same date", () => {
  // Near edge exclusive, far edge inclusive -- so the date exactly 7
  // months out belongs to the 7 bucket alone, never to 8 as well.
  const sevenOut = D.monthsFromDate(7, TODAY);
  assert.equal(D.isInFinalWindowMonth(sevenOut, 7, TODAY), true);
  assert.equal(D.isInFinalWindowMonth(sevenOut, 8, TODAY), false);
});

test("isInFinalWindowMonth: handles a null check-in and a year boundary", () => {
  assert.equal(D.isInFinalWindowMonth(null, 11, TODAY), false);
  assert.equal(D.isInFinalWindowMonth("", 11, TODAY), false);
  // Crossing into the next calendar year is just ordinary string compare
  // on ISO dates, but worth pinning since that's the common real case.
  const nov = { year: 2026, month: 11, day: 20 };
  assert.equal(D.monthsFromDate(11, nov), "2027-10-20");
  assert.equal(D.isInFinalWindowMonth("2027-10-01", 11, nov), true);
});

test("monthsFromDate: month-end rollover matches app.js's own helpers", () => {
  // Jan 31 + 1 month has no Feb 31 to land on. Date.setMonth rolls over
  // rather than clamping, and app.js's monthsFromTodayCutoff() has always
  // done the same -- pinned here so a future "fix" to clamp doesn't
  // silently give the app two different answers for one window date.
  assert.equal(D.monthsFromDate(1, { year: 2026, month: 1, day: 31 }), "2026-03-03");
});

test("11-Month Sniper: locked at zero, tiers at 1/5/15", () => {
  const at = n => B.evaluateEventBadges([{ badge_id: "eleven-month-sniper", event_count: n }])
    .find(b => b.id === "eleven-month-sniper");
  assert.equal(at(0).unlocked, false);
  assert.equal(at(1).tierLabel, "Window Watcher");
  assert.equal(at(5).tierLabel, "Sharpshooter");
  assert.equal(at(15).tierLabel, "Dead Eye");
  assert.equal(at(1).valueLabel, "1 stay planned at the 11-month mark");
  assert.equal(at(2).valueLabel, "2 stays planned at the 11-month mark");
});

test("11-Month Sniper: is an event badge, not a sticky derived one", () => {
  // Its source of truth is user_badges.event_count, so applyBadgePersistence
  // must not also treat it as a high-water mark to re-write.
  assert.equal(B.STICKY_BADGE_IDS.has("eleven-month-sniper"), false);
});

test("11-Month Sniper does not collide with the existing 7-Month Sniper", () => {
  const all = [...evaluate([], []), ...B.evaluateEventBadges([])];
  const seven = all.find(b => b.id === "sniper");
  const eleven = all.find(b => b.id === "eleven-month-sniper");
  assert.equal(seven.name, "7-Month Sniper");
  assert.equal(eleven.name, "11-Month Sniper");
  assert.notEqual(seven.icon, eleven.icon, "the two snipers must be visually distinguishable");
  assert.equal(new Set(all.map(b => b.id)).size, all.length, "duplicate badge id");
});

// ---------------------------------------------------------------------
// Whole-collection sanity
// ---------------------------------------------------------------------

test("mastery score can actually reach 100% and no badge is malformed", () => {
  const all = [...evaluate([contract()], [trip("saratogaSprings", "treehouse")]), ...B.evaluateEventBadges([])];
  for (const b of all) {
    assert.ok(b.name, `badge ${b.id} has no name`);
    assert.ok(b.tierLabel != null, `${b.id} has no tierLabel`);
    if (b.kind === "tiered") {
      assert.ok(Array.isArray(b.tiers) && b.tiers.length > 0, `${b.id} has no tiers`);
      assert.ok(b.tierNumber <= b.tiers.length, `${b.id} tierNumber exceeds its own ladder`);
    }
  }
  const mastery = B.computeMasteryScore(all);
  assert.ok(mastery.max > 0);
  assert.ok(mastery.earned <= mastery.max, "earned tiers exceed the maximum reachable");
});

test("7-Month Sniper needs an away stay the contract can actually reach", () => {
  const saved = { summary: window.DVCTripFunding.summary, access: window.DVCAuth.getUserResortAccess };
  window.DVCTripFunding.summary = () => ({ valid: true, owned: 20 });
  // A home-only resale contract: reaches nothing beyond its own resort.
  window.DVCAuth.getUserResortAccess = ([c]) => ({ homeResortIds: new Set([c.home_resort_id]), sevenMoResortIds: new Set(c.purchase_type === "resale" ? [] : ["copperCreek"]) });
  const trip = contract_id => ({ resort_id: "copperCreek", room_type_id: "x", check_in: "2026-09-27", check_out: "2026-09-30", points_used: 20,
    points_source_breakdown: { version: 2, allocations: [{ contract_id, points: 20 }], one_time: 0, transferred: 0, other: 0 } });
  const sniper = contract => B.evaluateUserBadges([contract], [trip(contract.id)], [], { paybackPct: 0 }, null, []).find(b => b.id === "sniper");
  try {
    assert.equal(sniper({ id: "d", is_active: true, home_resort_id: "riviera", purchase_type: "direct" }).unlocked, true);
    assert.equal(sniper({ id: "r", is_active: true, home_resort_id: "riviera", purchase_type: "resale" }).unlocked, false);
    assert.equal(sniper({ id: "h", is_active: true, home_resort_id: "copperCreek", purchase_type: "direct" }).unlocked, false);
  } finally {
    window.DVCTripFunding.summary = saved.summary;
    window.DVCAuth.getUserResortAccess = saved.access;
  }
});

// ---- Free badges (2026-09-24) ----
const FREE_IDS = new Set([...fs.readFileSync(path.join(ROOT, "js/auth.js"), "utf8")
  .match(/const FREE_BADGE_IDS = new Set\(\[([^]*?)\]\)/)[1].matchAll(/"([a-z-]+)"/g)].map(m => m[1]));
const everyBadge = (itins = [], stored = []) => [
  ...window.DVCBadges.evaluateUserBadges([], [], itins, { paybackPct: 0 }, null, []),
  ...window.DVCBadges.evaluateEventBadges(stored),
];

test("free badges: 13, and every id on auth.js's list is a real badge", () => {
  assert.equal(FREE_IDS.size, 13);
  const ids = new Set(everyBadge().map(b => b.id));
  for (const id of FREE_IDS) assert.ok(ids.has(id), id);
});

test("free badges: none of them needs a contract, trip or member-only data", () => {
  const itins = [
    { created_at: "2026-01-01T00:00:00Z", segments: [{ resortId: "saratogaSprings", checkIn: "2026-12-01" }, { resortId: "oldKeyWest", checkIn: "2026-12-04" }] },
  ];
  const stored = [...FREE_IDS].map(id => ({ badge_id: id, event_count: 50 }));
  const unlocked = new Set(everyBadge(itins, stored).filter(b => b.unlocked).map(b => b.id));
  for (const id of ["savant", "daydreamer", "early-bird", "stay-finder", "resort-matchmaker", "trend-watcher", "deed-detective", "re-checker", "night-owl"]) {
    assert.ok(unlocked.has(id), id);
  }
});

test("Early Bird: needs check-in 10+ months after the save date", () => {
  const badge = created => everyBadge([{ created_at: created, segments: [{ resortId: "boulderRidge", checkIn: "2027-08-01" }] }]).find(b => b.id === "early-bird");
  assert.equal(badge("2026-10-01T12:00:00Z").unlocked, true);  // exactly 10 months
  assert.equal(badge("2026-10-02T12:00:00Z").unlocked, false);
  assert.equal(everyBadge([{ segments: [{ resortId: "boulderRidge", checkIn: "2030-01-01" }] }]).find(b => b.id === "early-bird").unlocked, false);
});

test("Resort Collector counts distinct resorts across itineraries", () => {
  const itins = ["saratogaSprings", "oldKeyWest", "saratogaSprings", "boulderRidge"].map(resortId => ({ segments: [{ resortId, checkIn: "2027-01-01" }] }));
  const b = everyBadge(itins).find(b => b.id === "resort-collector");
  assert.equal(b.value, 3);
  assert.equal(b.tierNumber, 1);
});

test("markMemberOnly: non-members see every non-free badge locked and labeled", () => {
  const badges = everyBadge([], [{ badge_id: "night-owl", event_count: 3 }]);
  const marked = window.DVCBadges.markMemberOnly(badges, FREE_IDS, false);
  for (const b of marked) {
    if (FREE_IDS.has(b.id)) assert.ok(!b.memberOnly, b.id);
    else { assert.equal(b.memberOnly, true, b.id); assert.equal(b.unlocked, false, b.id); assert.equal(window.DVCBadges.badgeTierText(b), "Active Member"); }
  }
  assert.ok(marked.find(b => b.id === "night-owl").unlocked);
  assert.equal(window.DVCBadges.markMemberOnly(badges, FREE_IDS, true), badges);
});
