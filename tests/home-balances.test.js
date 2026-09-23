const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../home.js'), 'utf8');
function setup() {
  const c = vm.createContext({ window: {}, resortName: () => 'Resort' });
  for (const f of ['dvc-dates.js', 'dvc-point-attention.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), c);
  vm.runInContext(source.match(/function buildContractBalancesHTML\([^]*?\n\}/)[0], c);
  return c.buildContractBalancesHTML;
}
const today = { year: 2026, month: 9, day: 22 };
const contract = { id: 'a', use_year: 'Dec', nickname: 'Family', points_per_year: 200 };
test('Home shows the actual current and next cycles for a December contract', () => {
  const html = setup()([contract], {}, today);
  assert.match(html, /Current &middot; 2025 use year/);
  assert.match(html, /Dec 2025 &ndash; Nov 2026/);
  assert.match(html, /Next &middot; 2026 use year/);
  assert.match(html, /contract=a&amp;year=2025/);
  assert.match(html, /contract=a&amp;year=2026/);
});
test('Home sums all saved buckets and distinguishes zero from missing balances', () => {
  const render = setup();
  const rows = { a: [{ use_year_label: 2025, balance_confirmed_at: 'x', points_remaining: 0, points_banked: 20, points_borrowed: 30, points_holding: 10 }] };
  assert.match(render([contract], rows, today), /60 <small>pts left/);
  assert.match(render([contract], rows, today), /Add balance/);
  rows.a.push({ use_year_label: 2026, balance_confirmed_at: 'x', points_remaining: 0 });
  assert.match(render([contract], rows, today), /0 <small>pts left/);
  assert.doesNotMatch(render([contract], rows, today), /Add balance/);
});
test('Unconfirmed rows do not become available points and names are escaped', () => {
  const html = setup()([{ ...contract, nickname: '<img src=x>', id: 'a&b' }], { 'a&b': [{ use_year_label: 2025, points_remaining: 200 }] }, today);
  assert.doesNotMatch(html, /200 <small>|<img/);
  assert.match(html, /&lt;img src=x&gt;/);
  assert.match(html, /contract=a%26b/);
});
