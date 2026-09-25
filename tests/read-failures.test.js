// UX2-05: a failed owner-data read must be distinguishable from an empty one.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const auth = fs.readFileSync(require.resolve('../js/auth.js'), 'utf8').replace(/\r/g, '');
const fnSource = name => auth.match(new RegExp('(?:async )?function ' + name + '\\([^]*?\\n\\}'))[0];

function context(error) {
  const result = { data: error ? null : [], error: error ? { message: 'network down' } : null };
  const chain = new Proxy({}, { get: (_, key) => key === 'then' ? (resolve) => resolve(result) : () => chain });
  const ctx = vm.createContext({ configured: true, currentSession: { user: { id: 'u' } }, console: { error() {} },
    supabase: { from: () => chain }, hasMembership: async () => true });
  vm.runInContext(auth.match(/const readFailures = new Set\(\);/)[0] + fnSource('noteRead') + fnSource('readFailed') + fnSource('getContracts'), ctx);
  return ctx;
}

test('a failed contracts read returns [] but is flagged as failed', async () => {
  const ctx = context(true);
  assert.deepEqual([...await ctx.getContracts()], []);
  assert.equal(ctx.readFailed('contracts'), true);
});

test('a successful empty read is not flagged', async () => {
  const ctx = context(false);
  assert.deepEqual([...await ctx.getContracts()], []);
  assert.equal(ctx.readFailed('contracts'), false);
});

test('the four owner reads record their outcome', () => {
  for (const [fn, name] of [['getContracts', 'contracts'], ['getContractYearPoints', 'contract_year_points'], ['getTrips', 'trips'], ['getItineraries', 'itineraries']]) {
    assert.ok(fnSource(fn).includes(`noteRead("${name}", error)`), fn);
  }
});
