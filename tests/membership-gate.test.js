const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const auth = fs.readFileSync(require.resolve('../auth.js'), 'utf8');
const fnSource = name => auth.match(new RegExp('(?:async )?function ' + name + '\\([^]*?\\n\\}'))[0];

const READS = ['getContracts', 'getContractYearPoints', 'getUserBadges', 'getTrips', 'getItineraries', 'getTripDeductions'];
const WRITES = ['addContract', 'updateContract', 'upsertContractYearPoints', 'recordPointMovement', 'upsertUserBadge',
  'incrementBadgeEvent', 'addTrip', 'updateTrip', 'addItinerary', 'updateItinerary', 'saveTripBooking', 'deleteTripBooking'];

function context(member) {
  let queried = false;
  const chain = new Proxy({}, { get: () => () => { queried = true; return chain; } });
  const ctx = vm.createContext({
    configured: true, currentSession: { user: { id: 'u' } }, console,
    supabase: { from: () => chain, rpc: () => { queried = true; return {}; } },
    hasMembership: async () => member, MEMBERSHIP_REQUIRED_ERROR: 'members only',
  });
  return { ctx, wasQueried: () => queried };
}

test('owner-data reads return nothing for non-members without querying', async () => {
  for (const name of READS) {
    const { ctx, wasQueried } = context(false);
    vm.runInContext(fnSource(name), ctx);
    assert.deepEqual([...await ctx[name]()], [], name);
    assert.equal(wasQueried(), false, name);
  }
});

test('owner-data writes are refused for non-members without querying', async () => {
  for (const name of WRITES) {
    const { ctx, wasQueried } = context(false);
    vm.runInContext(fnSource(name), ctx);
    const result = await ctx[name]('a', {});
    assert.equal(result.error, 'members only', name);
    assert.equal(wasQueried(), false, name);
  }
});

// Status rules are checked with the gate forced on, independent of the
// shipped MEMBERSHIP_GATE_ENABLED value (off until live-mode Stripe exists).
function statusCheck(gateEnabled) {
  const ctx = vm.createContext({});
  vm.runInContext(`const MEMBERSHIP_GATE_ENABLED = ${gateEnabled};` + auth.match(/const MEMBER_STATUSES = [^;]+;/)[0] + fnSource('isMemberStatus'), ctx);
  return s => vm.runInContext(`isMemberStatus(${JSON.stringify(s)})`, ctx);
}

test('with the gate off, every signed-in owner counts as a member', () => {
  const is = statusCheck(false);
  assert.equal(is('canceled'), true);
  assert.equal(is(undefined), true);
});

test('trialing and past_due still count as members; canceled does not', () => {
  const is = statusCheck(true);
  assert.equal(is('active'), true);
  assert.equal(is('trialing'), true);
  assert.equal(is('past_due'), true);
  assert.equal(is('canceled'), false);
  assert.equal(is(undefined), false);
});

test('every owner page renders the membership gate', () => {
  for (const file of ['account.html', 'trips.html', 'itineraries.html', 'itinerarycompare.html', 'badges.html', 'home.js']) {
    assert.match(fs.readFileSync(require.resolve('../' + file), 'utf8'), /hasMembership\(\)/, file);
  }
});
