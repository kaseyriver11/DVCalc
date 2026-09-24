const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const auth = fs.readFileSync(require.resolve('../auth.js'), 'utf8');
const fnSource = name => auth.match(new RegExp('(?:async )?function ' + name + '\\([^]*?\\n\\}'))[0];

const READS = ['getContracts', 'getContractYearPoints', 'getTrips', 'getTripDeductions'];
const WRITES = ['addContract', 'updateContract', 'upsertContractYearPoints', 'recordPointMovement', 'upsertUserBadge',
  'incrementBadgeEvent', 'addTrip', 'updateTrip', 'saveTripBooking', 'deleteTripBooking', 'reconcilePoints'];

function context(member) {
  let queried = false;
  const chain = new Proxy({}, { get: () => () => { queried = true; return chain; } });
  const ctx = vm.createContext({
    configured: true, currentSession: { user: { id: 'u' } }, console,
    supabase: { from: () => chain, rpc: () => { queried = true; return {}; } },
    hasMembership: async () => member, MEMBERSHIP_REQUIRED_ERROR: 'members only', FREE_BADGE_IDS: new Set(['night-owl']),
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
  for (const file of ['account.html', 'bookings.html', 'trips.html', 'badges.html', 'home.js']) {
    assert.match(fs.readFileSync(require.resolve('../' + file), 'utf8'), /hasMembership\(\)/, file);
  }
});

test('saved itineraries are free: no membership check on read or write', async () => {
  for (const name of ['getItineraries', 'addItinerary', 'updateItinerary']) {
    assert.doesNotMatch(fnSource(name), /hasMembership/, name);
  }
  for (const page of ['itineraries.html', 'itinerarycompare.html']) {
    assert.doesNotMatch(fs.readFileSync(require.resolve('../' + page), 'utf8'), /renderMembershipGate/, page);
  }
});

test('free badges: non-members can record them, but not member badges', async () => {
  for (const [id, allowed] of [['night-owl', true], ['house-money', false]]) {
    const done = { data: {}, error: null };
    const chain = { upsert: () => chain, select: () => chain, single: async () => done };
    const ctx = vm.createContext({
      configured: true, currentSession: { user: { id: 'u' } }, console,
      supabase: { from: () => chain, rpc: async () => done },
      hasMembership: async () => false, MEMBERSHIP_REQUIRED_ERROR: 'members only', FREE_BADGE_IDS: new Set(['night-owl']),
    });
    vm.runInContext(fnSource('incrementBadgeEvent') + fnSource('upsertUserBadge'), ctx);
    assert.equal((await ctx.incrementBadgeEvent(id)).error === 'members only', !allowed, id);
    assert.equal((await ctx.upsertUserBadge({ badge_id: id, tier: 1 })).error === 'members only', !allowed, id);
  }
});
