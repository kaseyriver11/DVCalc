// Owner-led "Reconcile points" (Prompt 2): comparison, validation, the
// activity timeline, and the database function's guards.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const R = require('../dvc-reconcile.js');

const row = (b = {}) => ({ balance_confirmed_at: '2026-09-01T00:00:00+00:00', updated_at: '2026-09-01T00:00:00+00:00', points_remaining: 120, points_banked: 20, points_borrowed: 0, points_holding: 0, ...b });
const entry = (b = {}) => ({ points_remaining: '120', points_banked: '20', points_borrowed: '0', points_holding: '0', ...b });

test('an unknown balance has no recorded buckets -- never zero, never the allotment', () => {
  assert.equal(R.recordedBuckets(null), null);
  assert.equal(R.recordedBuckets({ points_remaining: 200 }), null); // unconfirmed row
  assert.deepEqual(R.recordedBuckets(row({ points_remaining: 0, points_banked: 0 })), { points_remaining: 0, points_banked: 0, points_borrowed: 0, points_holding: 0 });
});

test('entries must be whole, nonnegative numbers; blank is not zero', () => {
  assert.ok(R.parseEntry(entry({ points_holding: '' })).error);
  assert.ok(R.parseEntry(entry({ points_banked: '-1' })).error);
  assert.ok(R.parseEntry(entry({ points_remaining: '12.5' })).error);
  assert.deepEqual(R.parseEntry(entry()).values, { points_remaining: 120, points_banked: 20, points_borrowed: 0, points_holding: 0 });
});

test('matching numbers mark the balance checked with no reason needed', () => {
  const diff = R.difference(R.recordedBuckets(row()), R.parseEntry(entry()).values);
  assert.equal(diff.matched, true);
  assert.equal(diff.totalDelta, 0);
  assert.equal(R.saveProblem(diff, null), null);
});

test('a mismatch shows per-bucket and total deltas and requires a reason', () => {
  const diff = R.difference(R.recordedBuckets(row()), R.parseEntry(entry({ points_remaining: '80', points_holding: '10' })).values);
  assert.equal(diff.matched, false);
  assert.deepEqual(diff.rows.filter(r => r.delta).map(r => [r.label, r.delta]), [['Current', -40], ['Holding', 10]]);
  assert.equal(diff.totalBefore, 140);
  assert.equal(diff.totalAfter, 110);
  assert.equal(diff.totalDelta, -30);
  assert.ok(R.saveProblem(diff, null));
  assert.ok(R.saveProblem(diff, 'nonsense'));
  assert.equal(R.saveProblem(diff, 'cancellation'), null);
});

test('entering Disney amounts for an unknown balance is a change, not a match', () => {
  const diff = R.difference(null, R.parseEntry(entry()).values);
  assert.equal(diff.matched, false);
  assert.equal(diff.unknownBefore, true);
  assert.equal(diff.totalBefore, null);
  assert.equal(diff.totalDelta, null);
});

test('a saved zero that matches Disney is a real match', () => {
  const zero = row({ points_remaining: 0, points_banked: 0 });
  const diff = R.difference(R.recordedBuckets(zero), R.parseEntry(entry({ points_remaining: '0', points_banked: '0' })).values);
  assert.equal(diff.matched, true);
});

test('activity: moves, deductions and reversals, and reconciliations for one use year, newest first', () => {
  const events = R.activity({
    year: 2026,
    movements: [
      { kind: 'bank', from_year: 2026, to_year: 2027, points: 30, created_at: '2026-05-01T12:00:00Z' },
      { kind: 'bank', from_year: 2025, to_year: 2026, points: 20, created_at: '2025-12-01T12:00:00Z' },
      { kind: 'borrow', from_year: 2027, to_year: 2026, points: 15, created_at: '2026-06-01T12:00:00Z' },
      { kind: 'bank', from_year: 2024, to_year: 2025, points: 99, created_at: '2025-01-01T12:00:00Z' }, // other years
    ],
    deductions: [
      { use_year_label: 2026, points_remaining: 50, created_at: '2026-07-01T12:00:00Z', reversed_at: '2026-07-10T12:00:00Z' },
      { use_year_label: 2025, points_remaining: 10, created_at: '2026-07-02T12:00:00Z' },
    ],
    reconciliations: [
      { use_year_label: 2026, matched: false, reason: 'cancellation', before: { points_remaining: 100, points_banked: 0, points_borrowed: 0, points_holding: 0 }, after: { points_remaining: 90, points_banked: 0, points_borrowed: 0, points_holding: 10 }, notes: 'Canceled May trip', created_at: '2026-08-01T12:00:00Z' },
      { use_year_label: 2026, matched: true, before: {}, after: {}, created_at: '2026-09-01T12:00:00Z' },
    ],
  });
  assert.deepEqual(events.map(e => [e.source, e.text]), [
    ['owner', 'Checked against Disney: matched'],
    ['owner', 'Corrected the bucket split to match Disney (100 points) (Cancellation)'],
    ['app', '50 points from a booking were put back or reassigned'],
    ['app', 'A booking took 50 points'],
    ['app', 'Borrowed 15 points from 2027'],
    ['app', 'Banked 30 current points into 2027'],
    ['app', '20 points banked in from 2025'],
  ]);
  assert.equal(events[1].notes, 'Canceled May trip');
});

test('a total change reads as before -> after', () => {
  const [e] = R.activity({ year: 2026, reconciliations: [{ use_year_label: 2026, matched: false, reason: 'booking', before: { points_remaining: 100, points_banked: 0, points_borrowed: 0, points_holding: 0 }, after: { points_remaining: 60, points_banked: 0, points_borrowed: 0, points_holding: 0 }, created_at: '2026-09-01T00:00:00Z' }] });
  assert.equal(e.text, 'Corrected to match Disney: 100 → 60 points (Booking)');
  assert.equal(e.delta, -40);
});

test('a first-time balance from Disney reads as set, not corrected', () => {
  const [e] = R.activity({ year: 2026, reconciliations: [{ use_year_label: 2026, matched: false, reason: 'other', before: null, after: { points_remaining: 150, points_banked: 0, points_borrowed: 0, points_holding: 0 }, created_at: '2026-09-01T00:00:00Z' }] });
  assert.equal(e.text, 'Balance set from Disney: 150 points (Other)');
  assert.equal(e.delta, null);
});

// The database function can't run here (no Postgres in this environment);
// these check its guards are present. The SQL itself was parsed with
// pglast (libpg_query) when written -- see the Prompt 2 report.
const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/025_point_reconciliation.sql'), 'utf8');
test('reconcile_points: retry key, ownership, conflict check, reason rule, immutable events', () => {
  assert.match(sql, /pg_advisory_xact_lock\(hashtextextended\(p_id::text, 0\)\)/);
  assert.match(sql, /select \* into previous from public\.point_reconciliations where id = p_id/);
  assert.match(sql, /from public\.contracts where id = p_contract and user_id = owner_id/);
  assert.match(sql, /raise exception 'Balances changed\. Review the latest balance before saving\.'/);
  assert.match(sql, /if not is_match and \(p_reason is null or p_reason not in/);
  assert.match(sql, /check \(matched or reason is not null\)/);
  assert.match(sql, /No insert\/update\/delete grants/);
  assert.doesNotMatch(sql, /grant (insert|update|delete)/i);
  assert.match(sql, /last_checked_against_disney_at timestamptz/);
  assert.doesNotMatch(sql, /update public\.contract_year_points set last_checked_against_disney_at = /); // no backfill: nothing inherits a check
});
