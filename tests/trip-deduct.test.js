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
