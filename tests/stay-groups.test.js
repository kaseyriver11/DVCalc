// Bookings & Stays grouping and Membership Value's two-stay preview.
const test = require('node:test');
const assert = require('node:assert/strict');
const { groupStays, stayPreview, phase } = require('../js/dvc-stay-groups.js');

const today = '2026-09-23';
const stay = (id, check_in, check_out, extra = {}) => ({ id, check_in, check_out, ...extra });
const needsReview = t => !!t.review;

test('date boundaries: check-in today is in progress, checkout today is completed', () => {
  assert.equal(phase(stay('a', '2026-09-24', '2026-09-27'), today), 'upcoming');
  assert.equal(phase(stay('b', '2026-09-23', '2026-09-27'), today), 'in-progress'); // checks in today
  assert.equal(phase(stay('c', '2026-09-20', '2026-09-24'), today), 'in-progress');
  assert.equal(phase(stay('d', '2026-09-20', '2026-09-23'), today), 'completed'); // checks out today
  assert.equal(phase(stay('e', '2026-09-01', '2026-09-05'), today), 'completed');
});

// Ten stays across four years: two upcoming, two in progress, one needing
// review (in an old year).
const trips = [
  stay('u2', '2027-03-01', '2027-03-05'),
  stay('c26b', '2026-06-01', '2026-06-04'),
  stay('u1', '2026-10-10', '2026-10-14'),
  stay('c24', '2024-12-28', '2025-01-02'),
  stay('c26a', '2026-02-10', '2026-02-12'),
  stay('p2', '2026-09-20', '2026-09-26'),
  stay('r23', '2023-05-01', '2023-05-03', { review: true }),
  stay('p1', '2026-09-23', '2026-09-25'), // checks in today
  stay('c25a', '2025-03-10', '2025-03-15'),
  stay('out', '2026-09-19', '2026-09-23'), // checks out today
];

test('each stay appears exactly once across the groups', () => {
  const g = groupStays(trips, { today, needsReview });
  const all = [...g.needsReview, ...g.inProgress, ...g.upcoming, ...g.completedYears.flatMap(y => y.stays)].map(t => t.id);
  assert.equal(all.length, 10);
  assert.deepEqual([...all].sort(), trips.map(t => t.id).sort());
});

test('in progress is nearest checkout first; upcoming is nearest check-in first', () => {
  const g = groupStays(trips, { today, needsReview });
  assert.deepEqual(g.inProgress.map(t => t.id), ['p1', 'p2']);
  assert.deepEqual(g.upcoming.map(t => t.id), ['u1', 'u2']);
});

test('completed stays group by checkout year, newest year and most recent checkout first', () => {
  const g = groupStays(trips, { today, needsReview });
  assert.deepEqual(g.completedYears.map(y => y.year), [2026, 2025]);
  assert.deepEqual(g.completedYears[0].stays.map(t => t.id), ['out', 'c26b', 'c26a']);
  assert.deepEqual(g.completedYears[1].stays.map(t => t.id), ['c25a', 'c24']); // c24 checks out Jan 2025
});

test('needs review is exclusive and wins over any timing', () => {
  const flagged = trips.map(t => ['p1', 'u1'].includes(t.id) ? { ...t, review: true } : t);
  const g = groupStays(flagged, { today, needsReview });
  assert.deepEqual(g.needsReview.map(t => t.id), ['r23', 'p1', 'u1']);
  assert.ok(!g.inProgress.some(t => t.id === 'p1'));
  assert.ok(!g.upcoming.some(t => t.id === 'u1'));
  assert.ok(!g.completedYears.some(y => y.stays.some(t => t.id === 'r23')));
});

test('preview with a stay in progress: current stay first, then the next upcoming', () => {
  const p = stayPreview(trips, { today, needsReview });
  assert.deepEqual(p.lines.map(l => [l.kind, l.trip.id]), [['in-progress', 'p1'], ['upcoming', 'u1']]);
});

test('preview with a current stay but nothing upcoming falls back to the latest completed', () => {
  const p = stayPreview(trips.filter(t => !t.id.startsWith('u')), { today, needsReview });
  assert.deepEqual(p.lines.map(l => [l.kind, l.trip.id]), [['in-progress', 'p1'], ['completed', 'out']]);
});

test('preview without a current stay keeps the next-upcoming and latest-completed pair', () => {
  const p = stayPreview(trips.filter(t => !t.id.startsWith('p')), { today, needsReview });
  assert.deepEqual(p.lines.map(l => [l.kind, l.trip.id]), [['upcoming', 'u1'], ['completed', 'out']]);
});

test('preview never shows more than two stays, whatever the history length', () => {
  const many = Array.from({ length: 40 }, (_, i) => stay('s' + i, `20${10 + (i % 17)}-0${1 + (i % 9)}-01`, `20${10 + (i % 17)}-0${1 + (i % 9)}-05`));
  assert.ok(stayPreview(many, { today }).lines.length <= 2);
});

test('counts include stays in progress and stays awaiting review', () => {
  const p = stayPreview(trips, { today, needsReview });
  assert.equal(p.inProgressCount, 2);
  assert.equal(p.upcomingCount, 2);
  assert.equal(p.completedCount, 6); // includes r23, which needs review
  assert.equal(p.needsReviewCount, 1);
});

test('when every stay needs review there is nothing to summarize', () => {
  const all = trips.map(t => ({ ...t, review: true }));
  const p = stayPreview(all, { today, needsReview });
  assert.deepEqual(p.lines, []);
  assert.equal(p.needsReviewCount, 10);
  assert.equal(p.inProgressCount + p.upcomingCount + p.completedCount, 10);
});

test('preview with no stays has nothing to show', () => {
  const p = stayPreview([], { today });
  assert.deepEqual(p.lines, []);
  assert.equal(p.inProgressCount + p.upcomingCount + p.completedCount, 0);
});
