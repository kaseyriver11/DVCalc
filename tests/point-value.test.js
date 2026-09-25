// One value per point across the app: every page that turns points into a
// dollar estimate renders the shared dvc-point-value.js editor, and every
// default agrees with it.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const PV = require('../dvc-point-value.js');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const PAGES = { 'index.html': 'app.js', 'compare.html': 'compare.html', 'contractvalue.html': 'contractvalue.html', 'trips.html': 'trips.html' };

test('rental is its own $20 kind, separate from the $30 value per point', () => {
  assert.equal(PV.RENTAL_DEFAULT, 20);
  assert.equal(PV.clamp(99, 'rental'), PV.KINDS.rental.MAX);
  assert.equal(PV.clamp('x', 'rental'), 20);
  assert.ok(PV.KINDS.rental.PRESETS.some(p => p.value === 20));
  assert.ok(!PV.PRESETS.some(p => /rental/i.test(p.sub)), 'the value editor offers no rental preset');
});

test('rental prices use the rental kind, never the $30 value', () => {
  for (const f of ['app.js', 'compare.html']) {
    const src = read(f);
    assert.match(src, /rentalRate: window\.DVCPointValue\.RENTAL_DEFAULT/, f);
    assert.match(src, /id: "rental-rate", kind: "rental"/, f);
  }
  const cv = read('contractvalue.html');
  assert.match(cv, /rentalRate: window\.DVCPointValue\.RENTAL_DEFAULT/);
  assert.match(cv, /const rentValueYear = inputs\.rentalRate \* /);
});

test('the shared default is $30 and inside the editor range', () => {
  assert.equal(PV.DEFAULT, 30);
  assert.ok(PV.MIN <= PV.DEFAULT && PV.DEFAULT <= PV.MAX);
  assert.ok(PV.PRESETS.some(p => p.value === PV.DEFAULT));
  assert.equal(PV.clamp(999), PV.MAX);
  assert.equal(PV.clamp('x'), PV.DEFAULT);
});

for (const [page, script] of Object.entries(PAGES)) {
  test(`${page} loads and renders the shared $/pt editor`, () => {
    assert.match(read(page), /<script src="dvc-point-value\.js"><\/script>/);
    const src = read(script);
    assert.match(src, /window\.DVCPointValue\.html\(/);
    assert.match(src, /window\.DVCPointValue\.attach\(/);
  });
}

test('no page keeps its own $/pt default or preset list', () => {
  for (const f of ['app.js', 'compare.html', 'contractvalue.html', 'trips.html', 'data/data.js']) {
    const src = read(f);
    assert.doesNotMatch(src, /DEFAULT_RENTAL_RATE|RENT_POINT_VALUE|POINT_VALUE_PRESETS/, f);
  }
  assert.match(read('contractvalue.html'), /pointValue: window\.DVCPointValue\.DEFAULT/);
});

test('saved-setting defaults match the shared default', () => {
  assert.match(read('auth.js'), new RegExp(`point_value_baseline: ${PV.DEFAULT},`));
  for (const f of ['trips.html', 'bookings.html']) {
    assert.match(read(f), new RegExp(`(let userSettings|const DEFAULT_ASSUMPTIONS) = \\{ point_value_baseline: ${PV.DEFAULT},`), f);
  }
  assert.match(read('db/schema.sql'), new RegExp(`point_value_baseline numeric\\(6,2\\) not null default ${PV.DEFAULT},`));
});
