// ---- Stay value helpers shared by Membership Value (trips.html) and
// Bookings & Stays (bookings.html) ----
// Moved out of trips.html verbatim when booking management got its own page
// (2026-09-23), so both pages price and describe a stay the same way. Plain
// <script> exposing globals, same as the page scripts that call them; home.js
// and badges.html keep their own long-standing copies of some of these.
// Depends on data/data.js (RESORTS, getPointsForDate, getCashRateWithFallback),
// data/cash_value_index.js, data/resort_images.js, and dvc-trip-funding.js.

function resortName(id) {
  const r = RESORTS.find(r => r.id === id);
  return r ? r.name : id;
}

function contractLabel(c) {
  return c.nickname || resortName(c.home_resort_id);
}

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// No real DVC stay comes close to this; it exists purely as a runaway
// guard. Native <input type="date"> fires "change" on every keystroke
// while editing a segment in place, so mid-edit on the year (e.g. typing
// over "2024" one digit at a time) can briefly put check-in and check-out
// thousands of years apart -- without this cap, stayDateRange()'s per-night
// loop would try to build a date list that long and freeze the tab.
const MAX_TRIP_NIGHTS = 90;

function nightsBetween(checkIn, checkOut) {
  const ci = new Date(checkIn + "T12:00:00");
  const co = new Date(checkOut + "T12:00:00");
  const nights = Math.round((co - ci) / 86400000);
  return Number.isFinite(nights) ? nights : 0;
}

// Same shape as compare.html's calcStay() -- kept as its own copy here
// rather than shared, matching how every other self-contained page in this
// app (compare.html, changes.html) already duplicates this instead of
// depending on app.js, which is tightly coupled to the calendar's own DOM.
function calcStay(resort, roomTypeId, stayDates) {
  let totalPoints = 0, totalCash = 0, hasCash = false;
  for (const dateStr of stayDates) {
    const pts = getPointsForDate(resort, dateStr, roomTypeId);
    const cashResult = getCashRateWithFallback(resort, dateStr, roomTypeId);
    if (pts) totalPoints += pts;
    if (cashResult && cashResult.rate) { totalCash += cashResult.rate; hasCash = true; }
  }
  return { totalPoints, totalCash: hasCash ? totalCash : null };
}

function remapDateToYear(dateStr, targetYear) {
  const [, m, d] = dateStr.split("-");
  return `${targetYear}-${m}-${d}`;
}

function stayDateRange(startDateStr, nights) {
  const start = new Date(startDateStr + "T12:00:00");
  const dates = [];
  for (let i = 0; i < nights; i++) {
    const dt = new Date(start);
    dt.setDate(dt.getDate() + i);
    dates.push(formatDate(dt.getFullYear(), dt.getMonth(), dt.getDate()));
  }
  return dates;
}

// Which year's cash rates actually exist for a resort. RESORTS can have a
// later year entry (e.g. 2027) with no cash rates of its own, relying on
// getCashRateWithFallback to borrow the prior year's -- for picking a
// remap target we want the year the rates actually came from, not just
// the newest RESORTS entry, so the label shown to the user (and the cash
// index's anchor year below) is accurate.
function latestCashYear(resortId) {
  const years = [...new Set(RESORTS.filter(r => r.id === resortId).map(r => r.year))].sort((a, b) => b - a);
  for (const y of years) {
    const resort = RESORTS.find(r => r.id === resortId && r.year === y);
    if (resort?.travelPeriods?.some(p => p.cashRates)) return y;
  }
  return years[0] || null;
}

// Estimates what a trip cost, by remapping its original month/day onto the
// most recent year data.js actually has cash rates for, running the normal
// cash-rate lookup, then deflating that today-dollars figure back to the
// trip's own year using data/cash_value_index.js's published WDW price
// trend -- we don't have a historical rack-rate archive for every resort,
// so this doesn't pretend to know what the resort *actually* charged on
// the real historical dates; it's "what a similar stay likely cost that
// year, based on how WDW resort pricing has grown since," which is a more
// honest proxy for an old trip than pricing it at today's rate.
function estimateTripCashValue(resortId, roomTypeId, checkIn, checkOut) {
  const anchorYear = latestCashYear(resortId);
  if (!anchorYear) return null;
  const resort = RESORTS.find(r => r.id === resortId && r.year === anchorYear);
  const roomType = resort?.roomTypes.find(rt => rt.id === roomTypeId);
  if (!resort || !roomType) return null;

  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0 || nights > MAX_TRIP_NIGHTS) return null;

  const stayDates = stayDateRange(remapDateToYear(checkIn, anchorYear), nights);
  const result = calcStay(resort, roomTypeId, stayDates);
  if (result.totalCash == null) return null;

  const tripYear = parseInt(checkIn.slice(0, 4), 10);
  const deflator = getCashValueMultiplier(tripYear) / getCashValueMultiplier(anchorYear);
  const cash = result.totalCash * deflator;

  return { cash, rawCash: result.totalCash, year: tripYear, anchorYear, nights, isDeflated: tripYear !== anchorYear };
}

// Suggests points used for a trip. Unlike cash, we DO have real historical
// points charts (data/data_historical.js covers 2016-2027 per resort), so
// if the trip's actual check-in year has chart data, this uses the real
// dates directly -- no remapping needed, and no estimate caveat applies.
// Only falls back to remapping onto the nearest year with data (same
// technique as estimateTripCashValue) for years outside that range.
function estimateTripPoints(resortId, roomTypeId, checkIn, checkOut) {
  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0 || nights > MAX_TRIP_NIGHTS) return null;

  const years = [...new Set(RESORTS.filter(r => r.id === resortId).map(r => r.year))];
  if (years.length === 0) return null;

  const checkInYear = parseInt(checkIn.slice(0, 4), 10);
  const isExactYear = years.includes(checkInYear);
  let targetYear = checkInYear;
  if (!isExactYear) {
    const sorted = [...years].sort((a, b) => b - a);
    const pastYears = sorted.filter(y => y <= checkInYear);
    targetYear = pastYears.length ? pastYears[0] : sorted[sorted.length - 1];
  }

  const resort = RESORTS.find(r => r.id === resortId && r.year === targetYear);
  const roomType = resort?.roomTypes.find(rt => rt.id === roomTypeId);
  if (!resort || !roomType) return null;

  const stayStart = isExactYear ? checkIn : remapDateToYear(checkIn, targetYear);
  const stayDates = stayDateRange(stayStart, nights);
  const result = calcStay(resort, roomTypeId, stayDates);
  return result.totalPoints > 0 ? { points: result.totalPoints, year: targetYear, isExactYear } : null;
}

function fmt(n) {
  return "$" + Math.round(n).toLocaleString();
}

function tripCashValue(trip, ownedContracts) {
  const est = trip.custom_cash_value != null
    ? { cash: Number(trip.custom_cash_value), isCustom: true }
    : estimateTripCashValue(trip.resort_id, trip.room_type_id, trip.check_in, trip.check_out);
  if (!est) return null;
  const credited = window.DVCTripFunding.credit(trip, est.cash, ownedContracts);
  return credited ? { ...est, ...credited } : null;
}

// "Look 2" card (2026-09-20 app-wide art-card sweep, see CLAUDE.md) --
// shared by trip postcards AND the Cost of Ownership cards below (both are
// dark-on-light content cards, unlike the white-on-dark wallet card,
// "Look 1"): fades the resort's art (data/resort_images.js) in behind a
// plain white wash rather than a resort-hash color. 0.92, not 0.86 --
// bumped after the postcard text was reported hard to read (the postcard's
// own lighter grays, #888/#666, were already low-contrast on solid white,
// so a busier photo underneath made it worse); this is the one shared
// constant, not a trips.html-only tweak, so it's worth syncing to any
// other page using the same recipe (compare.html, contractvalue.html,
// home.js, and whichever session owns itineraries.html's copy) rather
// than drifting again. Empty string (no-op) for a resort with no art yet.
function resortArtCardStyle(resortId) {
  const image = typeof getResortImage === "function" ? getResortImage(resortId) : null;
  if (!image) return "";
  return `background-image: linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url('${image}'); background-size: cover; background-position: center;`;
}

// Same shortening as dvc-dates.js formatDateRange(): "Oct 3–6, 2026",
// "Oct 30 – Nov 2, 2026", "Dec 28, 2026 – Jan 2, 2027" (both years shown
// when they differ -- "Dec 28 – Jan 2, 2027" hid the start year).
function formatTripDateRange(checkIn, checkOut) {
  const [ay, am, ad] = checkIn.split("-").map(Number);
  const [by, bm, bd] = checkOut.split("-").map(Number);
  const mon = (y, m) => new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  if (ay !== by) return `${mon(ay, am)} ${ad}, ${ay} – ${mon(by, bm)} ${bd}, ${by}`;
  if (am === bm) return `${mon(ay, am)} ${ad}–${bd}, ${by}`;
  return `${mon(ay, am)} ${ad} – ${mon(by, bm)} ${bd}, ${by}`;
}

// Today as "YYYY-MM-DD" in the visitor's own calendar.
function localToday() {
  return new Date().toLocaleDateString('en-CA');
}
