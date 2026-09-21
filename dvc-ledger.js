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

  const HOLDING_REBOOK_DAYS = 60;
  const MS_PER_DAY = 86400000;

  // The real deadline by which a use-year row's Holding balance must be
  // rebooked: enteredDateMs (when the points entered holding) + 60 days,
  // capped at the use year's own expiration -- holding doesn't grant an
  // extension past the normal use-year boundary, it only ever shortens the
  // effective deadline. All three args are UTC-midnight ms (dvc-dates.js's
  // dateOnlyUTC() convention) -- kept as plain numbers rather than importing
  // dvc-dates.js so this file has no dependency and stays trivially
  // Node-testable. Returns null if enteredDateMs is unknown (a pre-existing
  // row, or points_holding is 0) -- there's nothing to compute a deadline
  // from.
  function holdingRebookDeadline(enteredDateMs, useYearExpiresMs, todayMs) {
    if (enteredDateMs == null) return null;
    const sixtyDayMs = enteredDateMs + HOLDING_REBOOK_DAYS * MS_PER_DAY;
    const deadlineMs = Math.min(sixtyDayMs, useYearExpiresMs);
    return { ms: deadlineMs, daysUntil: Math.round((deadlineMs - todayMs) / MS_PER_DAY) };
  }

  // Plain-language rule text for a tooltip/help string next to the Holding
  // stepper -- kept here (not duplicated in account.html/app.js) so both
  // callers show identical copy.
  const HOLDING_RULES_TEXT =
    "From a reservation canceled or modified 1-30 days before check-in. Can't be banked or borrowed, and must be rebooked within 60 days of entering holding.";

  const api = {
    MAX_BORROW_RATIO,
    HOLDING_REBOOK_DAYS,
    validateBorrowedPoints,
    pointsEnterHolding,
    holdingRebookDeadline,
    HOLDING_RULES_TEXT,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    window.DVCLedger = api;
  }
})();
