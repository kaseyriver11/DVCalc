// Prompt 3: point actions (dvc-point-attention.js) and the opt-in use-year
// expiration / Holding reminder emails (supabase/functions/_shared/
// point-reminders.js + point-reminder-run.js), including that the two name
// the same points.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const shared = path.join(__dirname, '../supabase/functions/_shared');
const load = f => import('file://' + path.join(shared, f).replace(/\\/g, '/'));
let P, Run;
test.before(async () => { P = await load('point-reminders.js'); Run = await load('point-reminder-run.js'); });

const c = vm.createContext({ window: {} });
for (const f of ['js/dvc-dates.js', 'js/dvc-point-attention.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), c);
const { DVCDates: D, DVCPointAttention: A } = c.window;
const plain = v => JSON.parse(JSON.stringify(v));
const confirmed = (b = {}) => ({ balance_confirmed_at: '2026-09-01T00:00:00Z', points_remaining: 0, points_banked: 0, points_borrowed: 0, points_holding: 0, ...b });
const both = { expiration: 45, holding: 60 };

// ---- App-side point actions ----
test('each recorded point lands in exactly one action, and only current points are ever bankable', () => {
  const contract = { id: 'a', use_year: 'Feb', is_active: true };
  const row = { use_year_label: 2026, ...confirmed({ points_remaining: 50, points_banked: 20, points_borrowed: 5, points_holding: 10 }) };
  for (const today of [{ year: 2026, month: 9, day: 22 }, { year: 2026, month: 10, day: 1 }, { year: 2027, month: 1, day: 20 }]) {
    const events = A.eventsForContract(contract, { a: [row] }, today);
    assert.equal(events.reduce((s, e) => s + e.points, 0), 85, JSON.stringify(today));
    for (const e of events) {
      const copy = A.describe(e, D.formatDeadlineDate);
      if (e.kind !== 'bankable') assert.doesNotMatch(copy.title + copy.why, /\bBank or\b|bank them|bank these/i);
    }
  }
});

test('banking-cutoff transition: current points move from "bank or use" to "use before"', () => {
  const contract = { id: 'a', use_year: 'Feb', is_active: true };
  const rows = { a: [{ use_year_label: 2026, ...confirmed({ points_remaining: 50 }) }] };
  const before = A.eventsForContract(contract, rows, { year: 2026, month: 9, day: 30 }); // deadline day
  const after = A.eventsForContract(contract, rows, { year: 2026, month: 10, day: 1 });
  assert.equal(before[0].kind, 'bankable');
  assert.equal(A.describe(before[0], D.formatDeadlineDate).title, 'Bank or use 50 current points by Sep 30, 2026');
  assert.equal(after[0].kind, 'use-by');
  const copy = A.describe(after[0], D.formatDeadlineDate);
  assert.equal(copy.title, 'Use 50 points before Jan 31, 2027');
  assert.match(copy.why, /Sep 30, 2026 banking deadline has passed/);
});

test('December use year: the 2025 cycle ends Nov 30, 2026; Holding keeps its 60-day booking rule', () => {
  const contract = { id: 'd', use_year: 'Dec', is_active: true };
  const rows = { d: [{ use_year_label: 2025, ...confirmed({ points_banked: 30, points_holding: 12 }) }] };
  const events = A.eventsForContract(contract, rows, { year: 2026, month: 10, day: 15 });
  assert.equal(JSON.stringify(events.map(e => [e.kind, e.points, e.daysUntil])), JSON.stringify([['use-by', 30, 46], ['holding', 12, 46]]));
  const holding = A.describe(events[1], D.formatDeadlineDate);
  assert.equal(holding.title, 'Use 12 Holding points by Nov 30, 2026');
  assert.match(holding.why, /Book no more than 60 days before check-in/);
  assert.doesNotMatch(holding.why, /entered Holding|since/); // not a clock from entry
});

test('unknown balances ask for a Disney check; a saved zero needs nothing', () => {
  const a = { id: 'a', use_year: 'Oct', is_active: true }, z = { id: 'z', use_year: 'Oct', is_active: true };
  const today = { year: 2026, month: 9, day: 22 };
  const [unknown] = A.eventsForContract(a, {}, today);
  assert.equal(A.describe(unknown, D.formatDeadlineDate).title, 'Check your Disney balance');
  assert.equal(unknown.points, undefined);
  assert.equal(A.eventsForContract(z, { z: [{ use_year_label: 2025, ...confirmed() }] }, today).length, 0);
});

test('action center groups by contract, most urgent first, unknown next, all-clear last; freshness carried', () => {
  const today = { year: 2026, month: 9, day: 22 };
  const soon = { id: 'soon', use_year: 'Oct', is_active: true }, later = { id: 'later', use_year: 'Apr', is_active: true };
  const unknown = { id: 'unk', use_year: 'Jun', is_active: true }, clear = { id: 'clear', use_year: 'Oct', is_active: true }, off = { id: 'off', use_year: 'Oct', is_active: false };
  const rows = {
    soon: [{ use_year_label: 2025, ...confirmed({ points_holding: 5 }), last_checked_against_disney_at: '2026-09-20T12:00:00Z' }],
    later: [{ use_year_label: 2026, ...confirmed({ points_remaining: 100 }) }],
    clear: [{ use_year_label: 2025, ...confirmed() }],
  };
  const g = A.groups([clear, unknown, later, off, soon], rows, today);
  assert.deepEqual(plain(g.map(x => x.contract.id)), ['soon', 'later', 'unk', 'clear']);
  assert.equal(g[0].events[0].freshness.checkedAt, '2026-09-20T12:00:00Z');
  assert.equal(g[1].events[0].freshness.checkedAt, null);
});

// ---- Sender rules ----
test('February use year in December: past the cutoff, current + banked expire; Holding separately', () => {
  const today = { year: 2026, month: 12, day: 20 };
  const d = P.pointReminderDecisions({ useYear: 'Feb', today, prefs: both, row: confirmed({ points_remaining: 50, points_banked: 20, points_holding: 10 }) });
  assert.deepEqual(d.map(x => [x.kind, x.points, x.daysUntil, x.type]), [['expiration', 70, 42, 'use_year_expiration'], ['holding', 10, 42, 'holding_expiration']]);
});

test('with a long lead while banking is open, current points stay with the banking reminder', () => {
  const d = P.pointReminderDecisions({ useYear: 'Feb', today: { year: 2026, month: 9, day: 1 }, prefs: { expiration: 240, holding: null }, row: confirmed({ points_remaining: 50, points_borrowed: 15 }) });
  assert.deepEqual(d.map(x => [x.kind, x.points]), [['expiration', 15]]);
});

test('unknown -> one check email (never Holding); saved zero, opted out, out of window -> nothing; failed read -> error', () => {
  const today = { year: 2026, month: 12, day: 20 };
  assert.deepEqual(P.pointReminderDecisions({ useYear: 'Feb', today, prefs: both, row: null }).map(x => x.kind), ['expirationCheck']);
  assert.deepEqual(P.pointReminderDecisions({ useYear: 'Feb', today, prefs: { expiration: null, holding: 60 }, row: null }), []);
  assert.deepEqual(P.pointReminderDecisions({ useYear: 'Feb', today, prefs: both, row: { points_holding: 50 } }).map(x => x.kind), ['expirationCheck']); // unconfirmed draft
  assert.deepEqual(P.pointReminderDecisions({ useYear: 'Feb', today, prefs: both, row: confirmed() }), []);
  assert.deepEqual(P.pointReminderDecisions({ useYear: 'Feb', today, prefs: { expiration: null, holding: null }, row: confirmed({ points_banked: 5 }) }), []);
  assert.deepEqual(P.pointReminderDecisions({ useYear: 'Feb', today, prefs: { expiration: 30, holding: 30 }, row: confirmed({ points_banked: 5 }) }), []); // 42 days out
  assert.deepEqual(P.pointReminderDecisions({ useYear: 'Feb', today, prefs: both, row: null, rowError: true }).map(x => x.kind), ['error']);
});

test('sender names the same points as the app for every use year and many dates', () => {
  const rowSets = [
    { points_remaining: 50, points_banked: 20, points_borrowed: 5, points_holding: 10 },
    { points_remaining: 0, points_banked: 0, points_borrowed: 0, points_holding: 7 },
    { points_remaining: 33, points_banked: 0, points_borrowed: 0, points_holding: 0 },
  ];
  let compared = 0;
  for (const useYear of Object.keys(D.USE_YEAR_START_MONTH)) {
    for (let m = 1; m <= 12; m++) for (const day of [1, 15, 28]) {
      const today = { year: 2026, month: m, day };
      const label = D.currentUYYear(useYear, today);
      for (const b of rowSets) {
        const row = { use_year_label: label, ...confirmed(b) };
        const events = A.eventsForContract({ id: 'x', use_year: useYear, is_active: true }, { x: [row] }, today);
        const decisions = P.pointReminderDecisions({ useYear, today, prefs: { expiration: 400, holding: 400 }, row });
        const pts = kind => events.find(e => e.kind === kind)?.points ?? null;
        assert.equal(decisions.find(d => d.kind === 'expiration')?.points ?? null, pts('use-by'), `${useYear} ${m}/${day}`);
        assert.equal(decisions.find(d => d.kind === 'holding')?.points ?? null, pts('holding'), `${useYear} ${m}/${day}`);
        assert.equal(decisions[0]?.endMs ?? events[0].expiresMs, events[0].expiresMs);
        compared++;
      }
    }
  }
  assert.ok(compared > 800);
});

test('emails: exact amounts only when recorded, no banking suggestion, Holding rule, typed unsubscribe', () => {
  const today = { year: 2026, month: 12, day: 20 };
  const links = { balance: 'https://dvccompanion.com/account.html?contract=a&year=2026', unsubscribe: 'https://x/unsub?token=t&type=expiration' };
  const [exp, hold] = P.pointReminderDecisions({ useYear: 'Feb', today, prefs: both, row: confirmed({ points_remaining: 50, points_banked: 20, points_holding: 10 }) });
  const e = P.pointReminderEmail(exp, { name: 'Pat', contractLabel: 'SSR <Home>', useYear: 'Feb', links });
  assert.equal(e.subject, 'Use 70 points on SSR <Home> before January 31, 2027');
  assert.match(e.html, /50 current, 20 banked/);
  assert.match(e.html, /SSR &lt;Home&gt;/);
  assert.match(e.html, /banking deadline for this use year has passed/);
  assert.doesNotMatch(e.html, /bank them|bank these|borrow (them|these)/i);
  assert.match(e.html, /type=expiration/);
  const h = P.pointReminderEmail(hold, { contractLabel: 'SSR', useYear: 'Feb', links: { ...links, unsubscribe: 'https://x/unsub?token=t&type=holding' } });
  assert.equal(h.subject, '10 Holding points on SSR expire January 31, 2027');
  assert.match(h.html, /no more than 60 days before check-in/);
  assert.match(h.html, /Unsubscribe from Holding point reminders/);
  const [check] = P.pointReminderDecisions({ useYear: 'Feb', today, prefs: both, row: null });
  const k = P.pointReminderEmail(check, { contractLabel: 'SSR', useYear: 'Feb', links });
  assert.equal(k.subject, 'Check your SSR points before the use year ends on January 31, 2027');
  assert.doesNotMatch(k.html.replace(/\d{4}|January 31|42 days/g, ''), /\d+ (current |Holding )?points/);
});

// ---- The nightly loop against a fake Supabase ----
function fakeSupabase(db, { failTable = null } = {}) {
  const query = table => {
    const filters = []; let op = 'select', payload = null;
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
      if (op === 'delete') { db[table] = (db[table] || []).filter(r => !filters.every(f => f(r))); return { error: null }; }
      const found = (db[table] || []).filter(r => filters.every(f => f(r)));
      return { data: single ? found[0] ?? null : found, error: null };
    }
    return q;
  };
  return { from: query, auth: { admin: { getUserById: async id => ({ data: { user: { email: `${id}@example.com` } }, error: null }) } } };
}
const profile = (id, b) => ({ id, display_name: id, reminder_unsubscribe_token: 't-' + id, expiration_reminder_opt_in: false, expiration_reminder_lead_days: 45, holding_reminder_opt_in: false, holding_reminder_lead_days: 60, ...b });
function world() {
  return {
    profiles: [
      profile('both', { expiration_reminder_opt_in: true, holding_reminder_opt_in: true }),
      profile('holdonly', { holding_reminder_opt_in: true }),
      profile('none', {}),
    ],
    contracts: [
      { id: 'feb', user_id: 'both', use_year: 'Feb', is_active: true, nickname: 'Feb', home_resort_id: 'ssr' },   // ends Jan 31, 2027: 42 days
      { id: 'unk', user_id: 'both', use_year: 'Feb', is_active: true, nickname: 'Unknown', home_resort_id: 'ssr' },
      { id: 'zero', user_id: 'both', use_year: 'Feb', is_active: true, nickname: 'Zero', home_resort_id: 'ssr' },
      { id: 'oct', user_id: 'both', use_year: 'Oct', is_active: true, nickname: 'Oct', home_resort_id: 'ssr' },  // ends Sep 30, 2027: out of window
      { id: 'h', user_id: 'holdonly', use_year: 'Feb', is_active: true, nickname: 'Hold', home_resort_id: 'blt' },
      { id: 'n', user_id: 'none', use_year: 'Feb', is_active: true, nickname: 'Nope', home_resort_id: 'blt' },
    ],
    contract_year_points: [
      { contract_id: 'feb', use_year_label: 2026, ...confirmed({ points_remaining: 50, points_banked: 20, points_holding: 10 }) },
      { contract_id: 'zero', use_year_label: 2026, ...confirmed() },
      { contract_id: 'h', use_year_label: 2026, ...confirmed({ points_remaining: 99, points_holding: 4 }) },
      { contract_id: 'n', use_year_label: 2026, ...confirmed({ points_banked: 99 }) },
    ],
    reminder_log: [],
  };
}
const dec20 = { year: 2026, month: 12, day: 20 };
const runWith = (db, opts = {}) => {
  const mail = [];
  return Run.runPointReminders({ supabase: fakeSupabase(db, opts), today: dec20, appBaseUrl: 'https://dvccompanion.com', unsubscribeBaseUrl: 'https://x/unsub', dryRun: opts.dryRun, memberIds: opts.memberIds,
    send: async m => { mail.push(m); return opts.sendFails ? { ok: false, error: 'resend down' } : { ok: true }; } }).then(r => ({ ...r, mail }));
};

test('one run: each opted-in type sends once per contract; zero, opted-out and out-of-window send nothing', async () => {
  const db = world();
  const r = await runWith(db);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.mail.map(m => [m.to, m.subject]), [
    ['both@example.com', 'Use 70 points on Feb before January 31, 2027'],
    ['both@example.com', '10 Holding points on Feb expire January 31, 2027'],
    ['both@example.com', 'Check your Unknown points before the use year ends on January 31, 2027'],
    ['holdonly@example.com', '4 Holding points on Hold expire January 31, 2027'],
  ]);
  assert.deepEqual(db.reminder_log.map(l => [l.contract_id, l.reminder_type, l.deadline_date]), [
    ['feb', 'use_year_expiration', '2027-01-31'], ['feb', 'holding_expiration', '2027-01-31'], ['unk', 'use_year_expiration_check', '2027-01-31'], ['h', 'holding_expiration', '2027-01-31'],
  ]);
  assert.match(r.mail[0].html, /account\.html\?contract=feb&amp;year=2026/);
  assert.match(r.mail[3].html, /token=t-holdonly&amp;type=holding/);
});

test('repeated nightly runs send nothing new; concurrent runs claim each email once', async () => {
  const db = world();
  await runWith(db);
  assert.equal((await runWith(db)).sent, 0);
  const shared = world();
  const [a, b] = await Promise.all([runWith(shared), runWith(shared)]);
  assert.equal(a.sent + b.sent, 4);
});

test('a failed ledger read logs id-only errors and sends nothing for that contract', async () => {
  const r = await runWith(world(), { failTable: 'contract_year_points' });
  assert.equal(r.sent, 0);
  assert.ok(r.errors.length >= 4 && r.errors.every(e => /^balance read failed for contract \w+: boom$/.test(e) && !e.includes('@')));
});

test('a failed send releases its claim; dry run plans without sending or claiming; non-members skipped', async () => {
  const db = world();
  const failed = await runWith(db, { sendFails: true });
  assert.equal(failed.sent, 0);
  assert.equal(db.reminder_log.length, 0);
  assert.equal((await runWith(db)).sent, 4);
  const dry = world();
  const plan = await runWith(dry, { dryRun: true });
  assert.equal(plan.mail.length, 0);
  assert.equal(dry.reminder_log.length, 0);
  assert.deepEqual(plan.planned.map(p => [p.contract, p.action]), [['feb', 'expiration'], ['feb', 'holding'], ['unk', 'expirationCheck'], ['h', 'holding']]);
  const members = await runWith(world(), { memberIds: new Set(['holdonly']) });
  assert.equal(members.sent, 1);
});

test('index.ts runs banking and expiration/holding separately; unsubscribe knows each type', () => {
  const index = fs.readFileSync(path.join(__dirname, '../supabase/functions/send-banking-reminders/index.ts'), 'utf8');
  assert.match(index, /\["banking", runBankingReminders\], \["expiration\/holding", runPointReminders\]/);
  const unsub = fs.readFileSync(path.join(__dirname, '../supabase/functions/unsubscribe-reminders/index.ts'), 'utf8');
  for (const col of ['reminder_opt_in', 'expiration_reminder_opt_in', 'holding_reminder_opt_in']) assert.ok(unsub.includes(`"${col}"`));
  assert.match(unsub, /searchParams\.get\("type"\) \?\? "banking"/); // links sent before this change keep meaning banking
  const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/026_point_expiration_reminders.sql'), 'utf8');
  assert.match(sql, /expiration_reminder_opt_in boolean not null default false/);
  assert.match(sql, /holding_reminder_opt_in boolean not null default false/);
});
