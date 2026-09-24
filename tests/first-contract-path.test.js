// The first-contract path: Home's "Add my first contract" -> My Contracts
// sign-in -> the Add contract form, and membership copy that matches what
// the gate actually does.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = f => fs.readFileSync(require.resolve('../' + f), 'utf8').replace(/\r/g, '');
const auth = read('auth.js');
const account = read('account.html');
const fn = (src, name) => src.match(new RegExp(`function ${name}\\([^]*?\\n\\}`))[0];

function termsLine(gateEnabled) {
  const ctx = vm.createContext({});
  vm.runInContext(`const MEMBERSHIP_GATE_ENABLED = ${gateEnabled}; const MEMBERSHIP_PLAN = { price: 25, trialDays: 7 };` + fn(auth, 'membershipTermsLine'), ctx);
  return ctx.membershipTermsLine();
}

test('pre-sign-in terms say free while the gate is off, and the real terms once it is on', () => {
  assert.equal(termsLine(false), 'Free to use. No payment or card needed.');
  const paid = termsLine(true);
  assert.match(paid, /7-day free trial/);
  assert.match(paid, /\$25\/yr/);
  assert.match(paid, /until you cancel/);
});

test('the gate is on in the app and the reminder emails alike, and plan terms come from one place', () => {
  assert.match(auth, /const MEMBERSHIP_GATE_ENABLED = true;/);
  assert.match(read('supabase/functions/send-banking-reminders/index.ts'), /const MEMBERSHIP_GATE_ENABLED = true;/);
  assert.doesNotMatch(auth.replace(/const MEMBERSHIP_PLAN = [^\n]*/, ''), /\$\d|7-day/);
  assert.doesNotMatch(account, /\$25\b/);
});

test('My Contracts shows no upgrade card while contract tools are free', () => {
  const build = fn(account, 'buildMembershipCardHTML');
  const ctx = vm.createContext({
    window: { DVCAuth: { MEMBERSHIP_GATE_ENABLED: false } },
    membershipCardState: sub => sub ? { action: 'manage', statusText: 'Active', buttonText: 'Manage Membership', buttonClass: '' } : { action: 'upgrade', statusText: 'Free', buttonText: 'Upgrade', buttonClass: '' },
  });
  vm.runInContext(build, ctx);
  assert.equal(ctx.buildMembershipCardHTML(null, []), '');
  assert.match(ctx.buildMembershipCardHTML({ status: 'active' }, []), /Manage Membership/);
  ctx.window.DVCAuth.MEMBERSHIP_GATE_ENABLED = true;
  assert.match(ctx.buildMembershipCardHTML(null, []), /Upgrade/);
});

// Runs the intent helpers against a fake page URL and sessionStorage.
function intentPage(url, now = 1_000_000) {
  const store = new Map();
  const u = new URL(url, 'https://dvccompanion.com/');
  const replaced = [];
  const events = [];
  const opened = [];
  const ctx = vm.createContext({
    location: { search: u.search, pathname: u.pathname, hash: u.hash },
    history: { replaceState: (_s, _t, next) => replaced.push(next) },
    sessionStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) },
    Date: { now: () => now },
    JSON, URLSearchParams,
    window: { DVCFunnel: { event: e => events.push(e) } },
    document: { getElementById: () => null },
    openForm: c => opened.push(c),
  });
  const src = account.slice(account.indexOf('const ADD_CONTRACT_INTENT_KEY'), account.indexOf('function renderGate()'));
  vm.runInContext(src.replace(/const /g, 'var '), ctx);
  return { ctx, store, replaced, events, opened };
}

test('the intent is captured once, and the param is stripped from the URL', () => {
  const page = intentPage('/account.html?start=add-contract#top');
  assert.deepEqual(page.replaced, ['/account.html#top']);
  assert.ok(page.ctx.readAddContractIntent());
  assert.equal(intentPage('/account.html').ctx.readAddContractIntent(), null);
});

test('with no contracts the form opens once; a refresh does not reopen it', () => {
  const page = intentPage('/account.html?start=add-contract');
  page.ctx.consumeAddContractIntent([]);
  assert.deepEqual(page.opened, [null]);
  page.ctx.consumeAddContractIntent([]);
  assert.deepEqual(page.opened, [null]);
  assert.equal(page.store.size, 0);
});

test('with existing contracts nothing opens; sign-in completion counts only after a prompt', () => {
  const page = intentPage('/account.html?start=add-contract');
  page.ctx.writeAddContractIntent({ ...page.ctx.readAddContractIntent(), signinShown: true });
  page.ctx.consumeAddContractIntent([{ id: 'a' }]);
  assert.deepEqual(page.opened, []);
  assert.deepEqual(page.events, ['signin-done']);
  const already = intentPage('/account.html?start=add-contract');
  already.ctx.consumeAddContractIntent([]);
  assert.deepEqual(already.events, []);
});

test('a stale intent expires instead of opening a form later', () => {
  const page = intentPage('/account.html?start=add-contract', 1_000_000);
  page.ctx.Date.now = () => 1_000_000 + 61 * 60 * 1000;
  assert.equal(page.ctx.readAddContractIntent(), null);
});

test('funnel events carry only a step name', () => {
  const src = read('dvc-funnel.js');
  assert.match(src, /path: "funnel\/" \+ step, title: step, event: true/);
  for (const [, step] of account.matchAll(/DVCFunnel\?\.event\(([^)]*)\)/g)) {
    assert.match(step, /^("[a-z-]+"|`step-\$\{modalStep\}-done`|saved\.length \? "balance-saved" : "balance-skipped")$/, step);
  }
});
