const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
function setup() {
  const c = vm.createContext({ window: {}, state: { checkIn: '2027-03-01', checkOut: '2027-03-04' },
    selectedContractId: 'a',
    multiContractAllocations: null,
    userContractYearPoints: [
      { contract_id: 'a', use_year_label: 2026, balance_confirmed_at: '2026-09-22', points_remaining: 0 },
      { contract_id: 'a', use_year_label: 2027, balance_confirmed_at: '2026-09-22', points_remaining: 150 },
    ], computeStayEntry: (_r, _room, dates) => ({ points: dates.length * 20 }) });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../dvc-dates.js'), 'utf8'), c);
  c.window.DVCDates.todayInEastern = () => ({ year: 2026, month: 9, day: 21 });
  for (const [first, next] of [
    ['currentUYYear', 'getContractWindowMonths'],
    ['buildCancelOutcomeHTML', 'buildSmartDrawHTML'],
    ['computeDefaultMultiSplit', 'toggleMultiContractSplit'],
  ]) {
    vm.runInContext(source.slice(source.indexOf(`function ${first}(`), source.indexOf(`function ${next}(`)), c);
  }
  c.contract = { id: 'a', use_year: 'Feb', points_per_year: 150 };
  c.getSelectedContract = () => c.contract;
  c.rerenderStaySummary = () => {};
  return c;
}
test('March 2027 uses February 2027 balance, not depleted 2026 balance', () => {
  const c = setup(), row = c.getStayYearRow(c.contract);
  assert.equal(row.year, 2027);
  assert.equal(c.computeSmartDraw(row, 81).shortfall, 0);
  assert.equal(c.computeSmartDraw(row, 81).after.remaining, 69);
  assert.match(c.stayYearLabel(c.contract, row), /Feb 2027.*Jan 2028 recorded/);
});
test('January belongs to the prior February cycle; no dates uses current cycle', () => {
  const c = setup();
  assert.equal(c.getStayYearRow(c.contract, '2027-01-31').year, 2026);
  assert.equal(c.getStayYearRow(c.contract, '2027-02-01').year, 2027);
  assert.equal(c.getStayYearRow(c.contract, null).year, 2026);
});
test('December cycle and missing rows are explicitly unknown', () => {
  const c = setup(), contract = { id: 'b', use_year: 'Dec', points_per_year: 100 };
  const row = c.getStayYearRow(contract, '2027-03-01');
  assert.equal(row.year, 2026);
  assert.equal(row.remaining, 0);
  assert.equal(row.recorded, false);
  assert.match(c.stayYearLabel(contract, row), /balance not confirmed/);
});
test('cross-boundary nights are assessed separately, checkout is not a night', () => {
  const c = setup();
  assert.equal(c.stayYearGroups(c.contract, ['2027-01-30', '2027-01-31']).length, 1);
  const html = c.buildCrossYearDrawHTML(c.contract, {}, ['2027-01-31', '2027-02-01']);
  assert.match(html, /Short by 20 pts in this use year/);
  assert.match(html, /130 pts projected left/);
});
test('same-cost new dates cannot reuse contract allocations', () => {
  const c = setup();
  assert.equal(c.getMultiSplitAllocations([c.contract], 81).a, 81);
  c.state.checkIn = '2027-01-10';
  assert.equal(c.getMultiSplitAllocations([c.contract], 81).a, 0);
});
test('different contracts use their own cycles and recorded buckets', () => {
  const c = setup();
  c.userContractYearPoints.push({ contract_id: 'b', use_year_label: 2026, balance_confirmed_at: '2026-09-22', points_remaining: 10, points_banked: 20, points_borrowed: 5, points_holding: 0 });
  const b = { id: 'b', use_year: 'Dec', points_per_year: 100 };
  const split = c.getMultiSplitAllocations([b, c.contract], 81);
  assert.equal(split.b, 35);
  assert.equal(split.a, 46);
});
