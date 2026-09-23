// Prompt 5: owner-entered waitlists, booking confirmation details and
// Disney-cancellation history -- rules (dvc-waitlists.js), the review
// reminder sender, and the database guards in migration 027.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const W = require('../dvc-waitlists.js');
const { cancellationEffect } = require('../dvc-trip-deduct.js');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const shared = path.join(ROOT, 'supabase/functions/_shared');
let R, Run;
test.before(async () => {
  R = await import('file://' + path.join(shared, 'waitlist-reminders.js').replace(/\\/g, '/'));
  Run = await import('file://' + path.join(shared, 'waitlist-reminder-run.js').replace(/\\/g, '/'));
});

const today = '2026-09-23';
const req = (b = {}) => ({ id: 'w1', user_id: 'u1', resort_id: 'polynesianVillas', room_type_id: 'dsS', check_in: '2026-12-10', check_out: '2026-12-14', requested_on: '2026-09-20', status: 'pending', remind_days_before: null, review_reminded_at: null, backup_trip_id: null, notes: null, ...b });

test('validation: requested stay, dates, request date, reminder range', () => {
  assert.equal(W.validate(req(), { today, isNew: true }), null);
  assert.match(W.validate(req({ resort_id: '' }), { today, isNew: true }), /resort and room/);
  assert.match(W.validate(req({ check_out: '2026-12-10' }), { today, isNew: true }), /after check-in/);
  assert.match(W.validate(req({ check_in: '2026-09-23', check_out: '2026-09-25' }), { today, isNew: true }), /after today/);
  assert.equal(W.validate(req({ check_in: '2026-09-01', check_out: '2026-09-05' }), { today, isNew: false }), null); // editing an old one is fine
  assert.match(W.validate(req({ requested_on: '2026-09-30' }), { today, isNew: true }), /today or earlier/);
  assert.match(W.validate(req({ remind_days_before: 0 }), { today, isNew: true }), /1 to 120/);
  assert.match(W.validate(req({ check_out: '2027-02-10' }), { today, isNew: true }), /30 nights/);
});

test('pending requests list by check-in; review reminders fall due N days before check-in', () => {
  const { pending, closed } = W.partition([req({ id: 'b', check_in: '2027-01-05', check_out: '2027-01-08' }), req({ id: 'a' }), req({ id: 'c', status: 'canceled', updated_at: '2026-09-01' }), req({ id: 'd', status: 'fulfilled', updated_at: '2026-09-10' })]);
  assert.deepEqual(pending.map(w => w.id), ['a', 'b']);
  assert.deepEqual(closed.map(w => w.id), ['d', 'c']);
  const w = req({ remind_days_before: 14 });
  assert.deepEqual(W.review(w, '2026-11-25'), { daysToCheckIn: 15, reviewOn: '2026-11-26', due: false, passed: false });
  assert.equal(W.review(w, '2026-11-26').due, true);
  assert.equal(W.review({ ...w, status: 'canceled' }, '2026-11-26').due, false);
  assert.equal(W.review(w, '2026-12-11').passed, true);
});

test('"Disney confirmed this" prefills only what was requested -- never points or sources', () => {
  const draft = W.bookingDraft(req({ notes: 'Lagoon view if possible' }));
  assert.deepEqual(Object.keys(draft).sort(), ['check_in', 'check_out', 'notes', 'resort_id', 'room_type_id']);
});

test('cancellation dates match the 31+ / 30-1 / check-in-day rule used for real cancellations', () => {
  const d = W.cancellationDates('2026-12-10');
  assert.deepEqual(d, { restoreThrough: '2026-11-09', holdingFrom: '2026-11-10', holdingThrough: '2026-12-09' });
  assert.equal(cancellationEffect('2026-12-10', d.restoreThrough), 'restore');
  assert.equal(cancellationEffect('2026-12-10', d.holdingFrom), 'holding');
  assert.equal(cancellationEffect('2026-12-10', d.holdingThrough), 'holding');
  assert.equal(cancellationEffect('2026-12-10', '2026-12-10'), 'forfeit');
});

test('cancellation history says what happened to the points', () => {
  const name = id => ({ a: 'SSR', b: 'Poly' }[id]);
  assert.deepEqual(W.cancellationOutcome({ outcome: 'none', points: [] }, name), ["This booking hadn't taken points out of balances in the app, so none changed."]);
  assert.deepEqual(W.cancellationOutcome({ outcome: 'holding', points: [{ contract_id: 'a', use_year_label: 2026, points: 80, mode: 'holding', restored: true }, { contract_id: 'b', use_year_label: 2025, points: 20, mode: 'holding', restored: false }] }, name),
    ['80 pts from SSR 2026 went to Holding.', "20 pts from Poly 2025 couldn't go back: that use year's balance no longer existed."]);
  assert.deepEqual(W.cancellationOutcome({ outcome: 'restore', points: [{ contract_id: 'a', use_year_label: 2026, points: 50, mode: 'restore', restored: true }] }, name), ['50 pts went back to SSR 2026.']);
  assert.match(W.cancellationOutcome({ outcome: 'forfeit', points: [{ contract_id: 'a', use_year_label: 2026, points: 50, mode: 'forfeit', restored: false }] }, name)[0], /weren't returned/);
});

// ---- Review reminder email ----
test('reminder decision: pending, opted in, not yet sent, inside the window', () => {
  const t = { year: 2026, month: 11, day: 26 };
  assert.equal(R.waitlistReminderDecision(req({ remind_days_before: 14 }), t).send, true);
  assert.equal(R.waitlistReminderDecision(req({ remind_days_before: 7 }), t).send, false);
  assert.equal(R.waitlistReminderDecision(req({ remind_days_before: 14, review_reminded_at: 'x' }), t).send, false);
  assert.equal(R.waitlistReminderDecision(req({ remind_days_before: 14, status: 'fulfilled' }), t).send, false);
  assert.equal(R.waitlistReminderDecision(req({ remind_days_before: null }), t).send, false);
  const e = R.waitlistReminderEmail(req(), { daysToCheckIn: 14 }, { resortLabel: 'Polynesian Villas', backupLabel: 'Saratoga Springs, checking in 2026-12-10', links: { bookings: 'https://x/bookings.html#waitlists', unsubscribe: 'https://u?token=t&type=waitlist' } });
  assert.equal(e.subject, 'Review your Polynesian Villas waitlist request: check-in December 10, 2026');
  assert.match(e.html, /can't see Disney's waitlist/);
  assert.match(e.html, /backup booking/);
  assert.doesNotMatch(e.html, /available|confirmed by|we checked|monitor/i);
});

function fakeSupabase(db, { sendFails } = {}) {
  const query = table => {
    const filters = []; let op = 'select', payload = null, single = false;
    const q = {
      select() { return q; }, eq(c, v) { filters.push(r => r[c] === v); return q; }, is(c, v) { filters.push(r => (r[c] ?? null) === v); return q; },
      update(p) { op = 'update'; payload = p; return q; }, maybeSingle() { single = true; return run(); }, then(res, rej) { return run().then(res, rej); },
    };
    async function run() {
      const rows = (db[table] || []).filter(r => filters.every(f => f(r)));
      if (op === 'update') { rows.forEach(r => Object.assign(r, payload)); return { data: rows.map(r => ({ id: r.id })), error: null }; }
      return { data: single ? rows[0] ?? null : rows, error: null };
    }
    return q;
  };
  return { from: query, auth: { admin: { getUserById: async id => ({ data: { user: { email: id + '@example.com' } }, error: null }) } } };
}
const world = () => ({
  waitlists: [req({ remind_days_before: 14, backup_trip_id: 't1' }), req({ id: 'w2', remind_days_before: null }), req({ id: 'w3', user_id: 'u2', remind_days_before: 30, status: 'canceled' })],
  profiles: [{ id: 'u1', display_name: 'Pat', reminder_unsubscribe_token: 'tok' }],
  trips: [{ id: 't1', resort_id: 'saratogaSprings', check_in: '2026-12-10' }],
});
const nov26 = { year: 2026, month: 11, day: 26 };
const runWith = (db, opts = {}) => { const mail = []; return Run.runWaitlistReminders({ supabase: fakeSupabase(db), today: nov26, appBaseUrl: 'https://dvccompanion.com', unsubscribeBaseUrl: 'https://u', dryRun: opts.dryRun, memberIds: opts.memberIds,
  resortLabel: id => id === 'polynesianVillas' ? 'Polynesian Villas' : 'Saratoga Springs', send: async m => { mail.push(m); return opts.sendFails ? { ok: false, error: 'down' } : { ok: true }; } }).then(r => ({ ...r, mail })); };

test('nightly loop: one email per opted-in request, claimed first; repeats send nothing; failures release the claim', async () => {
  const db = world();
  const r = await runWith(db);
  assert.equal(r.sent, 1);
  assert.equal(r.mail[0].to, 'u1@example.com');
  assert.match(r.mail[0].html, /token=tok&amp;type=waitlist/);
  assert.match(r.mail[0].html, /Saratoga Springs, checking in 2026-12-10/);
  assert.ok(db.waitlists[0].review_reminded_at);
  assert.equal((await runWith(db)).sent, 0);
  const failing = world();
  const f = await runWith(failing, { sendFails: true });
  assert.equal(f.sent, 0);
  assert.equal(failing.waitlists[0].review_reminded_at, null);
  assert.equal((await runWith(failing)).sent, 1);
  const dry = world();
  assert.deepEqual((await runWith(dry, { dryRun: true })).planned.map(p => p.waitlist), ['w1']);
  assert.equal(dry.waitlists[0].review_reminded_at, null);
  assert.equal((await runWith(world(), { memberIds: new Set() })).sent, 0);
});

// ---- Database guards (no Postgres here; the SQL was parsed with pglast) ----
const sql = read('db/migrations/027_waitlists_and_booking_records.sql');
test('migration 027: waitlist fulfilled only with the booking, cancellation history kept, RLS', () => {
  assert.match(sql, /update public\.waitlists set status = 'fulfilled', fulfilled_trip_id = p_trip_id[^;]*status = 'pending';\s*if not found then raise exception 'This waitlist request is no longer pending/);
  assert.match(sql, /if p_mode = 'canceled' then\s*insert into public\.booking_cancellations/);
  assert.match(sql, /with check \(user_id = auth\.uid\(\) and status in \('pending', 'canceled'\) and fulfilled_trip_id is null\)/);
  assert.match(sql, /using \(user_id = auth\.uid\(\) and status <> 'fulfilled'\)/);
  assert.match(sql, /grant select on public\.booking_cancellations to authenticated;/);
  assert.doesNotMatch(sql, /grant (insert|update|delete)[^;]*booking_cancellations/);
  assert.match(sql, /disney_confirmation_number = confirmation, disney_checked_on = checked/);
  // Same 31+/30-1/check-in-day outcome as migration 024.
  assert.match(sql, /when days_out >= 31 then 'restore' when days_out >= 1 then 'holding' else 'forfeit'/);
});

test('waitlists never reach Membership Value, stay counts or badges', () => {
  for (const f of ['trips.html', 'home.js', 'dvc-owner-value.js', 'dvc-badges.js', 'dvc-stay-groups.js', 'dvc-stay-value.js']) {
    // ("Waitlist Whisperer" in dvc-badges.js is an itinerary badge, not these records.)
    assert.doesNotMatch(read(f), /getWaitlists|["']waitlists["']|DVCWaitlists/, f);
  }
});

test('confirmation details only in expanded booking details, never called verified', () => {
  const page = read('bookings.html');
  const row = page.slice(page.indexOf('function stayRowHTML('), page.indexOf('// Disney\'s cancellation thresholds for an upcoming booking'));
  const summary = row.slice(row.indexOf('<button type="button" class="stay-row-toggle"'), row.indexOf('<div class="stay-details"'));
  assert.doesNotMatch(summary, /confirmation/);
  assert.match(row, /Disney confirmation \(as entered\)/);
  assert.doesNotMatch(page + read('bookings-waitlists.js'), /\bverified\b/i);
});
