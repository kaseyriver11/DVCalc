// Bookings & Stays grouping and Membership Value's two-stay preview.
const test = require('node:test');
const assert = require('node:assert/strict');
const { groupStays, stayPreview } = require('../dvc-stay-groups.js');

const today = '2026-09-23';
const stay = (id, check_in, check_out, extra = {}) => ({ id, check_in, check_out, ...extra });
// Ten stays across four years: two upcoming, one needing review (in an old year).
const trips = [
  stay('u2', '2027-03-01', '2027-03-05'),
  stay('c26b', '2026-06-01', '2026-06-04'),
  stay('u1', '2026-10-10', '2026-10-14'),
  stay('c24', '2024-12-28', '2025-01-02'),
  stay('c26a', '2026-02-10', '2026-02-12'),
  stay('c25b', '2025-11-01', '2025-11-05'),
  stay('r23', '2023-05-01', '2023-05-03', { review: true }),
  stay('c25a', '2025-03-10', '2025-03-15'),
  stay('c23', '2023-08-01', '2023-08-06'),
  stay('now', '2026-09-20', '2026-09-25'), // in progress: already checked in
];
const needsReview = t => !!t.review;

test('each stay appears exactly once across the groups', () => {
  const g = groupStays(trips, { today, needsReview });
  const all = [...g.needsReview, ...g.upcoming, ...g.completedYears.flatMap(y => y.stays)].map(t => t.id);
  assert.equal(all.length, 10);
  assert.deepEqual([...all].sort(), trips.map(t => t.id).sort());
});

test('upcoming is nearest check-in first; a stay already checked in is completed', () => {
  const g = groupStays(trips, { today, needsReview });
  assert.deepEqual(g.upcoming.map(t => t.id), ['u1', 'u2']);
});

test('completed stays group by checkout year, newest year and most recent checkout first', () => {
  const g = groupStays(trips, { today, needsReview });
  assert.deepEqual(g.completedYears.map(y => y.year), [2026, 2025, 2023]);
  assert.deepEqual(g.completedYears[0].stays.map(t => t.id), ['now', 'c26b', 'c26a']);
  assert.deepEqual(g.completedYears[1].stays.map(t => t.id), ['c25b', 'c25a', 'c24']); // c24 checks out Jan 2025
  assert.deepEqual(g.completedYears[2].stays.map(t => t.id), ['c23']);
});

test('a stay needing review leads in its own group, even from an old year', () => {
  const g = groupStays(trips, { today, needsReview });
  assert.deepEqual(g.needsReview.map(t => t.id), ['r23']);
  assert.ok(!g.completedYears.some(y => y.stays.some(t => t.id === 'r23')));
});

test('preview shows at most the next upcoming and the last completed stay', () => {
  const p = stayPreview(trips, { today, needsReview });
  assert.equal(p.nextUpcoming.id, 'u1');
  assert.equal(p.lastCompleted.id, 'now');
  assert.equal(p.upcomingCount, 2);
  assert.equal(p.completedCount, 8);
  assert.equal(p.needsReviewCount, 1);
});

test('preview with no stays has nothing to show', () => {
  const p = stayPreview([], { today });
  assert.equal(p.nextUpcoming, null);
  assert.equal(p.lastCompleted, null);
  assert.equal(p.upcomingCount + p.completedCount, 0);
});
