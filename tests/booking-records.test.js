// Prompt 5 (what was kept): Disney confirmation details on a booking and
// the "Canceled with Disney" history -- dvc-booking-records.js and the
// database guards in migration 027. (Waitlists were removed 2026-09-23.)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const B = require('../js/dvc-booking-records.js');
const { cancellationEffect } = require('../js/dvc-trip-deduct.js');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

test('cancellation dates match the 31+ / 30-1 / check-in-day rule used for real cancellations', () => {
  const d = B.cancellationDates('2026-12-10');
  assert.deepEqual(d, { restoreThrough: '2026-11-09', holdingFrom: '2026-11-10', holdingThrough: '2026-12-09' });
  assert.equal(cancellationEffect('2026-12-10', d.restoreThrough), 'restore');
  assert.equal(cancellationEffect('2026-12-10', d.holdingFrom), 'holding');
  assert.equal(cancellationEffect('2026-12-10', d.holdingThrough), 'holding');
  assert.equal(cancellationEffect('2026-12-10', '2026-12-10'), 'forfeit');
});

test('cancellation history says what happened to the points', () => {
  const name = id => ({ a: 'SSR', b: 'Poly' }[id]);
  assert.deepEqual(B.cancellationOutcome({ outcome: 'none', points: [] }, name), ["This booking hadn't taken points out of balances in the app, so none changed."]);
  assert.deepEqual(B.cancellationOutcome({ outcome: 'holding', points: [{ contract_id: 'a', use_year_label: 2026, points: 80, mode: 'holding', restored: true }, { contract_id: 'b', use_year_label: 2025, points: 20, mode: 'holding', restored: false }] }, name),
    ['80 pts from SSR 2026 went to Holding.', "20 pts from Poly 2025 couldn't go back: that use year's balance no longer existed."]);
  assert.deepEqual(B.cancellationOutcome({ outcome: 'restore', points: [{ contract_id: 'a', use_year_label: 2026, points: 50, mode: 'restore', restored: true }] }, name), ['50 pts went back to SSR 2026.']);
  assert.match(B.cancellationOutcome({ outcome: 'forfeit', points: [{ contract_id: 'a', use_year_label: 2026, points: 50, mode: 'forfeit', restored: false }] }, name)[0], /weren't returned/);
});

test('migration 027: cancellation history is written only by delete_trip_booking, confirmation fields saved', () => {
  const sql = read('db/migrations/027_waitlists_and_booking_records.sql');
  assert.match(sql, /if p_mode = 'canceled' then\s*insert into public\.booking_cancellations/);
  assert.match(sql, /grant select on public\.booking_cancellations to authenticated;/);
  assert.doesNotMatch(sql, /grant (insert|update|delete)[^;]*booking_cancellations/);
  assert.match(sql, /disney_confirmation_number = confirmation, disney_checked_on = checked/);
  assert.match(sql, /when days_out >= 31 then 'restore' when days_out >= 1 then 'holding' else 'forfeit'/);
});

test('confirmation details only in expanded booking details, never called verified; no waitlist UI left', () => {
  const page = read('bookings.html');
  const row = page.slice(page.indexOf('function stayRowHTML('), page.indexOf("// Disney's cancellation thresholds for an upcoming booking"));
  const summary = row.slice(row.indexOf('<button type="button" class="stay-row-toggle"'), row.indexOf('<div class="stay-details"'));
  assert.doesNotMatch(summary, /confirmation/);
  assert.match(row, /Disney confirmation \(as entered\)/);
  assert.doesNotMatch(page + read('js/bookings-cancellations.js'), /\bverified\b/i);
  assert.doesNotMatch(page.replace('Waitlist Whisperer', ''), /waitlist/i); // that's an itinerary badge
});

test('modification date: dates/room type unlock 11 months before the original check-out (Disney rule since 2026-09-17)', () => {
  assert.equal(B.modifiableFrom('2026-12-10'), '2026-01-10');
  assert.equal(B.modifiableFrom('2027-08-05'), '2026-09-05');
  // Rollover, not clamping: 11 months before Mar 31 is "Apr 31" -> May 1.
  assert.equal(B.modifiableFrom('2027-03-31'), '2026-05-01');
  assert.equal(B.modifiableFrom('2027-01-15'), '2026-02-15');
});
