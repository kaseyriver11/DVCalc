// ---- State ----
// Sort resorts alphabetically once at startup
RESORTS.sort((a, b) => a.name.localeCompare(b.name));

// Discover available years from the data
const AVAILABLE_YEARS = [...new Set(RESORTS.map(r => r.year))].sort();

function resortsForYear(year) {
  return RESORTS.filter(r => r.year === year);
}

const defaultYear = AVAILABLE_YEARS.includes(new Date().getFullYear())
  ? new Date().getFullYear()
  : AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];
const defaultResorts = resortsForYear(defaultYear);
const defaultResort = defaultResorts.find(r => r.id === "copperCreek") || defaultResorts[0];

const state = {
  resortId: defaultResort.id,
  roomTypeId: defaultResort.roomTypes[0].id,
  year: defaultYear,
  month: new Date().getMonth(), // 0-indexed, defaults to current month
  checkIn: null,  // "YYYY-MM-DD" or null
  checkOut: null,  // "YYYY-MM-DD" or null
  rentalRate: DEFAULT_RENTAL_RATE,
  rentalEnabled: true,
  ownerEnabled: true,
  ownerResortId: "saratogaSprings",
  customCashRate: null, // user-entered nightly cash rate for resorts without data
  segments: [], // completed split-stay segments: [{ resortId, roomTypeId, checkIn, checkOut }]
  bookingWindow: "all", // "all", "7mo", "11mo"
};

// ---- DOM References ----
const resortSearch = document.getElementById("resort-search");
const resortDropdown = document.getElementById("resort-dropdown");
const resortWrapper = document.getElementById("resort-select-wrapper");
const roomSelect = document.getElementById("room-select");
const yearSelect = document.getElementById("year-select");
const monthLabel = document.getElementById("month-label");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");
const calendarGrid = document.getElementById("calendar-grid");
const legendItems = document.getElementById("legend-items");
const selectionHint = document.getElementById("selection-hint");
const summaryContainer = document.getElementById("summary");
const actionButtons = document.getElementById("action-buttons");
const rentalRateSlider = document.getElementById("rental-rate");
const rentalRateValue = document.getElementById("rental-rate-value");
const ownerToggle = document.getElementById("owner-toggle");
const ownershipDetails = document.getElementById("ownership-details");
const ownerResortSelect = document.getElementById("owner-resort");
const ownerDuesInfo = document.getElementById("owner-dues-info");
const rentalToggle = document.getElementById("rental-toggle");
const rentalDetails = document.getElementById("rental-details");
const bookingWindowSelect = document.getElementById("booking-window");

// ---- Helpers ----
function getResort() {
  return RESORTS.find((r) => r.id === state.resortId && r.year === state.year);
}

function formatDate(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatShortDate(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Get all dates between check-in (inclusive) and check-out (exclusive)
function getStayDates() {
  if (!state.checkIn || !state.checkOut) return [];
  const dates = [];
  const current = new Date(state.checkIn + "T12:00:00");
  const end = new Date(state.checkOut + "T12:00:00");
  while (current < end) {
    const y = current.getFullYear();
    const m = current.getMonth();
    const d = current.getDate();
    dates.push(formatDate(y, m, d));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Detect room category from the current room type's name
function getCategoryFromRoomType() {
  const resort = getResort();
  const rt = resort.roomTypes.find(r => r.id === state.roomTypeId);
  return getCategoryFromRoom(rt);
}

function getCategoryFromRoom(rt) {
  if (!rt) return "studio";
  const name = rt.name.toLowerCase();
  if (name.includes("three-bedroom") || name.includes("3-bedroom")) return "three";
  if (name.includes("two-bedroom") || name.includes("2-bedroom")) return "two";
  if (name.includes("one-bedroom") || name.includes("1-bedroom")) return "one";
  return "studio";
}

const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---- Booking Window ----
// Returns the last bookable date (YYYY-MM-DD) for the selected window, or null if "all"
function getBookingWindowCutoff() {
  if (state.bookingWindow === "all") return null;
  const months = state.bookingWindow === "11mo" ? 11 : 7;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setMonth(cutoff.getMonth() + months);
  return formatDate(cutoff.getFullYear(), cutoff.getMonth(), cutoff.getDate());
}

// Returns the date a booking window opens for a given check-in date
function getWindowOpenDate(checkInStr, months) {
  const checkIn = new Date(checkInStr + "T12:00:00");
  const openDate = new Date(checkIn);
  openDate.setMonth(openDate.getMonth() - months);
  return openDate;
}

// Build booking window info for the summary
function buildBookingWindowNote(checkInStr) {
  if (!checkInStr) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const open11 = getWindowOpenDate(checkInStr, 11);
  const open7 = getWindowOpenDate(checkInStr, 7);

  const is11Open = today >= open11;
  const is7Open = today >= open7;

  const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (is7Open) {
    return `<div class="booking-window-note"><span class="bw-open">Bookable now</span> at any DVC resort</div>`;
  } else if (is11Open) {
    return `<div class="booking-window-note"><span class="bw-open">Bookable now</span> at home resort · 7-mo opens ${fmt(open7)}</div>`;
  } else {
    return `<div class="booking-window-note">11-mo opens ${fmt(open11)} · 7-mo opens ${fmt(open7)}</div>`;
  }
}

// ---- Availability Confidence ----
const NON_WDW_RESORT_IDS = new Set(["aulani", "hiltonHead", "veroBeach", "disneylandHotel", "grandCalifornian"]);

function getKeyDatesPeriod(dateStr, resortId) {
  const date = new Date(dateStr + "T12:00:00");
  const month = date.getMonth();
  const day = date.getDate();
  const isNonWDW = NON_WDW_RESORT_IDS.has(resortId);

  // New Year's: Dec 25 - Jan 5
  if ((month === 11 && day >= 25) || (month === 0 && day <= 5)) return "newYears";

  if (isNonWDW) {
    if (month === 0 || month === 1) return "presidents";
    if (month === 2 || month === 3) return "easter";
    if (month >= 4 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "thanksgiving";
    if (month === 11) return "christmas";
  } else {
    if (month === 0) return "marathon";
    if (month === 1) return "presidents";
    if (month === 2 || month === 3) return "easter";
    if (month === 4) return "summer";
    if (month >= 5 && month <= 7) return "summer";
    if (month === 8 || month === 9) return "foodAndWine";
    if (month === 10) return "thanksgiving";
    if (month === 11) return "christmas";
  }
  return "summer";
}

function getAvailabilityScore(resortId, roomTypeId, dateStr, window) {
  if (typeof AVAILABILITY_DATA === "undefined") return null;
  const resortData = AVAILABILITY_DATA[resortId];
  if (!resortData) return null;
  const roomData = resortData[roomTypeId];
  if (!roomData) return null;
  const period = getKeyDatesPeriod(dateStr, resortId);
  const periodData = roomData[period];
  if (!periodData) return null;
  return periodData[window] ?? null;
}

function getStayAvailability(resortId, roomTypeId, dates) {
  if (!dates || dates.length === 0) return null;
  let min11 = 8, min7 = 8;
  let has11 = false, has7 = false;
  for (const dateStr of dates) {
    const s11 = getAvailabilityScore(resortId, roomTypeId, dateStr, "11Mo");
    const s7 = getAvailabilityScore(resortId, roomTypeId, dateStr, "7Mo");
    if (s11 !== null) { min11 = Math.min(min11, s11); has11 = true; }
    if (s7 !== null) { min7 = Math.min(min7, s7); has7 = true; }
  }
  if (!has11 && !has7) return null;
  return {
    score11Mo: has11 ? min11 : null,
    score7Mo: has7 ? min7 : null,
  };
}

function availabilityLabel(score, stayLength) {
  if (score === null) return null;
  if (score <= 0.1) return { text: "Not Likely", cls: "avail-very-low" };

  // Score = average consecutive days available
  // Ratio = how well the typical opening fits your stay
  const ratio = score / stayLength;

  if (ratio >= 1.0) return { text: "Excellent", cls: "avail-excellent" };
  if (ratio >= 0.75) return { text: "Good", cls: "avail-good" };
  if (ratio >= 0.5) return { text: "Fair", cls: "avail-fair" };
  if (ratio >= 0.25) return { text: "Low", cls: "avail-low" };
  return { text: "Not Likely", cls: "avail-very-low" };
}

function buildAvailabilityHTML(resortId, roomTypeId, dates) {
  const avail = getStayAvailability(resortId, roomTypeId, dates);
  if (!avail) return "";
  const stayLength = dates.length;
  const label11 = availabilityLabel(avail.score11Mo, stayLength);
  const label7 = availabilityLabel(avail.score7Mo, stayLength);
  if (!label11 && !label7) return "";

  return `
    <div class="summary-card">
      <div class="availability-outlook">
        <h3>Booking Outlook <span class="avail-stay-length">${dates.length} night${dates.length !== 1 ? "s" : ""}</span></h3>
        ${label11 ? `
        <div class="avail-row">
          <span class="avail-label">11-Month (Home Resort)</span>
          <span class="avail-badge ${label11.cls}">${label11.text}</span>
        </div>` : ""}
        ${label7 ? `
        <div class="avail-row">
          <span class="avail-label">7-Month (Any Resort)</span>
          <span class="avail-badge ${label7.cls}">${label7.text}</span>
        </div>` : ""}
        <div class="avail-note">Based on historical availability from <a href="https://dvcfieldguide.com/availability-tables" target="_blank" rel="noopener">DVC Field Guide</a></div>
      </div>
    </div>
  `;
}

function buildSplitAvailabilityHTML(segments, currentResortId, currentRoomTypeId, currentDates) {
  const allSegs = segments.map(seg => ({
    name: RESORTS.find(r => r.id === seg.resortId && r.year === state.year)?.name || seg.resortId,
    resortId: seg.resortId,
    roomTypeId: seg.roomTypeId,
    dates: getSegmentDates(seg),
  }));
  if (currentDates && currentDates.length > 0) {
    allSegs.push({
      name: RESORTS.find(r => r.id === currentResortId && r.year === state.year)?.name || currentResortId,
      resortId: currentResortId,
      roomTypeId: currentRoomTypeId,
      dates: currentDates,
    });
  }

  let hasAny = false;
  let rows = "";
  for (const seg of allSegs) {
    const avail = getStayAvailability(seg.resortId, seg.roomTypeId, seg.dates);
    if (!avail) continue;
    hasAny = true;
    const len = seg.dates.length;
    const l11 = availabilityLabel(avail.score11Mo, len);
    const l7 = availabilityLabel(avail.score7Mo, len);
    rows += `
      <div class="avail-segment">
        <div class="avail-segment-name">${seg.name} <span class="avail-stay-length">${len}n</span></div>
        <div class="avail-segment-badges">
          ${l11 ? `<span class="avail-badge-mini ${l11.cls}">11Mo ${l11.text}</span>` : ""}
          ${l7 ? `<span class="avail-badge-mini ${l7.cls}">7Mo ${l7.text}</span>` : ""}
        </div>
      </div>
    `;
  }

  if (!hasAny) return "";

  return `
    <div class="summary-card">
      <div class="availability-outlook">
        <h3>Booking Outlook</h3>
        ${rows}
        <div class="avail-note">Based on historical availability from <a href="https://dvcfieldguide.com/availability-tables" target="_blank" rel="noopener">DVC Field Guide</a></div>
      </div>
    </div>
  `;
}

// ---- Split Stay Helpers ----
function getSegmentDates(seg) {
  const dates = [];
  const current = new Date(seg.checkIn + "T12:00:00");
  const end = new Date(seg.checkOut + "T12:00:00");
  while (current < end) {
    dates.push(formatDate(current.getFullYear(), current.getMonth(), current.getDate()));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function getAllPreviousSegmentDates() {
  const dates = new Set();
  for (const seg of state.segments) {
    for (const d of getSegmentDates(seg)) dates.add(d);
  }
  return dates;
}

function calcSegmentTotals(seg) {
  const resort = RESORTS.find(r => r.id === seg.resortId && r.year === state.year);
  const dates = getSegmentDates(seg);
  let totalPoints = 0, totalCash = 0;
  let hasCash = false;
  let isPriorYearCash = false;
  const breakdown = [];
  for (const dateStr of dates) {
    const pts = getPointsForDate(resort, dateStr, seg.roomTypeId);
    const cashResult = getCashRateWithFallback(resort, dateStr, seg.roomTypeId);
    const cashRate = cashResult ? cashResult.rate : null;
    if (cashResult && cashResult.isPriorYear) isPriorYearCash = true;
    const dayOfWeek = new Date(dateStr + "T12:00:00").getDay();
    if (pts) totalPoints += pts;
    if (cashRate) { totalCash += cashRate; hasCash = true; }
    breakdown.push({
      date: dateStr,
      points: pts,
      cashRate,
      dayName: DAY_NAMES_SHORT[dayOfWeek],
    });
  }
  const roomType = resort.roomTypes.find(rt => rt.id === seg.roomTypeId);
  return { resort, roomType, dates, totalPoints, totalCash: hasCash ? totalCash : 0, hasCash, isPriorYearCash, breakdown };
}

function isSplitMode() {
  return state.segments.length > 0;
}

function addSegment() {
  state.segments.push({
    resortId: state.resortId,
    roomTypeId: state.roomTypeId,
    checkIn: state.checkIn,
    checkOut: state.checkOut,
  });
  // Lock next check-in to previous check-out
  state.checkIn = state.checkOut;
  state.checkOut = null;
  state.customCashRate = null;
  updateHint();
  renderCalendar();
  renderSummary();
}

function editSegment(index) {
  // Load the target segment as the active selection
  const seg = state.segments[index];
  state.resortId = seg.resortId;
  state.roomTypeId = seg.roomTypeId;
  state.checkIn = seg.checkIn;
  state.checkOut = seg.checkOut;
  state.customCashRate = null;
  // Remove this segment and everything after it
  state.segments.splice(index);
  // Update UI to reflect the loaded resort/room
  const resort = getResort();
  resortSearch.value = resort.name;
  populateRoomTypes();
  roomSelect.value = state.roomTypeId;
  updateHint();
  renderCalendar();
  renderLegend();
  renderSummary();
}

function removeSegment(index) {
  state.segments.splice(index, 1);
  if (state.segments.length === 0) {
    // No completed segments left — exit split mode, keep current dates as a normal stay
  } else if (!state.checkOut) {
    // Still picking checkout — chain from the new last segment
    const lastSeg = state.segments[state.segments.length - 1];
    state.checkIn = lastSeg.checkOut;
  }
  state.customCashRate = null;
  updateHint();
  renderCalendar();
  renderSummary();
}

function removeCurrentSegment() {
  // Remove the active (last) segment — clear current selection
  state.checkOut = null;
  if (state.segments.length === 0) {
    state.checkIn = null;
  } else {
    // Stay in split mode, re-lock checkIn to last completed segment's checkOut
    state.checkIn = state.segments[state.segments.length - 1].checkOut;
  }
  state.customCashRate = null;
  updateHint();
  renderCalendar();
  renderSummary();
}

function editCurrentSegment() {
  // Clear checkout so user can re-pick dates for the current segment
  state.checkOut = null;
  state.customCashRate = null;
  updateHint();
  renderCalendar();
  renderSummary();
}

// ---- Populate Dropdowns ----
function populateResorts(filter = "") {
  resortDropdown.innerHTML = "";
  const query = filter.toLowerCase();
  const yearResorts = resortsForYear(state.year);
  const matches = yearResorts.filter((r) => r.name.toLowerCase().includes(query));
  for (const resort of matches) {
    const div = document.createElement("div");
    div.className = "searchable-option" + (resort.id === state.resortId ? " active" : "");
    div.textContent = resort.name;
    div.dataset.id = resort.id;
    div.addEventListener("mousedown", (e) => {
      e.preventDefault(); // prevent input blur before click registers
      selectResort(resort.id);
    });
    resortDropdown.appendChild(div);
  }
}

function selectResort(id) {
  state.resortId = id;
  if (!isSplitMode()) {
    state.checkIn = null;
    state.checkOut = null;
    state.customCashRate = null;
  } else {
    // In split mode, keep locked checkIn, clear checkOut
    state.checkOut = null;
  }
  const resort = getResort();
  resortSearch.value = resort.name;
  resortDropdown.classList.remove("open");
  resortWrapper.classList.remove("open");
  populateRoomTypes();
  updateHint();
  renderCalendar();
  renderLegend();
  renderSummary();
}

function populateRoomTypes() {
  const resort = getResort();
  roomSelect.innerHTML = "";
  for (const rt of resort.roomTypes) {
    const opt = document.createElement("option");
    opt.value = rt.id;
    opt.textContent = `${rt.name} (sleeps ${rt.sleeps})`;
    roomSelect.appendChild(opt);
  }
  // Always default to first room type for this resort
  state.roomTypeId = resort.roomTypes[0].id;
  roomSelect.value = state.roomTypeId;
}

// ---- Selection Hint ----
function updateHint() {
  if (isSplitMode() && !state.checkOut) {
    selectionHint.innerHTML = `Check-in: <span class="checkin-date">${formatDisplayDate(state.checkIn)}</span> — pick a check-out date for ${getResort().name}`;
  } else if (!state.checkIn) {
    selectionHint.innerHTML = "Click a check-in date";
  } else if (!state.checkOut) {
    selectionHint.innerHTML = `Check-in: <span class="checkin-date">${formatDisplayDate(state.checkIn)}</span> — now click a check-out date`;
  } else {
    const allNights = state.segments.reduce((n, s) => n + getSegmentDates(s).length, 0) + getStayDates().length;
    const totalSegs = state.segments.length + 1;
    const firstCheckIn = state.segments.length > 0 ? state.segments[0].checkIn : state.checkIn;
    if (totalSegs > 1) {
      selectionHint.innerHTML = `${formatDisplayDate(firstCheckIn)} — ${formatDisplayDate(state.checkOut)} (${allNights} nights, ${totalSegs} resorts)`;
    } else {
      selectionHint.innerHTML = `${formatDisplayDate(state.checkIn)} — ${formatDisplayDate(state.checkOut)} (${allNights} night${allNights !== 1 ? "s" : ""})`;
    }
  }
}

// ---- Handle Date Click ----
function handleDateClick(dateStr) {
  // In split mode, check-in is locked — only allow setting check-out
  if (isSplitMode()) {
    const prevDates = getAllPreviousSegmentDates();
    if (prevDates.has(dateStr)) return; // can't click on previous segment dates
    if (dateStr <= state.checkIn) return; // must be after locked check-in
    state.checkOut = dateStr;
    updateHint();
    renderCalendar();
    renderSummary();
    return;
  }

  if (!state.checkIn || state.checkOut) {
    state.checkIn = dateStr;
    state.checkOut = null;
  } else {
    if (dateStr <= state.checkIn) {
      state.checkIn = dateStr;
      state.checkOut = null;
    } else {
      state.checkOut = dateStr;
    }
  }
  updateHint();
  renderCalendar();
  renderSummary();
}

// ---- Render Calendar ----
function renderCalendar() {
  const resort = getResort();
  const year = state.year;
  const month = state.month;

  monthLabel.textContent = `${MONTH_NAMES[month]} ${year}`;

  calendarGrid.innerHTML = "";

  for (const dh of DAY_HEADERS) {
    const el = document.createElement("div");
    el.className = "day-header";
    el.textContent = dh;
    calendarGrid.appendChild(el);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const stayDates = new Set(getStayDates());
  const prevSegDates = getAllPreviousSegmentDates();
  const windowCutoff = getBookingWindowCutoff();

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement("div");
    el.className = "day-cell empty";
    calendarGrid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(year, month, d);
    const period = getTravelPeriod(resort, dateStr);
    const points = getPointsForDate(resort, dateStr, state.roomTypeId);
    const cashResult = getCashRateWithFallback(resort, dateStr, state.roomTypeId);
    const cashRate = cashResult ? cashResult.rate : null;
    const cashIsPriorYear = cashResult ? cashResult.isPriorYear : false;
    const dayOfWeek = new Date(year, month, d).getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const isOutsideWindow = windowCutoff && dateStr > windowCutoff;

    const isStayNight = stayDates.has(dateStr);
    const isCheckIn = dateStr === state.checkIn;
    const isCheckOut = dateStr === state.checkOut;
    const isPrevSegment = prevSegDates.has(dateStr);

    const el = document.createElement("div");
    el.className = "day-cell";
    if (isPrevSegment) el.classList.add("prev-segment");
    if (isStayNight) el.classList.add("selected");
    if (isCheckIn) el.classList.add("checkin");
    if (isCheckOut) el.classList.add("checkout");
    if (isOutsideWindow) el.classList.add("outside-window");

    if (period) {
      el.style.backgroundColor = period.color + "20";
      el.style.borderLeft = `3px solid ${period.color}`;
    }

    if (period) {
      el.title = `${period.name} season — ${isWeekend ? "Fri/Sat" : "Sun-Thu"} rate`;
    }

    const cashLabel = cashRate ? `<span class="day-cash${cashIsPriorYear ? ' prior-year' : ''}">$${cashRate.toLocaleString()}${cashIsPriorYear ? '*' : ''}</span>` : "";

    el.innerHTML = `
      ${cashLabel}
      <span class="day-number">${d}</span>
      <span class="day-points" style="color: ${period ? period.color : '#333'}">${points ?? "—"}</span>
      <span class="day-type-label">${isWeekend ? "Fri/Sat" : "Sun-Thu"}</span>
    `;

    if (!isOutsideWindow) {
      el.addEventListener("click", () => handleDateClick(dateStr));
    }
    calendarGrid.appendChild(el);
  }
}

// ---- Legend ----
function renderLegend() {
  const resort = getResort();
  legendItems.innerHTML = "";
  for (const period of resort.travelPeriods) {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `
      <span class="legend-swatch" style="background: ${period.color}"></span>
      ${period.name}
    `;
    legendItems.appendChild(item);
  }
}

// ---- Summary ----

// Build totals for the current (in-progress) segment
function calcCurrentSegmentTotals() {
  const resort = getResort();
  const stayDates = getStayDates();
  if (stayDates.length === 0) return null;

  let totalPoints = 0, totalCash = 0;
  let hasCash = false;
  let isPriorYearCash = false;
  const resortHasCashData = resort.travelPeriods.some(p => p.cashRates);
  const breakdown = [];

  for (const dateStr of stayDates) {
    const pts = getPointsForDate(resort, dateStr, state.roomTypeId);
    const cashResult = getCashRateWithFallback(resort, dateStr, state.roomTypeId);
    const cashRate = cashResult ? cashResult.rate : null;
    if (cashResult && cashResult.isPriorYear) isPriorYearCash = true;
    const dayOfWeek = new Date(dateStr + "T12:00:00").getDay();
    if (pts) totalPoints += pts;
    if (cashRate) { totalCash += cashRate; hasCash = true; }
    breakdown.push({
      date: dateStr,
      points: pts,
      cashRate,
      dayName: DAY_NAMES_SHORT[dayOfWeek],
    });
  }

  const roomType = resort.roomTypes.find(rt => rt.id === state.roomTypeId);
  return {
    resort, roomType, dates: stayDates,
    totalPoints, totalCash: hasCash ? totalCash : 0,
    hasCash, isPriorYearCash, resortHasCashData, breakdown,
    checkIn: state.checkIn, checkOut: state.checkOut,
  };
}

// Build nightly breakdown HTML for a segment
function buildNightlyRows(breakdown, hasCashData, useCustomRate) {
  return breakdown.map(n => {
    const displayCash = useCustomRate ? state.customCashRate : n.cashRate;
    return `
      <div class="nightly-row">
        <span class="night-date">${n.dayName} ${formatShortDate(n.date)}</span>
        <span class="night-points">${n.points} pts</span>
        ${hasCashData ? `<span class="night-cash">$${displayCash ? displayCash.toLocaleString() : "—"}</span>` : ""}
      </div>
    `;
  }).join("");
}

// Build a segment detail block for the summary
function buildSegmentBlock(seg, totals, index, isCurrentSegment, totalVisible) {
  const nightCount = totals.dates.length;
  const hasCashData = totals.totalCash > 0;
  const useCustomRate = isCurrentSegment && !totals.resortHasCashData && !totals.hasCash && state.customCashRate;
  const nightlyRows = buildNightlyRows(totals.breakdown, hasCashData || useCustomRate, useCustomRate);
  const segCheckIn = totals.checkIn || seg.checkIn;
  const segCheckOut = totals.checkOut || seg.checkOut;
  const segCategory = getCategoryFromRoom(totals.roomType);
  const hasCompleteDates = segCheckIn && segCheckOut;

  // Removable: 2 total → both; 3+ total → only first and last visible
  const canRemove = totalVisible >= 2 && (
    totalVisible <= 2 || index === 0 || index === totalVisible - 1
  );
  const removeAction = isCurrentSegment ? 'removeCurrentSegment()' : `removeSegment(${index})`;

  return `
    <div class="segment-block">
      <div class="segment-header">
        <span class="segment-label">Segment ${index + 1}</span>
        <span class="segment-resort">${totals.resort.name}</span>
        ${isCurrentSegment
          ? `<span class="segment-edit" onclick="editCurrentSegment()">Edit</span>`
          : `<span class="segment-edit" onclick="editSegment(${index})">Edit</span>`
        }
        ${canRemove ? `<span class="segment-remove" onclick="${removeAction}">&times;</span>` : ""}
      </div>
      <div class="segment-detail">${totals.roomType ? totals.roomType.name : ""}</div>
      <div class="segment-detail">${formatShortDate(segCheckIn)} — ${formatShortDate(segCheckOut)} (${nightCount} night${nightCount !== 1 ? "s" : ""})</div>
      <div class="segment-detail"><strong>${totals.totalPoints} pts</strong>${hasCashData ? ` · $${totals.totalCash.toLocaleString()} cash` : ""}</div>
      <div class="segment-actions">
        ${hasCompleteDates ? `<a class="segment-compare" href="compare.html?checkin=${segCheckIn}&checkout=${segCheckOut}&category=${segCategory}">Compare Resorts</a>` : ""}
        <span class="segment-nightly-toggle" onclick="this.closest('.segment-block').querySelector('.summary-nightly').classList.toggle('open')">Nightly</span>
      </div>
      <div class="summary-nightly">
        <div class="nightly-rows">${nightlyRows}</div>
      </div>
    </div>
  `;
}

function renderSummary() {
  const resort = getResort();
  const stayDates = getStayDates();
  const inSplitMode = isSplitMode();

  // No dates selected and no segments
  if (stayDates.length === 0 && !inSplitMode) {
    actionButtons.innerHTML = "";
    summaryContainer.innerHTML = `
      <div class="summary-card">
        <h3>Your Stay</h3>
        <div class="summary-empty">
          Select check-in and check-out dates on the calendar
        </div>
      </div>
    `;
    return;
  }

  // In split mode but no check-out yet for current segment
  if (stayDates.length === 0 && inSplitMode) {
    actionButtons.innerHTML = "";
    // Show existing segments with a prompt to pick check-out
    const segmentBlocks = state.segments.map((seg, i) => {
      const totals = calcSegmentTotals(seg);
      totals.checkIn = seg.checkIn;
      totals.checkOut = seg.checkOut;
      totals.resortHasCashData = totals.resort.travelPeriods.some(p => p.cashRates);
      return buildSegmentBlock(seg, totals, i, false, state.segments.length);
    }).join("");

    const combinedPoints = state.segments.reduce((sum, seg) => sum + calcSegmentTotals(seg).totalPoints, 0);

    summaryContainer.innerHTML = `
      <div class="summary-card">
        <h3>Split Stay</h3>
        ${segmentBlocks}
        <div class="summary-divider"></div>
        <div class="summary-stats">
          <div class="summary-row">
            <span class="row-label">Points so far</span>
            <span class="row-value">${combinedPoints.toLocaleString()}</span>
          </div>
        </div>
        <div class="summary-empty" style="padding: 12px;">
          Pick a check-out date for ${resort.name}
        </div>
        <button class="summary-clear" onclick="clearSelection()">Clear All</button>
      </div>
    `;
    return;
  }

  // Gather all segment totals
  const allSegmentTotals = state.segments.map(seg => {
    const t = calcSegmentTotals(seg);
    t.checkIn = seg.checkIn;
    t.checkOut = seg.checkOut;
    t.resortHasCashData = t.resort.travelPeriods.some(p => p.cashRates);
    return t;
  });
  const currentTotals = calcCurrentSegmentTotals();
  if (currentTotals) allSegmentTotals.push(currentTotals);

  // Combined totals across all segments
  let totalPoints = 0, totalDisneyCash = 0, totalNights = 0;
  let anyHasCash = false;
  let anyIsPriorYear = false;
  let anyMissingCash = false;

  for (const t of allSegmentTotals) {
    totalPoints += t.totalPoints;
    totalNights += t.dates.length;
    if (t.hasCash || t.totalCash > 0) { totalDisneyCash += t.totalCash; anyHasCash = true; }
    if (t.isPriorYearCash) anyIsPriorYear = true;
    if (!t.hasCash && !(t.resortHasCashData)) anyMissingCash = true;
  }

  // For single segment: apply custom cash rate
  const resortHasCashData = currentTotals ? currentTotals.resortHasCashData : false;
  const hasFallbackCash = currentTotals ? (!resortHasCashData && currentTotals.isPriorYearCash && currentTotals.totalCash > 0) : false;
  if (!inSplitMode && !resortHasCashData && !hasFallbackCash && state.customCashRate) {
    totalDisneyCash = state.customCashRate * stayDates.length;
    anyHasCash = true;
  }

  const hasCashData = totalDisneyCash > 0;
  const rentalValue = totalPoints * state.rentalRate;
  const savings = totalDisneyCash > 0
    ? Math.round(((totalDisneyCash - rentalValue) / totalDisneyCash) * 100)
    : 0;

  // Ownership
  const ownerDues = DUES_PER_POINT[state.ownerResortId] || 0;
  const ownerCost = totalPoints * ownerDues;
  const ownerSavingsVsRental = rentalValue - ownerCost;
  const ownerSavingsVsDisney = totalDisneyCash - ownerCost;
  const ownerPctVsDisney = totalDisneyCash > 0
    ? Math.round(((totalDisneyCash - ownerCost) / totalDisneyCash) * 100)
    : 0;
  const ownerPctVsRental = rentalValue > 0
    ? Math.round(((rentalValue - ownerCost) / rentalValue) * 100)
    : 0;

  // Overall check-in/check-out
  const overallCheckIn = inSplitMode ? state.segments[0].checkIn : state.checkIn;
  const overallCheckOut = state.checkOut;

  // Build segment blocks for split stay
  let segmentBlocksHTML = "";
  if (inSplitMode) {
    const totalVisible = state.segments.length + (currentTotals ? 1 : 0);
    state.segments.forEach((seg, i) => {
      const t = calcSegmentTotals(seg);
      t.checkIn = seg.checkIn;
      t.checkOut = seg.checkOut;
      t.resortHasCashData = t.resort.travelPeriods.some(p => p.cashRates);
      segmentBlocksHTML += buildSegmentBlock(seg, t, i, false, totalVisible);
    });
    if (currentTotals) {
      segmentBlocksHTML += buildSegmentBlock({}, currentTotals, state.segments.length, true, totalVisible);
    }
  }

  // Build nightly rows for single-segment mode
  const useCustomRate = !inSplitMode && !resortHasCashData && !hasFallbackCash && state.customCashRate;
  const singleNightlyRows = !inSplitMode && currentTotals
    ? buildNightlyRows(currentTotals.breakdown, hasCashData, useCustomRate)
    : "";

  summaryContainer.innerHTML = `
    <div class="summary-card">
      <h3>${inSplitMode ? "Split Stay" : "Your Stay"}</h3>

      ${inSplitMode ? `
        ${segmentBlocksHTML}
        <div class="summary-divider"></div>
        <div class="summary-section-label">Combined Totals</div>
      ` : `
        <div class="summary-dates-display">
          <div class="date-row">
            <span class="date-label">Check-in</span>
            <span class="date-value">${formatDisplayDate(overallCheckIn)}</span>
          </div>
          <div class="date-row">
            <span class="date-label">Check-out</span>
            <span class="date-value">${formatDisplayDate(overallCheckOut)}</span>
          </div>
        </div>
        ${buildBookingWindowNote(overallCheckIn)}
        <div class="summary-divider"></div>
      `}

      <div class="summary-stats">
        <div class="summary-row">
          <span class="row-label">Nights</span>
          <span class="row-value">${totalNights}${inSplitMode ? ` (${allSegmentTotals.length} resorts)` : ""}</span>
        </div>
        <div class="summary-row total">
          <span class="row-label">Total Points</span>
          <span class="row-value">${totalPoints.toLocaleString()}</span>
        </div>
      </div>
    </div>

    ${!inSplitMode
      ? buildAvailabilityHTML(state.resortId, state.roomTypeId, stayDates)
      : buildSplitAvailabilityHTML(state.segments, state.resortId, state.roomTypeId, stayDates)
    }

    <div class="summary-card">
      <h3>Cost Comparison</h3>
      <div class="summary-stats">
        ${!inSplitMode && !resortHasCashData && !hasFallbackCash ? `
        <div class="custom-cash-input">
          <div class="no-cash-note">No cash rate data for non-WDW resorts.</div>
          <div class="custom-cash-row">
            <label for="custom-cash-rate">Compare to your own rate</label>
            <div class="custom-cash-field">
              <span class="cash-prefix">$</span>
              <input type="number" id="custom-cash-rate" placeholder="e.g. 650" min="0" step="1" value="${state.customCashRate || ''}">
              <span class="cash-suffix">/night</span>
            </div>
          </div>
        </div>
        ` : ""}

        ${hasCashData ? `
        <div class="summary-section-label">${useCustomRate ? 'Your cash rate' : 'If booking through Disney'}</div>
        <div class="summary-row">
          <span class="row-label">${useCustomRate ? `${stayDates.length} nights x $${state.customCashRate}/night` : 'Est. Cash Price'}</span>
          <span class="row-value rack">$${totalDisneyCash.toLocaleString()} <span class="cost-per-point">$${(totalDisneyCash / totalPoints).toFixed(2)}/pt</span></span>
        </div>
        ${anyIsPriorYear ? `<div class="prior-year-note">* Some cash rates based on prior year pricing</div>` : ""}
        ` : ""}

        ${state.ownerEnabled ? `
        <div class="summary-section-label">If using your own points</div>
        <div class="summary-row">
          <span class="row-label">${totalPoints} pts</span>
          <span class="row-value owner">$${ownerCost.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} <span class="cost-per-point">$${ownerDues.toFixed(2)}/pt</span></span>
        </div>
        ` : ""}

        ${state.rentalEnabled ? `
        <div class="summary-section-label">If renting DVC points</div>
        <div class="summary-row">
          <span class="row-label">${totalPoints} pts</span>
          <span class="row-value cash">$${rentalValue.toLocaleString()} <span class="cost-per-point">$${state.rentalRate}/pt</span></span>
        </div>
        ` : ""}

        ${(hasCashData || (state.ownerEnabled && state.rentalEnabled)) ? `
        <div class="summary-divider"></div>
        <div class="summary-section-label">Savings</div>
        ` : ""}

        ${hasCashData && state.ownerEnabled ? `
        <div class="summary-row">
          <span class="row-label">Owner vs. cash</span>
          <span class="row-value cash">
            <span class="save-amount">save $${Math.round(ownerSavingsVsDisney).toLocaleString()}</span>
            <span class="savings-badge">${ownerPctVsDisney}% off</span>
          </span>
        </div>
        ` : ""}

        ${state.ownerEnabled && state.rentalEnabled ? `
        <div class="summary-row">
          <span class="row-label">Owner vs. rental</span>
          <span class="row-value cash">
            <span class="save-amount">save $${Math.round(ownerSavingsVsRental).toLocaleString()}</span>
            <span class="savings-badge">${ownerPctVsRental}% off</span>
          </span>
        </div>
        ` : ""}

        ${hasCashData && state.rentalEnabled ? `
        <div class="summary-row">
          <span class="row-label">Rental vs. cash</span>
          <span class="row-value cash">
            <span class="save-amount">save $${(totalDisneyCash - rentalValue).toLocaleString()}</span>
            <span class="savings-badge">${savings}% off</span>
          </span>
        </div>
        ` : ""}
      </div>

      ${!inSplitMode ? `
      <div class="summary-nightly">
        <h4 onclick="this.parentElement.classList.toggle('open')">Nightly Breakdown (${totalNights} nights)${hasCashData ? " — pts / cash" : ""}</h4>
        <div class="nightly-rows">
          ${singleNightlyRows}
        </div>
      </div>
      ` : ""}
    </div>

    <button class="summary-clear" onclick="clearSelection()">Clear ${inSplitMode ? "All" : "Selection"}</button>
  `;

  // Render action buttons between settings and summary
  const hasCompleteDates = state.checkIn && state.checkOut;
  if (hasCompleteDates) {
    actionButtons.innerHTML = `
      <button class="summary-add-segment" onclick="addSegment()">+ Add Another Resort</button>
      ${!inSplitMode ? `<a class="summary-compare" href="compare.html?checkin=${overallCheckIn}&checkout=${overallCheckOut}&category=${getCategoryFromRoomType()}">Compare All Resorts</a>` : ""}
    `;
  } else {
    actionButtons.innerHTML = "";
  }

  // Attach custom cash rate input listener
  const customInput = document.getElementById("custom-cash-rate");
  if (customInput) {
    customInput.addEventListener("change", (e) => {
      const val = parseFloat(e.target.value);
      state.customCashRate = val > 0 ? val : null;
      renderSummary();
    });
    customInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.target.blur();
    });
  }
}

function clearSelection() {
  state.checkIn = null;
  state.checkOut = null;
  state.segments = [];
  state.customCashRate = null;
  updateHint();
  renderCalendar();
  renderSummary();
}

// ---- Event Listeners ----

// Searchable resort dropdown
resortSearch.addEventListener("focus", () => {
  resortSearch.select();
  populateResorts(resortSearch.value === getResort().name ? "" : resortSearch.value);
  resortDropdown.classList.add("open");
  resortWrapper.classList.add("open");
});

resortSearch.addEventListener("input", () => {
  populateResorts(resortSearch.value);
  resortDropdown.classList.add("open");
  resortWrapper.classList.add("open");
});

resortSearch.addEventListener("blur", () => {
  resortDropdown.classList.remove("open");
  resortWrapper.classList.remove("open");
  // Reset to current resort name if input doesn't match
  resortSearch.value = getResort().name;
});

resortSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const firstOption = resortDropdown.querySelector(".searchable-option");
    if (firstOption) {
      selectResort(firstOption.dataset.id);
      resortSearch.blur();
    }
  } else if (e.key === "Escape") {
    resortSearch.blur();
  }
});

roomSelect.addEventListener("change", (e) => {
  state.roomTypeId = e.target.value;
  renderCalendar();
  renderSummary();
});

rentalRateSlider.addEventListener("input", (e) => {
  state.rentalRate = parseFloat(e.target.value);
  rentalRateValue.textContent = state.rentalRate % 1 === 0
    ? state.rentalRate
    : state.rentalRate.toFixed(1);
  renderSummary();
});

prevBtn.addEventListener("click", () => {
  state.month--;
  if (state.month < 0) {
    const prevYear = state.year - 1;
    if (AVAILABLE_YEARS.includes(prevYear)) {
      state.month = 11;
      state.year = prevYear;
      yearSelect.value = state.year;
      // Keep same resort in new year
      const resort = getResort();
      if (resort) {
        populateRoomTypes();
        renderLegend();
      }
    } else {
      state.month = 0; // clamp to Jan of current year
    }
  }
  renderCalendar();
});

nextBtn.addEventListener("click", () => {
  state.month++;
  if (state.month > 11) {
    const nextYear = state.year + 1;
    if (AVAILABLE_YEARS.includes(nextYear)) {
      state.month = 0;
      state.year = nextYear;
      yearSelect.value = state.year;
      // Keep same resort in new year
      const resort = getResort();
      if (resort) {
        populateRoomTypes();
        renderLegend();
      }
    } else {
      state.month = 11; // clamp to Dec of current year
    }
  }
  renderCalendar();
});

// Ownership toggle and resort selector
ownerToggle.addEventListener("change", (e) => {
  state.ownerEnabled = e.target.checked;
  ownershipDetails.style.display = state.ownerEnabled ? "block" : "none";
  renderSummary();
});

ownerResortSelect.addEventListener("change", (e) => {
  state.ownerResortId = e.target.value;
  updateOwnerDuesInfo();
  renderSummary();
});

// Rental toggle
rentalToggle.addEventListener("change", (e) => {
  state.rentalEnabled = e.target.checked;
  rentalDetails.style.display = state.rentalEnabled ? "block" : "none";
  renderSummary();
});

// Booking window selector
bookingWindowSelect.addEventListener("change", (e) => {
  state.bookingWindow = e.target.value;
  renderCalendar();
  renderSummary();
});

// Year selector
yearSelect.addEventListener("change", (e) => {
  state.year = parseInt(e.target.value);
  state.checkIn = null;
  state.checkOut = null;
  // Keep the same resort if it exists in the new year, otherwise pick the first
  const yearResorts = resortsForYear(state.year);
  const sameResort = yearResorts.find(r => r.id === state.resortId);
  if (sameResort) {
    state.resortId = sameResort.id;
  } else {
    state.resortId = yearResorts[0].id;
  }
  const resort = getResort();
  resortSearch.value = resort.name;
  populateRoomTypes();
  updateHint();
  renderCalendar();
  renderLegend();
  renderSummary();
});

function populateYears() {
  yearSelect.innerHTML = "";
  for (const year of AVAILABLE_YEARS) {
    const opt = document.createElement("option");
    opt.value = year;
    opt.textContent = year;
    yearSelect.appendChild(opt);
  }
  yearSelect.value = state.year;
}

function populateOwnerResorts() {
  ownerResortSelect.innerHTML = "";
  // Deduplicate by id (owner resort is for dues, which don't change by year)
  const seen = new Set();
  const unique = [];
  for (const resort of RESORTS) {
    if (!seen.has(resort.id)) {
      seen.add(resort.id);
      unique.push(resort);
    }
  }
  unique.sort((a, b) => a.name.localeCompare(b.name));
  for (const resort of unique) {
    const opt = document.createElement("option");
    opt.value = resort.id;
    opt.textContent = resort.name;
    ownerResortSelect.appendChild(opt);
  }
  ownerResortSelect.value = state.ownerResortId;
  updateOwnerDuesInfo();
}

function updateOwnerDuesInfo() {
  const dues = DUES_PER_POINT[state.ownerResortId];
  if (dues) {
    ownerDuesInfo.textContent = `Annual dues: $${dues.toFixed(2)}/point`;
  } else {
    ownerDuesInfo.textContent = "";
  }
}

// ---- State Persistence (for compare page round-trip) ----
function saveStateToSession() {
  sessionStorage.setItem("dvc_calendar_state", JSON.stringify(state));
}

// Intercept all compare links to save state before navigating
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href*='compare.html']");
  if (link) {
    saveStateToSession();
  }
});

// ---- Init ----

// Restore state from sessionStorage only if returning from compare page
const returningFromCompare = sessionStorage.getItem("dvc_return_to_calendar");
const savedState = returningFromCompare ? sessionStorage.getItem("dvc_calendar_state") : null;
const switchResort = returningFromCompare ? sessionStorage.getItem("dvc_switch_resort") : null;
sessionStorage.removeItem("dvc_calendar_state");
sessionStorage.removeItem("dvc_switch_resort");
sessionStorage.removeItem("dvc_return_to_calendar");

if (savedState) {
  try {
    const restored = JSON.parse(savedState);
    Object.assign(state, restored);

    // If switching resort from compare page, apply it
    if (switchResort) {
      const switchData = JSON.parse(switchResort);
      state.resortId = switchData.resortId;
      // Try to match the room type if provided
      const switchResortObj = RESORTS.find(r => r.id === switchData.resortId && r.year === state.year);
      if (switchResortObj && switchData.roomId) {
        const matchRoom = switchResortObj.roomTypes.find(rt => rt.id === switchData.roomId);
        if (matchRoom) state.roomTypeId = switchData.roomId;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
}

resortSearch.value = getResort().name;
populateYears();
yearSelect.value = state.year;
populateRoomTypes();
roomSelect.value = state.roomTypeId;
populateOwnerResorts();
ownerResortSelect.value = state.ownerResortId;
updateOwnerDuesInfo();
ownerToggle.checked = state.ownerEnabled;
ownershipDetails.style.display = state.ownerEnabled ? "block" : "none";
rentalToggle.checked = state.rentalEnabled;
rentalDetails.style.display = state.rentalEnabled ? "block" : "none";
rentalRateSlider.value = state.rentalRate;
rentalRateValue.textContent = state.rentalRate % 1 === 0 ? state.rentalRate : state.rentalRate.toFixed(1);
bookingWindowSelect.value = state.bookingWindow;
updateHint();
renderCalendar();
renderLegend();
renderSummary();
