// "Download my data" (dvc-data-export.js, auth.js readOwnerExport(),
// account.html's Your data section): all-or-nothing, no secrets, works
// without an active membership, and an unavailable table isn't "empty".
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const X = require('../dvc-data-export.js');
const auth = fs.readFileSync(require.resolve('../auth.js'), 'utf8').replace(/\r/g, '');
const account = fs.readFileSync(require.resolve('../account.html'), 'utf8').replace(/\r/g, '');
const fnSource = name => auth.match(new RegExp('(?:async )?function ' + name + '\\([^]*?\\n\\}'))[0];

const NOW = new Date(2026, 8, 24, 21, 30); // local Sep 24, 2026
const PROFILE = {
  id: 'u1', display_name: 'Pat', reminder_opt_in: true, reminder_lead_days: 14,
  reminder_unsubscribe_token: 'secret-unsub-uuid', push_enabled: true, push_subscription: { endpoint: 'https://push.example/abc', keys: { auth: 'k' } },
  expiration_reminder_opt_in: false, point_value_baseline: 26,
};
function reads(overrides = {}) {
  const out = { profile: { row: PROFILE, error: null } };
  for (const c of X.COLLECTIONS) out[c.table] = { rows: [], missing: false, error: null };
  return Object.assign(out, overrides);
}

test('file name uses the local date', () => {
  assert.equal(X.fileName(NOW), 'dvc-companion-export-2026-09-24.json');
  assert.equal(X.fileName(new Date(2027, 0, 5)), 'dvc-companion-export-2027-01-05.json');
});

test('an owner with no records still gets a valid file with empty collections', () => {
  const { data, error } = X.build(reads(), NOW);
  assert.equal(error, undefined);
  assert.equal(data.schemaVersion, 1);
  assert.equal(data.exportedAt, NOW.toISOString());
  for (const key of ['contracts', 'useYearBalances', 'pointMovements', 'reconciliations', 'bookingDeductions', 'bookings', 'bookingCancellations', 'itineraries']) {
    assert.deepEqual(data[key], [], key);
    assert.deepEqual({ status: data.metadata.collections[key].status, count: data.metadata.collections[key].count }, { status: 'included', count: 0 }, key);
  }
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(data)));
});

test('records are included, without user ids', () => {
  const r = reads({
    contracts: { rows: [{ id: 'c1', user_id: 'u1', home_resort_id: 'ssr', points_per_year: 150 }], missing: false, error: null },
    contract_year_points: { rows: [{ id: 'y1', user_id: 'u1', contract_id: 'c1', use_year_label: 2026, points_remaining: 120, last_checked_against_disney_at: null }], missing: false, error: null },
    trips: { rows: [{ id: 't1', user_id: 'u1', resort_id: 'ssr', check_in: '2026-10-01', disney_confirmation_number: '12345678' }], missing: false, error: null },
    itineraries: { rows: [{ id: 'i1', user_id: 'u1', name: 'Spring', segments: [{ resortId: 'ssr' }] }], missing: false, error: null },
  });
  const { data } = X.build(r, NOW);
  assert.equal(data.contracts[0].points_per_year, 150);
  assert.equal(data.useYearBalances[0].points_remaining, 120);
  assert.equal(data.bookings[0].disney_confirmation_number, '12345678');
  assert.deepEqual(data.itineraries[0].segments, [{ resortId: 'ssr' }]);
  assert.equal(data.metadata.collections.contracts.count, 1);
  assert.ok(!JSON.stringify(data).includes('"user_id"'));
});

test('secrets never reach the file, at any depth', () => {
  const r = reads({ trips: { rows: [{ id: 't1', meta: { access_token: 'tok', stripe_customer_id: 'cus_1', nested: [{ refresh_token: 'r' }] } }], missing: false, error: null } });
  const text = JSON.stringify(X.build(r, NOW).data);
  for (const secret of ['secret-unsub-uuid', 'push.example', 'reminder_unsubscribe_token', 'push_subscription', 'push_enabled', 'tok', 'cus_1', 'refresh_token', '"id":"u1"']) {
    assert.ok(!text.includes(secret), secret);
  }
  const prefs = X.build(r, NOW).data.profilePreferences;
  assert.deepEqual(prefs, { display_name: 'Pat', reminder_opt_in: true, reminder_lead_days: 14, expiration_reminder_opt_in: false, point_value_baseline: 26 });
});

test('an optional table that does not exist yet is "unavailable", not empty', () => {
  const { data } = X.build(reads({ booking_cancellations: { rows: [], missing: true, error: null }, point_reconciliations: { rows: [], missing: true, error: null } }), NOW);
  assert.equal(data.bookingCancellations, null);
  assert.equal(data.metadata.collections.bookingCancellations.status, 'unavailable');
  assert.equal(data.reconciliations, null);
  assert.deepEqual(data.pointMovements, []);
  assert.equal(data.metadata.collections.pointMovements.status, 'included');
});

test('any failed read -- required, optional, or profile -- makes no file', () => {
  for (const [table, value] of [
    ['contracts', { rows: [], missing: false, error: 'network down' }],
    ['point_movements', { rows: [], missing: false, error: 'network down' }],
    ['trips', { rows: [], missing: true, error: null }], // a required table can't be "unavailable"
    ['profile', { row: null, error: 'network down' }],
    ['itineraries', undefined],
  ]) {
    const result = X.build(reads({ [table]: value }), NOW);
    assert.equal(result.data, undefined, table);
    assert.match(result.error, /no file was made/);
    assert.ok(result.failed.length >= 1);
  }
});

// ---- the read path ----
function authContext({ member, fail = {}, missing = {} }) {
  let membershipChecked = false;
  const queried = [];
  const result = table => missing[table] ? { data: null, error: { code: 'PGRST205', message: `Could not find the table 'public.${table}'` } }
    : fail[table] ? { data: null, error: { message: 'network down' } } : { data: table === 'profiles' ? PROFILE : [{ id: table + '1' }], error: null };
  const chainFor = table => new Proxy({}, { get: (_, key) => key === 'then' ? (ok, bad) => Promise.resolve(result(table)).then(ok, bad) : () => chainFor(table) });
  const ctx = vm.createContext({
    configured: true, currentSession: { user: { id: 'u1' } }, console: { error() {} },
    supabase: { from: table => { queried.push(table); return chainFor(table); } },
    hasMembership: async () => { membershipChecked = true; return member; },
  });
  vm.runInContext(fnSource('isMissingTableError') + fnSource('readOwnerExport'), ctx);
  return { ctx, queried, membershipChecked: () => membershipChecked };
}
const TABLES = X.COLLECTIONS.map(c => c.table);

test('export reads work after a membership lapse, and never consult the gate', async () => {
  const { ctx, queried, membershipChecked } = authContext({ member: false });
  const { reads: r } = await ctx.readOwnerExport(TABLES);
  assert.equal(membershipChecked(), false);
  assert.deepEqual(queried.sort(), ['profiles', ...TABLES].sort());
  const { data } = X.build(r, NOW);
  assert.equal(data.contracts.length, 1);
  assert.ok(!JSON.stringify(data).includes('secret-unsub-uuid'));
});

test('the read path reports failures and missing tables separately', async () => {
  const { ctx } = authContext({ member: true, fail: { trips: true }, missing: { booking_cancellations: true } });
  const { reads: r } = await ctx.readOwnerExport(TABLES);
  assert.equal(r.trips.error, 'network down');
  assert.equal(r.booking_cancellations.missing, true);
  assert.equal(r.booking_cancellations.error, null);
  assert.equal(r.booking_cancellations.rows.length, 0);
  assert.match(X.build(r, NOW).error, /no file was made/);
});

test('the export read path uses the signed-in session only, no service role', () => {
  const src = fnSource('readOwnerExport');
  assert.doesNotMatch(src, /hasMembership|service_role|serviceRole|SERVICE/);
  assert.doesNotMatch(auth, /service_role/i);
  assert.match(src, /select\("\*"\)/);
  assert.doesNotMatch(src, /insert|update|upsert|delete|rpc/);
});

// ---- My Contracts ----
test('Your data sits above the Danger Zone for members and non-members alike', () => {
  const signedIn = account.match(/async function renderSignedIn\(\) \{[^]*?\n\}/)[0];
  const gate = signedIn.slice(0, signedIn.indexOf('return;'));
  assert.ok(gate.indexOf('${YOUR_DATA_HTML}') > -1 && gate.indexOf('${YOUR_DATA_HTML}') < gate.indexOf('${DANGER_ZONE_HTML}'));
  assert.match(gate, /getElementById\("download-data"\)\.addEventListener\("click", handleDownloadData\)/);
  const rest = signedIn.slice(signedIn.indexOf('return;'));
  assert.ok(rest.indexOf('${YOUR_DATA_HTML}') > -1 && rest.indexOf('${YOUR_DATA_HTML}') < rest.indexOf('${DANGER_ZONE_HTML}'));
  assert.match(account, /The file contains your personal contract and stay details/);
});

function downloadContext(readOwnerExport) {
  const nodes = { 'download-data': { disabled: false, textContent: 'Download my data' }, 'export-status': { textContent: '', classList: { add(c) { this.list.add(c); }, remove(c) { this.list.delete(c); }, list: new Set() } } };
  const downloads = [];
  const ctx = vm.createContext({
    window: { DVCAuth: { readOwnerExport }, DVCDataExport: X },
    document: { getElementById: id => nodes[id], createElement: () => ({ click() { downloads.push({ name: this.download, href: this.href }); }, remove() {} }), body: { appendChild() {} } },
    URL: { createObjectURL: blob => { downloads.blob = blob; return 'blob:1'; }, revokeObjectURL() {} },
    Blob: class { constructor(parts, opts) { this.text = parts.join(''); this.type = opts.type; } },
    setTimeout: () => {}, Date,
  });
  vm.runInContext(account.slice(account.indexOf('let exportBusy = false;'), account.indexOf('// Collapsed by default: a destructive action')), ctx);
  return { nodes, downloads, run: () => vm.runInContext('handleDownloadData()', ctx) };
}

test('a failed read downloads nothing and offers a retry', async () => {
  const ui = downloadContext(async () => ({ reads: reads({ contracts: { rows: [], missing: false, error: 'down' } }) }));
  await ui.run();
  assert.equal(ui.downloads.length, 0);
  assert.match(ui.nodes['export-status'].textContent, /no file was made/);
  assert.ok(ui.nodes['export-status'].classList.list.has('error'));
  assert.equal(ui.nodes['download-data'].textContent, 'Try again');
  assert.equal(ui.nodes['download-data'].disabled, false);
  const signedOut = downloadContext(async () => ({ error: 'Not signed in' }));
  await signedOut.run();
  assert.equal(signedOut.downloads.length, 0);
});

test('a good read downloads one JSON file with the dated name', async () => {
  const ui = downloadContext(async () => ({ reads: reads() }));
  await ui.run();
  assert.equal(ui.downloads.length, 1);
  assert.match(ui.downloads[0].name, /^dvc-companion-export-\d{4}-\d{2}-\d{2}\.json$/);
  assert.equal(ui.downloads.blob.type, 'application/json');
  assert.equal(JSON.parse(ui.downloads.blob.text).schemaVersion, 1);
  assert.match(ui.nodes['export-status'].textContent, /^Downloaded dvc-companion-export-/);
});
