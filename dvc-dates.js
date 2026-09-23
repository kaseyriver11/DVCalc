// ---- Shared DVC use-year / banking-deadline math ----
// Single source of truth for account.html and app.js, which previously kept
// two independent copies of this logic that had quietly drifted apart:
// account.html pinned "today" to Eastern time (via todayInEastern()) while
// app.js's copy used the browser's local time (`new Date()`), so a visitor
// west of Eastern could see the calendar's Booking-As eligibility disagree
// with My Contracts' own deadline right around a use-year boundary. This
// file is loaded via a plain <script> tag (not a module) before each page's
// own inline script, same convention as auth.js's window.DVCAuth.
//
// Wrapped in an IIFE so this file only exposes window.DVCDates -- bare
// top-level function declarations here would leak same-named globals that
// collide with account.html's `const { currentUYYear, ... } = window.DVCDates`
// destructuring (mixing a function declaration and a const for one name in
// the same non-module script scope is a SyntaxError, not a silent shadow).
(function () {
  // 1-indexed deposit month for each use year (Jan=1). DVC labels a use
  // year's points by the calendar year they DEPOSIT in, not the year they
  // expire in -- confirmed against an official planDisney Q&A and multiple
  // DVC community sources (2026-09-11 research): a Dec-UY member's "2026
  // points" deposit Dec 1, 2026 and run through Nov 30, 2027, NOT the cycle
  // already underway in Sept 2026 (which is "2025 points", deposited Dec 1,
  // 2025).
  const USE_YEAR_START_MONTH = { Feb: 2, Mar: 3, Apr: 4, Jun: 6, Aug: 8, Sep: 9, Oct: 10, Dec: 12 };

  // Banking/borrowing deadline: always 8 months after the use year's start
  // month, same calendar date every year regardless of which specific
  // 12-month cycle you're in. {month, day} below is 1-indexed and is the
  // deadline itself -- not the use-year start -- so "next deadline" is just
  // "the next time this month/day occurs on or after today," which handles
  // both same-year deadlines (Feb, Mar, Apr) and next-year ones (Jun, Aug,
  // Sep, Oct, Dec) with one rule instead of hardcoding which roll over.
  // Mirrors the Edge Function's copy of this table exactly -- see
  // supabase/functions/send-banking-reminders/index.ts.
  const DEADLINE_BY_USE_YEAR = {
    Feb: { month: 9, day: 30 },  // Sep 30
    Mar: { month: 10, day: 31 }, // Oct 31
    Apr: { month: 11, day: 30 }, // Nov 30
    Jun: { month: 1, day: 31 },  // Jan 31
    Aug: { month: 3, day: 31 },  // Mar 31
    Sep: { month: 4, day: 30 },  // Apr 30
    Oct: { month: 5, day: 31 },  // May 31
    Dec: { month: 7, day: 31 },  // Jul 31
  };

  // "Today" as a calendar date in Eastern time, independent of the visitor's
  // own timezone -- otherwise someone browsing from a timezone hours
  // ahead/behind ET could see a deadline flip a day early or late right
  // around midnight ET.
  function todayInEastern() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date());
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return { year: Number(map.year), month: Number(map.month), day: Number(map.day) };
  }

  function dateOnlyUTC(year, month, day) {
    return Date.UTC(year, month - 1, day);
  }

  // The calendar year label of the use-year cycle active right now -- the
  // most recent deposit that's already happened. If this year's deposit
  // month hasn't arrived yet, the active cycle is still last year's.
  function currentUYYear(useYear, today) {
    const startMonth = USE_YEAR_START_MONTH[useYear];
    return today.month >= startMonth ? today.year : today.year - 1;
  }

  function nextDeadlineForUseYear(useYear, today) {
    const { month, day } = DEADLINE_BY_USE_YEAR[useYear];
    const todayMs = dateOnlyUTC(today.year, today.month, today.day);
    let candidateMs = dateOnlyUTC(today.year, month, day);
    if (candidateMs < todayMs) candidateMs = dateOnlyUTC(today.year + 1, month, day);
    return { ms: candidateMs, daysUntil: Math.round((candidateMs - todayMs) / 86400000) };
  }

  // The deadline date for one SPECIFIC use-year cycle (e.g. "the 2025 Dec-UY
  // cycle's own deadline"), as opposed to nextDeadlineForUseYear()'s "next
  // calendar occurrence of this deadline pattern from today," which can
  // silently belong to a LATER cycle than the one you're actually asking
  // about once the current cycle's own deadline has already passed. Needed
  // to tell whether a given cycle's banking window is still open.
  function deadlineForCycle(useYear, uyYear) {
    const startMonth = USE_YEAR_START_MONTH[useYear];
    const { month, day } = DEADLINE_BY_USE_YEAR[useYear];
    // The deadline lands within the cycle's own deposit calendar year when
    // its month falls later in the year than the deposit month; otherwise
    // it spills into the following calendar year (e.g. Dec-UY deposits in
    // December but its deadline is the following July).
    const year = month > startMonth ? uyYear : uyYear + 1;
    return dateOnlyUTC(year, month, day);
  }

  function isBankingWindowOpen(useYear, uyYear, today) {
    const todayMs = dateOnlyUTC(today.year, today.month, today.day);
    return todayMs <= deadlineForCycle(useYear, uyYear);
  }

  // timeZone: "UTC" is required, not cosmetic -- ms is always a UTC-midnight
  // marker for a plain calendar date (built via dateOnlyUTC()), with no real
  // time-of-day meaning. Without pinning the format to UTC, toLocaleDateString
  // re-renders it in the *viewer's* local timezone, which silently shows one
  // day earlier for anyone west of UTC (i.e. the entire US).
  function formatDeadlineDate(ms) {
    return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  }

  // The last date a use year's points -- remaining, banked-in, or borrowed-in,
  // all three alike -- are still usable for a stay, regardless of which of
  // those three buckets they're sitting in or where they originally came
  // from. That's the day before the NEXT use year's deposit date, e.g. a
  // Dec-UY row labeled 2025 is usable through Nov 30, 2026.
  function useYearExpiration(useYear, uyLabel) {
    return dateOnlyUTC(uyLabel + 1, USE_YEAR_START_MONTH[useYear], 0);
  }

  // Single urgency scale for every deadline/expiration countdown in the
  // app (2026-09-20) -- previously account.html (14/30-day thresholds)
  // and home.html (45/60-day thresholds, with its own different meaning
  // per status kind) each had their own independently-tuned scale, which
  // could disagree about the same contract at the same moment. Names
  // match account.html's existing CSS classes (.deadline-countdown.calm/
  // .warning/.danger, .notification-item.calm/.warning/.danger).
  function urgencyTier(daysUntil) {
    return daysUntil <= 30 ? "danger" : daysUntil <= 60 ? "warning" : "calm";
  }

  // Points whose banking window already closed can only be used or lost, so
  // that state is never "calm" no matter how much runway is left -- a green
  // banner next to "or they're forfeited" read as a contradiction.
  function expirationTier(daysUntil) {
    const tier = urgencyTier(daysUntil);
    return tier === "calm" ? "warning" : tier;
  }

  // Countdown copy shared by every deadline/expiration display: "Ends
  // today" at zero, a friendly "X months, Y days remaining" once there's
  // more than 60 days of runway (the calm tier -- months are approximated
  // as 30-day blocks since this is countdown copy, not a scheduling
  // calculation, so calendar-exact month boundaries aren't worth the
  // complexity), and the existing terse "(Nd)" suffix otherwise.
  function formatDeadlineWithCountdown(ms, daysUntil) {
    const dateStr = formatDeadlineDate(ms);
    if (daysUntil === 0) return `${dateStr} — Ends today`;
    if (daysUntil > 60) {
      const months = Math.floor(daysUntil / 30);
      const days = daysUntil % 30;
      const parts = [];
      if (months > 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);
      if (days > 0 || months === 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
      return `${dateStr} (${parts.join(", ")} remaining)`;
    }
    return `${dateStr} (${daysUntil}d)`;
  }

  // ---- Booking-window math ----

  // The calendar date exactly `months` months out from `from` (a
  // {year, month, day} with a 1-indexed month; defaults to today in
  // Eastern), as "YYYY-MM-DD". Deliberately uses Date.setMonth's ROLLOVER
  // semantics rather than clamping a short target month (Mar 31 + 11
  // months lands on Mar 3, not Feb 28) -- app.js's monthsFromTodayCutoff()
  // and monthsBeforeCheckIn() already behave that way, and one lone
  // clamping helper would put two different "11 months from now" dates in
  // the same app.
  function monthsFromDate(months, from) {
    const base = from || todayInEastern();
    const dt = new Date(base.year, base.month - 1, base.day);
    dt.setMonth(dt.getMonth() + months);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // True when `checkIn` (YYYY-MM-DD) sits in the FINAL month of a booking
  // window's lead time -- more than months-1 but no more than `months`
  // away. At months = 11 that reads "this stay's 11-month home resort
  // window either just opened or is opening about now," which is what the
  // 11-Month Sniper badge rewards.
  //
  // Inclusive at the far edge (exactly `months` out is the day the window
  // opens, the sniper moment itself) and exclusive at the near edge, so
  // adjacent windows can never both claim the same date.
  function isInFinalWindowMonth(checkIn, months, from) {
    if (!checkIn || !months) return false;
    return checkIn > monthsFromDate(months - 1, from) && checkIn <= monthsFromDate(months, from);
  }

  window.DVCDates = {
    USE_YEAR_START_MONTH,
    DEADLINE_BY_USE_YEAR,
    todayInEastern,
    dateOnlyUTC,
    currentUYYear,
    nextDeadlineForUseYear,
    deadlineForCycle,
    isBankingWindowOpen,
    formatDeadlineDate,
    useYearExpiration,
    urgencyTier,
    expirationTier,
    formatDeadlineWithCountdown,
    monthsFromDate,
    isInFinalWindowMonth,
  };
})();
