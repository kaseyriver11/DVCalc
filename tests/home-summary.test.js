// Home's "Next up" card, built from DVCPointAttention's own earliest() event.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { attentionCard, portfolioSummary } = require('../dvc-home-summary.js');

const c = vm.createContext({ window: {} });
for (const f of ['dvc-dates.js', 'dvc-point-attention.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), c);
const { DVCDates: D, DVCPointAttention: A } = c.window;
const opts = event => ({ name: event?.contract ? A.label(event.contract, 'Saratoga Springs') : '', tiers: { urgency: D.urgencyTier, expiration: D.expirationTier }, formatDate: D.formatDeadlineDate, describe: A.describe });
const today = { year: 2026, month: 9, day: 22 };
const contract = (id, use_year, extra = {}) => ({ id, use_year, is_active: true, points_per_year: 180, home_resort_id: 'ssr', ...extra });
const row = (label, b = {}) => ({ use_year_label: label, balance_confirmed_at: 'x', points_remaining: 0, points_banked: 0, points_borrowed: 0, points_holding: 0, ...b });

test('screenshot scenario: 400 current past the deadline, 180 next year, one contract missing a balance', () => {
  const contracts = [contract('a', 'Dec'), contract('b', 'Jun', { nickname: 'Add-on' })];
  const rows = { a: [row(2025, { points_remaining: 400 }), row(2026, { points_remaining: 180 })] };
  const event = A.earliest(contracts, rows, today);
  const card = attentionCard(event, opts(event));
  assert.equal(card.title, 'Use 400 points before Nov 30, 2026');
  assert.equal(card.detail, 'Saratoga Springs &middot; 2025 use year');
  assert.deepEqual(card.more, { label: 'View all point actions', href: 'account.html#point-actions' });
  assert.equal(card.action.href, 'use-points.html?contract=a&year=2025');
  assert.equal(card.action.label, 'Use these points');
  // The portfolio beside it states balances, never that deadline again.
  const summary = portfolioSummary(contracts.filter(x => x.is_active), rows, { currentYear: x => D.currentUYYear(x.use_year, today), name: x => x.id });
  assert.equal(summary.total, 400);
  assert.equal(summary.missing, 1);
});

test('banking event says what to bank and by when', () => {
  const contracts = [contract('a', 'Apr')];
  const event = A.earliest(contracts, { a: [row(2026, { points_remaining: 120 })] }, today);
  const card = attentionCard(event, opts(event));
  assert.equal(card.title, 'Bank or use 120 current points by Nov 30, 2026');
  assert.equal(card.action.label, 'Review banking');
});

test('holding points keep their booking restriction on a second line', () => {
  const event = A.earliest([contract('a', 'Oct')], { a: [row(2025, { points_holding: 10 })] }, today);
  const card = attentionCard(event, opts(event));
  assert.match(card.title, /^Use 10 Holding points by /);
  assert.equal(card.note, 'Book no more than 60 days before check-in.');
  assert.equal(card.tone, 'danger'); // 8 days left
});

test('a missing current balance names the contract; never an all-clear', () => {
  const event = A.earliest([contract('a', 'Dec', { nickname: 'Family' })], {}, today);
  const card = attentionCard(event, opts(event));
  assert.equal(card.title, 'Check your Disney balance');
  assert.match(card.detail, /^Family /);
  assert.equal(card.action.label, 'Check balance');
  assert.equal(card.action.href, 'account.html?contract=a&year=2025');
  assert.notEqual(card.title, 'Nothing needs attention');
});

test('all clear only when every current bucket is recorded and empty', () => {
  const event = A.earliest([contract('a', 'Oct')], { a: [row(2025)] }, today);
  assert.equal(attentionCard(event, opts(event)).title, 'Nothing needs attention');
  assert.equal(attentionCard(null, opts(null)), null); // no active contracts: no card
});

// ---- "Check balance with Disney" beside a near deadline ----
const { disneyCheck } = require('../dvc-home-summary.js');
const todayMs = D.dateOnlyUTC(today.year, today.month, today.day);
const cardFor = (rows, contracts = [contract('a', 'Oct')]) => {
  const event = A.earliest(contracts, rows, today);
  return attentionCard(event, { ...opts(event), todayMs });
};

test('a deadline within 30 days on a never-checked balance offers the Disney check', () => {
  // Oct use year, 2025 cycle: banking deadline passed, use-year ends Sep 30, 2026 (8 days out).
  const card = cardFor({ a: [row(2025, { points_remaining: 40 })] });
  assert.equal(card.title, 'Use 40 points before Sep 30, 2026');
  assert.equal(card.action.label, 'Use these points'); // primary action unchanged
  assert.deepEqual(card.check, { label: 'Check balance with Disney', href: 'account.html?contract=a&year=2025&check=disney', note: 'Not checked against Disney yet' });
});

test('a recent check hides it; a check over 30 days old brings it back with its date', () => {
  const recent = cardFor({ a: [row(2025, { points_remaining: 40, last_checked_against_disney_at: '2026-09-01T12:00:00Z' })] });
  assert.equal(recent.check, null);
  const stale = cardFor({ a: [row(2025, { points_remaining: 40, last_checked_against_disney_at: '2026-08-01T12:00:00Z' })] });
  assert.equal(stale.check.note, 'Last checked against Disney Aug 1, 2026');
});

test('no Disney check for far deadlines, missing balances, or without today', () => {
  // Dec use year 2026 cycle is far away; 2025 cycle ends Nov 30 (69 days).
  assert.equal(cardFor({ a: [row(2025, { points_remaining: 40 })] }, [contract('a', 'Dec')]).check, null);
  assert.equal(cardFor({}).check, null); // unconfirmed: "Check your Disney balance" is already the action
  const event = A.earliest([contract('a', 'Oct')], { a: [row(2025, { points_remaining: 40 })] }, today);
  assert.equal(attentionCard(event, opts(event)).check, null);
  assert.equal(disneyCheck(null, { todayMs, formatDate: D.formatDeadlineDate }), null);
});

test('a bankable deadline uses the banking date, not the use-year end', () => {
  // Feb use year, 2026 cycle: banking deadline 8 days out; the use year ends 131 days out.
  const event = A.earliest([contract('a', 'Feb')], { a: [row(2026, { points_remaining: 100 })] }, today);
  assert.equal(event.kind, 'bankable');
  const card = attentionCard(event, { ...opts(event), todayMs });
  assert.equal(card.action.label, 'Review banking');
  assert.equal(card.check.href, 'account.html?contract=a&year=2026&check=disney');
  // Apr: banking deadline 69 days out -- too far, even though never checked.
  const far = A.earliest([contract('a', 'Apr')], { a: [row(2026, { points_remaining: 100 })] }, today);
  assert.equal(attentionCard(far, { ...opts(far), todayMs }).check, null);
});
