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
  rentalEnabled: true, // always on — both cost-comparison tiles are always shown
  ownerEnabled: true,
  ownerResortId: "saratogaSprings",
  customCashRate: null, // user-entered nightly cash rate for resorts without data
  segments: [], // completed split-stay segments: [{ resortId, roomTypeId, checkIn, checkOut }]
  bookingWindow: "all", // "all", "7mo", "11mo"
  compareMonthStart: null, // 0-11 or null — restricts Stay Insights / the alternatives modal to a travel window
  compareMonthEnd: null,   // 0-11 or null; start > end wraps across the year boundary (e.g. Dec–Apr)
  altCrossResort: false,   // "Find a Better Stay" modal: also search other resorts, not just the current one
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
const bookingWindowSelect = document.getElementById("booking-window");

// ---- Custom Select (styled dropdown wrapper around a native <select>) ----
// Keeps the native <select> as the source of truth (existing .value reads/writes
// and "change" listeners elsewhere keep working untouched) while presenting a
// rounded, app-styled trigger + option list instead of the OS-native popup.
function initCustomSelect(selectEl) {
  const wrapper = selectEl.closest(".custom-select");
  const trigger = wrapper.querySelector(".custom-select-trigger");
  const valueEl = trigger.querySelector(".custom-select-value");
  const dropdown = wrapper.querySelector(".custom-select-dropdown");

  function render() {
    valueEl.textContent = selectEl.options[selectEl.selectedIndex]?.textContent || "";
    dropdown.innerHTML = Array.from(selectEl.options).map(opt => `
      <div class="custom-select-option${opt.value === selectEl.value ? " selected" : ""}" data-value="${opt.value}">${opt.textContent}</div>
    `).join("");
  }

  trigger.addEventListener("click", () => {
    const willOpen = !wrapper.classList.contains("open");
    document.querySelectorAll(".custom-select.open").forEach(el => el.classList.remove("open"));
    if (willOpen) {
      render();
      wrapper.classList.add("open");
    }
  });

  dropdown.addEventListener("click", (e) => {
    const opt = e.target.closest(".custom-select-option");
    if (!opt) return;
    selectEl.value = opt.dataset.value;
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
    wrapper.classList.remove("open");
    render();
  });

  selectEl._customSelectRender = render;
  render();
}

document.addEventListener("click", (e) => {
  document.querySelectorAll(".custom-select.open").forEach(el => {
    if (!el.contains(e.target)) el.classList.remove("open");
  });
});

// Re-syncs every custom dropdown's displayed label/options with its native <select>.
// Called from renderCalendar(), which already runs after every action that can
// change room type, booking window, or points year.
function syncCustomSelects() {
  [roomSelect, bookingWindowSelect, yearSelect].forEach(sel => sel._customSelectRender && sel._customSelectRender());
}

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

const MONTH_SHORT = MONTH_NAMES.map(m => m.slice(0, 3));

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

// Booking windows in the order DVC's own booking process opens them up.
const BOOKING_WINDOWS = [
  { key: "11Mo", label: "11-Month (Home Resort)", shortLabel: "11Mo" },
  { key: "7Mo", label: "7-Month (Any Resort)", shortLabel: "7Mo" },
  { key: "5Mo", label: "5-Month", shortLabel: "5Mo" },
  { key: "3Mo", label: "3-Month", shortLabel: "3Mo" },
  { key: "1Mo", label: "1-Month", shortLabel: "1Mo" },
];

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

// Returns the worst (minimum) score per booking window across every night of the
// stay, e.g. { "11Mo": 5.2, "7Mo": 0.3, "5Mo": null, ... } — null where no data exists.
function getStayAvailability(resortId, roomTypeId, dates) {
  if (!dates || dates.length === 0) return null;
  const mins = {}, has = {};
  for (const w of BOOKING_WINDOWS) { mins[w.key] = 8; has[w.key] = false; }
  for (const dateStr of dates) {
    for (const w of BOOKING_WINDOWS) {
      const s = getAvailabilityScore(resortId, roomTypeId, dateStr, w.key);
      if (s !== null) { mins[w.key] = Math.min(mins[w.key], s); has[w.key] = true; }
    }
  }
  if (!BOOKING_WINDOWS.some(w => has[w.key])) return null;
  const scores = {};
  for (const w of BOOKING_WINDOWS) scores[w.key] = has[w.key] ? mins[w.key] : null;
  return scores;
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
  const rows = BOOKING_WINDOWS.map(w => {
    const label = availabilityLabel(avail[w.key], stayLength);
    return label ? `
        <div class="avail-row">
          <span class="avail-label">${w.label}</span>
          <span class="avail-badge ${label.cls}">${label.text}</span>
        </div>` : "";
  }).join("");
  if (!rows) return "";

  return `
    <div class="summary-card">
      <div class="availability-outlook">
        <h3>Booking Outlook <span class="avail-stay-length">${dates.length} night${dates.length !== 1 ? "s" : ""}</span></h3>
        ${rows}
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
    const badges = BOOKING_WINDOWS.map(w => {
      const label = availabilityLabel(avail[w.key], len);
      return label ? `<span class="avail-badge-mini ${label.cls}">${w.shortLabel} ${label.text}</span>` : "";
    }).join("");
    rows += `
      <div class="avail-segment">
        <div class="avail-segment-name">${seg.name} <span class="avail-stay-length">${len}n</span></div>
        <div class="avail-segment-badges">
          ${badges}
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

// Resolves the resort-year object whose points chart actually covers a given date.
// A stay can cross Dec 31 -> Jan 1, spanning two different calendar-year points
// charts, so per-night lookups can't all use one fixed resort object. Falls back
// to the given resort if that date's own year isn't in the data (e.g. historical gaps).
function getResortForStayDate(resortId, dateStr, fallbackResort) {
  const year = parseInt(dateStr.slice(0, 4), 10);
  return RESORTS.find(r => r.id === resortId && r.year === year) || fallbackResort;
}

function calcSegmentTotals(seg) {
  const resort = RESORTS.find(r => r.id === seg.resortId && r.year === state.year);
  const dates = getSegmentDates(seg);
  let totalPoints = 0, totalCash = 0;
  let hasCash = false;
  let isPriorYearCash = false;
  const breakdown = [];
  for (const dateStr of dates) {
    const dateResort = getResortForStayDate(resort.id, dateStr, resort);
    const pts = getPointsForDate(dateResort, dateStr, seg.roomTypeId);
    const cashResult = getCashRateWithFallback(dateResort, dateStr, seg.roomTypeId);
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
  // Keep the current room type if it still exists on this resort (e.g. when
  // switching years); otherwise fall back to the first room type.
  const stillValid = resort.roomTypes.some(rt => rt.id === state.roomTypeId);
  if (!stillValid) state.roomTypeId = resort.roomTypes[0].id;
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

// ---- Crowd Calendar (Undercover Tourist) ----
// Real data scraped from undercovertourist.com — see docs/undercovertourist.md.
// crowd/label: a single Orlando-wide "Crowd Level" (1-10) for that date (the
// source doesn't publish a separate numeric score per park). season: the
// day's $ pricing tier. parks: per park, "recommended" (their lowest-crowd
// pick that day) or "busy" (their busy-day flag), straight from the source's
// own per-park icons — not a fabricated score.
const CROWD_TABLES = {
  2026: typeof UNDERCOVER_TOURIST_CROWD_2026 !== "undefined" ? UNDERCOVER_TOURIST_CROWD_2026 : null,
  2027: typeof UNDERCOVER_TOURIST_CROWD_2027 !== "undefined" ? UNDERCOVER_TOURIST_CROWD_2027 : null,
};

const CROWD_PARK_LABELS = {
  magicKingdom: "Magic Kingdom",
  epcot: "EPCOT",
  hollywoodStudios: "Hollywood Studios",
  animalKingdom: "Animal Kingdom",
  universalStudios: "Universal Studios",
  islandsOfAdventure: "Islands of Adventure",
  epicUniverse: "Epic Universe",
};

function getCrowdForDate(dateStr) {
  const table = CROWD_TABLES[dateStr.slice(0, 4)];
  return table ? table[dateStr] || null : null;
}

function crowdClass(label) {
  return `crowd-${label.toLowerCase()}`;
}

function buildCrowdTooltipHTML(dateStr, entry) {
  const flaggedParks = Object.entries(entry.parks).filter(([, flag]) => flag);
  const parksHTML = flaggedParks.length
    ? flaggedParks.map(([id, flag]) => `
        <div class="park-flag ${flag}">
          <span class="park-flag-icon">${flag === "recommended" ? "✓" : "!"}</span>
          <span class="park-flag-name">${CROWD_PARK_LABELS[id]}</span>
          <span class="park-flag-tag">${flag === "recommended" ? "Best pick" : "Busier day"}</span>
        </div>
      `).join("")
    : `<div class="crowd-tooltip-empty">No park picks flagged today</div>`;

  return `
    <div class="crowd-tooltip tooltip-card">
      <div class="crowd-tooltip-header">
        <span class="crowd-tooltip-date">${formatDisplayDate(dateStr)}</span>
        <span class="crowd-pill ${crowdClass(entry.label)}">${entry.crowd}</span>
      </div>
      <div class="crowd-tooltip-sub">
        <span>${entry.label} crowds</span>
        ${entry.season ? `<span class="crowd-tooltip-season">${"$".repeat(entry.season)}</span>` : ""}
      </div>
      <div class="crowd-tooltip-parks">${parksHTML}</div>
      <div class="crowd-tooltip-footer">Undercover Tourist</div>
    </div>
  `;
}

function buildCrowdSummaryHTML(dates) {
  const entries = dates.map(getCrowdForDate).filter(Boolean);
  if (entries.length === 0) return "";

  const avg = Math.round(entries.reduce((sum, e) => sum + e.crowd, 0) / entries.length);
  const min = Math.min(...entries.map(e => e.crowd));
  const max = Math.max(...entries.map(e => e.crowd));
  const avgLabel = entries.find(e => e.crowd === avg)?.label
    || entries.slice().sort((a, b) => Math.abs(a.crowd - avg) - Math.abs(b.crowd - avg))[0].label;

  return `
    <div class="summary-card">
      <h3>Crowd Forecast</h3>
      <div class="summary-stats">
        <div class="summary-row">
          <span class="row-label">Stay average</span>
          <span class="row-value"><span class="crowd-pill ${crowdClass(avgLabel)}">${avg}</span> ${avgLabel}</span>
        </div>
        ${min !== max ? `
        <div class="summary-row">
          <span class="row-label">Range</span>
          <span class="row-value">${min} – ${max}</span>
        </div>` : ""}
      </div>
      <a class="source-link" href="https://www.undercovertourist.com/orlando/crowd-calendar/" target="_blank" rel="noopener">Source: Undercover Tourist Crowd Calendar</a>
    </div>
  `;
}

// ---- Stay Comparison (distribution of all same-length stays this year) ----
// For the selected resort/room, computes points, cash, and crowd totals for
// every possible N-night window in the resort's points year, then shows
// where the current stay's totals fall in that distribution.
const WINDOW_STATS_CACHE = {};

function computeNightWindowStats(resort, roomTypeId, nights) {
  const cacheKey = `${resort.id}|${resort.year}|${roomTypeId}|${nights}`;
  if (WINDOW_STATS_CACHE[cacheKey]) return WINDOW_STATS_CACHE[cacheKey];

  const results = [];
  const cursor = new Date(resort.year, 0, 1);
  const lastCheckIn = new Date(resort.year, 11, 31);
  lastCheckIn.setDate(lastCheckIn.getDate() - (nights - 1));

  while (cursor <= lastCheckIn) {
    const checkIn = formatDate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
    let points = 0, pointsOk = true;
    let cash = 0, cashOk = true;
    let crowdSum = 0, crowdOk = true;
    const day = new Date(cursor);
    for (let i = 0; i < nights; i++) {
      const dateStr = formatDate(day.getFullYear(), day.getMonth(), day.getDate());
      const p = getPointsForDate(resort, dateStr, roomTypeId);
      if (p == null) pointsOk = false; else points += p;
      const c = getCashRateWithFallback(resort, dateStr, roomTypeId);
      if (!c) cashOk = false; else cash += c.rate;
      const crowd = getCrowdForDate(dateStr);
      if (!crowd) crowdOk = false; else crowdSum += crowd.crowd;
      day.setDate(day.getDate() + 1);
    }
    results.push({
      checkIn,
      points: pointsOk ? points : null,
      cash: cashOk ? cash : null,
      crowdAvg: crowdOk ? crowdSum / nights : null,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  WINDOW_STATS_CACHE[cacheKey] = results;
  return results;
}

function setCompareRangeStart(value) {
  state.compareMonthStart = value === "" ? null : parseInt(value, 10);
  renderSummary();
  if (alternativesModalOpen) renderAlternativesModal();
}

function setCompareRangeEnd(value) {
  state.compareMonthEnd = value === "" ? null : parseInt(value, 10);
  renderSummary();
  if (alternativesModalOpen) renderAlternativesModal();
}

// Years this resort actually has a points chart for (RESORTS has one entry per resort per year)
function resortYearsAvailable(resortId) {
  return [...new Set(RESORTS.filter(r => r.id === resortId).map(r => r.year))].sort((a, b) => a - b);
}

function buildCompareRangePickerHTML() {
  const monthOptions = (selected) => `<option value="">Any</option>` + MONTH_SHORT.map((m, i) =>
    `<option value="${i}" ${i === selected ? "selected" : ""}>${m}</option>`
  ).join("");

  return `
    <div class="compare-range-picker">
      <span class="compare-range-label">Travel window</span>
      <select class="compare-range-select" onchange="setCompareRangeStart(this.value)">${monthOptions(state.compareMonthStart)}</select>
      <span class="compare-range-sep">–</span>
      <select class="compare-range-select" onchange="setCompareRangeEnd(this.value)">${monthOptions(state.compareMonthEnd)}</select>
    </div>
  `;
}

// Given a month window (0-indexed, wraps if start > end), finds the next occurrence of
// that window that hasn't already fully elapsed relative to today — e.g. picking "Nov-Jan"
// in Aug 2026 resolves to Nov 2026 - Jan 2027, not Nov-Dec-Jan all within one calendar year.
function nextWindowYearSpan(start, end) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const wraps = start > end;
  let startYear = today.getFullYear();
  let endYear = startYear + (wraps ? 1 : 0);
  const endDate = new Date(endYear, end + 1, 0);
  if (endDate < today) {
    startYear += 1;
    endYear += 1;
  }
  return { startYear, endYear };
}

// Combines night-window stats across the year(s) a travel window actually spans (only
// pulling a second year's chart when the window wraps the calendar boundary), filtered
// down to just the dates inside that window.
function computeCompareWindowStats(resort, roomTypeId, nights) {
  const { compareMonthStart: start, compareMonthEnd: end } = state;
  if (start == null || end == null) {
    const stats = computeNightWindowStats(resort, roomTypeId, nights);
    return { stats, totalAvailable: stats.length, startYear: resort.year, endYear: resort.year };
  }

  const { startYear, endYear } = nextWindowYearSpan(start, end);
  const years = startYear === endYear ? [startYear] : [startYear, endYear];
  let combined = [];
  for (const y of years) {
    const yearResort = RESORTS.find(r => r.id === resort.id && r.year === y);
    if (yearResort) combined = combined.concat(computeNightWindowStats(yearResort, roomTypeId, nights));
  }
  const stats = combined.filter(s => {
    const m = parseInt(s.checkIn.slice(5, 7), 10) - 1;
    const y = parseInt(s.checkIn.slice(0, 4), 10);
    return startYear === endYear
      ? (y === startYear && m >= start && m <= end)
      : ((y === startYear && m >= start) || (y === endYear && m <= end));
  });
  return { stats, totalAvailable: combined.length, startYear, endYear };
}

function compareRangeLabel(startYear, endYear) {
  const { compareMonthStart: start, compareMonthEnd: end } = state;
  if (start == null || end == null) return `in ${startYear}`;
  return startYear === endYear
    ? `in ${MONTH_SHORT[start]}–${MONTH_SHORT[end]} ${startYear}`
    : `in ${MONTH_SHORT[start]} ${startYear}–${MONTH_SHORT[end]} ${endYear}`;
}

// % of the distribution at or below `value` (ties split evenly)
function percentileRank(values, value) {
  if (values.length === 0) return null;
  let below = 0, equal = 0;
  for (const v of values) {
    if (v < value) below++;
    else if (v === value) equal++;
  }
  return Math.round(((below + equal / 2) / values.length) * 100);
}

const DIST_BIN_COUNT = 12;

function buildDistributionHTML(values, currentValue, opts) {
  if (values.length < 20 || currentValue == null) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const bins = new Array(DIST_BIN_COUNT).fill(0);
  for (const v of values) {
    const idx = Math.min(DIST_BIN_COUNT - 1, Math.max(0, Math.floor(((v - min) / span) * DIST_BIN_COUNT)));
    bins[idx]++;
  }
  const currentBin = Math.min(DIST_BIN_COUNT - 1, Math.max(0, Math.floor(((currentValue - min) / span) * DIST_BIN_COUNT)));
  const maxCount = Math.max(...bins);
  const pct = percentileRank(values, currentValue);
  const total = values.length;
  const unit = opts.unit || "";

  const bars = bins.map((count, i) => {
    const heightPct = count === 0 ? 2 : Math.max((count / maxCount) * 100, 8);
    const binLo = min + (i / DIST_BIN_COUNT) * span;
    const binHi = min + ((i + 1) / DIST_BIN_COUNT) * span;
    const binPct = Math.round((count / total) * 100);
    const align = i <= 1 ? "tooltip-align-left" : i >= DIST_BIN_COUNT - 2 ? "tooltip-align-right" : "";
    return `
      <div class="dist-bar-anchor tooltip-anchor ${align}" tabindex="0">
        <div class="dist-bar${i === currentBin ? " current" : ""}" style="height:${heightPct}%"></div>
        <div class="dist-tooltip tooltip-card">${binPct}% (${count}/${total}) between ${opts.format(binLo)}${unit} and ${opts.format(binHi)}${unit}</div>
      </div>
    `;
  }).join("");

  return `
    <div class="dist-widget">
      <div class="dist-row">
        <span class="dist-title">${opts.title}</span>
        <span class="dist-current">${opts.format(currentValue)}</span>
      </div>
      <div class="dist-chart">${bars}</div>
      <div class="dist-axis">
        <span>${opts.format(min)}</span>
        <span>${opts.format(max)}</span>
      </div>
      <div class="dist-callout">${opts.calloutText(pct)}</div>
    </div>
  `;
}

// Normalizes a stay's points/crowd/deal ($/pt) against a pool of same-length
// stays and blends whichever metrics are available into a single 1-5 score
// (5 = great value). Returns null if there isn't enough data to score.
const VALUE_SCORE_LABELS = { 5: "Excellent Value", 4: "Great Value", 3: "Fair Value", 2: "Below Average", 1: "Poor Value" };
const VALUE_SCORE_CLASS = { 5: "crowd-low", 4: "crowd-moderate", 3: "crowd-busy", 2: "crowd-heavy", 1: "crowd-extreme" };

function computeValueScore(pool, currentEntry) {
  const metrics = [];
  const all = pool.concat([currentEntry]);
  const norm = (v, lo, hi) => (hi > lo ? (v - lo) / (hi - lo) : 0.5);

  if (currentEntry.points != null) {
    const vals = all.map(s => s.points).filter(v => v != null);
    if (vals.length >= 5) metrics.push(1 - norm(currentEntry.points, Math.min(...vals), Math.max(...vals)));
  }
  if (currentEntry.crowdAvg != null) {
    const vals = all.map(s => s.crowdAvg).filter(v => v != null);
    if (vals.length >= 5) metrics.push(1 - norm(currentEntry.crowdAvg, Math.min(...vals), Math.max(...vals)));
  }
  if (currentEntry.points > 0 && currentEntry.cash != null) {
    const vals = all.filter(s => s.points > 0 && s.cash != null).map(s => s.cash / s.points);
    if (vals.length >= 5) metrics.push(norm(currentEntry.cash / currentEntry.points, Math.min(...vals), Math.max(...vals)));
  }

  if (metrics.length === 0) return null;
  const avg = metrics.reduce((a, b) => a + b, 0) / metrics.length;
  return Math.round((1 + avg * 4) * 10) / 10;
}

function buildValueScoreHTML(score) {
  if (score == null) return "";
  const rounded = Math.min(5, Math.max(1, Math.round(score)));
  return `
    <div class="value-score-row">
      <div class="value-score-badge tooltip-anchor ${VALUE_SCORE_CLASS[rounded]}" tabindex="0">
        <span class="value-score-num">${score.toFixed(1)}</span>
        <div class="value-tooltip tooltip-card">
          <div class="value-tooltip-title">${score.toFixed(1)} out of 5 — ${VALUE_SCORE_LABELS[rounded]}</div>
          <div class="value-tooltip-desc">Blends points, crowd &amp; cash value vs. other same-length stays. 5 = great value, 1 = poor value.</div>
        </div>
      </div>
      <div class="value-score-body">
        <div class="value-score-label">${VALUE_SCORE_LABELS[rounded]}</div>
        <div class="value-score-desc">Blends points, crowd &amp; cash value vs. other same-length stays</div>
      </div>
    </div>
  `;
}

// ---- Stay Insights: comparison distributions + value score + alternatives ----
// One card, sharing the travel-window picker across all three sub-sections so
// it's clear the window applies everywhere.
const ALT_PICK_META = {
  points: { badge: "Fewer points", color: "#2e7d32" },
  crowd: { badge: "Calmer crowds", color: "#1565c0" },
  deal: { badge: "Better deal", color: "#6a1b9a" },
  overall: { badge: "Best overall", color: "#4a148c" },
};

function dateStrPlusDays(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return formatDate(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

// For each metric the current stay has data for, either picks the best alternative or
// (if none beats the current stay) pushes a null-entry placeholder explaining why —
// so a category doesn't just silently vanish when the pool has nothing better to offer.
function buildAlternativePicks(currentEntry, candidates) {
  const picks = [];

  if (currentEntry.points != null) {
    const cheaper = candidates.filter(s => s.points != null && s.points < currentEntry.points);
    if (cheaper.length) {
      const best = cheaper.reduce((a, b) => (b.points < a.points ? b : a));
      picks.push({
        type: "points", entry: best,
        note: `${currentEntry.points - best.points} fewer points (${best.points} vs ${currentEntry.points})`,
      });
    } else {
      picks.push({ type: "points", entry: null, note: "Already the lowest-points option in this window" });
    }
  }

  if (currentEntry.crowdAvg != null) {
    const calmer = candidates.filter(s => s.crowdAvg != null && s.crowdAvg < currentEntry.crowdAvg - 0.05);
    if (calmer.length) {
      const best = calmer.reduce((a, b) => (b.crowdAvg < a.crowdAvg ? b : a));
      picks.push({
        type: "crowd", entry: best,
        note: `Crowd ${best.crowdAvg.toFixed(1)} vs ${currentEntry.crowdAvg.toFixed(1)}`,
      });
    } else {
      picks.push({ type: "crowd", entry: null, note: "Already one of the calmest options in this window" });
    }
  }

  if (currentEntry.points > 0 && currentEntry.cash != null) {
    const currentRatio = currentEntry.cash / currentEntry.points;
    const betterDeal = candidates.filter(s => s.cash != null && s.points > 0 && (s.cash / s.points) > currentRatio + 0.01);
    if (betterDeal.length) {
      const best = betterDeal.reduce((a, b) => (b.cash / b.points) > (a.cash / a.points) ? b : a);
      picks.push({
        type: "deal", entry: best,
        note: `$${(best.cash / best.points).toFixed(2)}/pt vs $${currentRatio.toFixed(2)}/pt`,
      });
    } else {
      picks.push({ type: "deal", entry: null, note: "Already a strong deal in this window" });
    }
  }

  if (currentEntry.points != null && currentEntry.crowdAvg != null && currentEntry.cash != null) {
    const pool = candidates.filter(s => s.points != null && s.crowdAvg != null && s.cash != null);
    if (pool.length >= 5) {
      const all = pool.concat([currentEntry]);
      const pointsRange = [Math.min(...all.map(s => s.points)), Math.max(...all.map(s => s.points))];
      const crowdRange = [Math.min(...all.map(s => s.crowdAvg)), Math.max(...all.map(s => s.crowdAvg))];
      const dealRange = [Math.min(...all.map(s => s.cash / s.points)), Math.max(...all.map(s => s.cash / s.points))];
      const norm = (v, [lo, hi]) => (hi > lo ? (v - lo) / (hi - lo) : 0.5);
      const score = s => (
        (1 - norm(s.points, pointsRange)) +      // fewer points is better
        (1 - norm(s.crowdAvg, crowdRange)) +      // lower crowd is better
        norm(s.cash / s.points, dealRange)        // higher $/pt is better
      ) / 3;

      const currentScore = score(currentEntry);
      const best = pool.reduce((a, b) => (score(b) > score(a) ? b : a));
      if (score(best) > currentScore + 0.03) {
        picks.push({ type: "overall", entry: best, note: "Fewer points, calmer crowds, and better cash value overall" });
      } else {
        picks.push({ type: "overall", entry: null, note: "Already scores well on points, crowds & cash in this window" });
      }
    }
  }

  return picks;
}

function buildAlternativesRowsHTML(picks, nights, currentResortId) {
  return picks.map(p => {
    const meta = ALT_PICK_META[p.type];

    if (!p.entry) {
      return `
        <div class="alt-card alt-card-empty">
          <span class="alt-badge muted">${meta.badge}</span>
          <div class="alt-note">${p.note}</div>
        </div>
      `;
    }

    const checkOut = dateStrPlusDays(p.entry.checkIn, nights);
    const showResort = p.entry.resortId && p.entry.resortId !== currentResortId;
    return `
      <div class="alt-card" onclick="applyAlternativeStay('${p.entry.checkIn}', ${nights}, '${p.entry.resortId || ""}', '${p.entry.roomTypeId || ""}')" tabindex="0">
        <span class="alt-badge" style="background:${meta.color}">${meta.badge}</span>
        <div class="alt-dates">${formatDisplayDate(p.entry.checkIn)} – ${formatDisplayDate(checkOut)}</div>
        ${showResort ? `<div class="alt-resort">${p.entry.resortName}</div>` : ""}
        <div class="alt-note">${p.note}</div>
      </div>
    `;
  }).join("");
}

// Computes a stay's total points/cash/avg-crowd, each null if any night is missing that data.
function computeStayEntry(resort, roomTypeId, stayDates) {
  let points = 0, pointsOk = true;
  let cash = 0, cashOk = true;
  let crowdSum = 0, crowdOk = true;
  for (const dateStr of stayDates) {
    const dateResort = getResortForStayDate(resort.id, dateStr, resort);
    const p = getPointsForDate(dateResort, dateStr, roomTypeId);
    if (p == null) pointsOk = false; else points += p;
    const c = getCashRateWithFallback(dateResort, dateStr, roomTypeId);
    if (!c) cashOk = false; else cash += c.rate;
    const crowd = getCrowdForDate(dateStr);
    if (!crowd) crowdOk = false; else crowdSum += crowd.crowd;
  }
  return {
    points: pointsOk ? points : null,
    cash: cashOk ? cash : null,
    crowdAvg: crowdOk ? crowdSum / stayDates.length : null,
    pointsOk, cashOk, crowdOk,
  };
}

// Room category (studio/one/two/three) matching, shared with compare.html's approach.
const CATEGORY_KEYWORDS = { studio: "studio", one: "one-bedroom", two: "two-bedroom", three: "three-bedroom" };

function getRoomTypesForCategory(resort, category) {
  const keyword = CATEGORY_KEYWORDS[category];
  return resort.roomTypes.filter(rt => rt.name.toLowerCase().includes(keyword));
}

// Builds a same-length-stay candidate pool across every resort offering the given room
// category (one room type per resort — the first match), tagged with resort/room info
// so alternatives can point at a different resort, not just a different date.
function buildCrossResortCandidates(category, nights, todayStr) {
  const resortIds = [...new Set(RESORTS.map(r => r.id))];
  let candidates = [];
  for (const resortId of resortIds) {
    // Prefer the year currently being browsed; fall back to the resort's most recent year.
    const yearVariant = RESORTS.find(r => r.id === resortId && r.year === state.year)
      || RESORTS.filter(r => r.id === resortId).sort((a, b) => b.year - a.year)[0];
    if (!yearVariant) continue;
    const roomTypes = getRoomTypesForCategory(yearVariant, category);
    if (roomTypes.length === 0) continue;
    const roomTypeId = roomTypes[0].id;
    const { stats } = computeCompareWindowStats(yearVariant, roomTypeId, nights);
    for (const s of stats) {
      if (s.checkIn < todayStr) continue;
      candidates.push({ ...s, resortId, roomTypeId, resortName: yearVariant.name });
    }
  }
  return candidates;
}

function buildStayInsightsHTML(resort, roomTypeId, stayDates) {
  const nights = stayDates.length;
  if (nights < 1) return "";

  const picker = buildCompareRangePickerHTML();
  const { stats, totalAvailable, startYear, endYear } = computeCompareWindowStats(resort, roomTypeId, nights);
  const rangeLabel = compareRangeLabel(startYear, endYear);

  if (totalAvailable === 0) {
    return `
      <div class="summary-card wide">
        <h3>Stay Insights</h3>
        ${picker}
        <div class="summary-empty">No points chart available ${rangeLabel} for this resort.</div>
      </div>
    `;
  }
  if (totalAvailable < 20) return "";

  const currentEntry = computeStayEntry(resort, roomTypeId, stayDates);
  const { pointsOk, cashOk, crowdOk } = currentEntry;

  if (stats.length < 5) {
    return `
      <div class="summary-card wide">
        <h3>Stay Insights</h3>
        ${picker}
        <div class="summary-empty">Not enough ${nights}-night stays ${rangeLabel} to compare.</div>
      </div>
    `;
  }

  // Value score
  const valueScore = computeValueScore(stats, currentEntry);
  const valueScoreHTML = buildValueScoreHTML(valueScore);

  // Distributions
  const pointsValues = stats.map(s => s.points).filter(v => v != null);
  const cashValues = stats.map(s => s.cash).filter(v => v != null);
  const crowdValues = stats.map(s => s.crowdAvg).filter(v => v != null);

  const distSections = [];
  if (crowdOk) {
    distSections.push(buildDistributionHTML(crowdValues, currentEntry.crowdAvg, {
      title: "Crowd forecast",
      format: v => v.toFixed(1),
      calloutText: pct => pct == null ? "" : `Busier than <strong>${pct}%</strong> of all ${nights}-night stays ${rangeLabel}`,
    }));
  }
  if (pointsOk) {
    distSections.push(buildDistributionHTML(pointsValues, currentEntry.points, {
      title: "Points cost",
      format: v => Math.round(v).toLocaleString(),
      unit: " points",
      calloutText: pct => pct == null ? "" : `More points than <strong>${pct}%</strong> of all ${nights}-night stays ${rangeLabel}`,
    }));
  }
  if (cashOk) {
    distSections.push(buildDistributionHTML(cashValues, currentEntry.cash, {
      title: "Cash price",
      format: v => `$${Math.round(v).toLocaleString()}`,
      calloutText: pct => pct == null ? "" : `More expensive than <strong>${pct}%</strong> of all ${nights}-night stays ${rangeLabel}`,
    }));
  }
  const distContent = distSections.filter(Boolean);

  return `
    <div class="summary-card wide">
      <h3>Stay Insights</h3>
      ${picker}
      <div class="dist-subtitle">vs. every other ${nights}-night stay at ${resort.name} ${rangeLabel}</div>

      ${valueScoreHTML}

      ${distContent.length ? `<div class="dist-grid">${distContent.join("")}</div>` : ""}

      <button class="find-alt-btn" onclick="openAlternativesModal()">🔍 Find Alternatives</button>
    </div>
  `;
}

// ---- Find a Better Stay modal ----
let alternativesModalOpen = false;

function openAlternativesModal() {
  alternativesModalOpen = true;
  document.getElementById("alternatives-modal").classList.add("open");
  renderAlternativesModal();
}

function closeAlternativesModal() {
  alternativesModalOpen = false;
  document.getElementById("alternatives-modal").classList.remove("open");
}

function setAltCrossResort(checked) {
  state.altCrossResort = checked;
  renderAlternativesModal();
}

function renderAlternativesModal() {
  const resort = getResort();
  const stayDates = getStayDates();
  const nights = stayDates.length;
  if (nights < 1) { closeAlternativesModal(); return; }

  const picker = buildCompareRangePickerHTML();
  const { stats, startYear, endYear } = computeCompareWindowStats(resort, state.roomTypeId, nights);
  const rangeLabel = compareRangeLabel(startYear, endYear);
  const currentEntry = computeStayEntry(resort, state.roomTypeId, stayDates);
  const todayStr = formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  let candidates;
  if (state.altCrossResort) {
    const category = getCategoryFromRoomType();
    candidates = buildCrossResortCandidates(category, nights, todayStr)
      .filter(c => !(c.resortId === resort.id && c.roomTypeId === state.roomTypeId && c.checkIn === stayDates[0]));
  } else {
    candidates = stats
      .filter(s => s.checkIn !== stayDates[0] && s.checkIn >= todayStr)
      .map(s => ({ ...s, resortId: resort.id, roomTypeId: state.roomTypeId, resortName: resort.name }));
  }

  const picks = candidates.length >= 5 ? buildAlternativePicks(currentEntry, candidates) : [];
  const allEmpty = picks.length > 0 && picks.every(p => !p.entry);
  const body = candidates.length < 5
    ? `<div class="summary-empty">Not enough upcoming stays ${rangeLabel} to suggest alternatives.</div>`
    : picks.length === 0
      ? `<div class="summary-empty">Not enough data ${rangeLabel} to compare alternatives.</div>`
      : allEmpty
        ? `<div class="summary-empty">This stay is already a strong pick ${rangeLabel}.</div>`
        : `<div class="alt-grid">${buildAlternativesRowsHTML(picks, nights, resort.id)}</div>`;

  document.getElementById("alternatives-modal-body").innerHTML = `
    ${picker}
    <label class="alt-cross-toggle">
      <input type="checkbox" id="alt-cross-resort" ${state.altCrossResort ? "checked" : ""}>
      Also check other resorts
    </label>
    <div class="dist-subtitle">vs. every other ${nights}-night stay ${state.altCrossResort ? "across resorts offering this room type" : `at ${resort.name}`} ${rangeLabel}</div>
    ${body}
  `;

  document.getElementById("alt-cross-resort").addEventListener("change", (e) => setAltCrossResort(e.target.checked));
}

function applyAlternativeStay(checkInStr, nights, resortId, roomTypeId) {
  const year = Number(checkInStr.split("-")[0]);
  if (year !== state.year) {
    state.year = year;
    yearSelect.value = year;
  }
  if (resortId && resortId !== state.resortId) {
    state.resortId = resortId;
  }
  if (roomTypeId) state.roomTypeId = roomTypeId;
  resortSearch.value = getResort().name;
  populateRoomTypes(); // keeps the current room type if it still exists, else falls back
  renderLegend();
  state.checkIn = checkInStr;
  state.checkOut = dateStrPlusDays(checkInStr, nights);
  state.month = Number(checkInStr.split("-")[1]) - 1;
  updateHint();
  renderCalendar();
  renderSummary();
  closeAlternativesModal();
}

// ---- Render Calendar ----
function renderCalendar() {
  syncCustomSelects();

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

    const tooltipAlign = dayOfWeek <= 1 ? "tooltip-align-left" : dayOfWeek >= 5 ? "tooltip-align-right" : "";
    let periodTooltipHTML = "";

    if (period) {
      el.style.backgroundColor = period.color + "20";
      el.style.borderLeft = `3px solid ${period.color}`;
      periodTooltipHTML = `
        <div class="period-tooltip tooltip-card">
          <div class="period-tooltip-header">
            <span class="period-tooltip-date">${formatDisplayDate(dateStr)}</span>
            <span class="period-tooltip-pill" style="background:${period.color}">${period.name}</span>
          </div>
          <div class="period-tooltip-sub">${isWeekend ? "Fri/Sat" : "Sun-Thu"} rate</div>
        </div>
      `;
    }

    const cashLabel = cashRate ? `<span class="day-cash${cashIsPriorYear ? ' prior-year' : ''}">$${cashRate.toLocaleString()}${cashIsPriorYear ? '*' : ''}</span>` : "";
    const crowd = getCrowdForDate(dateStr);
    const crowdLabel = crowd ? `
      <span class="day-crowd tooltip-anchor ${crowdClass(crowd.label)} ${tooltipAlign}" tabindex="0">
        ${crowd.crowd}
        ${buildCrowdTooltipHTML(dateStr, crowd)}
      </span>` : "";

    const toplineHTML = (cashLabel || crowdLabel) ? `<div class="day-topline">${cashLabel}${crowdLabel}</div>` : "";

    el.innerHTML = `
      ${toplineHTML}
      <div class="day-body${period ? " tooltip-anchor" : ""} ${tooltipAlign}">
        <span class="day-number">${d}</span>
        <span class="day-points" style="color: ${period ? period.color : '#333'}">${points ?? "—"}</span>
        <span class="day-type-label">${isWeekend ? "Fri/Sat" : "Sun-Thu"}</span>
        ${periodTooltipHTML}
      </div>
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

const CROWD_LEGEND = [
  { label: "Low", range: "1-2" },
  { label: "Moderate", range: "3-4" },
  { label: "Busy", range: "5-6" },
  { label: "Heavy", range: "7-8" },
  { label: "Extreme", range: "9-10" },
];

function renderCrowdLegend() {
  const el = document.getElementById("crowd-legend-items");
  if (!el) return;
  el.innerHTML = CROWD_LEGEND.map(l => `
    <div class="legend-item">
      <span class="crowd-pill ${crowdClass(l.label)}">${l.range}</span>
      ${l.label}
    </div>
  `).join("");
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
    const dateResort = getResortForStayDate(resort.id, dateStr, resort);
    const pts = getPointsForDate(dateResort, dateStr, state.roomTypeId);
    const cashResult = getCashRateWithFallback(dateResort, dateStr, state.roomTypeId);
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

  const useCustomRate = !inSplitMode && !resortHasCashData && !hasFallbackCash && state.customCashRate;

  summaryContainer.innerHTML = `
    <div class="summary-card${inSplitMode ? " wide" : ""}">
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

    ${buildCrowdSummaryHTML(stayDates)}

    ${!inSplitMode ? buildStayInsightsHTML(resort, state.roomTypeId, stayDates) : ""}

    <div class="summary-card wide">
      <h3>Cost Comparison</h3>

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

      <div class="cost-tiles">
        ${hasCashData ? `
        <div class="cost-tile">
          <div class="cost-tile-label">${useCustomRate ? 'Your cash rate' : 'If booking through Disney'}</div>
          <div class="cost-tile-value rack">$${totalDisneyCash.toLocaleString()}</div>
          <div class="cost-tile-sub">${useCustomRate ? `${stayDates.length} nights × $${state.customCashRate}/night` : `$${(totalDisneyCash / totalPoints).toFixed(2)}/pt`}</div>
          ${anyIsPriorYear ? `<div class="prior-year-note">* Some cash rates based on prior year pricing</div>` : ""}
        </div>
        ` : ""}

        ${state.ownerEnabled ? `
        <div class="cost-tile">
          <div class="cost-tile-label">If using your own points</div>
          <select id="owner-resort" class="cost-tile-select">${buildOwnerResortOptionsHTML()}</select>
          <div class="cost-tile-value owner">$${ownerCost.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
          <div class="cost-tile-sub">${totalPoints} pts · $${ownerDues.toFixed(2)}/pt annual dues</div>
        </div>
        ` : ""}

        ${state.rentalEnabled ? `
        <div class="cost-tile">
          <div class="cost-tile-label">If renting DVC points</div>
          <div class="cost-tile-rate-input">
            <span>$</span><input type="number" id="rental-rate" min="15" max="25" step="0.5" value="${state.rentalRate}"><span>/pt</span>
          </div>
          <div class="cost-tile-value cash">$${rentalValue.toLocaleString()}</div>
          <div class="cost-tile-sub">${totalPoints} pts</div>
          ${hasCashData ? `<div class="cost-tile-savings">save $${Math.round(totalDisneyCash - rentalValue).toLocaleString()} <span class="savings-badge">${savings}% off</span></div>` : ""}
        </div>
        ` : ""}
      </div>
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

  // Attach listeners for the owner-resort select and rental-rate input, now
  // rendered inline inside the Cost Comparison tiles (rebuilt every render).
  const ownerResortSelect = document.getElementById("owner-resort");
  if (ownerResortSelect) {
    ownerResortSelect.addEventListener("change", (e) => {
      state.ownerResortId = e.target.value;
      renderSummary();
    });
  }

  const rentalRateInput = document.getElementById("rental-rate");
  if (rentalRateInput) {
    rentalRateInput.addEventListener("change", (e) => {
      const val = parseFloat(e.target.value);
      if (val >= 15 && val <= 25) state.rentalRate = val;
      renderSummary();
    });
    rentalRateInput.addEventListener("keydown", (e) => {
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

// Alternatives modal: close on backdrop click or Escape
const alternativesModalEl = document.getElementById("alternatives-modal");
alternativesModalEl.addEventListener("click", (e) => {
  if (e.target === alternativesModalEl) closeAlternativesModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && alternativesModalOpen) closeAlternativesModal();
});

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

// Unique resorts (deduplicated by id — dues don't change by year), sorted by name,
// for the owner-resort <select> rendered inline inside the Cost Comparison card.
const OWNER_RESORT_OPTIONS = (() => {
  const seen = new Set();
  const unique = [];
  for (const resort of RESORTS) {
    if (!seen.has(resort.id)) {
      seen.add(resort.id);
      unique.push(resort);
    }
  }
  return unique.sort((a, b) => a.name.localeCompare(b.name));
})();

function buildOwnerResortOptionsHTML() {
  return OWNER_RESORT_OPTIONS.map(resort =>
    `<option value="${resort.id}" ${resort.id === state.ownerResortId ? "selected" : ""}>${resort.name}</option>`
  ).join("");
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
bookingWindowSelect.value = state.bookingWindow;
initCustomSelect(roomSelect);
initCustomSelect(bookingWindowSelect);
initCustomSelect(yearSelect);
updateHint();
renderCalendar();
renderLegend();
renderCrowdLegend();
renderSummary();
