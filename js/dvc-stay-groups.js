// How recorded bookings are grouped on Bookings & Stays (bookings.html) and
// previewed on Membership Value (trips.html). Pure: callers pass today's
// date and a needs-review test, so this runs unmodified in the browser
// (window.DVCStayGroups) and under node --test.
(function () {
  // Timing, comparing "YYYY-MM-DD" strings to today:
  //   upcoming     check-in after today
  //   in-progress  checked in on or before today, checks out after today
  //   completed    checkout on or before today
  // So a stay checking in today is in progress, and one checking out today
  // is completed.
  function phase(trip, today) {
    if (trip.check_in > today) return "upcoming";
    if (trip.check_out > today) return "in-progress";
    return "completed";
  }
  const isUpcoming = (trip, today) => phase(trip, today) === "upcoming";
  const byCheckInAsc = (a, b) => a.check_in.localeCompare(b.check_in) || a.check_out.localeCompare(b.check_out);
  const byCheckOutAsc = (a, b) => a.check_out.localeCompare(b.check_out) || a.check_in.localeCompare(b.check_in);
  const byCheckOutDesc = (a, b) => b.check_out.localeCompare(a.check_out) || b.check_in.localeCompare(a.check_in);

  // needsReview: stays whose point sources need correcting. They lead the
  // page in their own group so one can never hide inside a collapsed older
  // year, and appear there only -- whatever their dates.
  // inProgress: nearest checkout first. upcoming: nearest check-in first.
  // completedYears: grouped by checkout year, newest year first, each
  // year's stays most recent checkout first.
  function groupStays(trips, { today, needsReview = () => false }) {
    const review = [], inProgress = [], upcoming = [], years = new Map();
    for (const trip of trips) {
      if (needsReview(trip)) { review.push(trip); continue; }
      const p = phase(trip, today);
      if (p === "upcoming") upcoming.push(trip);
      else if (p === "in-progress") inProgress.push(trip);
      else {
        const year = Number(trip.check_out.slice(0, 4));
        if (!years.has(year)) years.set(year, []);
        years.get(year).push(trip);
      }
    }
    return {
      needsReview: review.sort(byCheckInAsc),
      inProgress: inProgress.sort(byCheckOutAsc),
      upcoming: upcoming.sort(byCheckInAsc),
      completedYears: [...years.entries()].sort((a, b) => b[0] - a[0]).map(([year, stays]) => ({ year, stays: stays.sort(byCheckOutDesc) })),
    };
  }

  // Membership Value's small preview: never more than two stays. With a
  // stay in progress, it leads ("current", nearest checkout), followed by
  // the next upcoming booking or else the latest completed stay; otherwise
  // the next upcoming and the latest completed. Stays awaiting review are
  // left out of the summaries (the page's warning covers them) but still
  // count toward the timing counts.
  function stayPreview(trips, { today, needsReview = () => false }) {
    const groups = groupStays(trips, { today, needsReview });
    const current = groups.inProgress[0] || null;
    const nextUpcoming = groups.upcoming[0] || null;
    const lastCompleted = groups.completedYears[0]?.stays[0] || null;
    const lines = current
      ? [{ kind: "in-progress", trip: current }, nextUpcoming ? { kind: "upcoming", trip: nextUpcoming } : lastCompleted && { kind: "completed", trip: lastCompleted }]
      : [nextUpcoming && { kind: "upcoming", trip: nextUpcoming }, lastCompleted && { kind: "completed", trip: lastCompleted }];
    const count = p => trips.filter(t => phase(t, today) === p).length;
    return {
      lines: lines.filter(Boolean),
      upcomingCount: count("upcoming"),
      inProgressCount: count("in-progress"),
      completedCount: count("completed"),
      needsReviewCount: groups.needsReview.length,
    };
  }

  const api = { groupStays, stayPreview, phase, isUpcoming };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCStayGroups = api;
})();
