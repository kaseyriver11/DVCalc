// The membership gate states the yearly price as the dues on a few points
// at the owner's own resort. The wording must never be false: "Less than N"
// only when the price is clearly under N points of dues.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = f => fs.readFileSync(require.resolve('../' + f), 'utf8').replace(/\r/g, '');
const auth = read('auth.js');
const fn = name => auth.match(new RegExp(`function ${name}\\([^]*?\\n\\}`))[0];

function gate() {
  const ctx = vm.createContext({});
  vm.runInContext(read('data/data.js') + read('data/resort_shorthand.js')
    + auth.match(/const MEMBERSHIP_PLAN = [^\n]*/)[0]
    + fn('duesPointsPhrase') + fn('membershipDuesHTML') + fn('ownedResortName')
    + ';this.DUES = DUES_PER_POINT; this.PLAN = MEMBERSHIP_PLAN;', ctx);
  return ctx;
}

test('founding price is $25 a year with a 7-day trial', () => {
  const { PLAN } = gate();
  assert.equal(PLAN.price, 25);
  assert.equal(PLAN.trialDays, 7);
});

test('"less than" only when clearly under, "about" within a tenth of a point', () => {
  const { duesPointsPhrase } = gate();
  assert.deepEqual({ ...duesPointsPhrase(25, 9.19) }, { lead: 'Less than', n: 3, unit: 'points' }); // 2.72
  assert.deepEqual({ ...duesPointsPhrase(25, 8.31) }, { lead: 'About', n: 3, unit: 'points' });     // 3.008
  assert.deepEqual({ ...duesPointsPhrase(25, 25) }, { lead: 'About', n: 1, unit: 'point' });
  assert.deepEqual({ ...duesPointsPhrase(25, 14.89) }, { lead: 'Less than', n: 2, unit: 'points' }); // 1.68
});

test('every resort gets a true statement about its own dues', () => {
  const { DUES, PLAN, duesPointsPhrase } = gate();
  for (const [id, dues] of Object.entries(DUES)) {
    const exact = PLAN.price / dues;
    const { lead, n } = duesPointsPhrase(PLAN.price, dues);
    if (lead === 'Less than') assert.ok(exact < n, id);
    else assert.ok(Math.abs(exact - n) < 0.1, id);
  }
});

test('a known resort names it by shorthand; an unknown one asks where they own', () => {
  const { membershipDuesHTML } = gate();
  const ssr = membershipDuesHTML('saratogaSprings');
  assert.match(ssr, /^Less than the dues on 3 Saratoga Springs points\./);
  assert.match(ssr, /data-membership-own>Change</);
  const any = membershipDuesHTML(null);
  assert.match(any, /^About the dues on 2–3 points\./);
  assert.match(any, /data-membership-own>Where do you own\?</);
  assert.match(membershipDuesHTML('notAResort'), /Where do you own\?/);
});

test('a complimentary membership shows as active with no billing button', () => {
  const account = read('account.html');
  const ctx = vm.createContext({});
  vm.runInContext(account.match(/function membershipCardState\([^]*?\n\}/)[0], ctx);
  const comp = ctx.membershipCardState({ status: 'active', stripe_customer_id: 'comp:abc' }, []);
  assert.equal(comp.statusText, 'Active Member');
  assert.equal(comp.action, '');
  const paid = ctx.membershipCardState({ status: 'active', stripe_customer_id: 'cus_123' }, []);
  assert.equal(paid.action, 'manage');
});
