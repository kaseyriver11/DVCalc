// Banking reminders (Prompt 1, 2026-09-23): the pure decision/copy module
// and the full nightly loop, run against an in-memory Supabase fake.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const shared = path.join(__dirname, '../supabase/functions/_shared');
let R, Run;
test.before(async () => {
  R = await import('file://' + path.join(shared, 'banking-reminder.js').replace(/\\/g, '/'));
  Run = await import('file://' + path.join(shared, 'banking-reminder-run.js').replace(/\\/g, '/'));
});

const confirmed = (points_remaining, extra = {}) => ({ points_remaining, balance_confirmed_at: '2026-09-01T00:00:00Z', ...extra });
const feb = { year: 2026, month: 9, day: 16 }; // 14 days before Feb UY's Sep 30 deadline

// ---- Decision rules ----
test('matches dvc-dates.js exactly: tables, labels, deadlines and use-year ends', () => {
  const c = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../dvc-dates.js'), 'utf8'), c);
  const D = c.window.DVCDates;
  assert.deepEqual({ ...D.USE_YEAR_START_MONTH }, R.USE_YEAR_START_MONTH);
  for (const uy of Object.keys(R.USE_YEAR_START_MONTH)) {
    for (let m = 1; m <= 12; m++) {
      const today = { year: 2026, month: m, day: 15 };
      const label = R.currentUseYearLabel(uy, today);
      assert.equal(label, D.currentUYYear(uy, today), `${uy} ${m} label`);
      assert.equal(R.bankingDeadlineMs(uy, label), D.deadlineForCycle(uy, label), `${uy} ${m} deadline`);
      assert.equal(R.useYearEndMs(uy, label), D.useYearExpiration(uy, label), `${uy} ${m} end`);
    }
  }
});

test('confirmed positive current points inside the window -> bank', () => {
  const d = R.bankingReminderDecision({ useYear: 'Feb', today: feb, leadDays: 30, row: confirmed(120) });
  assert.equal(d.action, 'bank');
  assert.equal(d.points, 120);
  assert.equal(d.daysUntil, 14);
  assert.equal(new Date(d.endMs).toISOString().slice(0, 10), '2027-01-31');
});

test('a saved zero sends nothing; unknown asks the owner to check Disney', () => {
  assert.equal(R.bankingReminderDecision({ useYear: 'Feb', today: feb, leadDays: 30, row: confirmed(0) }).action, 'none');
  assert.equal(R.bankingReminderDecision({ useYear: 'Feb', today: feb, leadDays: 30, row: null }).action, 'check');
  assert.equal(R.bankingReminderDecision({ useYear: 'Feb', today: feb, leadDays: 30, row: { points_remaining: 200, balance_confirmed_at: null } }).action, 'check');
});

test('banked-only, borrowed-only and Holding-only balances are not bankable current points', () => {
  for (const bucket of ['points_banked', 'points_borrowed', 'points_holding']) {
    assert.equal(R.bankingReminderDecision({ useYear: 'Feb', today: feb, leadDays: 30, row: confirmed(0, { [bucket]: 50 }) }).action, 'none', bucket);
  }
});

test('a failed ledger read inside the window is an error, never a guessed reminder', () => {
  assert.equal(R.bankingReminderDecision({ useYear: 'Feb', today: feb, leadDays: 30, row: null, rowError: true }).action, 'error');
  assert.equal(R.bankingReminderDecision({ useYear: 'Feb', today: { year: 2026, month: 6, day: 1 }, leadDays: 30, row: null, rowError: true }).action, 'none');
});

test('window edges: before the lead window, on the deadline, and after it', () => {
  const at = day => R.bankingReminderDecision({ useYear: 'Feb', today: { year: 2026, month: 9, day }, leadDays: 14, row: confirmed(10) });
  assert.equal(at(15).action, 'none'); // 15 days out
  assert.equal(at(16).action, 'bank'); // 14 days out
  assert.equal(at(30).action, 'bank'); // deadline day
  assert.equal(R.bankingReminderDecision({ useYear: 'Feb', today: { year: 2026, month: 10, day: 1 }, leadDays: 14, row: confirmed(10) }).action, 'none'); // day after
});

test('Dec use year: a mid-cycle deadline in the following calendar year', () => {
  const d = R.bankingReminderDecision({ useYear: 'Dec', today: { year: 2027, month: 7, day: 20 }, leadDays: 30, row: confirmed(90) });
  assert.equal(d.label, 2026);
  assert.equal(new Date(d.deadlineMs).toISOString().slice(0, 10), '2027-07-31');
  assert.equal(new Date(d.endMs).toISOString().slice(0, 10), '2027-11-30');
});

test('Eastern date rollover: 03:30 UTC is still the previous day in New York', () => {
  assert.deepEqual(R.todayInEastern(new Date('2026-10-01T03:30:00Z')), { year: 2026, month: 9, day: 30 });
  assert.deepEqual(R.todayInEastern(new Date('2026-10-01T05:30:00Z')), { year: 2026, month: 10, day: 1 });
});

test('email copy: banking deadline, recorded amount, Disney does it, and points stay usable', () => {
  const d = R.bankingReminderDecision({ useYear: 'Feb', today: feb, leadDays: 30, row: confirmed(120) });
  const { subject, html } = R.bankingReminderEmail(d, { name: 'Sam', contractLabel: 'Family <SSR>', useYear: 'Feb', appBaseUrl: 'https://dvccompanion.com', unsubscribeLink: 'https://x/unsub?token=t' });
  assert.equal(subject, 'Banking deadline in 14 days: 120 current points on Family <SSR>');
  assert.match(html, /120 points you recorded as current/);
  assert.match(html, /September 30, 2026/);
  assert.match(html, /Disney confirms what's eligible and does the banking/);
  assert.match(html, /aren't lost on that date/);
  assert.match(html, /January 31, 2027/);
  assert.match(html, /Family &lt;SSR&gt;/);
  assert.doesNotMatch(subject + html, /borrow/i);
  assert.doesNotMatch(html, /forfeit/i);
});

test('check-balance email makes no numerical or eligibility claim', () => {
  const d = R.bankingReminderDecision({ useYear: 'Feb', today: feb, leadDays: 30, row: null });
  const { subject, html } = R.bankingReminderEmail(d, { contractLabel: 'SSR', useYear: 'Feb', appBaseUrl: 'https://dvccompanion.com' });
  assert.equal(subject, 'Check your SSR points before the September 30, 2026 banking deadline');
  assert.doesNotMatch(html.replace(/\d{4}|September 30|14 days/g, ''), /\d+ (current )?points/);
  assert.doesNotMatch(subject + html, /borrow|forfeit/i);
});

// ---- The nightly loop against a fake Supabase ----
function fakeSupabase(db, { failTable = null } = {}) {
  const query = table => {
    const filters = []; let op = 'select', payload = null;
    const rows = () => (db[table] || []).filter(r => filters.every(f => f(r)));
    const q = {
      select() { return q; },
      eq(col, val) { filters.push(r => r[col] === val); return q; },
      in(col, vals) { filters.push(r => vals.includes(r[col])); return q; },
      insert(row) { op = 'insert'; payload = row; return q; },
      delete() { op = 'delete'; return q; },
      maybeSingle() { return run(true); },
      then(res, rej) { return run(false).then(res, rej); },
    };
    async function run(single) {
      if (failTable === table && op === 'select') return { data: null, error: { message: 'boom' } };
      if (op === 'insert') {
        const dup = table === 'reminder_log' && (db.reminder_log || []).some(r => r.contract_id === payload.contract_id && r.deadline_date === payload.deadline_date && r.reminder_type === payload.reminder_type);
        if (dup) return { error: { code: '23505', message: 'duplicate key' } };
        (db[table] ||= []).push(payload); return { error: null };
      }
      if (op === 'delete') { const keep = (db[table] || []).filter(r => !filters.every(f => f(r))); db[table] = keep; return { error: null }; }
      const found = rows();
      return { data: single ? found[0] ?? null : found, error: null };
    }
    return q;
  };
  return { from: query, auth: { admin: { getUserById: async id => ({ data: { user: { email: `${id}@example.com` } }, error: null }) } } };
}

function world() {
  return {
    profiles: [
      { id: 'u1', display_name: 'Pat', reminder_opt_in: true, reminder_lead_days: 30, reminder_unsubscribe_token: 't1' },
      { id: 'u2', display_name: 'Opted Out', reminder_opt_in: false, reminder_lead_days: 30, reminder_unsubscribe_token: 't2' },
    ],
    contracts: [
      { id: 'pos', user_id: 'u1', use_year: 'Feb', is_active: true, nickname: 'Positive', home_resort_id: 'ssr' },
      { id: 'zero', user_id: 'u1', use_year: 'Feb', is_active: true, nickname: 'Zero', home_resort_id: 'ssr' },
      { id: 'unknown', user_id: 'u1', use_year: 'Feb', is_active: true, nickname: 'Unknown', home_resort_id: 'ssr' },
      { id: 'dec', user_id: 'u1', use_year: 'Dec', is_active: true, nickname: 'Dec', home_resort_id: 'blt' }, // outside its window in September
      { id: 'out', user_id: 'u2', use_year: 'Feb', is_active: true, nickname: 'Opted out', home_resort_id: 'ssr' },
    ],
    contract_year_points: [
      { contract_id: 'pos', use_year_label: 2026, ...confirmed(120) },
      { contract_id: 'zero', use_year_label: 2026, ...confirmed(0, { points_banked: 40 }) },
      { contract_id: 'out', use_year_label: 2026, ...confirmed(99) },
    ],
    reminder_log: [],
  };
}
const runWith = (db, opts = {}) => {
  const mail = [];
  return Run.runBankingReminders({ supabase: fakeSupabase(db, opts), today: feb, appBaseUrl: 'https://dvccompanion.com', unsubscribeBaseUrl: 'https://x/unsub', dryRun: opts.dryRun,
    send: async m => { mail.push(m); return opts.sendFails ? { ok: false, error: 'resend down' } : { ok: true }; } }).then(r => ({ ...r, mail }));
};

test('one run: positive gets a banking email, unknown a check email, zero/out-of-window/opted-out nothing', async () => {
  const db = world();
  const r = await runWith(db);
  assert.equal(r.sent, 2);
  assert.deepEqual(r.mail.map(m => m.subject), ['Banking deadline in 14 days: 120 current points on Positive', 'Check your Unknown points before the September 30, 2026 banking deadline']);
  assert.ok(r.mail.every(m => m.to === 'u1@example.com'));
  assert.deepEqual(db.reminder_log.map(l => [l.contract_id, l.reminder_type]), [['pos', 'banking_deadline'], ['unknown', 'banking_balance_check']]);
  assert.deepEqual(r.errors, []);
});

test('duplicate cron invocations send each reminder once', async () => {
  const db = world();
  await runWith(db);
  const again = await runWith(db);
  assert.equal(again.sent, 0);
  const both = await Promise.all([runWith(world()), runWith(world())]); // separate DBs: independent
  assert.ok(both.every(r => r.sent === 2));
  const shared = world();
  const [a, b] = await Promise.all([runWith(shared), runWith(shared)]);
  assert.equal(a.sent + b.sent, 2, 'concurrent runs on one DB claim each reminder once');
});

test('an owner reminded under the legacy type is not reminded again this cycle', async () => {
  const db = world();
  db.reminder_log.push({ contract_id: 'pos', deadline_date: '2026-09-30', reminder_type: 'banking_borrowing_deadline' });
  const r = await runWith(db);
  assert.deepEqual(r.mail.map(m => m.subject.split(':')[0].slice(0, 16)), ['Check your Unkno']);
});

test('a failed ledger read logs an id-only error and sends nothing', async () => {
  const r = await runWith(world(), { failTable: 'contract_year_points' });
  assert.equal(r.sent, 0);
  assert.equal(r.errors.length, 3); // pos, zero, unknown are in-window; dec/out never read
  assert.ok(r.errors.every(e => /^balance read failed for contract \w+: boom$/.test(e)));
  assert.ok(r.errors.every(e => !e.includes('@')));
});

test('a failed send releases its claim so the next run retries', async () => {
  const db = world();
  const failed = await runWith(db, { sendFails: true });
  assert.equal(failed.sent, 0);
  assert.equal(db.reminder_log.length, 0);
  assert.ok(failed.errors.every(e => !e.includes('@')));
  assert.equal((await runWith(db)).sent, 2);
});

test('dry run computes decisions without sending or claiming', async () => {
  const db = world();
  const r = await runWith(db, { dryRun: true });
  assert.equal(r.mail.length, 0);
  assert.equal(db.reminder_log.length, 0);
  assert.deepEqual(r.planned.map(p => [p.contract, p.action]), [['pos', 'bank'], ['unknown', 'check']]);
});
