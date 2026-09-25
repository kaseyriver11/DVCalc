// getUserResortAccess(): DVC's resale restriction (no Riviera / Disneyland
// Hotel Villas / Fort Wilderness Cabins at 7 months) only applies to resale
// deeds bought on or after 2019-01-19. Earlier resale is grandfathered.
// Loaded out of auth.js the same way tests/eleven-month-sniper.test.js does.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const auth = fs.readFileSync(path.join(__dirname, "..", "js/auth.js"), "utf8");
const ctx = vm.createContext({});
vm.runInContext(auth.slice(auth.indexOf("const HOME_ONLY_RESALE_RESORTS"), auth.indexOf("// Direct-purchase minimum points")), ctx);
const access = ctx.getUserResortAccess;

const ALL = ["saratogaSprings", "rivieraResort", "disneylandHotel", "fortWildernessCabins", "beachClubVillas"];
const RESTRICTED = ["rivieraResort", "disneylandHotel", "fortWildernessCabins"];
const resale = (purchase_date, home_resort_id = "saratogaSprings") => ({ home_resort_id, purchase_type: "resale", purchase_date, is_active: true });

test("resale bought on/after 2019-01-19 can't reach the three home-only resorts", () => {
  const r = access([resale("2022-09-10")], ALL);
  assert.deepEqual([...r.restrictedResortIds].sort(), RESTRICTED.sort());
  assert.ok(r.sevenMoResortIds.has("beachClubVillas"));
});

test("resale bought before 2019-01-19 is grandfathered everywhere", () => {
  const r = access([resale("2015-06-01")], ALL);
  assert.equal(r.restrictedResortIds.size, 0);
  for (const id of RESTRICTED) assert.ok(r.sevenMoResortIds.has(id), id);
});

test("a 2019 purchase (stored as YYYY-01-01, day unknown) is treated as restricted", () => {
  const r = access([resale("2019-01-01")], ALL);
  assert.deepEqual([...r.restrictedResortIds].sort(), RESTRICTED.sort());
});

test("no purchase date means restricted (never assume an open window)", () => {
  assert.equal(access([resale(null)], ALL).restrictedResortIds.size, 3);
  assert.equal(access([resale(undefined)], ALL).restrictedResortIds.size, 3);
});

test("a grandfathered resale at a home-only resort still books only there at 11 months", () => {
  // Riviera resale is home-only regardless of date (Riviera didn't exist before 2019 anyway).
  const r = access([resale("2021-03-01", "rivieraResort")], ALL);
  assert.ok(r.homeResortIds.has("rivieraResort"));
  assert.equal(r.sevenMoResortIds.size, 0);
});

test("direct contracts are never restricted", () => {
  const r = access([{ home_resort_id: "saratogaSprings", purchase_type: "direct", purchase_date: "2024-01-01" }], ALL);
  assert.equal(r.restrictedResortIds.size, 0);
});
