// Stays that points about to expire can still book. Pure: the caller
// supplies the resort list, a per-night price lookup, and (optionally) a
// per-night availability lookup, so this runs unmodified in the browser
// (window.DVCLeftoverPoints) and under node --test.
(function () {
  const DAY = 86400000;
  const iso = ms => new Date(ms).toISOString().slice(0, 10);
  const parse = s => Date.parse(s + "T00:00:00Z");

  // Same "Good" bar as the calendar's Booking Outlook (app.js
  // availabilityLabel): the typical opening at this lead time lasts at
  // least 75% of the stay. Expiring points always mean short notice, when
  // most resorts are sold out -- suggesting a stay that usually can't be
  // booked would be worse than suggesting nothing.
  const MIN_ODDS_RATIO = 0.75;

  // Nearest DVC Field Guide booking window to a check-in `daysOut` days
  // away, ties toward the nearer window since it quotes the worse odds
  // (same rule as app.js currentBookingWindowKey / compare.html).
  function bookingWindowKey(daysOut) {
    const monthsOut = daysOut / 30.44;
    let nearest = null;
    for (const months of [11, 7, 5, 3, 1]) {
      if (nearest == null || Math.abs(months - monthsOut) <= Math.abs(nearest - monthsOut)) nearest = months;
    }
    return nearest + "Mo";
  }

  // points: what's left to spend. fromDate/lastNightDate: "YYYY-MM-DD"
  // bounds on the nights themselves (the use year's last day is the last
  // night these points can cover). resorts: [{ resortId, maxCheckIn,
  // roomTypeIds }] where maxCheckIn is that resort's own booking-window
  // limit. pointsFor(resortId, roomTypeId, dateStr) -> number | null.
  // availabilityFor(resortId, roomTypeId, nightStr, checkInStr) -> average
  // days available out of 7 at the window that check-in would be booked
  // in, or null when unknown. With it, a stay only qualifies when its
  // worst night clears MIN_ODDS_RATIO (unknown never qualifies), and
  // results rank most-likely-available first; without it, longest first.
  function findStays({ points, fromDate, lastNightDate, resorts, pointsFor, availabilityFor = null, maxNights = 14, limit = 3 }) {
    if (!(points > 0)) return [];
    const from = parse(fromDate), last = parse(lastNightDate);
    // Chance of actually getting the room beats stay length: within a
    // resort, an Excellent-odds stay wins over a longer Good-odds one, then
    // longer, then better raw odds. Across resorts, Walt Disney World comes
    // first (an off-site resort is rarely a realistic short-notice trip for
    // an Orlando-focused owner, even when it has the best odds), then odds.
    // Without availability data, every stay ties on odds and longest wins.
    const tier = s => availabilityFor && s.availability / s.nights >= 1 ? 1 : 0;
    const better = (a, b) => tier(a) - tier(b) || a.nights - b.nights || (a.availability ?? 0) - (b.availability ?? 0) || a.pointsUsed - b.pointsUsed;
    const isWdw = s => NON_WDW.has(s.resortId) ? 0 : 1;
    const rank = (a, b) => isWdw(a) - isWdw(b) || tier(a) - tier(b) || (availabilityFor ? a.availability - b.availability : 0) || better(a, b);
    const best = [];
    for (const resort of resorts) {
      const lastCheckIn = Math.min(last, parse(resort.maxCheckIn));
      let top = null;
      for (const roomTypeId of resort.roomTypeIds) {
        for (let start = from; start <= lastCheckIn; start += DAY) {
          const checkIn = iso(start);
          let nights = 0, total = 0, minScore = Infinity;
          for (let night = start; night <= last && nights < maxNights; night += DAY) {
            const nightStr = iso(night);
            const cost = pointsFor(resort.resortId, roomTypeId, nightStr);
            if (cost == null || total + cost > points) break;
            let score = null;
            if (availabilityFor) {
              score = availabilityFor(resort.resortId, roomTypeId, nightStr, checkIn);
              if (score == null || Math.min(minScore, score) < MIN_ODDS_RATIO * (nights + 1)) break;
              minScore = Math.min(minScore, score);
            }
            total += cost;
            nights++;
          }
          if (nights === 0) continue;
          const candidate = { resortId: resort.resortId, roomTypeId, checkIn, checkOut: iso(start + nights * DAY), nights, pointsUsed: total };
          if (availabilityFor) candidate.availability = minScore;
          if (!top || better(candidate, top) > 0) top = candidate;
        }
      }
      if (top) best.push(top);
    }
    return best.sort((a, b) => rank(b, a)).slice(0, limit);
  }

  // AVAILABILITY_DATA (data/availability_data.js) lookup for one night.
  // The date -> key-dates-period mapping is copied from app.js's
  // getKeyDatesPeriod(); keep the two in step.
  const NON_WDW = new Set(["aulani", "hiltonHead", "veroBeach", "disneylandHotel", "grandCalifornian"]);
  function keyDatesPeriod(dateStr, resortId) {
    const month = Number(dateStr.slice(5, 7)) - 1, day = Number(dateStr.slice(8, 10));
    if ((month === 11 && day >= 25) || (month === 0 && day <= 5)) return "newYears";
    if (NON_WDW.has(resortId)) {
      if (month <= 1) return "presidents";
      if (month <= 3) return "easter";
      if (month <= 7) return "summer";
      if (month <= 10) return "thanksgiving";
      return "christmas";
    }
    if (month === 0) return "marathon";
    if (month === 1) return "presidents";
    if (month <= 3) return "easter";
    if (month <= 7) return "summer";
    if (month <= 9) return "foodAndWine";
    if (month === 10) return "thanksgiving";
    return "christmas";
  }
  function availabilityScore(data, resortId, roomTypeId, nightStr, windowKey) {
    return data?.[resortId]?.[roomTypeId]?.[keyDatesPeriod(nightStr, resortId)]?.[windowKey] ?? null;
  }

  // Odds wording for a qualifying stay, same thresholds as availabilityLabel.
  function oddsLabel(availability, nights) {
    return availability / nights >= 1 ? "Excellent" : "Good";
  }

  const api = { findStays, bookingWindowKey, keyDatesPeriod, availabilityScore, oddsLabel, MIN_ODDS_RATIO };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCLeftoverPoints = api;
})();
