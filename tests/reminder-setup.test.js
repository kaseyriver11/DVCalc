// The reminder offer after a first saved balance (dvc-reminder-setup.js +
// account.html's card): opt-in, reflects saved settings, only offers what
// can persist, and never claims reminders are on after a failed save.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const R = require('../js/dvc-reminder-setup.js');
const source = fs.readFileSync(require.resolve('../account.html'), 'utf8').replace(/\r/g, '');

const withAll = (extra = {}) => ({ reminder_opt_in: false, reminder_lead_days: 14, expiration_reminder_opt_in: false, expiration_reminder_lead_days: 45, holding_reminder_opt_in: false, holding_reminder_lead_days: 60, ...extra });
const before026 = (extra = {}) => ({ reminder_opt_in: false, reminder_lead_days: 14, ...extra });

test('offers all three reminder types, unchecked unless already saved on', () => {
  const opts = R.options(withAll({ expiration_reminder_opt_in: true }));
  assert.deepEqual(opts.map(o => [o.key, o.checked]), [['banking', false], ['expiration', true], ['holding', false]]);
  for (const o of opts) assert.ok(o.line.length < 90, 'one short line each');
});

test('before migration 026 only the banking reminder is offered (the others could not save)', () => {
  assert.deepEqual(R.options(before026()).map(o => o.key), ['banking']);
  assert.deepEqual(R.patch(before026(), { banking: true, expiration: true, holding: true }), { reminder_opt_in: true });
  assert.deepEqual(R.options(null), []);
});

test('the patch writes only opt-in columns, never lead times or push', () => {
  const patch = R.patch(withAll(), { banking: true, holding: true });
  assert.deepEqual(patch, { reminder_opt_in: true, expiration_reminder_opt_in: false, holding_reminder_opt_in: true });
});

test('shown only after a first balance, not after dismissal, and not when everything is already on', () => {
  assert.equal(R.shouldOffer({ profile: withAll(), pending: false, done: false }), false);
  assert.equal(R.shouldOffer({ profile: withAll(), pending: true, done: false }), true);
  assert.equal(R.shouldOffer({ profile: withAll(), pending: true, done: true }), false);
  assert.equal(R.shouldOffer({ profile: withAll({ reminder_opt_in: true, expiration_reminder_opt_in: true, holding_reminder_opt_in: true }), pending: true, done: false }), false);
  assert.equal(R.shouldOffer({ profile: null, pending: true, done: false }), false); // profile read failed
});

test('first balance: current or next use year, and only if none was recorded before', () => {
  const contracts = [{ id: 'a', use_year: 'Dec', is_active: true }, { id: 'b', use_year: 'Jun', is_active: true }];
  const currentYear = c => ({ a: 2025, b: 2026 })[c.id];
  assert.equal(R.isFirstBalance(contracts, {}, [{ contractId: 'a', year: 2025 }], currentYear), true);
  assert.equal(R.isFirstBalance(contracts, {}, [{ contractId: 'a', year: 2026 }], currentYear), true); // next use year
  assert.equal(R.isFirstBalance(contracts, {}, [{ contractId: 'a', year: 2028 }], currentYear), false); // a far planned year
  const had = { b: [{ use_year_label: 2026, balance_confirmed_at: 'x' }] };
  assert.equal(R.isFirstBalance(contracts, had, [{ contractId: 'a', year: 2025 }], currentYear), false);
  // An unconfirmed placeholder row isn't a balance.
  assert.equal(R.isFirstBalance(contracts, { b: [{ use_year_label: 2026, balance_confirmed_at: null }] }, [{ contractId: 'a', year: 2025 }], currentYear), true);
});

test('the offer and Notification Settings read and write the same profile columns', () => {
  const settingsKeys = [...source.matchAll(/\{ key: "(\w+)", short:/g)].map(m => m[1]);
  assert.deepEqual(settingsKeys, ['expiration', 'holding']);
  for (const key of settingsKeys) assert.ok(R.TYPES.some(t => t.column === `${key}_reminder_opt_in`));
  assert.match(source, /id="n-email-enabled" aria-label="Email reminders" \$\{profile\?\.reminder_opt_in \? "checked" : ""\}/);
  assert.ok(R.TYPES.some(t => t.column === 'reminder_opt_in'));
});

test('the offer is only triggered from a saved balance, never from adding a contract', () => {
  assert.doesNotMatch(source, /buildReminderOfferHTML|REMINDER_OFFER_DISMISSED_KEY/);
  const close = source.match(/async function closeBalanceSetup\(\) \{[^]*?\n\}/)[0];
  assert.match(close, /balanceSetupSaved\.keys\(\)/);
  assert.match(close, /reminderSetupPending = true/);
  const saveForm = source.match(/async function saveForm\([^]*?\n\}/)[0];
  assert.doesNotMatch(saveForm, /reminderSetup/);
  assert.doesNotMatch(source.match(/function buildReminderSetupHTML[^]*?\n\}/)[0], /requestPermission|[Pp]ush/);
});

// The real card code from account.html, driven with a fake DOM.
function setupCard(updateProfile, profile = withAll()) {
  const store = {};
  const inputs = R.options(profile).map(o => ({ dataset: { reminderSetup: o.key }, checked: o.checked, disabled: false }));
  const nodes = {
    'reminder-setup-save': { textContent: 'Save reminder choices', disabled: false },
    'reminder-setup-error': { textContent: '', hidden: true },
  };
  nodes['reminder-setup'] = {
    querySelectorAll: sel => sel === '[data-reminder-setup]' ? inputs : [...inputs, nodes['reminder-setup-save']],
  };
  let rendered = 0;
  const ctx = vm.createContext({
    window: { DVCReminderSetup: R, DVCAuth: { updateProfile, getSession: () => ({ user: { id: 'u1' } }) } },
    document: { getElementById: id => nodes[id] },
    localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; } },
    currentProfile: profile,
    renderSignedIn: async () => { rendered++; },
  });
  vm.runInContext(source.slice(source.indexOf('let reminderSetupPending = false;'), source.indexOf('function wireReminderSetup()')), ctx);
  vm.runInContext('reminderSetupPending = true;', ctx);
  return { inputs, nodes, store, ctx, rendered: () => rendered, save: () => vm.runInContext('saveReminderSetup()', ctx), state: expr => vm.runInContext(expr, ctx) };
}

test('a failed save keeps the picks, shows a retry, and claims nothing', async () => {
  for (const fail of [async () => ({ error: 'offline' }), async () => { throw new Error('offline'); }]) {
    const ui = setupCard(fail);
    ui.inputs[0].checked = true; ui.inputs[2].checked = true;
    await ui.save();
    assert.equal(ui.nodes['reminder-setup-error'].hidden, false);
    assert.match(ui.nodes['reminder-setup-error'].textContent, /no reminders changed/);
    assert.equal(ui.nodes['reminder-setup-save'].textContent, 'Try again');
    assert.equal(ui.nodes['reminder-setup-save'].disabled, false);
    assert.deepEqual({ ...ui.state('reminderSetupDraft') }, { banking: true, expiration: false, holding: true });
    assert.equal(ui.state('reminderSetupSaved'), false);
    assert.equal(ui.state('reminderSetupPending'), true);
    assert.deepEqual(ui.store, {}); // not marked done: it can still be retried
    assert.equal(ui.rendered(), 0);
    // A re-render (e.g. another edit on the page) still shows the retained picks.
    const html = ui.state('buildReminderSetupHTML(currentProfile)');
    assert.match(html, /data-reminder-setup="banking" checked/);
    assert.match(html, /data-reminder-setup="expiration" >/);
    assert.match(html, />Try again</);
  }
});

test('a successful save writes the picks, stops the offer, and re-reads settings', async () => {
  let patch;
  const ui = setupCard(async p => { patch = p; return { data: {} }; });
  ui.inputs[1].checked = true;
  await ui.save();
  assert.deepEqual(patch, { reminder_opt_in: false, expiration_reminder_opt_in: true, holding_reminder_opt_in: false });
  assert.equal(ui.store['dvc_reminder_setup_done:u1'], '1');
  assert.equal(ui.state('reminderSetupSaved'), true);
  assert.equal(ui.rendered(), 1); // renderSignedIn re-reads the profile for Notification Settings
  assert.match(ui.state('buildReminderSetupHTML(currentProfile)'), /Reminder choices saved/);
});

test('double taps do not send overlapping saves', async () => {
  let calls = 0, release;
  const ui = setupCard(() => { calls++; return new Promise(r => { release = r; }); });
  const first = ui.save();
  await ui.save();
  assert.equal(calls, 1);
  release({});
  await first;
});

test('copy tells owners reminder dates depend on what they record', () => {
  const html = setupCard(async () => ({})).state('buildReminderSetupHTML(currentProfile)');
  assert.match(html, /Save reminder choices/);
  assert.match(html, /Not now/);
  assert.match(html, /use years and balances you record here, so check those against Disney/);
});
