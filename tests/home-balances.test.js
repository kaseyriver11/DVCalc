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
  vm.runInContext(`const { currentUYYear, dateOnlyUTC, formatDeadlineDate } = window.DVCDates; const todayInEastern = () => (${JSON.stringify(today)});
    const HOME_CONTRACT_ROWS = 3; const ADD_CONTRACT_HREF = "account.html?start=add-contract";` + fn('resortName') + fn('contractName') + fn('renderContractsWidget'), c);
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
  assert.match(one, /1 current balance needed/);
  assert.doesNotMatch(one, /200 pts/);
  const none = render([contract('a')], {});
  assert.match(none, /Current balances needed/);
  assert.doesNotMatch(none, /portfolio-total">0</);
});

test('unconfirmed rows count as missing, and names are escaped', () => {
  const html = setup()([contract('a&b', { nickname: '<img src=x>' })], { 'a&b': [{ use_year_label: 2025, points_remaining: 200 }] });
  assert.match(html, /Current balances needed/);
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

test('the badge counts current use years only, never missing next-year balances', () => {
  const render = setup();
  // a: current known, next missing; b: current missing; c: current known, next missing
  const html = render([contract('a'), contract('b'), contract('c')], { a: [row(2025, { points_remaining: 10 })], c: [row(2025, { points_remaining: 5 })] });
  assert.match(html, /1 current balance needed/);
  assert.equal((html.match(/Add balance/g) || []).length, 4); // b now + next, a next, c next
  const two = render([contract('a'), contract('b'), contract('c')], { a: [row(2025, { points_remaining: 10 })] });
  assert.match(two, /2 current balances needed/);
});

test('zero contracts: adding one is the only primary action; inactive-only is not treated as new', () => {
  const render = setup();
  const empty = render([], {});
  // Carries the add-contract intent, so My Contracts opens the form.
  assert.match(empty, /href="account\.html\?start=add-contract" class="home-primary-btn">\+ Add your first contract/);
  const inactive = render([contract('a', { is_active: false })], {});
  assert.doesNotMatch(inactive, /Add your first contract/);
  assert.match(inactive, /None of your contracts are active/);
});

test('zero contracts: Membership Value asks for a contract, not a booking', () => {
  const container = { innerHTML: '' };
  const c = vm.createContext({ document: { getElementById: () => container }, computeHouseMoneyStats: () => { throw new Error('no stats for an empty account'); } });
  vm.runInContext(fn('renderHouseMoneyWidget'), c);
  c.renderHouseMoneyWidget([], [], {});
  assert.match(container.innerHTML, /Add a contract to see what your membership has paid back\./);
  assert.doesNotMatch(container.innerHTML, /Record/);
});

test('Home hides the action row only for a successful empty read, not a failed one', () => {
  assert.ok(source.includes('if (!contractsFailed && contracts.length === 0) document.getElementById("home-actions").innerHTML = "";\n  else renderActions(true);'));
});

// ---- How recently the counted balances were checked against Disney ----
const checked = (label, when, b = {}) => row(label, { last_checked_against_disney_at: when, ...b });

test('every counted balance checked: shows the oldest check date, never "verified"', () => {
  const html = setup()([contract('a'), contract('b')], {
    a: [checked(2025, '2026-09-10T15:00:00Z', { points_remaining: 10 })],
    b: [checked(2025, '2026-09-01T15:00:00Z', { points_remaining: 20 })],
  });
  assert.match(html, /portfolio-freshness checked">Checked against Disney &middot; oldest check Sep 1, 2026</);
  assert.doesNotMatch(html, /verified/i);
});

test('a balance never checked is counted, not hidden behind the others', () => {
  const html = setup()([contract('a'), contract('b'), contract('c')], {
    a: [checked(2025, '2026-09-10T15:00:00Z', { points_remaining: 10 })],
    b: [row(2025, { points_remaining: 20 })],
    c: [row(2025, { points_remaining: 5 })],
  });
  assert.match(html, /portfolio-freshness unchecked">2 balances haven't been checked against Disney</);
  assert.doesNotMatch(html, /oldest check/);
  const one = setup()([contract('a')], { a: [row(2025, { points_remaining: 10 })] });
  assert.match(one, /1 balance hasn't been checked against Disney/);
});

test('a stale check is flagged; missing balances never count toward freshness', () => {
  const html = setup()([contract('a'), contract('b')], {
    a: [checked(2025, '2026-07-01T15:00:00Z', { points_remaining: 10 })],
    // b has no current balance: it's "needed", not "unchecked".
  });
  assert.match(html, /portfolio-freshness stale">Checked against Disney Jul 1, 2026</);
  assert.match(html, /1 current balance needed/);
  const none = setup()([contract('a')], {});
  assert.doesNotMatch(none, /portfolio-freshness/);
});

test('a failed read shows Retry and no freshness claim', () => {
  const signedIn = fn('renderSignedIn');
  assert.match(signedIn, /if \(contractsFailed\) \{[^}]*loadErrorHTML\("your contracts"\)/);
  // Freshness only renders inside renderContractsWidget, which a failed read never reaches.
  assert.ok(signedIn.indexOf('renderContractsWidget') > signedIn.indexOf('} else {'));
});
