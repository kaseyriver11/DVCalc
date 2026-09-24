// contractvalue.html is self-contained (inline script, no module), so this
// pulls its pure functions out of the page source and runs them against the
// real data files, the same way the page does.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'contractvalue.html'), 'utf8');

// Source of one top-level `function name(...) {...}` or `const NAME = ...;`.
function extractFunction(name) {
  const start = html.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `contractvalue.html: no function ${name}`);
  let depth = 0, i = html.indexOf('{', start);
  for (; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}' && --depth === 0) break;
  }
  return html.slice(start, i + 1);
}
function extractConst(name) {
  const m = html.match(new RegExp(`const ${name} = [^;]*;`));
  assert.ok(m, `contractvalue.html: no const ${name}`);
  return m[0];
}

function setup(wizard) {
  const context = vm.createContext({ window: {}, console, Math, Number, Object, Set });
  context.window = context;
  context.DVCResale = require('../dvc-resale.js');
  context.DVCFinancing = require('../dvc-financing.js');
  for (const f of ['data/data.js', 'data/data_historical.js', 'data/dues_historical.js', 'data/resort_investment.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/^(const|let) /gm, 'var '), context);
  }
  const src = [
    extractConst('RESALE_BROKER_FEE'),
    extractConst('resaleValueFraction'), extractConst('SPECIALTY_ROOM_PATTERN'),
    'const CATEGORY_KEYWORDS = { studio: "studio", one: "one-bedroom", two: "two-bedroom", three: "three-bedroom" };',
    extractFunction('getRoomTypesForCategory'),
    extractFunction('medianRoomPoints'), extractFunction('computeRow'),
    'var priceOverrides = {}; var currentRealYear = 2026;',
    'function isHomeOnlyResale() { return false; } function resortDisplayName(id) { return id; }',
  ].join('\n');
  vm.runInContext(src.replace(/^const /gm, 'var '), context);
  context.wizardData = { purchaseType: 'resale', sellAtEnd: true, ...wizard };
  return context;
}

const INPUTS = { points: 150, closingCost: 1500, duesGrowth: 0.04, pointValue: 30, rentalRate: 20, valueGrowth: 0.05, category: 'studio' };
function rows(ctx, desiredVacationYears) {
  return Object.keys(ctx.RESORT_INVESTMENT_DATA)
    .map(id => ctx.computeRow(id, { ...INPUTS, desiredVacationYears }))
    .filter(r => r && r.costPerPointYear != null);
}
const topBy = (list, key, dir) => [...list].sort((a, b) => dir * (a[key] - b[key]))[0].resortId;
const rank = (list, key, dir) => [...list].sort((a, b) => dir * (a[key] - b[key])).map(r => r.resortId);

test('at Full Length, Cost/Pt/Year no longer crowns the shortest deeds', () => {
  const all = rows(setup({}), Infinity);
  const best = all.find(r => r.resortId === topBy(all, 'costPerPointYear', 1));
  assert.ok(best.contractExpirationYear > 2042, `best overall is a 2042 deed: ${best.resortId}`);
});

test('Cost/Pt/Year and Cash Ratio do not point in opposite directions', () => {
  for (const horizon of [Infinity, 20, 10]) {
    const all = rows(setup({}), horizon);
    const byCost = rank(all, 'costPerPointYear', 1);
    const byRatio = rank(all, 'cashRatio', -1);
    // The cheapest resort by cost must sit in Cash Ratio's top half, and
    // vice versa -- the two headline metrics may differ, not contradict.
    const half = Math.ceil(all.length / 2);
    assert.ok(byRatio.indexOf(byCost[0]) < half, `horizon ${horizon}: ${byCost[0]} is best by cost but ranks ${byRatio.indexOf(byCost[0]) + 1} by Cash Ratio`);
    assert.ok(byCost.indexOf(byRatio[0]) < half, `horizon ${horizon}: ${byRatio[0]} is best by Cash Ratio but ranks ${byCost.indexOf(byRatio[0]) + 1} by cost`);
  }
});

test('resale value follows the price curve, not a straight line to zero', () => {
  const ctx = setup({});
  const riviera = ctx.computeRow('rivieraResort', { ...INPUTS, desiredVacationYears: 20 });
  // 44 years left today, 24 at exit: well above the straight line's ~$67.
  assert.ok(riviera.residualPerPoint > 100, `Riviera after 20 years: $${riviera.residualPerPoint.toFixed(0)}/pt`);
  assert.equal(ctx.resaleValueFraction(0), 0);
  assert.ok(ctx.resaleValueFraction(16) < ctx.resaleValueFraction(40));
});

test('breakeven respects the plan length and the sell-at-end setting', () => {
  const held = setup({ sellAtEnd: false });
  const sold = setup({ sellAtEnd: true });
  const at = (ctx, years) => ctx.computeRow('saratogaSprings', { ...INPUTS, desiredVacationYears: years });
  assert.equal(at(held, 3).yearsToBreakeven, null, 'a 3-year hold cannot recoup the buy-in');
  const heldLong = at(held, Infinity).yearsToBreakeven, soldLong = at(sold, Infinity).yearsToBreakeven;
  assert.ok(soldLong != null && (heldLong == null || soldLong < heldLong), 'selling at the end breaks even sooner');
});

test('Est. Nightly Cost uses standard rooms, not the first one listed', () => {
  const ctx = setup({});
  const poly = ctx.RESORTS.find(r => r.id === 'polynesianVillas' && r.year === 2026);
  const firstListed = ctx.getRoomTypesForCategory(poly, 'two')[0];
  assert.match(firstListed.name, /Bungalow/);
  const bungalowNight = poly.travelPeriods[0].rates.sunThu[firstListed.id];
  assert.ok(ctx.medianRoomPoints(poly, 'two') < bungalowNight);
});

test('financing adds the loan interest to the buy-in and raises Cost/Pt/Year', () => {
  const ctx = setup({});
  const cash = ctx.computeRow('saratogaSprings', { ...INPUTS, desiredVacationYears: 20 });
  const loan = ctx.computeRow('saratogaSprings', { ...INPUTS, desiredVacationYears: 20, financed: true, downPct: 0.1, apr: 0.12, termYears: 10 });
  assert.equal(cash.financingInterest, 0);
  const borrowed = cash.pricePerPoint * INPUTS.points * 0.9;
  assert.ok(Math.abs(loan.financingInterest - ctx.DVCFinancing.totalInterest(borrowed, 0.12, 120)) < 0.01);
  assert.ok(loan.costPerPointYear > cash.costPerPointYear);
  assert.ok(loan.lifetimeOutlay - cash.lifetimeOutlay > loan.financingInterest - 1);
});
