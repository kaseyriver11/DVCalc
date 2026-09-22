// Tests the 11-Month Sniper's TRIGGER GATE in app.js -- specifically that
// an owner with contracts at several resorts gets credit at every one of
// them, since DVC grants 11-month priority per deed with no notion of a
// "primary" home resort.
//
// Loads the real getUserResortAccess() out of auth.js (which is an ES
// module importing Supabase over the network, so it can't be require()d)
// by slicing out the region that defines it and running that in a vm
// context -- the same technique tests/itinerary-funding.test.js already
// uses. app.js's own function is extracted the same way; loading all of
// app.js would drag in its DOM setup.
//
// The date half of the gate is NOT retested here -- isInFinalWindowMonth()
// has its own boundary tests in dvc-badges.test.js. This file pins "today"
// so every case below turns purely on contracts and resorts.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");

const TODAY = { year: 2026, month: 6, day: 15 };
// Inside the 10-to-11-month stretch from TODAY; see dvc-badges.test.js.
const IN_WINDOW = "2027-05-01";
const TOO_SOON = "2026-12-01";

// Real dvc-dates.js, loaded once for its window math.
const datesCtx = vm.createContext({ window: {} });
vm.runInContext(read("dvc-dates.js"), datesCtx);
const realDates = datesCtx.window.DVCDates;

const ALL_RESORT_IDS = [
  "bayLakeTower", "animalKingdomVillas", "saratogaSprings", "rivieraResort",
  "grandFloridian", "beachClubVillas",
];

function setup() {
  const tracked = [];
  const ctx = vm.createContext({
    state: { checkIn: IN_WINDOW, resortId: "bayLakeTower" },
    userContracts: [],
    RESORTS: ALL_RESORT_IDS.flatMap(id => [2026, 2027].map(year => ({ id, year }))),
    window: {
      DVCTrack: { track: id => tracked.push(id) },
      // Delegates to the real implementation with a pinned "today" --
      // app.js calls it with two args, so it would otherwise read the
      // system clock and make these tests drift.
      DVCDates: {
        isInFinalWindowMonth: (checkIn, months) =>
          realDates.isInFinalWindowMonth(checkIn, months, TODAY),
      },
    },
  });

  const auth = read("auth.js");
  vm.runInContext(
    auth.slice(auth.indexOf("const HOME_ONLY_RESALE_RESORTS"), auth.indexOf("// Direct-purchase minimum points")),
    ctx,
  );
  ctx.window.DVCAuth = { getUserResortAccess: ctx.getUserResortAccess };

  const app = read("app.js");
  vm.runInContext(app.match(/function trackElevenMonthSniper\(\)[^]*?\n\}/)[0], ctx);

  ctx.tracked = tracked;
  ctx.own = (home, over = {}) => {
    ctx.userContracts.push({
      id: `c${ctx.userContracts.length}`, home_resort_id: home,
      purchase_type: "resale", points_per_year: 150, is_active: true, ...over,
    });
  };
  ctx.lookAt = (resortId, checkIn = IN_WINDOW) => {
    ctx.state.resortId = resortId;
    ctx.state.checkIn = checkIn;
    tracked.length = 0;
    vm.runInContext("trackElevenMonthSniper()", ctx);
    return tracked.slice();
  };
  return ctx;
}

test("an owner at several resorts snipes at every one of them", () => {
  // The whole point: DVC grants 11-month priority per deed. There is no
  // primary contract, so owning Bay Lake Tower AND Animal Kingdom Villas
  // must earn the badge at both, not just whichever came first.
  const c = setup();
  c.own("bayLakeTower");
  c.own("animalKingdomVillas");
  assert.deepEqual(c.lookAt("bayLakeTower"), ["eleven-month-sniper"]);
  assert.deepEqual(c.lookAt("animalKingdomVillas"), ["eleven-month-sniper"]);
});

test("a third and fourth deed keep working, including duplicates at one resort", () => {
  const c = setup();
  c.own("bayLakeTower");
  c.own("saratogaSprings");
  c.own("saratogaSprings"); // add-on at a resort already owned
  c.own("rivieraResort");
  for (const id of ["bayLakeTower", "saratogaSprings", "rivieraResort"]) {
    assert.deepEqual(c.lookAt(id), ["eleven-month-sniper"], `should fire at ${id}`);
  }
});

test("a resort you do not own never fires, even at 10-11 months out", () => {
  const c = setup();
  c.own("bayLakeTower");
  assert.deepEqual(c.lookAt("grandFloridian"), []);
  assert.deepEqual(c.lookAt("beachClubVillas"), []);
});

test("a direct contract's 7-month reach everywhere does not widen the gate", () => {
  // getUserResortAccess() puts EVERY resort in sevenMoResortIds for a
  // direct contract. Only homeResortIds may gate this badge -- 7-month
  // reach is exactly what an 11-month snipe is supposed to beat.
  const c = setup();
  c.own("bayLakeTower", { purchase_type: "direct" });
  assert.deepEqual(c.lookAt("bayLakeTower"), ["eleven-month-sniper"]);
  assert.deepEqual(c.lookAt("saratogaSprings"), []);
});

test("a home-only resale contract still snipes its own home resort", () => {
  // Riviera resale can book nowhere else at 7 months, but its 11-month
  // home priority is intact -- arguably the purest sniper case there is.
  const c = setup();
  c.own("rivieraResort", { purchase_type: "resale" });
  assert.deepEqual(c.lookAt("rivieraResort"), ["eleven-month-sniper"]);
  assert.deepEqual(c.lookAt("bayLakeTower"), []);
});

test("a sold (inactive) contract confers no priority", () => {
  const c = setup();
  c.own("bayLakeTower", { is_active: false });
  c.own("saratogaSprings");
  assert.deepEqual(c.lookAt("bayLakeTower"), []);
  assert.deepEqual(c.lookAt("saratogaSprings"), ["eleven-month-sniper"]);
});

test("an owner with no contracts never fires it", () => {
  const c = setup();
  assert.deepEqual(c.lookAt("bayLakeTower"), []);
});

test("the right resort at the wrong time does not fire", () => {
  const c = setup();
  c.own("bayLakeTower");
  assert.deepEqual(c.lookAt("bayLakeTower", TOO_SOON), []);
  assert.deepEqual(c.lookAt("bayLakeTower", "2028-01-01"), []);
  assert.deepEqual(c.lookAt("bayLakeTower", null), []);
});

test("it fires once per completed pick, not once per contract owned", () => {
  const c = setup();
  c.own("bayLakeTower");
  c.own("bayLakeTower");
  c.own("bayLakeTower");
  assert.deepEqual(c.lookAt("bayLakeTower"), ["eleven-month-sniper"]);
});

test("a missing DVCTrack/DVCAuth is a silent no-op, never a throw", () => {
  // The calendar must keep working for a signed-out or offline visitor.
  const c = setup();
  c.own("bayLakeTower");
  for (const missing of ["DVCTrack", "DVCAuth", "DVCDates"]) {
    const saved = c.window[missing];
    delete c.window[missing];
    assert.doesNotThrow(() => vm.runInContext("trackElevenMonthSniper()", c));
    c.window[missing] = saved;
  }
});
