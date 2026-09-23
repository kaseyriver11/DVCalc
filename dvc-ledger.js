// ---- Shared DVC points-ledger validation rules ----
// Pure functions only (no DOM/network), same convention as dvc-dates.js --
// loaded via a plain <script> tag before account.html's/app.js's own inline
// scripts, exposing window.DVCLedger. Split out from dvc-dates.js since
// these rules are about the ledger's 4 point buckets (Remaining/Banked/
// Borrowed/Holding), not date math, even though several of them consume
// dvc-dates.js's output.
//
// Also loaded directly by Node for tests/dvc-ledger.test.js (CommonJS
// export guarded below) -- there's no bundler/build step in this repo, so
// the same file has to work unmodified as both a browser <script> and a
// plain Node module.
(function () {
  // DVC's real borrowing rule: a contract can borrow up to 100% of the
  // FOLLOWING use year's points allotment into the current one -- i.e. the
  // only real ceiling is "not more than next year actually has." (A 50%
  // cap existed as a temporary COVID-era restriction from April 2020,
  // lifted July 2020 -- this constant briefly, incorrectly, shipped as
  // 0.5 here on 2026-09-19 before being corrected the same day once that
  // history came up while researching Task 04; confirmed against DVC Fan's
  // and A Timeshare Broker's coverage of the restriction being removed,
  // 2026-09-19 research.) Still worth enforcing even at 100%, since the
  // ledger's Borrowed input otherwise just clamps to >= 0 -- a typo (e.g.
  // an extra digit) can otherwise silently claim more points than the
  // contract will ever actually have next year. This doesn't block a save
  // (DVC Companion has no way to confirm the real number against Disney's
  // system -- see migration 006's comment), it only tells the owner their
  // entry looks wrong.
  const MAX_BORROW_RATIO = 1.0;

  // borrowedAmount: what the owner has entered as borrowed INTO the
  // current year. nextYearPointsPerYear: the contract's annual allotment
  // (the following use year's points, which is what's actually being
  // pulled forward -- an owner planning ahead with a different next-year
  // allotment should pass that, not always points_per_year).
  function validateBorrowedPoints(borrowedAmount, nextYearPointsPerYear) {
    const maxAllowed = Math.floor(nextYearPointsPerYear * MAX_BORROW_RATIO);
    return {
      valid: borrowedAmount <= maxAllowed,
      maxAllowed,
    };
  }

  // Whether a reservation change made this many days before its check-in
  // date sends its points to the Holding account, per Disney's own rule:
  // holding applies for a cancel/modify made 1-30 days before check-in.
  // 31+ days out is a normal cancellation (points return to their original
  // bucket, still usable/bankable within the use year). 0 or negative days
  // (same-day or after check-in) is a no-show/forfeiture case, not
  // holding -- out of scope here since those points aren't recoverable at
  // all, in Holding or otherwise.
  function pointsEnterHolding(daysBeforeCheckIn) {
    return daysBeforeCheckIn >= 1 && daysBeforeCheckIn <= 30;
  }

  const HOLDING_BOOKING_WINDOW_DAYS = 60;
  const MS_PER_DAY = 86400000;

  // Holding expires at the end of the use year, regardless of entry date.
  // The 60-day limit is the advance booking window, not a rebooking clock.
  // Source: https://plandisney.disney.go.com/question/holding-points-work-expire-bank-501019/
  function holdingExpiration(useYearExpiresMs, todayMs) {
    return { ms: useYearExpiresMs, daysUntil: Math.round((useYearExpiresMs - todayMs) / MS_PER_DAY) };
  }

  // Plain-language rule text for a tooltip/help string next to the Holding
  // stepper -- kept here (not duplicated in account.html/app.js) so both
  // callers show identical copy.
  const HOLDING_RULES_TEXT =
    "From a reservation canceled or modified 1-30 days before check-in. Cannot be banked or borrowed. Book DVC Resort stays no more than 60 days before check-in, and use these points before the use year ends.";

  // What canceling a reservation TODAY would do to its points, and until
  // when that stays true. Per Disney's On-Line Booking T&C (effective
  // 2025-06-01): 31+ days out, points return to the use year the stay falls
  // in; 1-30 days out they go to Holding; on check-in day they're forfeited.
  // Only CURRENT-year points come back bankable, and only until that use
  // year's banking deadline -- banked and borrowed points stay where they
  // were moved (both moves are final), confirmed against DVC Fan and
  // planDisney 2026-09-22. All inputs are UTC date-only ms.
  //   kind: "bankable"  -- current pts return and can still be banked
  //         "returns"   -- pts return to the use year but can't be banked
  //         "holding"   -- pts go to Holding
  //         "forfeit"   -- pts are lost
  //   untilMs: last day this outcome holds (null for forfeit)
  //   next: the outcome after untilMs
  function cancellationOutcome({ todayMs, checkInMs, bankingDeadlineMs }) {
    const daysOut = Math.round((checkInMs - todayMs) / MS_PER_DAY);
    if (daysOut <= 0) return { kind: "forfeit", untilMs: null, next: null };
    if (pointsEnterHolding(daysOut)) return { kind: "holding", untilMs: checkInMs - MS_PER_DAY, next: "forfeit" };
    const lastNormalCancelMs = checkInMs - 31 * MS_PER_DAY;
    if (todayMs <= bankingDeadlineMs) {
      return bankingDeadlineMs < lastNormalCancelMs
        ? { kind: "bankable", untilMs: bankingDeadlineMs, next: "returns" }
        : { kind: "bankable", untilMs: lastNormalCancelMs, next: "holding" };
    }
    return { kind: "returns", untilMs: lastNormalCancelMs, next: "holding" };
  }

  // Whether to suggest banking now instead of booking, for a stay that
  // falls after its use year's banking deadline. Once booked, "bank then
  // borrow" gives no protection -- canceled borrowed points return to the
  // stay's use year, unbankable, same as current ones -- so the advice only
  // holds while the owner is still deciding: banking before the deadline
  // keeps the points safe if the trip doesn't happen, and borrowing from
  // next year (no deadline) can still fund it if it does.
  function shouldSuggestBankFirst({ todayMs, checkInMs, bankingDeadlineMs, currentPoints }) {
    return currentPoints > 0 && todayMs <= bankingDeadlineMs && checkInMs > bankingDeadlineMs;
  }

  const api = {
    MAX_BORROW_RATIO,
    HOLDING_BOOKING_WINDOW_DAYS,
    validateBorrowedPoints,
    pointsEnterHolding,
    holdingExpiration,
    cancellationOutcome,
    shouldSuggestBankFirst,
    HOLDING_RULES_TEXT,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    window.DVCLedger = api;
  }
})();
