const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const funding = require('../dvc-trip-funding.js');
const contracts = [{ id: 'a', is_active: true }, { id: 'b', is_active: false }];
const sources = (allocations, transferred = 0) => ({ version: 2, allocations, one_time: 0, transferred, other: 0 });
const trip = points_source_breakdown => ({ points_used: 100, custom_cash_value: 2000, points_source_breakdown });

test('fully owned stay credits its full value', () => {
  const result = funding.credit(trip(sources([{ contract_id: 'a', points: 100 }])), 2000, contracts);
  assert.equal(result.cash, 2000);
  assert.equal(result.byContract[0].cash, 2000);
});
test('multiple contracts and outside points receive proportional attribution, including inactive historical contracts', () => {
  const result = funding.credit(trip(sources([{ contract_id: 'a', points: 40 }, { contract_id: 'b', points: 20 }], 40)), 2000, contracts);
  assert.equal(result.cash, 1200);
  assert.deepEqual(result.byContract.map(c => c.cash), [800, 400]);
  assert.equal(result.ownedPoints, 60);
});
test('entirely outside stay remains valid history with zero ownership credit', () => {
  assert.equal(funding.credit(trip(sources([], 100)), 2000, []).cash, 0);
});
test('legacy and removed-contract records require review instead of guessed credit', () => {
  for (const value of [null, { contracts: 100 }, sources([{ contract_id: 'removed', points: 100 }])]) {
    assert.equal(funding.credit(trip(value), 2000, contracts), null);
  }
});
test('reject missing, excess, fractional, negative, repeated and unknown sources', () => {
  for (const value of [sources([]), sources([], 101), sources([], -1), sources([], 99.5),
    sources([{ contract_id: 'a', points: 0 }], 100),
    sources([{ contract_id: 'a', points: 50 }, { contract_id: 'a', points: 50 }]),
    sources([{ contract_id: 'stranger', points: 100 }]),
    { version: 2, allocations: [], transferred: 100 }]) {
    assert.equal(funding.validate(100, value, contracts).valid, false);
  }
  for (const total of [0, -100, NaN, 100.5, '100']) {
    assert.equal(funding.validate(total, sources([], 100), contracts).valid, false);
  }
});
test('invalid cash never enters value totals; zero cash is supported', () => {
  const t = trip(sources([{ contract_id: 'a', points: 100 }]));
  for (const cash of [-1, NaN, Infinity]) assert.equal(funding.credit(t, cash, contracts), null);
  assert.equal(funding.credit(t, 0, contracts).cash, 0);
});
for (const file of ['home.js', 'trips.html', 'badges.html']) {
  test(`${file} uses the same credited value for both custom and estimated cash`, () => {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    const fn = source.match(/function tripCashValue\(trip, ownedContracts\) \{[\s\S]*?\n\}/)[0];
    const context = vm.createContext({ window: { DVCTripFunding: funding }, estimateTripCashValue: () => ({ cash: 2000 }) });
    vm.runInContext(fn, context);
    const t = trip(sources([{ contract_id: 'a', points: 60 }], 40));
    assert.equal(context.tripCashValue(t, contracts).cash, 1200);
    assert.equal(context.tripCashValue({ ...t, custom_cash_value: null }, contracts).cash, 1200);
    assert.equal(context.tripCashValue({ ...t, points_source_breakdown: null }, contracts), null);
  });
}
for (const name of ['addTrip', 'updateTrip']) {
  test(`${name} never retries a confirmed trip by discarding its funding or cash`, async () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'auth.js'), 'utf8');
    const fn = source.match(new RegExp(`async function ${name}\\([^]*?\\n\\}`))[0];
    let writes = 0;
    const chain = { insert: () => chain, update: () => chain, eq: () => chain, select: () => chain,
      single: async () => { writes++; return { error: { message: 'Missing points_source_breakdown column' } }; } };
    const context = vm.createContext({ configured: true, currentSession: { user: { id: 'owner' } },
      supabase: { from: () => chain }, isMissingColumnError: () => true, hasMembership: async () => true });
    vm.runInContext(fn, context);
    const payload = trip(sources([{ contract_id: 'a', points: 100 }]));
    const result = name === 'addTrip' ? await context[name](payload) : await context[name]('trip', payload);
    assert.match(result.error, /Missing/);
    assert.equal(writes, 1);
  });
}
