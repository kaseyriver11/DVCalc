// Membership Value costs (2026-09-23): the purchase price is the all-in
// amount (no closing estimate on top) and an optional owner estimate of
// financing interest paid to date is added once -- never the principal.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const defaults = { point_value_baseline: 20, dues_growth_rate: 0.04, value_growth_rate: 0, opportunity_cost_rate: 0 };
const RATES = { 2024: 8, 2025: 9, 2026: 10 };
const context = vm.createContext({
  window: { DVCAuth: { DEFAULT_USER_SETTINGS: defaults } },
  Date: class extends Date { constructor(...args) { super(...(args.length ? args : [2026, 8, 23])); } },
  RESORT_INVESTMENT_DATA: { ssr: { resalePricePerPoint: 100, contractExpirationYear: 2054 } },
  DUES_HISTORY: { ssr: RATES }, getDuesForYear: (id, y) => RATES[y] ?? 10,
});
vm.runInContext(read('dvc-owner-value.js'), context);
const M = context.window.DVCOwnerValue.create(t => t.credit);
const ssr = { id: 'a', home_resort_id: 'ssr', purchase_type: 'resale', purchase_date: '2024-03-01', purchase_price: 15000, points_per_year: 100, is_active: true };

test('resale purchase price is all in: nothing added for closing', () => {
  const s = M.computeHouseMoneyStats([ssr], [], defaults);
  assert.equal(s.totalInitialCost, 15000);
  assert.equal(s.totalOutlay, 15000 + 2700);
});

test('financing interest is added once, on top of the price, and shows in the chart', () => {
  const s = M.computeHouseMoneyStats([{ ...ssr, financing_interest_paid: '1250.50' }], [], defaults);
  assert.equal(s.totalPurchasePrice, 15000);
  assert.equal(s.totalInterestPaid, 1250.5);
  assert.equal(s.totalOutlay, 15000 + 1250.5 + 2700);
  assert.equal(s.series.outlay[s.series.years.indexOf(2026)], s.totalOutlay);
  assert.equal(s.perContract[0].interest, 1250.5);
  for (const bad of [null, '', -5, 'abc']) assert.equal(M.computeHouseMoneyStats([{ ...ssr, financing_interest_paid: bad }], [], defaults).totalInterestPaid, 0);
});

test('missing purchase details stay estimated and labeled', () => {
  const s = M.computeHouseMoneyStats([{ ...ssr, purchase_price: null, purchase_date: null }], [], defaults);
  assert.equal(s.perContract[0].priceSource, 'estimated');
  assert.equal(s.costSources.estimatedPrices, 1);
  assert.equal(s.costSources.estimatedStarts, 1);
});

test('the contract form collects it, and every page uses the same model without per-year actuals', () => {
  assert.match(read('account.html'), /financing_interest_paid: document\.getElementById\("f-interest"\)/);
  for (const f of ['trips.html', 'home.js', 'badges.html']) assert.doesNotMatch(read(f), /DVCActualCosts|getOwnershipCosts|costActuals/, f);
  assert.match(read('db/migrations/029_contract_financing_interest.sql'), /add column if not exists financing_interest_paid numeric\(12,2\)/);
});
