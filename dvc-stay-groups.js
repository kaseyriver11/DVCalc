// How recorded bookings are grouped on Bookings & Stays (bookings.html) and
// previewed on Membership Value (trips.html). Pure: callers pass today's
// date and a needs-review test, so this runs unmodified in the browser
// (window.DVCStayGroups) and under node --test.
(function () {
  // A stay is upcoming until its check-in day has passed -- the same line
  // the stay list has always drawn, so a stay in progress reads as
  // completed. Dates are "YYYY-MM-DD", compared as strings.
  const isUpcoming = (trip, today) => trip.check_in >= today;
  const byCheckInAsc = (a, b) => a.check_in.localeCompare(b.check_in) || a.check_out.localeCompare(b.check_out);
  const byCheckOutDesc = (a, b) => b.check_out.localeCompare(a.check_out) || b.check_in.localeCompare(a.check_in);

  // needsReview: stays whose point sources need correcting. They lead the
  // page in their own group so one can never hide inside a collapsed older
  // year, and appear there only -- never duplicated into Upcoming or a year.
  // upcoming: nearest check-in first. completedYears: grouped by checkout
  // year, newest year first, each year's stays most recent checkout first.
  function groupStays(trips, { today, needsReview = () => false }) {
    const review = [], upcoming = [], years = new Map();
    for (const trip of trips) {
      if (needsReview(trip)) review.push(trip);
      else if (isUpcoming(trip, today)) upcoming.push(trip);
      else {
        const year = Number(trip.check_out.slice(0, 4));
        if (!years.has(year)) years.set(year, []);
        years.get(year).push(trip);
      }
    }
    return {
      needsReview: review.sort(byCheckInAsc),
      upcoming: upcoming.sort(byCheckInAsc),
      completedYears: [...years.entries()].sort((a, b) => b[0] - a[0]).map(([year, stays]) => ({ year, stays: stays.sort(byCheckOutDesc) })),
    };
  }

  // Membership Value's small preview: at most the next upcoming booking and
  // the most recently completed stay, plus counts by timing. Counts include
  // stays awaiting review (they're still upcoming or completed); the two
  // summaries skip them, since those are shown with their warning instead.
  function stayPreview(trips, { today, needsReview = () => false }) {
    const groups = groupStays(trips, { today, needsReview });
    return {
      nextUpcoming: groups.upcoming[0] || null,
      lastCompleted: groups.completedYears[0]?.stays[0] || null,
      upcomingCount: trips.filter(t => isUpcoming(t, today)).length,
      completedCount: trips.filter(t => !isUpcoming(t, today)).length,
      needsReviewCount: groups.needsReview.length,
    };
  }

  const api = { groupStays, stayPreview, isUpcoming };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCStayGroups = api;
})();
