// Owner-entered waitlist requests and booking-record helpers for Bookings &
// Stays (Prompt 5). Pure -- window.DVCWaitlists in the browser,
// require()-able for node --test. DVC Companion never submits, watches or
// cancels anything with Disney: a waitlist here is the owner's own note of a
// request they made, and it never takes points or counts toward Membership
// Value until the owner records the confirmed booking.
(function () {
  const DAY = 86400000;
  const parse = s => Date.parse(s + "T00:00:00Z");
  const iso = ms => new Date(ms).toISOString().slice(0, 10);
  const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || "") && iso(parse(s)) === s;
  const STATUS = { pending: "Pending", fulfilled: "Disney confirmed", canceled: "Canceled" };
  const REMINDER_CHOICES = [null, 7, 14, 30];

  // An add or edit. isNew: only a new request must be for a future stay.
  function validate(w, { today, isNew }) {
    if (!w.resort_id || !w.room_type_id) return "Choose the resort and room you asked Disney for.";
    if (!isDate(w.check_in) || !isDate(w.check_out)) return "Enter the check-in and check-out dates you requested.";
    if (w.check_out <= w.check_in) return "Check-out must be after check-in.";
    if ((parse(w.check_out) - parse(w.check_in)) / DAY > 30) return "That's more than 30 nights -- double-check the dates.";
    if (isNew && w.check_in <= today) return "Check-in must be after today.";
    if (!isDate(w.requested_on) || w.requested_on > today) return "Enter the date you asked Disney for this (today or earlier).";
    if (w.notes && w.notes.length > 500) return "Keep notes under 500 characters.";
    if (w.remind_days_before != null && !(Number.isInteger(w.remind_days_before) && w.remind_days_before >= 1 && w.remind_days_before <= 120)) return "Choose a reminder from 1 to 120 days before check-in.";
    return null;
  }

  // Pending first by check-in; closed (fulfilled/canceled) newest first.
  function partition(list) {
    const pending = list.filter(w => w.status === "pending").sort((a, b) => a.check_in.localeCompare(b.check_in));
    const closed = list.filter(w => w.status !== "pending").sort((a, b) => String(b.updated_at || b.created_at).localeCompare(String(a.updated_at || a.created_at)));
    return { pending, closed };
  }

  // When a pending request's owner-set review reminder applies.
  function review(w, today) {
    const daysToCheckIn = Math.round((parse(w.check_in) - parse(today)) / DAY);
    const reviewOn = w.remind_days_before ? iso(parse(w.check_in) - w.remind_days_before * DAY) : null;
    return { daysToCheckIn, reviewOn, due: w.status === "pending" && !!reviewOn && today >= reviewOn && daysToCheckIn >= 0, passed: daysToCheckIn < 0 };
  }

  // Record a Booking prefill for "Disney confirmed this": only what was
  // requested. The owner confirms Disney's actual dates, points and sources.
  function bookingDraft(w) {
    return { resort_id: w.resort_id, room_type_id: w.room_type_id, check_in: w.check_in, check_out: w.check_out, notes: w.notes || "" };
  }

  // Disney's cancellation thresholds for a confirmed booking (same rule as
  // dvc-trip-deduct.js cancellationEffect: 31+ days out restores points,
  // 1-30 days out sends them to Holding, check-in day forfeits them).
  function cancellationDates(checkIn) {
    return { restoreThrough: iso(parse(checkIn) - 31 * DAY), holdingFrom: iso(parse(checkIn) - 30 * DAY), holdingThrough: iso(parse(checkIn) - DAY) };
  }

  // How a recorded Disney cancellation left the points, as short lines.
  // nameFor(contractId) -> display name.
  function cancellationOutcome(c, nameFor) {
    if (c.outcome === "none") return ["This booking hadn't taken points out of balances in the app, so none changed."];
    return (c.points || []).map(p => {
      const where = `${nameFor(p.contract_id)} ${p.use_year_label}`;
      if (p.mode === "forfeit") return `${p.points} pts from ${where} weren't returned (canceled on or after check-in day).`;
      if (!p.restored) return `${p.points} pts from ${where} couldn't go back: that use year's balance no longer existed.`;
      return p.mode === "holding" ? `${p.points} pts from ${where} went to Holding.` : `${p.points} pts went back to ${where}.`;
    });
  }

  const api = { STATUS, REMINDER_CHOICES, validate, partition, review, bookingDraft, cancellationDates, cancellationOutcome };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCWaitlists = api;
})();
