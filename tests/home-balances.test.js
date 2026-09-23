// Home's compact points portfolio (2026-09-23 redesign): the real
// renderContractsWidget() from home.js, rendered against the shared
// dvc-dates / dvc-point-attention / dvc-home-summary modules.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../home.js'), 'utf8').replace(/\r/g, '');
const fn = name => source.match(new RegExp('function ' + name + '\\([^]*?\\n\\}'))[0];

function setup(today = { year: 2026, month: 9, day: 22 }) {
  const container = { innerHTML: '' };
  const c = vm.createContext({ window: {}, RESORTS: [{ id: 'ssr', name: "Disney's Saratoga Springs Resort & Spa" }],
    document: { getElementById: () => container } });
  for (const f of ['dvc-dates.js', 'dvc-point-attention.js', 'dvc-home-summary.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), c);
  c.window.DVCHomeSummary = c.window.DVCHomeSummary || require('../dvc-home-summary.js');
  vm.runInContext(`const currentUYYear = window.DVCDates.currentUYYear; const todayInEastern = () => (${JSON.stringify(today)});
    const HOME_CONTRACT_ROWS = 3;` + fn('resortName') + fn('contractName') + fn('renderContractsWidget'), c);
  return (contracts, rows) => { c.renderContractsWidget(contracts, rows); return container.innerHTML; };
}
const contract = (id, extra = {}) => ({ id, use_year: 'Dec', home_resort_id: 'ssr', nickname: null, points_per_year: 200, is_active: true, ...extra });
const row = (use_year_label, b = {}) => ({ use_year_label, balance_confirmed_at: 'x', points_remaining: 0, points_banked: 0, points_borrowed: 0, points_holding: 0, ...b });

test('a December contract shows its actual current (2025) and next (2026) use years', () => {
  const html = setup()([contract('a')], { a: [row(2025, { points_remaining: 400 }), row(2026, { points_remaining: 180 })] });
  assert.match(html, /Now &middot; 2025: 400 pts/);
  assert.match(html, /Next &middot; 2026: 180 pts/);
  assert.match(html, /contract=a&year=2025/);
});

test('all four buckets count toward recorded points left, and a saved zero stays 0', () => {
  const html = setup()([contract('a')], { a: [row(2025, { points_banked: 20, points_borrowed: 30, points_holding: 10 }), row(2026)] });
  assert.match(html, /portfolio-total">60</);
  assert.match(html, /Next &middot; 2026: 0 pts/);
  assert.doesNotMatch(html, /Add balance/);
});

test('missing balances are never zero or the annual allotment', () => {
  const render = setup();
  const one = render([contract('a'), contract('b')], { a: [row(2025, { points_remaining: 400 })] });
  assert.match(one, /portfolio-total">400</);
  assert.match(one, /1 balance needed/);
  assert.doesNotMatch(one, /200 pts/);
  const none = render([contract('a')], {});
  assert.match(none, /Balances needed/);
  assert.doesNotMatch(none, /portfolio-total">0</);
});

test('unconfirmed rows count as missing, and names are escaped', () => {
  const html = setup()([contract('a&b', { nickname: '<img src=x>' })], { 'a&b': [{ use_year_label: 2025, points_remaining: 200 }] });
  assert.match(html, /Balances needed/);
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img src=x&gt;/);
  assert.match(html, /contract=a%26b/);
});

test('each row opens the year that needs a balance first', () => {
  const render = setup();
  assert.match(render([contract('a')], {}), /contract=a&year=2025/);
  assert.match(render([contract('a')], { a: [row(2025, { points_remaining: 5 })] }), /contract=a&year=2026/);
  assert.match(render([contract('a')], { a: [row(2025), row(2026)] }), /contract=a&year=2025/);
});

test('at most three contracts are listed, with a link to the rest', () => {
  const contracts = ['a', 'b', 'c', 'd', 'e'].map(id => contract(id));
  const rows = Object.fromEntries(contracts.map(c => [c.id, [row(2025, { points_remaining: 10 })]]));
  const html = setup()(contracts, rows);
  assert.equal((html.match(/class="portfolio-row"/g) || []).length, 3);
  assert.match(html, /View all 5 contracts/);
  assert.match(html, /portfolio-total">50</); // every contract counts, not just the three shown
});

// A bare 1fr grid track can't shrink below its longest unbreakable line, so a
// long one-line resort name widened the whole page past a phone (2026-09-23).
test('Home grid tracks and cards can shrink below their content on phones', () => {
  const css = fs.readFileSync(path.join(__dirname, '../home.html'), 'utf8');
  assert.match(css, /\.dashboard-grid \{[^}]*grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\)/);
  assert.match(css, /\.dashboard-grid \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  assert.match(css, /\.widget-card \{\s*min-width: 0;/);
});
