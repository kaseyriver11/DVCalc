// Booking-record helpers for Bookings & Stays (Prompt 5). Pure --
// window.DVCBookingRecords in the browser, require()-able for node --test.
// DVC Companion never cancels or changes anything with Disney; these only
// describe what the owner recorded.
(function () {
  const DAY = 86400000;
  const parse = s => Date.parse(s + "T00:00:00Z");
  const iso = ms => new Date(ms).toISOString().slice(0, 10);

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

  const api = { cancellationDates, cancellationOutcome };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCBookingRecords = api;
})();
