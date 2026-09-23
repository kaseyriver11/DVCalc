const test = require('node:test');
const assert = require('node:assert/strict');
const deduct = require('../dvc-trip-deduct.js');

const ssr = { id: 'ssr', use_year: 'Dec', points_per_year: 150 };
const riv = { id: 'riv', use_year: 'Jun', points_per_year: 100 };
const row = (contract_id, use_year_label, b, confirmed = '2026-09-01T00:00:00Z') => ({
  contract_id, use_year_label, balance_confirmed_at: confirmed,
  points_remaining: b.remaining ?? 0, points_banked: b.banked ?? 0, points_borrowed: b.borrowed ?? 0, points_holding: b.holding ?? 0,
});
const plan = (allocations, rows, checkIn = '2026-09-27') =>
  deduct.planTripDeduction({ allocations, contracts: [ssr, riv], rows, checkIn, today: '2026-09-22' });

test('check-in maps to the deposit-year label of the cycle it falls in', () => {
  assert.equal(deduct.useYearLabelFor('Dec', '2026-09-27'), 2025);
  assert.equal(deduct.useYearLabelFor('Dec', '2026-12-01'), 2026);
  assert.equal(deduct.useYearLabelFor('Jun', '2026-05-31'), 2025);
  assert.equal(deduct.useYearLabelFor('Jun', '2026-06-01'), 2026);
  assert.equal(deduct.useYearEndsOn('Dec', 2025), '2026-11-30');
});

test('draws holding, then banked, then borrowed, then current', () => {
  const [p] = plan([{ contract_id: 'ssr', points: 39 }], [row('ssr', 2025, { remaining: 20, banked: 20 })]);
  assert.equal(p.status, 'ready');
  assert.deepEqual(p.draws, { holding: 0, banked: 20, borrowed: 0, remaining: 19 });
  assert.deepEqual(p.after, { holding: 0, banked: 0, borrowed: 0, remaining: 1 });
  assert.equal(deduct.describeDraw(p.draws), '20 banked + 19 current');
});

test('each contract in a split stay draws from its own use year', () => {
  const rows = [row('ssr', 2025, { remaining: 30 }), row('riv', 2026, { remaining: 100 })];
  const plans = plan([{ contract_id: 'ssr', points: 30 }, { contract_id: 'riv', points: 9 }], rows);
  assert.deepEqual(plans.map(p => [p.contract_id, p.label, p.status, p.after.remaining]), [['ssr', 2025, 'ready', 0], ['riv', 2026, 'ready', 91]]);
});

test('unconfirmed or missing balances are never deducted from', () => {
  const plans = plan([{ contract_id: 'ssr', points: 10 }, { contract_id: 'riv', points: 10 }], [row('ssr', 2025, { remaining: 50 }, null)]);
  assert.deepEqual(plans.map(p => p.status), ['no-balance', 'no-balance']);
});

test('a shortfall leaves the balance alone instead of zeroing it', () => {
  const [p] = plan([{ contract_id: 'ssr', points: 60 }], [row('ssr', 2025, { remaining: 20, banked: 20 })]);
  assert.equal(p.status, 'short');
  assert.equal(p.shortfall, 20);
});

test('stays in a use year that already ended are skipped', () => {
  const [p] = plan([{ contract_id: 'ssr', points: 10 }], [row('ssr', 2023, { remaining: 50 })], '2024-03-01');
  assert.equal(p.status, 'ended');
});

test('ledger row keeps the holding date only while holding points remain', () => {
  const r = { ...row('ssr', 2025, { holding: 10, remaining: 20 }), points_holding_entered_at: '2026-09-01' };
  const [partial] = plan([{ contract_id: 'ssr', points: 5 }], [r]);
  assert.equal(deduct.ledgerRowAfter(partial, 'now').points_holding_entered_at, '2026-09-01');
  const [full] = plan([{ contract_id: 'ssr', points: 15 }], [r]);
  const written = deduct.ledgerRowAfter(full, 'now');
  assert.equal(written.points_holding_entered_at, null);
  assert.equal(written.points_remaining, 15);
  assert.equal(written.balance_confirmed_at, 'now');
});

// ---- UX2-03: stays that cross a contract's use-year boundary ----
const feb = { id: 'feb', use_year: 'Feb', points_per_year: 200 };
const planFeb = (points, extra = {}) => deduct.planTripDeduction({
  allocations: [{ contract_id: 'feb', points }], contracts: [feb],
  rows: [row('feb', 2026, { remaining: 100 }), row('feb', 2027, { remaining: 100 })],
  checkIn: '2027-01-31', checkOut: '2027-02-02', today: '2026-09-22', ...extra,
});

test('a stay across the use-year boundary is paid from each night\'s own use year', () => {
  // Jan 31 night is Feb-2026 UY; Feb 1 night is Feb-2027 UY. Equal chart points -> 25/25.
  const plans = planFeb(50, { nightPoints: () => 20 });
  assert.deepEqual(plans.map(p => [p.label, p.points, p.split]), [[2026, 25, true], [2027, 25, true]]);
  assert.ok(plans.every(p => p.status === 'ready'));
});

test('the split follows chart points per night and always sums to the allocation', () => {
  const plans = planFeb(50, { nightPoints: d => d === '2027-01-31' ? 30 : 10 });
  assert.deepEqual(plans.map(p => p.points), [38, 12]); // 37.5 / 12.5 -> largest remainder, ties to earlier year
  assert.equal(plans.reduce((s, p) => s + p.points, 0), 50);
});

test('missing chart data splits by nights instead', () => {
  assert.deepEqual(planFeb(51, { nightPoints: () => null }).map(p => p.points), [26, 25]);
});

test('owner overrides replace the split only when they still add up', () => {
  const ok = planFeb(50, { nightPoints: () => 20, overrides: { 'feb|2026': 40, 'feb|2027': 10 } });
  assert.deepEqual(ok.map(p => [p.points, p.splitAdjusted]), [[40, true], [10, true]]);
  const bad = planFeb(50, { nightPoints: () => 20, overrides: { 'feb|2026': 40, 'feb|2027': 5 } });
  assert.deepEqual(bad.map(p => [p.points, p.splitAdjusted]), [[25, false], [25, false]]);
});

test('an override of zero for one year drops that year from the plan', () => {
  const plans = planFeb(50, { nightPoints: () => 20, overrides: { 'feb|2026': 50, 'feb|2027': 0 } });
  assert.deepEqual(plans.map(p => [p.label, p.points]), [[2026, 50]]);
});

test('a stay inside one use year is not split', () => {
  const plans = deduct.planTripDeduction({ allocations: [{ contract_id: 'feb', points: 30 }], contracts: [feb],
    rows: [row('feb', 2026, { remaining: 100 })], checkIn: '2026-10-01', checkOut: '2026-10-04', today: '2026-09-22', nightPoints: () => 10 });
  assert.deepEqual(plans.map(p => [p.label, p.points, p.split]), [[2026, 30, false]]);
});

// ---- UX2-02: edits re-plan against balances with the old receipts put back ----
test('edit preview restores the booking\'s receipts before drawing again', () => {
  const rows = [row('ssr', 2025, { remaining: 30, banked: 0 })];
  const receipts = [{ contract_id: 'ssr', use_year_label: 2025, points_banked: 20, points_remaining: 30 }];
  const restored = deduct.rowsWithReceiptsRestored(rows, receipts);
  assert.equal(restored[0].points_banked, 20);
  assert.equal(restored[0].points_remaining, 60);
  assert.equal(rows[0].points_remaining, 30, 'original rows untouched');
  const [p] = deduct.planTripDeduction({ allocations: [{ contract_id: 'ssr', points: 60 }], contracts: [ssr], rows: restored, checkIn: '2026-09-27', today: '2026-09-22' });
  assert.deepEqual(p.draws, { holding: 0, banked: 20, borrowed: 0, remaining: 40 });
});

test('deductions payload carries only ready entries', () => {
  const plans = [{ status: 'ready', contract_id: 'a', label: 2026, points: 10 }, { status: 'short', contract_id: 'b', label: 2026, points: 5 }];
  assert.deepEqual(deduct.deductionsPayload(plans), [{ contract_id: 'a', use_year_label: 2026, points: 10 }]);
});

test('Disney cancellation effect by days before check-in', () => {
  assert.equal(deduct.cancellationEffect('2026-10-23', '2026-09-22'), 'restore'); // 31 days
  assert.equal(deduct.cancellationEffect('2026-10-22', '2026-09-22'), 'holding'); // 30 days
  assert.equal(deduct.cancellationEffect('2026-09-23', '2026-09-22'), 'holding'); // 1 day
  assert.equal(deduct.cancellationEffect('2026-09-22', '2026-09-22'), 'forfeit'); // check-in day
});

test('receipt helpers', () => {
  const d = { points_holding: 0, points_banked: 20, points_borrowed: 0, points_remaining: 19 };
  assert.equal(deduct.receiptTotal(d), 39);
  assert.equal(deduct.describeReceipt(d), '20 banked + 19 current');
});
