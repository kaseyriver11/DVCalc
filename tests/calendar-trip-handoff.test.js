const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Exercise the actual page handlers without a browser or a live owner account.
function handler(file, name, next) {
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf(`function ${next}(`, start);
  assert.ok(start >= 0 && end > start);
  return source.slice(start, end);
}

function setup() {
  const storage = new Map();
  const opened = [];
  const alerts = [];
  const session = { user: { id: "owner" } };
  const contracts = [
    { id: "one", nickname: "Family", is_active: true },
    { id: "two", nickname: "Add-on", is_active: true },
  ];
  const totals = {
    resort: { id: "ssr" }, totalPoints: 55, totalCash: 2500,
    dates: ["2026-10-12", "2026-10-13"], hasCash: true, resortHasCashData: true,
  };
  const context = vm.createContext({
    window: {
      DVCAuth: {
        getSession: () => session,
        upsertContractYearPoints: () => assert.fail("Planning must not write balances"),
        addTrip: () => assert.fail("Opening a form must not save a trip"),
      },
      location: { href: "index.html" },
    },
    sessionStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key),
    },
    calcCurrentSegmentTotals: () => totals,
    isSplitMode: () => false,
    state: { roomTypeId: "studio", checkIn: "2026-10-12", checkOut: "2026-10-14", customCashRate: null },
    multiContractSplitMode: false,
    getSelectedContract: () => contracts[0],
    eligibleSplitContracts: () => contracts,
    getMultiSplitAllocations: () => ({ one: 30, two: 25 }),
    saveStateToSession: () => storage.set("dvc_calendar_state", "saved"),
    alert: text => alerts.push(text),
    contracts,
    RESORTS: [{ id: "ssr", roomTypes: [{ id: "studio" }] }],
    openTripForm: (...args) => opened.push(args),
  });
  vm.runInContext(handler("app.js", "logTripFromCalendar", "toggleSmartDrawManual"), context);
  vm.runInContext(handler("trips.html", "openCalendarTripDraft", "openTripForm"), context);
  return { context, storage, opened, alerts, totals, contracts };
}

test("calendar opens a new prefilled trip exactly once without writing owner data", () => {
  const { context: c, storage, opened } = setup();
  c.logTripFromCalendar();
  assert.equal(c.window.location.href, "trips.html");
  assert.equal(storage.get("dvc_return_to_calendar"), "1");
  c.openCalendarTripDraft();
  c.openCalendarTripDraft();
  assert.equal(opened.length, 1);
  assert.equal(opened[0][0], null); // New trip, never an existing trip edit.
  const draft = opened[0][1];
  assert.equal(draft.resort_id, "ssr");
  assert.equal(draft.room_type_id, "studio");
  assert.equal(draft.check_in, "2026-10-12");
  assert.equal(draft.check_out, "2026-10-14");
  assert.equal(draft.points_used, 55);
  assert.equal(draft.custom_cash_value, 2500);
  assert.equal(draft.contract_id, "one");
  assert.equal(storage.has("dvc_trip_draft"), false);
});

test("repeated navigation requests do not accumulate trips or deductions", () => {
  const { context: c, storage } = setup();
  c.logTripFromCalendar();
  const first = storage.get("dvc_trip_draft");
  c.logTripFromCalendar();
  assert.equal(storage.get("dvc_trip_draft"), first);
});

test("multi-contract preview passes notes without attributing everything to one contract", () => {
  const { context: c, opened } = setup();
  c.multiContractSplitMode = true;
  c.logTripFromCalendar();
  c.openCalendarTripDraft();
  assert.equal(opened[0][1].contract_id, null);
  assert.match(opened[0][1].notes, /Proposed contract split/);
  assert.match(opened[0][1].notes, /Family: 30 pts\nAdd-on: 25 pts/);
  assert.equal(opened[0][1].points_used, 55);
  assert.deepEqual(JSON.parse(JSON.stringify(opened[0][1].contract_allocations)), [
    { contract_id: "one", points: 30 },
    { contract_id: "two", points: 25 },
  ]);
});

test("custom nightly cash value is handed off as the total stay value", () => {
  const { context: c, totals, opened } = setup();
  totals.resortHasCashData = false;
  totals.hasCash = false;
  c.state.customCashRate = 600;
  c.logTripFromCalendar();
  c.openCalendarTripDraft();
  assert.equal(opened[0][1].custom_cash_value, 1200);
  assert.equal(opened[0][1].cash_is_custom, true);
});

test("draft waits for sign-in and is not exposed to another account", () => {
  const { context: c, storage, opened } = setup();
  c.logTripFromCalendar();
  c.window.DVCAuth.getSession = () => null;
  c.openCalendarTripDraft();
  assert.equal(storage.has("dvc_trip_draft"), true);
  c.window.DVCAuth.getSession = () => ({ user: { id: "other-owner" } });
  c.openCalendarTripDraft();
  assert.equal(opened.length, 0);
  assert.equal(storage.has("dvc_trip_draft"), false);
});

test("malformed or unsupported drafts do not break Membership Value", () => {
  const { context: c, storage, opened } = setup();
  for (const raw of ["{broken", "null", JSON.stringify({ version: 2 })]) {
    storage.set("dvc_trip_draft", raw);
    assert.doesNotThrow(() => c.openCalendarTripDraft());
  }
  assert.equal(opened.length, 0);
});

test("inactive contract is omitted and a supplied trip ID cannot turn the draft into an edit", () => {
  const { context: c, storage, opened, contracts } = setup();
  c.logTripFromCalendar();
  const draft = JSON.parse(storage.get("dvc_trip_draft"));
  draft.id = "existing-trip";
  storage.set("dvc_trip_draft", JSON.stringify(draft));
  contracts[0].is_active = false;
  c.openCalendarTripDraft();
  assert.equal(opened[0][0], null);
  assert.equal(opened[0][1].contract_id, null);
  assert.equal(opened[0][1].id, undefined);
});

test("storage failure keeps the owner on the calendar with an explanation", () => {
  const { context: c, alerts } = setup();
  c.sessionStorage.setItem = () => { throw new Error("Storage unavailable"); };
  c.logTripFromCalendar();
  assert.equal(c.window.location.href, "index.html");
  assert.match(alerts[0], /Couldn't open the trip form/);
});
