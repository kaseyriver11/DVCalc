// "Use these points" (Prompt 4): dvc-use-points.js against the real point
// charts, Field Guide history, resale access rules (auth.js
// getUserResortAccess), stay search (dvc-leftover-points.js) and funding
// allocator (dvc-plan-funding.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const U = require('../dvc-use-points.js');
const { allocate } = require('../dvc-plan-funding.js');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const c = vm.createContext({ window: {} });
for (const f of ['data/data.js', 'data/data_historical.js', 'data/availability_data.js', 'dvc-dates.js', 'dvc-leftover-points.js']) vm.runInContext(read(f), c);
const auth = read('auth.js');
vm.runInContext(auth.slice(auth.indexOf('const HOME_ONLY_RESALE_RESORTS'), auth.indexOf('// Direct-purchase minimum points')), c);
const RESORTS = vm.runInContext('RESORTS', c), AV = vm.runInContext('AVAILABILITY_DATA', c);
const getPointsForDate = vm.runInContext('getPointsForDate', c), getUserResortAccess = vm.runInContext('getUserResortAccess', c);
const D = c.window.DVCDates, L = c.window.DVCLeftoverPoints;

const TODAY = { year: 2026, month: 9, day: 23 };
const todayMs = Date.UTC(2026, 8, 23), todayStr = '2026-09-23';
const DAY = 86400000;
const iso = ms => new Date(ms).toISOString().slice(0, 10);
const allIds = [...new Set(RESORTS.map(r => r.id))];
const charts = allIds.map(id => RESORTS.find(r => r.id === id && r.year === 2026) || RESORTS.find(r => r.id === id));
const pointsFor = (id, room, date) => { const ch = RESORTS.find(r => r.id === id && r.year === +date.slice(0, 4)); return ch ? getPointsForDate(ch, date, room) ?? null : null; };
const availabilityFor = (id, room, night, checkIn) => L.availabilityScore(AV, id, room, night, L.bookingWindowKey((Date.parse(checkIn + 'T00:00:00Z') - todayMs) / DAY));
const worstAvailability = s => { let w = Infinity; for (let i = 0; i < s.nights; i++) { const v = availabilityFor(s.resortId, s.roomTypeId, iso(Date.parse(s.checkIn + 'T00:00:00Z') + i * DAY), s.checkIn); if (v == null) return null; w = Math.min(w, v); } return w; };
// Same rollover rule as the calendar (app.js monthsBeforeCheckIn).
const opensOn = (checkIn, months) => { const [y, m, d] = checkIn.split('-').map(Number); const dt = new Date(y, m - 1, d); dt.setMonth(dt.getMonth() - months); return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; };
const caps = { 11: D.monthsFromDate(11, TODAY), 7: D.monthsFromDate(7, TODAY) };

const contract = (id, home, use_year, extra = {}) => ({ id, home_resort_id: home, use_year, purchase_type: 'resale', is_active: true, points_per_year: 150, ...extra });
const row = b => ({ balance_confirmed_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-02T00:00:00Z', points_remaining: 0, points_banked: 0, points_borrowed: 0, points_holding: 0, ...b });
const budget = (k, r, year) => U.budget({ contract: k, row: r, year, today: TODAY, dates: D });
const search = (k, b, opts = {}) => U.suggest({ b, today: TODAY, dates: D, pointsFor, availabilityFor, worstAvailability, findStays: L.findStays,
  resorts: U.eligibleResorts({ charts, access: getUserResortAccess([k], allIds), caps, ...opts }), month: opts.month });
const fundStay = (primary, year, b, stay, others = []) => U.fund({ nights: U.nightly({ ...stay, pointsFor }), resortId: stay.resortId, checkIn: stay.checkIn,
  primary: { contract: primary, year, b }, accessFor: k => getUserResortAccess([k], allIds), opensOn, todayStr, allocate, dates: D,
  others: others.map(([k, rows]) => ({ contract: k, rowFor: date => { const y = D.currentUYYear(k.use_year, { year: +date.slice(0, 4), month: +date.slice(5, 7), day: +date.slice(8, 10) }); return { year: y, row: rows[y] || null }; } })) });

const ssr = contract('ssr', 'saratogaSprings', 'Dec');

test('budget: unknown is never the allotment; a saved zero is zero; Holding kept apart', () => {
  assert.equal(budget(ssr, null, 2025).state, 'unknown');
  assert.equal(budget(ssr, { points_remaining: 150 }, 2025).state, 'unknown'); // unconfirmed draft
  assert.equal(budget(ssr, row({}), 2025).state, 'zero');
  const b = budget(ssr, row({ points_remaining: 60, points_banked: 20, points_holding: 10 }), 2025);
  assert.deepEqual([b.state, b.flexible, b.holding, b.total, iso(b.endMs), b.daysLeft, b.bankingOpen], ['ok', 80, 10, 90, '2026-11-30', 68, false]);
  const next = budget(ssr, row({ points_remaining: 150 }), 2026);
  assert.deepEqual([iso(next.startMs), iso(next.endMs), next.bankingOpen], ['2026-12-01', '2027-11-30', false]); // not started yet
  const feb = budget(contract('f', 'saratogaSprings', 'Feb'), row({ points_remaining: 100 }), 2026);
  assert.deepEqual([feb.bankingOpen, iso(feb.bankingDeadlineMs)], [true, '2026-09-30']);
});

test('room sizes from real room names', () => {
  assert.equal(U.roomSize('Deluxe Studio - Standard View'), 'studio');
  assert.equal(U.roomSize('Tower Studio'), 'studio');
  assert.equal(U.roomSize('One-Bedroom Villa - Preferred View'), '1br');
  assert.equal(U.roomSize('Cabin'), '1br');
  assert.equal(U.roomSize('Two-Bedroom Bungalow'), '2br');
  assert.equal(U.roomSize('Three-Bedroom Treehouse Villa'), '3br');
  assert.equal(U.roomSize('Three-Bedroom Grand Villa - Standard View'), '3br');
});

test('resale access: a Riviera resale contract only reaches Riviera; legacy resale reaches the legacy resorts; direct reaches all', () => {
  const ids = k => U.eligibleResorts({ charts, access: getUserResortAccess([k], allIds), caps }).map(r => [r.resortId, r.window]);
  assert.deepEqual(ids(contract('r', 'rivieraResort', 'Dec')), [['rivieraResort', 11]]);
  const legacy = ids(ssr);
  assert.ok(legacy.some(([id, w]) => id === 'saratogaSprings' && w === 11));
  assert.ok(legacy.some(([id, w]) => id === 'polynesianVillas' && w === 7));
  assert.ok(!legacy.some(([id]) => ['rivieraResort', 'disneylandHotel', 'cabinsFortWilderness'].includes(id)));
  const direct = ids(contract('d', 'rivieraResort', 'Dec', { purchase_type: 'direct' }));
  assert.ok(direct.length >= legacy.length && direct.some(([id]) => id === 'saratogaSprings'));
});

test('80 expiring points: practical stays inside the use year, within the budget, WDW first, one per resort', () => {
  const b = budget(ssr, row({ points_remaining: 60, points_banked: 20 }), 2025);
  const ideas = search(ssr, b);
  assert.ok(ideas.length >= 3, 'expected several ideas');
  const access = getUserResortAccess([ssr], allIds);
  for (const s of ideas) {
    assert.ok(s.pointsUsed <= 80 && s.pointsUsed > 0);
    assert.ok(s.checkIn > todayStr && s.checkOut <= '2026-12-01', `${s.checkIn} → ${s.checkOut} must stay in the use year`);
    assert.ok(access.homeResortIds.has(s.resortId) || access.sevenMoResortIds.has(s.resortId));
    assert.ok(['excellent', 'good', 'limited', 'unknown'].includes(s.outlook));
    const nights = U.nightly({ ...s, pointsFor });
    assert.equal(nights.reduce((t, x) => t + x.points, 0), s.pointsUsed, 'point math matches the chart night by night');
  }
  assert.equal(new Set(ideas.map(s => s.resortId)).size, ideas.length);
  const wdw = ideas.map(s => !['aulani', 'hiltonHead', 'veroBeach', 'disneylandHotel', 'grandCalifornian'].includes(s.resortId));
  assert.deepEqual(wdw, [...wdw].sort((a, b) => b - a));
});

test('Holding: only stays checking in within 60 days can use it', () => {
  const b = budget(ssr, row({ points_holding: 50 }), 2025);
  const ideas = search(ssr, b);
  assert.ok(ideas.length > 0);
  for (const s of ideas) { assert.ok(s.checkIn <= iso(todayMs + 60 * DAY)); assert.equal(s.usesHolding, true); }
  const later = fundStay(ssr, 2025, b, { resortId: 'saratogaSprings', roomTypeId: RESORTS.find(r => r.id === 'saratogaSprings' && r.year === 2026).roomTypes[0].id, checkIn: '2026-11-25', nights: 2 });
  assert.equal(later.holdingExcluded, true);
  assert.equal(later.primary.points, 0);
});

test('month and room filters narrow the search; no fit and too few points give no ideas', () => {
  const b = budget(ssr, row({ points_remaining: 120 }), 2025);
  for (const s of search(ssr, b, { month: '2026-11' })) assert.equal(s.checkIn.slice(0, 7), '2026-11');
  assert.deepEqual(search(ssr, b, { partySize: 12, size: 'studio' }), []);
  assert.deepEqual(search(ssr, budget(ssr, row({ points_remaining: 1 }), 2025)), []);
  assert.deepEqual(search(ssr, budget(ssr, row({}), 2025)), []); // zero balance
  assert.deepEqual(search(ssr, budget(ssr, null, 2025)), []); // unknown balance
});

test('funding: cross-use-year nights, other contracts at 11 vs 7 months, restricted and unknown contracts', () => {
  const room = RESORTS.find(r => r.id === 'saratogaSprings' && r.year === 2026).roomTypes[0].id;
  const b = budget(ssr, row({ points_remaining: 200 }), 2025);
  // Nov 28 – Dec 3 (nights Nov 28 – Dec 2): Dec 1 and 2 fall in the Dec contract's next use year.
  const cross = fundStay(ssr, 2025, b, { resortId: 'saratogaSprings', roomTypeId: room, checkIn: '2026-11-28', nights: 5 },
    [[contract('home2', 'saratogaSprings', 'Feb'), { 2026: row({ points_remaining: 150 }) }]]);
  assert.equal(cross.outsideYear, 2);
  assert.equal(cross.others.length, 1);
  assert.equal(cross.others[0].window, 11);
  assert.equal(cross.shortfall, 0);
  assert.equal(cross.primary.points + cross.others[0].points, cross.total);

  // A stay 9 months out: the home contract's 11-month window is open, a
  // legacy non-home contract's 7-month window isn't -- it says when it opens.
  const far = { resortId: 'saratogaSprings', roomTypeId: room, checkIn: '2027-06-20', nights: 4 };
  const small = contract('small', 'saratogaSprings', 'Feb');
  const poly = contract('poly', 'polynesianVillas', 'Feb');
  const riv = contract('riv', 'rivieraResort', 'Feb');
  const unk = contract('unk', 'boardwalkVillas', 'Feb');
  const f = fundStay(small, 2027, budget(small, row({ points_remaining: 10 }), 2027), far,
    [[poly, { 2027: row({ points_remaining: 300 }) }], [riv, { 2027: row({ points_remaining: 300 }) }], [unk, {}]]);
  assert.equal(f.primary.window, 11);
  assert.equal(f.primary.openNow, true);
  assert.equal(f.others[0].contract.id, 'poly');
  assert.equal(f.others[0].window, 7);
  assert.equal(f.others[0].openNow, false);
  assert.equal(f.others[0].opens, '2026-11-20');
  assert.deepEqual(f.blocked.map(k => k.id), ['riv']);
  assert.deepEqual(f.unknown.map(u => u.contract.id), ['unk']);
  assert.equal(f.shortfall, 0);

  // The primary contract's own next use year covers nights past its end,
  // without re-counting the year already used.
  const self = fundStay(ssr, 2025, budget(ssr, row({ points_remaining: 200 }), 2025), { resortId: 'saratogaSprings', roomTypeId: room, checkIn: '2026-11-28', nights: 5 },
    [[ssr, { 2025: row({ points_remaining: 200 }), 2026: row({ points_remaining: 150 }) }]]);
  assert.deepEqual(self.others.map(o => [o.contract.id, o.year]), [['ssr', 2026]]);
  assert.equal(self.shortfall, 0);
  assert.equal(self.primary.points + self.others[0].points, self.total);

  // Insufficient everywhere: the shortage is stated.
  const short = fundStay(small, 2027, budget(small, row({ points_remaining: 10 }), 2027), far);
  assert.equal(short.primary.points, 10);
  assert.equal(short.shortfall, short.total - 10);
});

test('the page labels possibility, history and Disney separately, and never books or deducts', () => {
  const page = read('use-points.html');
  for (const label of ['Fits recorded points', 'Historical availability outlook', 'Check live availability with Disney', 'Add or check this balance first']) assert.ok(page.includes(label), label);
  assert.doesNotMatch(page, /saveTripBooking|upsertContractYearPoints|recordPointMovement|reconcilePoints|<select(?![^>]*native-select)/);
  assert.match(page, /https:\/\/disneyvacationclub\.disney\.go\.com\//);
  assert.doesNotMatch(page, />\s*Available\s*</i);
});

test('entry points: the ledger row and point actions open this flow for the exact contract and use year', () => {
  const account = read('account.html');
  assert.match(account, /class="ledger-primary-btn" href="use-points\.html\?contract=\$\{encodeURIComponent\(c\.id\)\}&year=\$\{row\.year\}"/);
  assert.match(account, /href="use-points\.html\?contract=\$\{encodeURIComponent\(c\.id\)\}&year=\$\{event\.year\}">Use these points &rarr;</);
  assert.match(read('dvc-home-summary.js'), /use-points\.html\?contract=/);
});
