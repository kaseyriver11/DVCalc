// Share links (dvc-share.js + dvc-compare-handoff.js applyShared()): a stay,
// itinerary or Suggest a Stay search round-trips through a URL, carries
// nothing private, and a bad link never half-applies.
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../dvc-share.js');
const H = require('../dvc-compare-handoff.js');

const RESORTS = [
  { id: 'riviera', year: 2026, roomTypes: [{ id: 'deluxeStudio' }] },
  { id: 'saratogaSprings', year: 2026, roomTypes: [{ id: 'deluxeStudio' }] },
];
const STAYS = [
  { resortId: 'riviera', roomTypeId: 'deluxeStudio', checkIn: '2026-10-01', checkOut: '2026-10-03' },
  { resortId: 'saratogaSprings', roomTypeId: 'deluxeStudio', checkIn: '2026-10-03', checkOut: '2026-10-06' },
];
const back = url => new URL(url).searchParams;

test('a split stay round-trips through the link, in order', () => {
  const url = S.link('index.html', S.stayParams(STAYS), 'https://dvccompanion.com/itineraries.html?x=1');
  assert.equal(url, 'https://dvccompanion.com/index.html?s=riviera%7EdeluxeStudio%7E2026-10-01%7E2026-10-03&s=saratogaSprings%7EdeluxeStudio%7E2026-10-03%7E2026-10-06');
  assert.deepEqual(S.readStays(back(url)), STAYS);
  assert.equal(S.readStays(new URLSearchParams('resort=x')), null);
});

test('applyShared: last stay is current, the rest are segments, edit context cleared', () => {
  const original = { year: 2027, month: 0, resortId: 'x', segments: [{}], itineraryEdit: { id: 'i1' }, customCashRate: 300 };
  const { state, error } = H.applyShared(STAYS, original, RESORTS);
  assert.equal(error, undefined);
  assert.equal(state.resortId, 'saratogaSprings');
  assert.equal(state.checkIn, '2026-10-03');
  assert.deepEqual(state.segments, [STAYS[0]]);
  assert.equal(state.year, 2026);
  assert.equal(state.month, 9);
  assert.equal(state.itineraryEdit, null);
  assert.equal(state.customCashRate, null);
});

test('applyShared rejects gaps, unknown rooms, bad dates and empty links', () => {
  const gap = [STAYS[0], { ...STAYS[1], checkIn: '2026-10-04' }];
  assert.ok(H.applyShared(gap, {}, RESORTS).error);
  assert.ok(H.applyShared([{ ...STAYS[0], roomTypeId: 'nope' }], {}, RESORTS).error);
  assert.ok(H.applyShared([{ ...STAYS[0], checkOut: 'soon' }], {}, RESORTS).error);
  assert.ok(H.applyShared([], {}, RESORTS).error);
});

test('a Suggest a Stay search round-trips; scope stays out of the link', () => {
  const wizard = { points: 150, year: 2027, months: [3, 9], category: 'one', partySize: 5, minNights: 4, maxNights: 7, scope: 'access' };
  const params = S.suggestParams(wizard, { key: 'nights', dir: 'desc' });
  assert.ok(!params.has('scope'));
  const read = S.readSuggest(params);
  const { scope, ...rest } = wizard;
  assert.deepEqual(read.wizardData, rest);
  assert.deepEqual(read.sort, { key: 'nights', dir: 'desc' });
});

test('Suggest links: no max means no limit, defaults stay defaults, junk is dropped', () => {
  const noMax = S.readSuggest(S.suggestParams({ points: 90, months: [], category: 'any', minNights: 1, maxNights: null }));
  assert.equal(noMax.wizardData.maxNights, null);
  assert.ok(!('category' in noMax.wizardData) && !('partySize' in noMax.wizardData));
  assert.equal(S.readSuggest(new URLSearchParams('year=2027')), null);
  const junk = S.readSuggest(new URLSearchParams('points=100&months=3,x,40,3&min=abc&max=2&party=-1'));
  assert.deepEqual(junk.wizardData, { points: 100, months: [3], maxNights: 2 });
});
