// Prompt 6: owner-entered actual ownership costs -- money handling
// (dvc-actual-costs.js), the value model with actuals (dvc-owner-value.js),
// and the save function's guards (migration 028).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const A = require('../dvc-actual-costs.js');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const defaults = { point_value_baseline: 20, dues_growth_rate: 0.04, value_growth_rate: 0, opportunity_cost_rate: 0 };
const RATES = { 2023: 7, 2024: 8, 2025: 9, 2026: 10 };
function model() {
  const context = vm.createContext({
    window: { DVCAuth: { DEFAULT_USER_SETTINGS: defaults } },
    Date: class extends Date { constructor(...args) { super(...(args.length ? args : [2026, 8, 23])); } },
    RESORT_INVESTMENT_DATA: { ssr: { resalePricePerPoint: 100, contractExpirationYear: 2054 }, blt: { resalePricePerPoint: 150, contractExpirationYear: 2060 } },
    DUES_HISTORY: { ssr: RATES, blt: RATES }, getDuesForYear: (id, y) => RATES[y] ?? 10,
  });
  vm.runInContext(read('dvc-owner-value.js'), context);
  return context.window.DVCOwnerValue.create(t => t.credit);
}
const M = model();
const plain = v => JSON.parse(JSON.stringify(v));
const ssr = { id: 'a', home_resort_id: 'ssr', purchase_type: 'resale', purchase_date: '2024-03-01', purchase_price: 15000, points_per_year: 100, is_active: true };
const blt = { id: 'b', home_resort_id: 'blt', purchase_type: 'direct', purchase_date: '2025-06-01', purchase_price: 30000, points_per_year: 150, is_active: true };
const idx = rows => A.index(rows);

test('money: dollars and cents to integer cents; blank means estimate; zero is a real zero', () => {
  assert.deepEqual(A.parseMoney('1,234.5'), { cents: 123450 });
  assert.deepEqual(A.parseMoney('$0'), { cents: 0 });
  assert.deepEqual(A.parseMoney('  '), { blank: true });
  for (const bad of ['12.345', '-5', 'abc', '1.2.3']) assert.ok(A.parseMoney(bad).error, bad);
  assert.equal(A.toCents('1234.50'), 123450);
  assert.equal(A.toCents(0.1 + 0.2 > 0.3 ? '0.30' : '0.30'), 30);
  assert.equal(A.centsText(123405), '1234.05');
  // 3 x $0.10 stays exact in cents (floats would drift).
  const sum = ['0.10', '0.10', '0.10'].reduce((s, v) => s + A.toCents(v), 0);
  assert.equal(A.centsText(sum), '0.30');
});

test('changes: only edited fields are sent; blank removes an actual; errors block the save', () => {
  const saved = idx([{ contract_id: 'a', kind: 'dues', year: 2025, amount: '900.00' }, { contract_id: 'a', kind: 'closing', year: null, amount: '1800' }]).a;
  const c = A.changes(saved, { dues: { 2024: '', 2025: '900', 2026: '1,010.10' }, closing: '', interest: { 2025: '0' } });
  assert.deepEqual(c.errors, []);
  assert.deepEqual(c.entries, [{ kind: 'dues', year: 2026, amount: '1010.10' }, { kind: 'interest', year: 2025, amount: '0.00' }, { kind: 'closing', year: null, amount: null }]);
  assert.equal(A.changes(saved, { dues: { 2025: '9x' } }).errors[0].year, 2025);
});

test('one contract: actual dues replace the published rate year by year; blank years stay estimated', () => {
  const est = M.computeHouseMoneyStats([ssr], [], defaults);
  assert.equal(est.totalDuesPaid, 800 + 900 + 1000);
  assert.equal(est.totalClosingCosts, 1500);
  assert.deepEqual(plain(est.costSources), { duesYears: 3, actualDuesYears: 0, closingActual: 0, closingEstimated: 1, estimatedPrices: 0, estimatedStarts: 0, interestYears: 0 });
  const act = M.computeHouseMoneyStats([ssr], [], defaults, idx([{ contract_id: 'a', kind: 'dues', year: 2025, amount: '1234.56' }, { contract_id: 'a', kind: 'closing', year: null, amount: '0' }]));
  assert.equal(Math.round(act.totalDuesPaid * 100), 80000 + 123456 + 100000);
  assert.equal(act.totalClosingCosts, 0); // a saved zero is an actual zero, not "use $1,500"
  assert.equal(act.costSources.actualDuesYears, 1);
  assert.equal(act.costSources.closingActual, 1);
  const b = act.perContract[0];
  assert.deepEqual(plain(b.years.map(y => [y.year, y.duesSource])), [[2024, 'published'], [2025, 'actual'], [2026, 'published']]);
  assert.equal(b.closingSource, 'actual');
  assert.equal(b.priceSource, 'entered');
  // Outlay, payback and remaining all move with the actuals, and the cost chart agrees at today.
  assert.equal(Math.round(act.totalOutlay * 100), Math.round((15000 + 0 + act.totalDuesPaid) * 100));
  const today = act.series.years.indexOf(2026);
  assert.equal(Math.round(act.series.outlay[today] * 100), Math.round(act.totalOutlay * 100));
  const trips = [{ check_out: '2025-05-01', credit: { cash: 5000, ownedPoints: 100 } }];
  assert.ok(M.computeHouseMoneyStats([ssr], trips, defaults, idx([])).remaining !== M.computeHouseMoneyStats([ssr], trips, defaults, idx([{ contract_id: 'a', kind: 'dues', year: 2024, amount: '3000' }])).remaining);
});

test('multiple contracts: each actual changes only its own contract', () => {
  const actuals = idx([{ contract_id: 'b', kind: 'dues', year: 2026, amount: '2000' }]);
  const s = M.computeHouseMoneyStats([ssr, blt], [], defaults, actuals);
  assert.equal(s.perContract[0].duesTotal, 2700);
  assert.equal(s.perContract[1].duesTotal, 150 * 9 + 2000);
  assert.equal(s.perContract[1].closing, 0); // direct: no closing estimate
  assert.equal(s.costSources.duesYears, 5);
  assert.equal(s.costSources.actualDuesYears, 1);
});

test('financing interest adds only the interest; the purchase price is the principal, counted once', () => {
  const s = M.computeHouseMoneyStats([ssr], [], defaults, idx([{ contract_id: 'a', kind: 'interest', year: 2024, amount: '450.25' }, { contract_id: 'a', kind: 'interest', year: 2025, amount: '400' }]));
  assert.equal(s.totalPurchasePrice, 15000);
  assert.equal(Math.round(s.totalInterestPaid * 100), 85025);
  assert.equal(Math.round(s.totalOutlay * 100), Math.round((15000 + 1500 + 2700 + 850.25) * 100));
  assert.equal(s.costSources.interestYears, 2);
});

test('missing purchase price and date stay estimated and are labeled', () => {
  const bare = { ...ssr, id: 'c', purchase_price: null, purchase_date: null };
  const s = M.computeHouseMoneyStats([bare], [], defaults);
  assert.equal(s.perContract[0].priceSource, 'estimated');
  assert.equal(s.perContract[0].price, 100 * 100);
  assert.equal(s.perContract[0].startEstimated, true);
  assert.equal(s.costSources.estimatedPrices, 1);
  assert.equal(s.costSources.estimatedStarts, 1);
});

test('editing or removing an actual recalculates without double counting', () => {
  let saved = idx([{ contract_id: 'a', kind: 'dues', year: 2025, amount: '1500' }]);
  const once = M.computeHouseMoneyStats([ssr], [], defaults, saved).totalOutlay;
  saved = A.applied(saved, 'a', [{ kind: 'dues', year: 2025, amount: '1600.00' }]);
  assert.equal(M.computeHouseMoneyStats([ssr], [], defaults, saved).totalOutlay, once + 100);
  saved = A.applied(saved, 'a', [{ kind: 'dues', year: 2025, amount: null }]);
  assert.equal(M.computeHouseMoneyStats([ssr], [], defaults, saved).totalOutlay, M.computeHouseMoneyStats([ssr], [], defaults).totalOutlay);
});

test('future years are always projected, even if an actual exists for one', () => {
  const s = M.computeHouseMoneyStats([ssr], [], defaults, idx([{ contract_id: 'a', kind: 'dues', year: 2027, amount: '1' }]));
  assert.equal(M.duesForYear(ssr, 2027, { dues: { 2027: 100 } }, 2026, 0.04).source, 'projected');
  const at2027 = s.series.years.indexOf(2027), at2026 = at2027 - 1;
  assert.ok(s.series.outlay[at2027] - s.series.outlay[at2026] > 1000); // projected dues, not $1
});

test('Membership Value, Exit Equity and Home all read the same actuals', () => {
  const trips = read('trips.html'), home = read('home.js');
  assert.match(trips, /computeHouseMoneyStats\(contracts, trips, userSettings, costActuals\)/);
  assert.doesNotMatch(trips, /computeHouseMoneyStats\(contracts, trips, userSettings\)/);
  assert.match(trips, /const netVacationOutlay = stats\.totalOutlay - currentAssetValueNet;/);
  assert.match(home, /computeHouseMoneyStats\(contracts, trips, settings, actuals\)/);
});

const sql = read('db/migrations/028_ownership_costs.sql');
test('migration 028: owner-only writes through one idempotent function, cents-exact amounts', () => {
  assert.match(sql, /from public\.contracts where id = p_contract and user_id = owner_id/);
  assert.match(sql, /on conflict \(contract_id, kind, \(coalesce\(year, 0\)\)\) do update set amount = excluded\.amount/);
  assert.match(sql, /amt <> round\(amt, 2\)/);
  assert.match(sql, /amount numeric\(12,2\)/);
  assert.match(sql, /\(kind = 'closing' and year is null\) or \(kind <> 'closing' and year between 1980 and 2100\)/);
  assert.doesNotMatch(sql, /grant (insert|update|delete)[^;]*ownership_costs/);
  assert.doesNotMatch(sql, /principal\b(?![^\n]*never)/i);
});
