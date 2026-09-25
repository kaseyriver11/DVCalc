// ---- State ----
// Sort resorts alphabetically once at startup
RESORTS.sort((a, b) => a.name.localeCompare(b.name));

// All years present in the data (used internally for cross-year lookups, e.g.
// stays spanning Dec 31 -> Jan 1, or the historical Year-over-Year comparisons).
const ALL_DATA_YEARS = [...new Set(RESORTS.map(r => r.year))].sort();

// The main calendar only offers the current + upcoming years — old historical
// years aren't useful for trip planning here (that's what changes.html is for).
const currentRealYear = new Date().getFullYear();
const upcomingYears = ALL_DATA_YEARS.filter(y => y >= currentRealYear);
const AVAILABLE_YEARS = upcomingYears.length ? upcomingYears : [ALL_DATA_YEARS[ALL_DATA_YEARS.length - 1]];

function resortsForYear(year) {
  return RESORTS.filter(r => r.year === year);
}

const defaultYear = AVAILABLE_YEARS.includes(currentRealYear)
  ? currentRealYear
  : AVAILABLE_YEARS[0];
const defaultResorts = resortsForYear(defaultYear);
const defaultResort = defaultResorts.find(r => r.id === "copperCreek") || defaultResorts[0];

const state = {
  resortId: defaultResort.id,
  roomTypeId: defaultResort.roomTypes[0].id,
  year: defaultYear,
  month: new Date().getMonth(), // 0-indexed, defaults to current month
  checkIn: null,  // "YYYY-MM-DD" or null
  checkOut: null,  // "YYYY-MM-DD" or null
  rentalRate: window.DVCPointValue.RENTAL_DEFAULT,
  rentalEnabled: true, // always on — both cost-comparison tiles are always shown
  ownerEnabled: true,
  ownerResortId: "saratogaSprings",
  customCashRate: null, // user-entered nightly cash rate for resorts without data
  segments: [], // completed split-stay segments: [{ resortId, roomTypeId, checkIn, checkOut }]
  compareMonthStart: null, // 0-11 or null — restricts Stay Insights / the alternatives modal to a travel window
  compareMonthEnd: null,   // 0-11 or null; start > end wraps across the year boundary (e.g. Dec–Apr)
  altCrossResort: false,   // "Find a Better Stay" modal: also search other resorts, not just the current one
  altWdwOnly: false,       // same modal, cross-resort mode: restrict candidates to WDW (Orlando) resorts
  altSameDays: false,      // same modal: only stays that check in (and so check out) on the same weekdays
};

// ---- DOM References ----
const resortSearch = document.getElementById("resort-search");
const resortDropdown = document.getElementById("resort-dropdown");
const resortWrapper = document.getElementById("resort-select-wrapper");
const roomSelect = document.getElementById("room-select");
const contractSelect = document.getElementById("contract-select");
const monthLabel = document.getElementById("month-label");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");
const calendarGrid = document.getElementById("calendar-grid");
const legendItems = document.getElementById("legend-items");
const selectionHint = document.getElementById("selection-hint");
const summaryContainer = document.getElementById("summary");
const actionButtons = document.getElementById("action-buttons");
const controlsToggle = document.getElementById("controls-toggle");
const controlsGroups = document.getElementById("controls-groups");
const controlsToggleLabel = document.getElementById("controls-toggle-label");

// Re-syncs the Room Type picker's trigger label + accordion selection with
// state.roomTypeId. Called from renderCalendar(), which already runs after
// every action that can change room type (resort switch, year switch,
// itinerary load, the accordion pick itself). Booking As/Load Trip's own
// sheets re-render from renderBookingAsControl()/renderItineraryLoadControl()
// directly instead, since those are driven by account data loading/changing
// rather than every calendar render.
function syncCustomSelects() {
  renderRoomTypeAccordion();
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

// Same approach as itineraries.html's own copy -- used wherever a picker
// sheet below interpolates free-typed search text back into its own HTML.
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Small "(!)" hover badge for resorts whose cash rates are estimated rather
// than observed (Aulani, Grand Californian, Vero Beach, Hilton Head -- see
// estimatedCashRates in data.js). Shared by the Cost Comparison tile and the
// trip rail's resort name so the caveat shows up everywhere a cash number
// derived from an estimate is displayed, not just one place.
function estimateBadgeHTML(align = "") {
  return `<span class="tooltip-anchor estimate-badge ${align}">(!)<div class="tooltip-card estimate-tooltip">Cash prices for this resort are estimated, not observed rates, and may not be fully accurate.</div></span>`;
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

// ---- Availability Confidence ----
const NON_WDW_RESORT_IDS = new Set(["aulani", "hiltonHead", "veroBeach", "disneylandHotel", "grandCalifornian"]);

// disney_events.js categories that run for weeks at a time (a whole festival
// or the general holiday season) rather than on specific nights -- shown as
// a single "active during your stay" line in the Special Events & Festivals
// card instead of a marker on every calendar cell they touch.
const BROAD_EVENT_CATEGORIES = new Set(["festival", "seasonal"]);
const EVENT_CATEGORY_LABEL = { hardTicketEvent: "Ticketed Event", runDisney: "Race Weekend", singleDay: "Single Day" };

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

// The booking window a stay would be booked in today: the nearest of
// 11/7/5/3/1 months to how far out check-in is, ties toward the nearer
// window since it quotes the worse odds (same rule as compare.html's
// booking-window chips). Null while check-in is still beyond the
// contract's own window, since nothing can be booked yet.
function currentBookingWindowKey(checkIn, contractMonths) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const [y, m, d] = checkIn.split("-").map(Number);
  const monthsOut = (new Date(y, m - 1, d, 12) - today) / (86400000 * 30.44);
  if (monthsOut > contractMonths) return null;
  let nearest = null;
  for (const months of [11, 7, 5, 3, 1]) {
    if (months > contractMonths) continue;
    if (nearest == null || Math.abs(months - monthsOut) <= Math.abs(nearest - monthsOut)) nearest = months;
  }
  return nearest + "Mo";
}

function availabilityLabel(score, stayLength) {
  if (score === null) return null;
  if (score <= 0.1) return { text: "Not Likely", short: "NL", cls: "avail-very-low", dotCls: "avail-dot-very-low" };

  // Score = average consecutive days available
  // Ratio = how well the typical opening fits your stay
  const ratio = score / stayLength;

  if (ratio >= 1.0) return { text: "Excellent", short: "Ex", cls: "avail-excellent", dotCls: "avail-dot-excellent" };
  if (ratio >= 0.75) return { text: "Good", short: "Gd", cls: "avail-good", dotCls: "avail-dot-good" };
  if (ratio >= 0.5) return { text: "Fair", short: "Fr", cls: "avail-fair", dotCls: "avail-dot-fair" };
  if (ratio >= 0.25) return { text: "Low", short: "Lo", cls: "avail-low", dotCls: "avail-dot-low" };
  return { text: "Not Likely", short: "NL", cls: "avail-very-low", dotCls: "avail-dot-very-low" };
}

// Builds the compact 5-window color-block row (11mo -> 1mo), each block
// hoverable/tappable for the full status label via the shared tooltip-card
// component. The bar itself is only ~34px wide -- too narrow for the full
// word ("Excellent", "Not Likely") at a legible size -- but a 2-letter code
// baked directly into the color still gives an at-a-glance read without
// requiring a tap, unlike a bare color block. The full word stays one
// tap/hover away in the tooltip for anyone who wants it spelled out.
function buildAvailabilityDotsHTML(avail, stayLength) {
  return BOOKING_WINDOWS.map((w, i) => {
    const label = availabilityLabel(avail[w.key], stayLength);
    if (!label) return "";
    const align = i === 0 ? "tooltip-align-left" : i === BOOKING_WINDOWS.length - 1 ? "tooltip-align-right" : "";
    return `
      <div class="avail-dot-col">
        <span class="avail-dot-label">${w.shortLabel}</span>
        <div class="avail-dot ${label.dotCls} tooltip-anchor ${align}">
          <span class="avail-dot-code">${label.short}</span>
          <div class="avail-dot-tooltip tooltip-card">${w.label}: ${label.text}</div>
        </div>
      </div>`;
  }).join("");
}

// When a later window rates better than an earlier one (the Field Guide
// shows this, mostly around Thanksgiving), say so, so it doesn't read as a
// mistake. Rooms come back as people cancel or change their plans.
const AVAIL_RANK = { NL: 0, Lo: 1, Fr: 2, Gd: 3, Ex: 4 };
function availabilityReboundNote(avail, stayLength) {
  const ranks = BOOKING_WINDOWS.map(w => availabilityLabel(avail[w.key], stayLength)).map(l => (l ? AVAIL_RANK[l.short] : null));
  const rebound = ranks.some((r, i) => r != null && ranks.slice(0, i).some(p => p != null && p < r));
  return rebound ? `<div class="avail-note">Odds can improve closer to check-in: rooms open back up as people cancel or change plans.</div>` : "";
}

function buildAvailabilityHTML(resortId, roomTypeId, dates) {
  const avail = getStayAvailability(resortId, roomTypeId, dates);
  if (!avail) return "";
  const stayLength = dates.length;
  const dots = buildAvailabilityDotsHTML(avail, stayLength);
  if (!dots) return "";

  return `
    <div class="summary-card">
      <div class="availability-outlook">
        <h3>Booking Outlook <span class="avail-stay-length">${dates.length} night${dates.length !== 1 ? "s" : ""}</span></h3>
        <div class="avail-dot-row">${dots}</div>
        ${availabilityReboundNote(avail, stayLength)}
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
    const dots = buildAvailabilityDotsHTML(avail, len);
    rows += `
      <div class="avail-segment">
        <div class="avail-segment-name">${seg.name} <span class="avail-stay-length">${len}n</span></div>
        <div class="avail-dot-row">${dots}</div>
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
  let fallbackYear = null;
  let isEstimateCash = false;
  const breakdown = [];
  for (const dateStr of dates) {
    const dateResort = getResortForStayDate(resort.id, dateStr, resort);
    const pts = getPointsForDate(dateResort, dateStr, seg.roomTypeId);
    const cashResult = getCashRateWithFallback(dateResort, dateStr, seg.roomTypeId);
    const cashRate = cashResult ? cashResult.rate : null;
    if (cashResult && cashResult.isPriorYear) { isPriorYearCash = true; fallbackYear = cashResult.fallbackYear; }
    if (cashResult && cashResult.isEstimate) isEstimateCash = true;
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
  return { resort, roomType, dates, totalPoints, totalCash: hasCash ? totalCash : 0, hasCash, isPriorYearCash, fallbackYear, isEstimateCash, breakdown };
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
  // Lock next check-in to previous check-out, and show that month -- the
  // calendar may be on another month (paged away, or a stay handed over
  // from Suggest a Stay while the grid was collapsed).
  state.checkIn = state.checkOut;
  state.checkOut = null;
  state.customCashRate = null;
  if (state.checkIn) {
    const year = Number(state.checkIn.slice(0, 4));
    state.month = Number(state.checkIn.slice(5, 7)) - 1;
    if (year !== state.year && AVAILABLE_YEARS.includes(year)) {
      state.year = year;
      if (getResort()) populateRoomTypes(); // same as paging across a year
    }
  }
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
  syncOwnerResortToBrowsed();
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
  syncResortPickerTrigger();
  populateRoomTypes();
  updateHint();
  renderCalendar();
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

// ---- Resort Picker Sheet ----
// The old searchable-select <input> (still in the DOM, hidden -- see the
// HTML comment above #resort-select-wrapper) is the reason long resort
// names used to clip on narrow screens: an <input> just cuts off overflow
// text with no wrap. The trigger button below shows the SHORT name (always
// fits), and the sheet's rows use white-space:normal so a long full name
// wraps onto a second line instead of clipping.
function syncResortPickerTrigger() {
  const label = document.getElementById("resort-picker-trigger-label");
  const resort = getResort();
  if (label && resort) label.textContent = shorthandResortName(resort.id, resort.name);
  applyResortArtBackground(document.getElementById("resort-picker-trigger"), resort ? getResortImage(resort.id) : null);
}

// Same translucent lavender wash (--color-primary-tint-bg at 82%) used
// everywhere a resort's art (data/resort_images.js) fades in behind an
// element's own content instead of a flat tint fill: the Resort trigger
// button, the drawer's collapsed summary bar, and the selected row in the
// Resort sheet's own list (renderResortSheetList() below). One shared
// string builder so all three stay in sync if the tint ever changes.
function resortArtWashCSS(imagePath) {
  return `linear-gradient(rgba(236, 225, 247, 0.82), rgba(236, 225, 247, 0.82)), url('${imagePath}')`;
}

// Shared by the Resort trigger button above and the drawer's collapsed
// summary bar (updateActiveContextBar() below) -- sets/clears the wash via
// a live element's style, vs. renderResortSheetList() below which needs
// the same CSS value baked into an HTML string instead. No-ops (clears
// back to the element's plain CSS background) when the resort has no art
// yet, which is still most of them.
function applyResortArtBackground(el, imagePath) {
  if (!el) return;
  if (imagePath) {
    el.style.backgroundImage = resortArtWashCSS(imagePath);
    el.classList.add("has-art");
  } else {
    el.style.backgroundImage = "";
    el.classList.remove("has-art");
  }
}

// Sets a plain (non-faded) background image, no tint wash -- used only by
// the Resort sheet's hero banner below, which IS the full photo rather
// than a faded-behind-text treatment.
function setThumbImage(el, imagePath) {
  if (!el) return;
  if (imagePath) {
    el.style.backgroundImage = `url('${imagePath}')`;
    el.hidden = false;
  } else {
    el.style.backgroundImage = "";
    el.hidden = true;
  }
}

function openResortSheet() {
  const search = document.getElementById("resort-sheet-search");
  search.value = "";
  renderResortSheetList("");
  const resort = getResort();
  setThumbImage(document.getElementById("resort-sheet-hero"), resort ? getResortImage(resort.id) : null);
  document.getElementById("resort-sheet").classList.add("open");
}

function closeResortSheet() {
  document.getElementById("resort-sheet").classList.remove("open");
}

function renderResortSheetList(filter) {
  const listEl = document.getElementById("resort-sheet-list");
  if (!listEl) return;
  const query = filter.toLowerCase();
  const matches = resortsForYear(state.year).filter(r => r.name.toLowerCase().includes(query));
  listEl.innerHTML = matches.length === 0
    ? `<div class="sheet-empty">No resorts match "${escapeHTML(filter)}".</div>`
    : matches.map(r => {
      const isSelected = r.id === state.resortId;
      // Selected row only -- same reasoning as the trigger/drawer bar: this
      // marks WHICH resort is active, so the fade only needs to show up on
      // that one row, not on every row that happens to have art.
      const image = isSelected ? getResortImage(r.id) : null;
      const artStyle = image ? ` style="background-image:${resortArtWashCSS(image)}"` : "";
      return `
      <button type="button" class="resort-pick-row${isSelected ? " selected" : ""}${image ? " has-art" : ""}" onclick="pickResort('${r.id}')"${artStyle}>
        <span class="resort-pick-swatch" style="background:${resortAccentColor(r.id)}"></span>
        <span>${r.name}</span>
      </button>
    `;
    }).join("");
}

function pickResort(id) {
  selectResort(id);
  closeResortSheet();
}

// ---- Room Type Accordion ----
// Inline, not a sheet (see the redesign discussion) -- a short flat list
// with no search need, meant to stay low-friction right where the other
// trip settings live rather than adding an extra tap-in/tap-out.
function roomTypeIcon(name) {
  const n = name.toLowerCase();
  if (n.includes("grand villa")) return "\u{1F3E1}"; // house
  if (n.includes("two-bedroom")) return "\u{1F3E0}"; // house (2)
  if (n.includes("one-bedroom")) return "\u{1F6CB}️"; // couch
  if (n.includes("cabin")) return "\u{1F3D5}️"; // camping/cabin
  if (n.includes("studio")) return "\u{1F6CF}️"; // bed
  return "\u{1F6CF}️";
}

function renderRoomTypeAccordion() {
  const resort = getResort();
  if (!resort) return;
  const current = resort.roomTypes.find(rt => rt.id === state.roomTypeId);
  const triggerLabel = document.getElementById("room-type-picker-trigger-label");
  if (triggerLabel && current) {
    triggerLabel.textContent = current.name;
  }
  const grid = document.getElementById("room-type-grid");
  if (!grid) return;
  // Full room names on every tile, same as Record a Booking (2026-09-23 alignment).
  grid.innerHTML = resort.roomTypes.map(rt => {
    const label = rt.name;
    return `
    <button type="button" class="room-type-chip${rt.id === state.roomTypeId ? " selected" : ""}" onclick="pickRoomType('${rt.id}')">
      <span class="room-type-icon">${roomTypeIcon(rt.name)}</span>
      <span class="room-type-name">${label}</span>
      <span class="room-type-sleeps">Sleeps ${rt.sleeps}</span>
    </button>
  `;
  }).join("");
}

function toggleRoomTypeAccordion() {
  const grid = document.getElementById("room-type-grid");
  if (grid) grid.classList.toggle("open");
}

function pickRoomType(id) {
  roomSelect.value = id;
  roomSelect.dispatchEvent(new Event("change", { bubbles: true }));
  const grid = document.getElementById("room-type-grid");
  if (grid) grid.classList.remove("open");
}

// ---- Shared resort accent color ----
// Same hash-to-a-fixed-palette approach as account.html's wallet-card
// gradients (not shared code -- this page doesn't load account.html's
// script -- but the SAME algorithm/palette, so a resort's color reads
// consistently between the Resort sheet's dot and the Booking As sheet's
// wallet-mini-card for that resort).
const RESORT_ACCENT_GRADIENTS = [
  ["#4a148c", "#1a237e"],
  ["#1b5e3a", "#0d3b26"],
  ["#0d47a1", "#082a63"],
  ["#7a1734", "#4a0e20"],
  ["#8d5524", "#5c3612"],
  ["#37474f", "#1c262b"],
];
function resortAccentHash(resortId) {
  let hash = 0;
  for (let i = 0; i < resortId.length; i++) hash = (hash * 31 + resortId.charCodeAt(i)) >>> 0;
  return hash % RESORT_ACCENT_GRADIENTS.length;
}
function resortAccentColor(resortId) {
  return RESORT_ACCENT_GRADIENTS[resortAccentHash(resortId)][0];
}
function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
// Same tinted-gradient-over-photo blend as account.html's walletCardGradient()
// -- with every resort now having real art (data/resort_images.js,
// 2026-09-20), a flat two-tone gradient reads as a placeholder next to it.
// Tinting the gradient down to 0.82 alpha over the photo keeps the dark
// wallet-card look (white text, gold ring) while actually showing the
// resort underneath; falls back to the plain flat gradient if a resort has
// no art yet.
function resortAccentGradient(resortId) {
  const [a, b] = RESORT_ACCENT_GRADIENTS[resortAccentHash(resortId)];
  const image = getResortImage(resortId);
  if (image) {
    return `linear-gradient(135deg, ${hexToRgba(a, 0.82)}, ${hexToRgba(b, 0.82)}), url('${image}')`;
  }
  return `linear-gradient(135deg, ${a}, ${b})`;
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
    trackElevenMonthSniper();
    updateHint();
    renderCalendar();
    renderSummary();
    return;
  }

  // Clicking the current check-in again while a complete range is showing
  // (e.g. after "Edit dates") is a "start over" gesture -- clear both
  // dates instead of re-priming checkIn to the same value, which would
  // silently turn the *next* click into a checkout instead of a fresh
  // check-in.
  if (dateStr === state.checkIn && state.checkOut) {
    state.checkIn = null;
    state.checkOut = null;
    forceExpandCalendar = false;
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
      forceExpandCalendar = false; // a freshly-completed stay collapses into review mode
      trackElevenMonthSniper();
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

function buildEventTooltipHTML(dateStr, events) {
  const itemsHTML = events.map(e => `
    <div>
      <div class="event-tooltip-item-name">${e.name}${e.park ? ` <span style="font-weight:400;color:#999;">· ${e.park}</span>` : ""}</div>
      <div class="event-tooltip-item-desc">${e.description}</div>
    </div>
  `).join("");

  return `
    <div class="event-tooltip tooltip-card">
      <div class="event-tooltip-header">${formatDisplayDate(dateStr)}</div>
      <div class="event-tooltip-list">${itemsHTML}</div>
      <div class="event-tooltip-footer">Disney Food Blog</div>
    </div>
  `;
}

// Replaces the old Crowd Forecast card -- crowd levels are already
// benchmarked in Stay Insights' distribution chart and on every calendar
// cell, so a third restatement here didn't earn its space. This surfaces
// something the other two views don't: which festivals and ticketed events
// actually overlap the picked stay. Broad, weeks-long windows (festival/
// seasonal) get one "active during your stay" line; genuinely date-specific
// events (ticketed parties, race weekends, single-day) list which nights of
// the stay they land on, since those are worth planning around.
function buildSpecialEventsHTML(resort, stayDates) {
  if (NON_WDW_RESORT_IDS.has(resort.id)) return "";
  if (stayDates.length === 0 || typeof getEventsForDate !== "function") return "";

  const byEvent = new Map();
  stayDates.forEach(d => {
    getEventsForDate(d).forEach(e => {
      if (!byEvent.has(e.name)) byEvent.set(e.name, { event: e, dates: [] });
      byEvent.get(e.name).dates.push(d);
    });
  });

  if (byEvent.size === 0) {
    return `
      <div class="summary-card">
        <h3>Special Events &amp; Festivals</h3>
        <div class="special-event-empty">No major festivals or ticketed events scheduled during this stay.</div>
      </div>
    `;
  }

  const festivals = [];
  const dateSpecific = [];
  byEvent.forEach(entry => (BROAD_EVENT_CATEGORIES.has(entry.event.category) || entry.event.selectNights ? festivals : dateSpecific).push(entry));

  const festivalsHTML = festivals.map(({ event }) => `
    <div class="special-event">
      <div class="special-event-name">${event.name}</div>
      <div class="special-event-dates">${formatShortDate(event.startDate)} &ndash; ${formatShortDate(event.endDate)}${event.selectNights ? " &middot; select nights only" : ""}</div>
      <div class="special-event-desc">${event.description}</div>
    </div>
  `).join("");

  const dateSpecificHTML = dateSpecific.map(({ event, dates }) => `
    <div class="special-event ticketed">
      <div class="special-event-badge">${EVENT_CATEGORY_LABEL[event.category] || "Event"}</div>
      <div class="special-event-name">${event.name}</div>
      <div class="special-event-dates">Active on ${dates.map(d => formatShortDate(d)).join(", ")}</div>
      <div class="special-event-desc">${event.description}</div>
    </div>
  `).join("");

  return `
    <div class="summary-card">
      <h3>Special Events &amp; Festivals</h3>
      ${festivals.length > 0 ? `
      <div class="special-event-group-label">Active Festivals</div>
      <div class="special-event-list">${festivalsHTML}</div>
      ` : ""}
      ${dateSpecific.length > 0 ? `
      <div class="special-event-group-label">Date-Specific Events</div>
      <div class="special-event-list">${dateSpecificHTML}</div>
      ` : ""}
      <a class="resort-alert-footer" href="https://www.disneyfoodblog.com/wdwcalendar" target="_blank" rel="noopener">Disney Food Blog</a>
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
function computeCompareWindowStats(resort, roomTypeId, nights, { allYear = false } = {}) {
  const { compareMonthStart: start, compareMonthEnd: end } = allYear ? {} : state;
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

function compareRangeLabel(startYear, endYear, { allYear = false } = {}) {
  const { compareMonthStart: start, compareMonthEnd: end } = allYear ? {} : state;
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

// Green (low/good) -> red (high/bad) for metrics where lower is unambiguously
// better (crowd, points) -- pct is the same percentile the callout text
// already shows, so the bar's color and its "busier/more points than X%"
// sentence always agree. Deliberately not used for cash price -- the Value
// Score elsewhere in this same card treats a *high* cash-per-point as the
// favorable direction, so coloring raw cash red-for-expensive would
// contradict that right next to it.
function distGoodBadColor(pct) {
  const hue = 120 - (pct / 100) * 120; // 120 = green, 0 = red
  return `hsl(${hue}, 65%, 42%)`;
}

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
  const currentColor = opts.colorScale ? distGoodBadColor(pct) : null;

  const bars = bins.map((count, i) => {
    const heightPct = count === 0 ? 2 : Math.max((count / maxCount) * 100, 8);
    const binLo = min + (i / DIST_BIN_COUNT) * span;
    const binHi = min + ((i + 1) / DIST_BIN_COUNT) * span;
    const binPct = Math.round((count / total) * 100);
    const align = i <= 1 ? "tooltip-align-left" : i >= DIST_BIN_COUNT - 2 ? "tooltip-align-right" : "";
    const isCurrent = i === currentBin;
    const barStyle = `height:${heightPct}%${isCurrent && currentColor ? `;background:${currentColor}` : ""}`;
    return `
      <div class="dist-bar-anchor tooltip-anchor ${align}">
        <div class="dist-bar${isCurrent ? " current" : ""}" style="${barStyle}"></div>
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
      <div class="value-score-badge tooltip-anchor ${VALUE_SCORE_CLASS[rounded]}">
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
function buildCrossResortCandidates(category, nights, todayStr, wdwOnly) {
  const resortIds = [...new Set(RESORTS.map(r => r.id))];
  let candidates = [];
  for (const resortId of resortIds) {
    if (wdwOnly && NON_WDW_RESORT_IDS.has(resortId)) continue;
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

  const { stats, totalAvailable, startYear, endYear } = computeCompareWindowStats(resort, roomTypeId, nights, { allYear: true });
  const rangeLabel = compareRangeLabel(startYear, endYear, { allYear: true });

  if (totalAvailable === 0) {
    return `
      <div class="summary-card wide">
        <h3>Stay Insights</h3>
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
      colorScale: true,
    }));
  }
  if (pointsOk) {
    distSections.push(buildDistributionHTML(pointsValues, currentEntry.points, {
      title: "Points cost",
      format: v => Math.round(v).toLocaleString(),
      unit: " points",
      calloutText: pct => pct == null ? "" : `More points than <strong>${pct}%</strong> of all ${nights}-night stays ${rangeLabel}`,
      colorScale: true,
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
      <div class="card-header-row">
        <h3>Stay Insights</h3>
        <button class="find-alt-btn" onclick="openAlternativesModal()">Find Alternatives</button>
      </div>
      <div class="dist-subtitle">vs. every other ${nights}-night stay at ${resort.name} ${rangeLabel}</div>

      ${valueScoreHTML}

      ${distContent.length ? `<div class="dist-grid">${distContent.join("")}</div>` : ""}
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

function setAltWdwOnly(checked) {
  state.altWdwOnly = checked;
  renderAlternativesModal();
}

function setAltSameDays(checked) {
  state.altSameDays = checked;
  renderAlternativesModal();
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const weekdayOf = dateStr => new Date(dateStr + "T12:00:00").getDay();

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
    candidates = buildCrossResortCandidates(category, nights, todayStr, state.altWdwOnly)
      .filter(c => !(c.resortId === resort.id && c.roomTypeId === state.roomTypeId && c.checkIn === stayDates[0]));
  } else {
    candidates = stats
      .filter(s => s.checkIn !== stayDates[0] && s.checkIn >= todayStr)
      .map(s => ({ ...s, resortId: resort.id, roomTypeId: state.roomTypeId, resortName: resort.name }));
  }
  // Same length, so a matching check-in weekday means matching check-out
  // too (a Thu-Mon stay only gets Thu-Mon suggestions).
  const checkInDay = weekdayOf(stayDates[0]);
  const daysLabel = `${WEEKDAY_SHORT[checkInDay]} &ndash; ${WEEKDAY_SHORT[weekdayOf(dateStrPlusDays(stayDates[0], nights))]}`;
  if (state.altSameDays) candidates = candidates.filter(c => weekdayOf(c.checkIn) === checkInDay);

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
    ${state.altCrossResort ? `
    <label class="alt-cross-toggle">
      <input type="checkbox" id="alt-wdw-only" ${state.altWdwOnly ? "checked" : ""}>
      WDW (Orlando) only
    </label>
    ` : ""}
    <label class="alt-cross-toggle">
      <input type="checkbox" id="alt-same-days" ${state.altSameDays ? "checked" : ""}>
      Keep the same days (${daysLabel})
    </label>
    <div class="dist-subtitle">vs. every other ${nights}-night stay${state.altSameDays ? ` from ${daysLabel}` : ""} ${state.altCrossResort ? "across resorts offering this room type" : `at ${resort.name}`} ${rangeLabel}</div>
    ${body}
  `;

  document.getElementById("alt-cross-resort").addEventListener("change", (e) => setAltCrossResort(e.target.checked));
  document.getElementById("alt-wdw-only")?.addEventListener("change", (e) => setAltWdwOnly(e.target.checked));
  document.getElementById("alt-same-days").addEventListener("change", (e) => setAltSameDays(e.target.checked));
}

function applyAlternativeStay(checkInStr, nights, resortId, roomTypeId) {
  forceExpandCalendar = false;
  const year = Number(checkInStr.split("-")[0]);
  if (year !== state.year) {
    state.year = year;
  }
  if (resortId && resortId !== state.resortId) {
    state.resortId = resortId;
    syncOwnerResortToBrowsed();
  }
  if (roomTypeId) state.roomTypeId = roomTypeId;
  resortSearch.value = getResort().name;
  populateRoomTypes(); // keeps the current room type if it still exists, else falls back
  state.checkIn = checkInStr;
  state.checkOut = dateStrPlusDays(checkInStr, nights);
  state.month = Number(checkInStr.split("-")[1]) - 1;
  updateHint();
  renderCalendar();
  renderSummary();
  closeAlternativesModal();
}

// ---- Render Calendar ----
// ---- Account/Contract Personalization ----
// Deliberately NOT part of `state` -- state gets wholesale-serialized to
// sessionStorage for the index<->compare handoff (see saveStateToSession()
// below), and contract data would go stale the moment it changes elsewhere.
// This is a separate module-scope pair, refreshed on auth changes.
let userContracts = [];          // every contract for the signed-in user (active + inactive)
let userContractYearPoints = []; // that user's contract_year_points rows, across all contracts
let selectedContractId = null;   // which one the user is browsing "as", or null

// ---- Multi-Contract Split (points across MULTIPLE contracts) UI state ----
// Deliberately named "multiContractSplit", never "splitMode"/"split" alone
// -- isSplitMode() elsewhere in this file means a SPLIT STAY (multiple
// resorts in one itinerary), a completely different concept from this
// (one stay, paid for out of more than one contract's points).
let multiContractSplitMode = false;
// { pointsNeeded, byContractId: { [contractId]: points } } -- same
// staleness guard: only trusted while pointsNeeded
// matches the active stay, so switching stays discards a stale split
// rather than silently carrying over amounts that no longer add up.
let multiContractAllocations = null;

// ---- 11-to-7 Swap Simulator (Task 04) UI state ----
// Only meaningful while booking the actual home resort at 11 months --
// see buildSwapSimulatorHTML()'s own gating comment.
let swapTargetResortId = null;
let swapTargetRoomTypeId = null;

function getActiveContracts() {
  return userContracts.filter(c => c.is_active);
}

function getSelectedContract() {
  return getActiveContracts().find(c => c.id === selectedContractId) || null;
}

// Shared with account.html -- see dvc-dates.js (loaded before this file).
// Previously a separate copy here used the browser's local time instead of
// Eastern time, which could disagree with account.html's deadline math for
// visitors outside Eastern right around a use-year boundary.
function currentUYYear(useYear) {
  return window.DVCDates.currentUYYear(useYear, window.DVCDates.todayInEastern());
}

// A planning balance belongs to the stay's use year, not the booking date.
// With no check-in selected, show today's cycle. Untouched years retain
// the same annual-allotment default as My Contracts and are labeled estimates.
function getStayYearRow(c, date = state.checkIn) {
  const parts = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.split('-').map(Number) : null;
  const year = parts ? window.DVCDates.currentUYYear(c.use_year, { year: parts[0], month: parts[1], day: parts[2] }) : currentUYYear(c.use_year);
  const row = userContractYearPoints.find(r => r.contract_id === c.id && r.use_year_label === year);
  return row?.balance_confirmed_at
    ? { year, recorded: true, remaining: row.points_remaining, banked: row.points_banked || 0, borrowed: row.points_borrowed || 0, holding: row.points_holding || 0, holdingEnteredAt: row.points_holding_entered_at || null }
    : { year, recorded: false, remaining: 0, banked: 0, borrowed: 0, holding: 0, holdingEnteredAt: null };
}

// Points recorded for the selected stay cycle: remaining plus banked-in,
// borrowed in from next year, or parked in Holding from a near-check-in
// cancellation (see dvc-ledger.js).
function stayYearLabel(contract, row) {
  const month = window.DVCDates.USE_YEAR_START_MONTH[contract.use_year];
  const start = new Date(Date.UTC(row.year, month - 1, 1));
  const end = new Date(window.DVCDates.useYearExpiration(contract.use_year, row.year));
  const format = d => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  return format(start) + ' &ndash; ' + format(end) + (row.recorded ? ' recorded balance' : ' balance not confirmed');
}
function stayYearGroups(contract, dates) {
  const groups = new Map();
  for (const date of dates) {
    const row = getStayYearRow(contract, date);
    if (!groups.has(row.year)) groups.set(row.year, { row, dates: [] });
    groups.get(row.year).dates.push(date);
  }
  return [...groups.values()];
}
// The usual fix for a shortfall in one cycle of a stay that spans use years
// is to borrow from the next cycle (DVC allows up to 100% of next year's
// points). Name it when the next year's recorded balance can cover it, so
// the owner isn't sent to My Contracts to work out what to do.
function crossYearBorrowHint(contract, row, shortfall) {
  const next = userContractYearPoints.find(r => r.contract_id === contract.id && r.use_year_label === row.year + 1);
  if (!next?.balance_confirmed_at || (next.points_remaining || 0) < shortfall) return '';
  return ` Borrowing ${shortfall} pts from your ${row.year + 1} use year (${next.points_remaining} recorded) would cover it -- borrow on Disney's site first, then <a href="account.html?contract=${encodeURIComponent(contract.id)}&year=${row.year}">record it in My Contracts</a>.`;
}
function buildCrossYearDrawHTML(contract, resort, dates) {
  const groups = stayYearGroups(contract, dates);
  return '<div class="smart-draw-card"><div class="smart-draw-title">This stay spans use years</div>' + groups.map(group => {
    if (!group.row.recorded) return `<div class="smart-draw-guardrail warning">${stayYearLabel(contract, group.row)}. <a href="account.html?contract=${encodeURIComponent(contract.id)}&year=${group.row.year}">Confirm this balance</a> before assessing these nights.</div>`;
    const points = computeStayEntry(resort, state.roomTypeId, group.dates).points;
    if (points == null) return '<div class="smart-draw-guardrail warning">Point chart unavailable for part of this stay. Review each date range separately.</div>';
    const draw = computeSmartDraw(group.row, points);
    const available = group.row.remaining + group.row.banked + group.row.borrowed + group.row.holding;
    return `<div class="smart-draw-guardrail ${draw.shortfall ? 'warning' : 'ok'}"><strong>${stayYearLabel(contract, group.row)}</strong><br>${group.dates.length} night(s): ${points} pts needed / ${available} available. ${draw.shortfall ? 'Short by ' + draw.shortfall + ' pts in this use year.' + crossYearBorrowHint(contract, group.row, draw.shortfall) : (available - points) + ' pts projected left in this use year.'}</div>`;
  }).join('') + '<div class="smart-draw-footer">Each night uses its applicable cycle. Balances are not combined or moved between years. Review banking or borrowing in My Contracts if needed.</div><button type="button" class="smart-draw-apply-btn" onclick="logTripFromCalendar()">Record this booking</button></div>';
}

function getAvailablePoints(c) {
  const { remaining, banked, borrowed, holding } = getStayYearRow(c);
  return remaining + banked + borrowed + holding;
}

// Which point buckets to draw from for a stay, in priority order: Holding
// first (can't be banked/borrowed and can only book within 60 days of
// check-in, per dvc-ledger.js -- the most "use it or lose it"
// bucket of the four), then banked-in points (already irreversible, can't
// be re-banked if unused), then already-borrowed-in points (same
// irreversibility), then native current-year points last (still bankable
// up until this use year's own deadline). Pure function, no DOM/network --
// `after` is a preview only; calendar planning never writes ledger balances.
function computeSmartDraw(currentRow, pointsNeeded) {
  let need = pointsNeeded;
  const drawHolding = Math.min(currentRow.holding, need); need -= drawHolding;
  const drawBanked = Math.min(currentRow.banked, need); need -= drawBanked;
  const drawBorrowed = Math.min(currentRow.borrowed, need); need -= drawBorrowed;
  const drawRemaining = Math.min(currentRow.remaining, need); need -= drawRemaining;
  return {
    draws: { holding: drawHolding, banked: drawBanked, borrowed: drawBorrowed, remaining: drawRemaining },
    shortfall: Math.max(0, need),
    after: {
      holding: currentRow.holding - drawHolding,
      banked: currentRow.banked - drawBanked,
      borrowed: currentRow.borrowed - drawBorrowed,
      remaining: currentRow.remaining - drawRemaining,
    },
  };
}

// How many months out someone can book a given resort under a single
// contract: 11 (home resort), 7 (other resort this contract can reach), or
// null (this contract can never book there -- see the resale-restriction
// rule in auth.js). Reuses DVCAuth.getUserResortAccess() with a one-contract
// array, since that function already unions correctly over any array length.
function getContractWindowMonths(contract, resortId) {
  if (!contract || !window.DVCAuth) return null;
  const allIds = [...new Set(RESORTS.map(r => r.id))];
  const access = window.DVCAuth.getUserResortAccess([contract], allIds);
  if (access.homeResortIds.has(resortId)) return 11;
  if (access.sevenMoResortIds.has(resortId)) return 7;
  return null;
}

// Distinguishes the two different reasons a resort can be blocked for a
// contract -- "this contract can ONLY ever book its home resort" (true only
// when the contract's OWN home resort is one of the three home-only resale
// resorts) vs. "this contract has normal 7-month reach elsewhere, just not
// to this one specific resort" (true for a normal resale contract hitting
// one of the three restricted resorts as its *target*, not its home). A
// resort being blocked doesn't imply the whole contract is home-only --
// conflating those two produced an actual wrong claim about what the
// contract can book, not just an unclear message.
function contractIsHomeOnly(contract) {
  if (!contract || !window.DVCAuth || contract.purchase_type === "direct") return false;
  const allIds = [...new Set(RESORTS.map(r => r.id))];
  const access = window.DVCAuth.getUserResortAccess([contract], allIds);
  return access.sevenMoResortIds.size === 0;
}

// Last bookable date (YYYY-MM-DD) for a given lead time in months from today,
// or null if unrestricted. Mirrors the date math the old Booking Window
// dropdown used, but now driven by real contract data instead of a manual
// toggle -- see docs/accounts_plan.md, Phase 3.
function monthsFromTodayCutoff(months) {
  if (months == null) return null;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setMonth(cutoff.getMonth() + months);
  return formatDate(cutoff.getFullYear(), cutoff.getMonth(), cutoff.getDate());
}

// The actual calendar date a booking window OPENS for a given check-in date
// -- checkIn minus N months, YYYY-MM-DD. Used by the Multi-Contract Split
// allocator to tell an owner exactly when a non-home (7-month) contract's
// window opens for the stay they're planning, not just that it isn't open
// yet (monthsFromTodayCutoff() above answers that half).
function monthsBeforeCheckIn(dateStr, months) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setMonth(dt.getMonth() - months);
  return formatDate(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

// "11-Month Sniper" badge event (dvc-badges.js's evaluateEventBadges()):
// fires when the owner picks a stay whose check-in is 10-11 months out at
// one of their OWN home resorts -- the stretch in which that specific
// stay's 11-month window opens.
//
// The home-resort gate is deliberate, not incidental: 11 months is purely
// a home-resort privilege, so eyeing a NON-home resort that far out isn't
// sniping, it's a stay literally nobody can book yet (it opens to everyone
// at 7 months). An owner with no active contracts never fires it for the
// same reason -- there's no 11-month priority to be early for. That gate
// is what keeps the badge's name true to its mechanic, the same standard
// that got Holiday Chaser renamed to Main Event.
//
// An owner can hold contracts at SEVERAL resorts and gets 11-month
// priority at every one of them -- there is no "primary" home resort and
// no "currently selected contract" involved here. So the gate asks
// getUserResortAccess() for the UNION of home resorts across every active
// contract (the same union compare.html/itinerarycompare.html use), not
// getContractWindowMonths() against one contract at a time. Inactive
// contracts are excluded: a sold contract confers no priority.
//
// Called from handleDateClick()'s two stay-completion points ONLY (the
// normal path and the split-stay path) -- deliberately NOT from the
// session-restore path at the bottom of this file, which rehydrates a
// stay via Object.assign(state, restored) after a suggest.html or
// compare.html handoff. This badge rewards the act of picking dates in
// the 11-month window yourself; a stay handed over from another page
// wasn't picked here, and restoring it on every page load would inflate
// the count for one decision. Keep new callers to genuine user picks.
//
// Fire-and-forget through DVCTrack, which already no-ops when signed out.
function trackElevenMonthSniper() {
  if (!window.DVCTrack || !window.DVCDates || !window.DVCAuth) return;
  if (!window.DVCDates.isInFinalWindowMonth(state.checkIn, 11)) return;
  const activeContracts = userContracts.filter(c => c.is_active);
  if (activeContracts.length === 0) return;
  const allIds = [...new Set(RESORTS.map(r => r.id))];
  const { homeResortIds } = window.DVCAuth.getUserResortAccess(activeContracts, allIds);
  if (homeResortIds.has(state.resortId)) window.DVCTrack.track("eleven-month-sniper");
}

async function refreshUserContracts() {
  if (window.DVCAuth) {
    [userContracts, userContractYearPoints] = await Promise.all([
      window.DVCAuth.getContracts(),
      window.DVCAuth.getContractYearPoints(),
    ]);
  } else {
    userContracts = [];
    userContractYearPoints = [];
  }
  if (!getActiveContracts().some(c => c.id === selectedContractId)) selectedContractId = null;
  if (state.bookingOwnerId === window.DVCAuth.getSession()?.user?.id) {
    selectedContractId = getActiveContracts().some(c => c.id === state.bookingContractId) ? state.bookingContractId : null;
  }
  applyOwnerDefault();
  renderBookingAsControl();
  renderSummary();
  renderCalendar();
}

// A fresh visit (nothing restored or handed off) starts as the owner's first
// contract at its home resort instead of "Just browsing" Copper Creek. Runs
// once, and only while the calendar is still untouched.
function applyOwnerDefault() {
  if (!ownerDefaultPending) return;
  ownerDefaultPending = false;
  const first = getActiveContracts()[0];
  if (!first || selectedContractId || state.checkIn || state.resortId !== defaultResort.id) return;
  selectedContractId = first.id;
  state.bookingContractId = first.id;
  state.bookingOwnerId = window.DVCAuth.getSession()?.user?.id;
  syncOwnerResortToContract(first);
  if (RESORTS.some(r => r.id === first.home_resort_id && r.year === state.year)) selectResort(first.home_resort_id);
}

// Owner Cost prices the stay at the dues of the contract you're booking as.
// Picking a resort in the Owner tile afterwards still overrides it.
// With no contract selected and no manual pick, "If using your own points"
// prices dues at the resort being browsed -- a visitor looking at Copper
// Creek shouldn't see Saratoga Springs dues (the old hardcoded default).
function syncOwnerResortToBrowsed() {
  if (state.ownerResortPicked || getSelectedContract()) return;
  if (DUES_PER_POINT[state.resortId]) state.ownerResortId = state.resortId;
}
function syncOwnerResortToContract(contract) {
  if (contract && DUES_PER_POINT[contract.home_resort_id]) state.ownerResortId = contract.home_resort_id;
}

function setSelectedContract(id) {
  selectedContractId = id || null;
  syncOwnerResortToContract(getSelectedContract());
  state.bookingContractId = selectedContractId;
  state.bookingOwnerId = window.DVCAuth.getSession()?.user?.id;
  renderBookingAsControl();
  renderSummary();
  renderCalendar();
}

// auth.js's module script resolves imports asynchronously -- poll briefly
// for window.DVCAuth rather than assuming it's ready this soon (same
// reasoning as auth.js's own header-control code and account.html).
let isSignedIn = false;

function initAccountPersonalization(attempts) {
  if (window.DVCAuth) {
    window.DVCAuth.onAuthChange((session) => {
      isSignedIn = !!session;
      if (!session || (state.itineraryEdit && state.itineraryEdit.ownerId !== session.user.id)) {
        showingItinerarySaveForm = false;
        itinerarySaveStatus = null;
        itineraryNameDraft = null;
      }
      if (session) {
        refreshUserContracts();
        refreshUserItineraries();
      } else {
        userContracts = [];
        userContractYearPoints = [];
        selectedContractId = null;
        userItineraries = [];
        renderBookingAsControl();
        renderItineraryLoadControl();
        renderSummary();
        renderCalendar();
      }
    });
  } else if (attempts > 0) {
    setTimeout(() => initAccountPersonalization(attempts - 1), 50);
  }
}

// ---- Saved Itineraries ----
// Same reasoning as userContracts above for staying out of `state`: this is
// session-derived UI state for the save-form, not calendar selection state.
let showingItinerarySaveForm = false;
let itineraryNameDraft = null;
let itinerarySaveStatus = null; // "saving" | "saved" | "error" | null
let userItineraries = []; // for the "load a saved itinerary" dropdown
let itinerarySaveMode = 'new';
let itinerarySaveError = '';
function editingItinerary() {
  return state.itineraryEdit?.ownerId === window.DVCAuth?.getSession()?.user?.id ? state.itineraryEdit : null;
}

async function refreshUserItineraries() {
  userItineraries = window.DVCAuth ? await window.DVCAuth.getItineraries() : [];
  renderItineraryLoadControl();
}

// Applies a saved itinerary straight into the live calendar state -- no
// navigation needed since we're already on this page (unlike
// itineraries.html's Load button, which has to hand off through
// sessionStorage because it's a different page entirely). Same segment
// unpacking logic as that handoff: the last segment becomes the active
// selection, everything before it becomes completed split-stay segments.
function loadItineraryIntoCalendar(itinerary) {
  if (itinerarySaveStatus === 'saving') return;
  forceExpandCalendar = false;
  const segs = itinerary.segments;
  if (!segs || !segs.length) return;
  const last = segs[segs.length - 1];
  const completed = segs.slice(0, -1);

  state.year = itinerary.year;
  state.resortId = last.resortId;
  state.roomTypeId = last.roomTypeId;
  state.checkIn = last.checkIn;
  state.checkOut = last.checkOut;
  state.month = Number(last.checkIn.split("-")[1]) - 1;
  state.segments = completed;
  state.itineraryEdit = {id:itinerary.id,name:itinerary.name,ownerId:window.DVCAuth.getSession()?.user?.id};
  state.itineraryPendingSave = null;
  state.bookingContractId = itinerary.booking_contract_id || null;
  state.bookingOwnerId = window.DVCAuth.getSession()?.user?.id;
  selectedContractId = getActiveContracts().some(c=>c.id===state.bookingContractId) ? state.bookingContractId : null;
  showingItinerarySaveForm = false;
  itineraryNameDraft = null;
  itinerarySaveStatus = null;

  resortSearch.value = getResort().name;
  populateRoomTypes();
  roomSelect.value = state.roomTypeId;
  renderBookingAsControl();
  updateHint();
  renderCalendar();
  renderSummary();
}

// The full ordered list of segments an itinerary save would capture: any
// already-completed split-stay segments, plus the current in-progress
// selection appended as the final segment (mirrors how allSegmentTotals is
// built in renderSummary() for display -- same "completed + current" shape).
function getFullItinerarySegments() {
  const segs = state.segments.map(s => ({ ...s }));
  if (state.checkIn && state.checkOut) {
    segs.push({
      resortId: state.resortId,
      roomTypeId: state.roomTypeId,
      checkIn: state.checkIn,
      checkOut: state.checkOut,
    });
  }
  return segs;
}

// Same short "Sep 11" shape as formatDisplayDate(), just without the
// weekday -- suggestItineraryName() below is the only caller that wants a
// bare date; every other formatDisplayDate() call site (check-in/check-out
// labels, etc.) still wants the weekday for a real date, not a name.
function formatShortDate(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function suggestItineraryName() {
  const segs = getFullItinerarySegments();
  if (segs.length === 0) return "";
  if (segs.length === 1) {
    const resort = RESORTS.find(r => r.id === segs[0].resortId && r.year === state.year);
    const fullName = resort ? resort.name : segs[0].resortId;
    const name = shorthandResortName(segs[0].resortId, fullName);
    const roomType = resort ? resort.roomTypes.find(rt => rt.id === segs[0].roomTypeId) : null;
    const parts = [name, formatShortDate(segs[0].checkIn)];
    if (roomType) parts.push(roomType.name);
    return parts.join(", ");
  }
  return `${segs.length}-Resort Trip, ${formatShortDate(segs[0].checkIn)}`;
}

function openItinerarySaveForm(mode) {
  if (itinerarySaveStatus === 'saving') return;
  const editing = editingItinerary();
  itinerarySaveMode = mode || (editing ? 'update' : 'new');
  showingItinerarySaveForm = true;
  itineraryNameDraft = editing ? editing.name + (itinerarySaveMode === 'copy' ? ' (copy)' : '') : suggestItineraryName();
  itinerarySaveStatus = null;
  renderSummary();
}

function closeItinerarySaveForm() {
  if (itinerarySaveStatus === 'saving') return;
  showingItinerarySaveForm = false;
  itineraryNameDraft = null;
  itinerarySaveStatus = null;
  renderSummary();
}

async function confirmSaveItinerary() {
  if (itinerarySaveStatus === 'saving' || itinerarySaveStatus === 'saved') return;
  const input = document.getElementById("itinerary-name-input");
  const name = (input?.value || "").trim();
  if (!name) {
    itinerarySaveStatus = 'error';
    itinerarySaveError = 'Enter a name for this itinerary.';
    renderSummary();
    return;
  }
  itineraryNameDraft = name;
  const ownerId = window.DVCAuth.getSession()?.user?.id;
  const editing = editingItinerary();
  if (!ownerId || (itinerarySaveMode === 'update' && !editing)) {
    itinerarySaveStatus = 'error';
    itinerarySaveError = 'Sign in to the account that owns this itinerary, then load it again.';
    renderSummary();
    return;
  }
  itinerarySaveStatus = "saving";
  renderSummary();
  const payload = {
    name,
    year: state.year,
    segments: getFullItinerarySegments(),
    booking_contract_id: getSelectedContract()?.id || null,
  };
  try {
    let result;
    if (itinerarySaveMode === 'update') {
      result = await window.DVCAuth.updateItinerary(editing.id, payload);
    } else {
      if (state.itineraryPendingSave?.ownerId !== ownerId || state.itineraryPendingSave?.mode !== itinerarySaveMode) {
        state.itineraryPendingSave = {ownerId,mode:itinerarySaveMode,id:crypto.randomUUID()};
      }
      result = await window.DVCAuth.addItinerary({...payload,id:state.itineraryPendingSave.id});
    }
    if (result.error || !result.data) throw new Error(result.error || 'No saved itinerary was returned.');
    if (window.DVCAuth.getSession()?.user?.id !== ownerId) return;
    state.itineraryEdit = {id:result.data.id,name,ownerId};
    state.itineraryPendingSave = null;
  } catch (error) {
    itinerarySaveStatus = "error";
    itinerarySaveError = error.message === window.DVCAuth.MEMBERSHIP_REQUIRED_ERROR
      ? error.message
      : `Could not confirm the save. ${error.message || 'Please retry.'} Your itinerary and name are still here.`;
    renderSummary();
    return;
  }
  itinerarySaveStatus = "saved";
  renderSummary();
  refreshUserItineraries();
  setTimeout(() => {
    showingItinerarySaveForm = false;
    itineraryNameDraft = null;
    itinerarySaveStatus = null;
    renderSummary();
  }, 1500);
}

// Once a complete single-resort stay is picked, the full calendar collapses
// into a compact trip-rail card and the summary panel expands into a wider
// insights grid (see renderLayoutMode()) -- "review mode". This flag is the
// escape hatch: clicking "Edit dates" on the trip rail forces the full
// calendar back open without losing the current selection. It resets
// whenever a fresh stay gets completed (handleDateClick) or cleared
// (clearSelection), so review mode kicks back in the next time a complete
// range is picked. Deliberately NOT part of `state` -- purely a UI-layout
// toggle, not something worth persisting across the index<->compare handoff.
let forceExpandCalendar = false;

function isReviewMode() {
  return !isSplitMode() && getStayDates().length > 0 && !forceExpandCalendar;
}

function expandCalendarForEditing() {
  forceExpandCalendar = true;
  renderCalendar();
  renderSummary();
}

// Toggles which calendar-side view is visible (full grid vs. trip rail) and
// whether the summary-side is in its narrow single-column or wide grid
// layout. Called from the tail of renderCalendar()/renderSummary() rather
// than threaded through every caller of those two.
function renderLayoutMode() {
  const reviewMode = isReviewMode();
  const fullCalendarEl = document.getElementById("full-calendar-view");
  const tripRailEl = document.getElementById("trip-rail-view");
  if (fullCalendarEl) fullCalendarEl.style.display = reviewMode ? "none" : "";
  if (tripRailEl) tripRailEl.style.display = reviewMode ? "" : "none";
  document.querySelector(".calendar-side")?.classList.toggle("collapsed", reviewMode);
  document.querySelector(".summary-side")?.classList.toggle("expanded", reviewMode);
  if (reviewMode) renderTripRail();
}

// Compact "trip rail" card that replaces the full calendar grid in review
// mode -- resort/room, dates, a mini per-night points strip (same period
// colors as the real grid), and an Edit dates button back to the full view.
function renderTripRail() {
  const el = document.getElementById("trip-rail-view");
  if (!el) return;
  const totals = calcCurrentSegmentTotals();
  if (!totals) { el.innerHTML = ""; return; }

  const resort = totals.resort;

  // A couple of days on either side of the stay, shown dimmed/dashed --
  // clicking one extends check-in/check-out to include it (adjustTripEdge()
  // below). Clicking the first or last *real* night shrinks the stay
  // instead. Interior nights aren't clickable -- removing one would split
  // the stay into two ranges, which the check-in/check-out model can't
  // represent.
  const CONTEXT_DAYS = 2;
  const firstNight = totals.breakdown[0].date;
  const lastNight = totals.breakdown[totals.breakdown.length - 1].date;
  const beforeDates = [];
  for (let i = CONTEXT_DAYS; i >= 1; i--) beforeDates.push(dateStrPlusDays(firstNight, -i));
  const afterDates = [];
  for (let i = 0; i < CONTEXT_DAYS; i++) afterDates.push(dateStrPlusDays(totals.checkOut, i));

  function buildChip(dateStr, { isContext, isEdge }) {
    const dateResort = getResortForStayDate(resort.id, dateStr, resort);
    const period = getTravelPeriod(dateResort, dateStr);
    const points = getPointsForDate(dateResort, dateStr, totals.roomType ? totals.roomType.id : state.roomTypeId);
    const color = period ? period.color : "#999";
    const dayNum = parseInt(dateStr.slice(8, 10), 10);
    const clickable = isContext || isEdge;
    // Same instant app-styled tooltip as the main calendar's day cells
    // (tooltip-anchor/tooltip-card), not the native title="" attribute --
    // that has a browser-default hover delay and looks like every other
    // OS tooltip instead of matching the app. Same left/right edge-align
    // logic as the main grid so it doesn't get clipped in column 0/1 or 5/6.
    const dow = new Date(dateStr + "T12:00:00").getDay();
    const tooltipAlign = dow <= 1 ? "tooltip-align-left" : dow >= 5 ? "tooltip-align-right" : "";
    const tooltipHTML = clickable ? `
      <div class="trip-tooltip tooltip-card ${tooltipAlign}">${isContext ? "Add this night" : "Remove this night"}</div>
    ` : "";
    // Context days get a much fainter fill than real stay nights (both used
    // to share the same "${color}20" tint, which -- combined with a 3px
    // dashed-vs-solid border being a subtle difference at this size -- made
    // a context day and the first real night hard to tell apart at a
    // glance). A near-white fill reads immediately as "not part of the stay
    // yet."
    const bgAlpha = isContext ? "08" : "20";
    return `
      <div class="trip-strip-day${isContext ? " context" : ""}${isEdge ? " editable" : ""}${clickable ? " tooltip-anchor" : ""}"
        style="background: ${color}${bgAlpha}; border-color: ${color}${isContext ? "33" : "55"};"
        ${clickable ? `onclick="adjustTripEdge('${dateStr}')" tabindex="0"` : ""}>
        <div class="trip-strip-num">${dayNum}</div>
        <div class="trip-strip-pts" style="color: ${color};">${points ?? "—"}</div>
        ${tooltipHTML}
      </div>
    `;
  }

  // A real 7-column grid (like the full calendar), not a flex-wrap strip --
  // flex-wrap items on a partial last row stretch to fill it (a 13-night
  // stay's lone 13th night would balloon to full width), and without empty
  // leading cells, wrapped rows don't line up by day-of-week at all (May 7
  // would sit directly under May 1 even though they're different weekdays).
  // Leading blanks align the first shown day (a "before" context day, if
  // any) to its real weekday column.
  const firstShownDate = beforeDates[0] || firstNight;
  const firstDow = new Date(firstShownDate + "T12:00:00").getDay();
  const headerHTML = DAY_HEADERS.map(d => `<div class="trip-strip-dow">${d[0]}</div>`).join("");
  const blanksHTML = `<div class="trip-strip-day empty"></div>`.repeat(firstDow);
  const beforeHTML = beforeDates.map(d => buildChip(d, { isContext: true, isEdge: false })).join("");
  const afterHTML = afterDates.map(d => buildChip(d, { isContext: true, isEdge: false })).join("");
  const stripHTML = totals.breakdown.map((n, i) => {
    const isEdge = i === 0 || i === totals.breakdown.length - 1;
    return buildChip(n.date, { isContext: false, isEdge });
  }).join("");

  el.innerHTML = `
    <div class="trip-card">
      <div class="card-title-row"><div class="trip-resort-label">Your Stay</div>${shareStayButtonHTML()}</div>
      <div class="trip-resort-name">${resort.name}${resort.estimatedCashRates ? estimateBadgeHTML() : ""}</div>
      <div class="trip-room-name">${totals.roomType ? totals.roomType.name : ""}</div>

      <div class="trip-dates">
        <div class="trip-date-block">
          <div class="trip-date-label">Check-in</div>
          <div class="trip-date-value">${formatDisplayDate(totals.checkIn)}</div>
        </div>
        <span class="trip-arrow">&rarr;</span>
        <div class="trip-date-block">
          <div class="trip-date-label">Check-out</div>
          <div class="trip-date-value">${formatDisplayDate(totals.checkOut)}</div>
        </div>
      </div>

      <div class="trip-strip-header">${headerHTML}</div>
      <div class="trip-strip">${blanksHTML}${beforeHTML}${stripHTML}${afterHTML}</div>
      <div class="trip-strip-hint">Click a shaded day to add it, or an end night to remove it</div>

      <div class="trip-total">
        <span class="trip-total-label">${totals.dates.length} night${totals.dates.length !== 1 ? "s" : ""}</span>
        <span class="trip-total-value">${totals.totalPoints.toLocaleString()} pts</span>
      </div>

      ${buildContractEligibilityHTML(resort, totals.dates)}

      <button class="edit-dates-btn" onclick="expandCalendarForEditing()">Edit dates</button>
      <button class="summary-clear" onclick="clearSelection()">Clear Selection</button>
      ${buildStayActionButtonsHTML(false, totals.checkIn, totals.checkOut)}
    </div>
  `;
  attachStayActionButtonListeners();
}

// Handles a click on any of the trip rail's edge-adjacent chips (the
// dimmed "context" days just outside the stay, or the first/last real
// night). Extends check-in/check-out to include a context day, or shrinks
// the stay by one night from whichever end was clicked; clicking the only
// night of a 1-night stay clears the selection entirely rather than trying
// to produce a zero-night range.
function adjustTripEdge(dateStr) {
  const checkIn = state.checkIn, checkOut = state.checkOut;
  if (!checkIn || !checkOut) return;

  if (dateStr < checkIn) {
    state.checkIn = dateStr;
    if (window.DVCTrack) window.DVCTrack.track("just-one-more-night");
  } else if (dateStr >= checkOut) {
    state.checkOut = dateStrPlusDays(dateStr, 1);
    if (window.DVCTrack) window.DVCTrack.track("just-one-more-night");
  } else if (dateStr === checkIn) {
    const newCheckIn = dateStrPlusDays(dateStr, 1);
    if (newCheckIn >= checkOut) { clearSelection(); return; }
    state.checkIn = newCheckIn;
  } else if (dateStr === dateStrPlusDays(checkOut, -1)) {
    const newCheckOut = dateStrPlusDays(checkOut, -1);
    if (newCheckOut <= checkIn) { clearSelection(); return; }
    state.checkOut = newCheckOut;
  } else {
    return; // an interior night -- not clickable, shouldn't reach here
  }

  updateHint();
  renderCalendar();
  renderSummary();
}

function renderCalendar() {
  syncCustomSelects();
  updateActiveContextBar();

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
  const now = new Date();
  const todayStr = formatDate(now.getFullYear(), now.getMonth(), now.getDate());

  const selectedContract = getSelectedContract();
  const contractWindowMonths = selectedContract ? getContractWindowMonths(selectedContract, resort.id) : null;
  const contractCutoff = contractWindowMonths != null ? monthsFromTodayCutoff(contractWindowMonths) : null;
  const contractRestricted = selectedContract && contractWindowMonths == null;

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement("div");
    el.className = "day-cell empty";
    calendarGrid.appendChild(el);
  }

  // Collected while building the grid below, then handed to
  // renderLegend()/renderCrowdLegend() at the end of this function -- the
  // legend only ever needs to list what's actually on-screen THIS month,
  // not every period/crowd tier that could theoretically ever appear for
  // this resort. Saves real vertical space on a phone, where the old
  // always-show-everything legend competed with the calendar grid itself.
  const activePeriodNames = new Set();
  const activeCrowdLabels = new Set();

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(year, month, d);
    const period = getTravelPeriod(resort, dateStr);
    if (period) activePeriodNames.add(period.name);
    const points = getPointsForDate(resort, dateStr, state.roomTypeId);
    const cashResult = getCashRateWithFallback(resort, dateStr, state.roomTypeId);
    const cashRate = cashResult ? cashResult.rate : null;
    const cashIsPriorYear = cashResult ? cashResult.isPriorYear : false;
    const dayOfWeek = new Date(year, month, d).getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    const isStayNight = stayDates.has(dateStr);
    const isCheckIn = dateStr === state.checkIn;
    const isCheckOut = dateStr === state.checkOut;
    const isPrevSegment = prevSegDates.has(dateStr);

    const isPast = dateStr < todayStr;

    const el = document.createElement("div");
    el.className = "day-cell";
    if (isPrevSegment) el.classList.add("prev-segment");
    if (isStayNight) el.classList.add("selected");
    if (isCheckIn) el.classList.add("checkin");
    if (isCheckOut) el.classList.add("checkout");
    if (isPast) el.classList.add("past-date");
    if (contractRestricted || (contractCutoff && dateStr > contractCutoff)) {
      el.classList.add("contract-not-yet-bookable");
    }

    const tooltipAlign = dayOfWeek <= 1 ? "tooltip-align-left" : dayOfWeek >= 5 ? "tooltip-align-right" : "";
    let periodTooltipHTML = "";

    if (period) {
      el.style.backgroundColor = period.color + "20";
      el.style.borderColor = period.color + "55";
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

    const cashLabel = cashRate ? `<span class="day-cash${cashIsPriorYear ? ' prior-year' : ''}">$${Math.round(cashRate).toLocaleString()}${cashIsPriorYear ? '*' : ''}</span>` : "";
    const crowd = getCrowdForDate(dateStr);
    if (crowd) activeCrowdLabels.add(crowd.label);
    const crowdLabel = crowd ? `
      <span class="day-crowd tooltip-anchor ${crowdClass(crowd.label)} ${tooltipAlign}">
        ${crowd.crowd}
        ${buildCrowdTooltipHTML(dateStr, crowd)}
      </span>` : "";
    // Only date-specific events (a ticketed party, a race morning) earn the
    // 🎉 marker here -- a multi-week festival/seasonal window would otherwise
    // paint it across all 30+ days it runs, which is what originally
    // cluttered the grid. Those broader windows are still surfaced, just in
    // the Special Events & Festivals card instead of on every affected cell.
    // selectNights entries (MNSSHP, MVMCP...) are stored as their whole run
    // because the source doesn't list the actual party nights, so a per-cell
    // badge would paint every day of Aug-Oct; they list once in the card.
    const dayEvents = getEventsForDate(dateStr).filter(e => !BROAD_EVENT_CATEGORIES.has(e.category) && !e.selectNights);
    const eventLabel = dayEvents.length > 0 ? `
      <span class="day-event tooltip-anchor ${tooltipAlign}">
        🎉
        ${buildEventTooltipHTML(dateStr, dayEvents)}
      </span>` : "";

    // Date number, crowd badge, and event icon are each pinned to their own
    // corner of .day-cell (top-left / top-right / bottom-right) so none of
    // them can collide regardless of which combination is present -- see
    // Mobile Responsiveness Guardrails. Cash rate is a normal-flow sibling
    // of the point cost inside .day-body, not another corner badge.
    el.innerHTML = `
      <span class="day-number">${d}</span>
      ${crowdLabel}
      ${eventLabel}
      <div class="day-body${period ? " tooltip-anchor" : ""} ${tooltipAlign}">
        <span class="day-points" style="color: ${period ? period.color : '#333'}">${points ?? "—"}</span>
        ${cashLabel}
        ${periodTooltipHTML}
      </div>
    `;

    el.addEventListener("click", () => handleDateClick(dateStr));
    calendarGrid.appendChild(el);
  }

  renderLegend(activePeriodNames);
  renderCrowdLegend(activeCrowdLabels);
}

// ---- Legend ----
// Filtering the legend down to just what's on-screen this month only makes
// sense on mobile, where vertical space is scarce (see the comment above
// activePeriodNames in renderCalendar()). On desktop there's room to just
// show every period/crowd tier the resort has, so the legend also works as
// a static reference, not just a key for this specific month.
const MOBILE_LEGEND_QUERY = window.matchMedia("(max-width: 800px)");
// Re-render on crossing the breakpoint (e.g. rotating a device, resizing a
// desktop window) so the legend switches between full and filtered lists
// without needing a fresh page load.
MOBILE_LEGEND_QUERY.addEventListener("change", () => renderCalendar());

// activePeriodNames: a Set of period.name values actually present on the
// currently rendered month's grid (see renderCalendar() above) -- on mobile,
// filters the resort's full period list down to just those, so e.g. an
// all-"Preferred" October doesn't also list Adventure/Choice/Dream/etc.
// nobody can see this month. Falls back to every period when called with
// no filter, or on desktop, where the full list is always shown.
function renderLegend(activePeriodNames) {
  const resort = getResort();
  const periods = (activePeriodNames && MOBILE_LEGEND_QUERY.matches)
    ? resort.travelPeriods.filter(p => activePeriodNames.has(p.name))
    : resort.travelPeriods;
  legendItems.innerHTML = "";
  for (const period of periods) {
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

// activeCrowdLabels: same filtering idea as renderLegend() above (mobile
// only), against CROWD_LEGEND's fixed 5 tiers instead of a resort's period
// list.
function renderCrowdLegend(activeCrowdLabels) {
  const el = document.getElementById("crowd-legend-items");
  if (!el) return;
  const tiers = (activeCrowdLabels && MOBILE_LEGEND_QUERY.matches)
    ? CROWD_LEGEND.filter(l => activeCrowdLabels.has(l.label))
    : CROWD_LEGEND;
  el.innerHTML = tiers.map(l => `
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
  let fallbackYear = null;
  let isEstimateCash = false;
  const resortHasCashData = resort.travelPeriods.some(p => p.cashRates);
  const breakdown = [];

  for (const dateStr of stayDates) {
    const dateResort = getResortForStayDate(resort.id, dateStr, resort);
    const pts = getPointsForDate(dateResort, dateStr, state.roomTypeId);
    const cashResult = getCashRateWithFallback(dateResort, dateStr, state.roomTypeId);
    const cashRate = cashResult ? cashResult.rate : null;
    if (cashResult && cashResult.isPriorYear) { isPriorYearCash = true; fallbackYear = cashResult.fallbackYear; }
    if (cashResult && cashResult.isEstimate) isEstimateCash = true;
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
    hasCash, isPriorYearCash, fallbackYear, isEstimateCash, resortHasCashData, breakdown,
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
        <span class="night-points">${n.points == null ? "— (no chart)" : n.points + " pts"}</span>
        ${hasCashData ? `<span class="night-cash">$${displayCash ? Math.round(displayCash).toLocaleString() : "—"}</span>` : ""}
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
      <div class="segment-detail"><strong>${totals.totalPoints} pts</strong>${hasCashData ? ` · $${Math.round(totals.totalCash).toLocaleString()} cash` : ""}</div>
      <div class="segment-actions">
        ${hasCompleteDates ? `<a class="segment-compare" href="compare.html?checkin=${segCheckIn}&checkout=${segCheckOut}&category=${segCategory}&segment=${isCurrentSegment ? "current" : index}">Compare Resorts &rarr;</a>` : ""}
        <span class="segment-nightly-toggle" onclick="this.closest('.segment-block').querySelector('.summary-nightly').classList.toggle('open')">Nightly</span>
      </div>
      <div class="summary-nightly">
        <div class="nightly-rows">${nightlyRows}</div>
      </div>
    </div>
  `;
}

function resortNameForId(id) {
  const r = RESORTS.find(r => r.id === id);
  return r ? r.name : id;
}

// Construction/refurbishment alerts for the selected resort, scoped to
// what's actually on screen: entries overlapping the selected stay when
// dates are picked, otherwise entries overlapping the calendar's currently
// viewed month -- so browsing Dec 2027 doesn't surface a refurbishment that
// only ran in 2026. Purely additive -- resorts/periods with no tracked work
// render nothing. Placement matters here: while browsing (no dates yet)
// it's rendered ahead of "Your Stay" as a "consider this while picking a
// date" prompt, but once dates are picked it's rendered *after* "Your
// Stay" so it reads as supporting context rather than the headline card.
function buildResortAlertsHTML(resort, stayDates) {
  if (typeof getResortConstruction !== "function") return "";
  const hasStay = stayDates.length > 0;
  const rangeStart = hasStay ? stayDates[0] : formatDate(state.year, state.month, 1);
  const rangeEnd = hasStay
    ? dateStrPlusDays(stayDates[stayDates.length - 1], 1)
    : (state.month === 11 ? formatDate(state.year + 1, 0, 1) : formatDate(state.year, state.month + 1, 1));

  const entries = getResortConstruction(resort.id, rangeStart, rangeEnd);
  if (entries.length === 0) return "";

  const itemsHTML = entries.map(e => `
    <div class="resort-alert${hasStay ? " overlaps-stay" : ""}">
      ${hasStay ? `<div class="resort-alert-badge">During your stay</div>` : ""}
      <div class="resort-alert-location">${e.location}</div>
      <div class="resort-alert-dates">${e.dateRangeLabel}</div>
      <div class="resort-alert-desc">${e.description}</div>
    </div>
  `).join("");

  return `
    <div class="summary-card">
      <h3>Resort Alerts</h3>
      <div class="resort-alert-list">${itemsHTML}</div>
      <a class="resort-alert-footer" href="https://www.disneyfoodblog.com/wdwcalendar" target="_blank" rel="noopener">Disney Food Blog</a>
    </div>
  `;
}

// Renders the "Booking As" contract picker into the top control bar
// (#booking-as-control, next to Resort/Room Type/Points Year) rather than
// the summary panel -- it's a persistent per-session setting like those
// other dropdowns, not stay-specific output. Hides the whole control-group
// if signed out or there are no active contracts, so this is purely
// additive for anyone not using the account features. The per-stay
// eligibility/points feedback this used to render lives in
// buildContractEligibilityHTML() instead, embedded in the "Your Stay" card.
// ---- Active Context Summary Bar (#controls-toggle, mobile-only) ----
// On mobile the Resort/Room Type/Booking As/Load Trip drawer (#controls-
// groups) collapses by default (see styles.css's 800px media query) so the
// four stacked dropdowns don't eat half the screen before any calendar
// content shows -- but a collapsed drawer with a static "Resort & Trip
// Settings" label left the user with zero visible context for what resort/
// room/contract is actually driving the calendar's point numbers. This
// builds that context line instead: "Resort Name · Room Type · Booking As".
// Booking As is only appended when the user actually has an active
// contract to browse as (getActiveContracts().length > 0) -- same
// condition renderBookingAsControl() already uses to show/hide that whole
// control, so the summary never dangles a "Just Browsing" segment on
// someone who was never offered the option in the first place.
function buildActiveContextSummary() {
  const resort = getResort();
  if (!resort) return "Resort & Trip Settings";
  const roomType = resort.roomTypes.find(rt => rt.id === state.roomTypeId);
  const parts = [resort.name, roomType ? roomType.name : null];
  if (getActiveContracts().length > 0) {
    const contract = getSelectedContract();
    parts.push(contract ? `${contract.nickname || resortNameForId(contract.home_resort_id)} Contract` : "Just Browsing");
  }
  return parts.filter(Boolean).join(" · ");
}

// Called from renderCalendar() (the shared hook every resort/room/contract
// change already funnels through -- selectResort(), the room-select change
// listener, setSelectedContract(), refreshUserContracts()'s auth resolve,
// and the initial post-session-restore render at the bottom of this file),
// so the bar updates in real time and is correct from the very first paint
// without a separate init call of its own. Re-checks which state to show
// every time rather than caching "open" -- renderCalendar() can run while
// the drawer is already open (e.g. changing room type without collapsing
// it first), and the label needs to keep reading "Hide Trip Settings" in
// that case, not flicker over to the summary text underneath it.
function updateActiveContextBar() {
  if (!controlsToggle || !controlsGroups || !controlsToggleLabel) return;
  const isOpen = controlsGroups.classList.contains("open");
  controlsToggleLabel.textContent = isOpen ? "Hide Trip Settings" : buildActiveContextSummary();

  // Collapsed-only -- expanded, it's showing "Hide Trip Settings" over the
  // plain tint background, same look as before this resort-art feature.
  const resort = getResort();
  applyResortArtBackground(controlsToggle, !isOpen && resort ? getResortImage(resort.id) : null);
}

function renderBookingAsControl() {
  const el = document.getElementById("booking-as-control");
  if (!el) return;
  const contracts = getActiveContracts();
  if (contracts.length === 0) {
    el.style.display = "none";
    return;
  }

  el.style.display = "flex";
  contractSelect.innerHTML = `<option value="">Just browsing (no contract)</option>` + contracts.map(c => {
    const label = `${c.nickname || resortNameForId(c.home_resort_id)} (${c.use_year} UY, ${c.points_per_year.toLocaleString()} pts)`;
    return `<option value="${c.id}">${label}</option>`;
  }).join("");
  contractSelect.value = selectedContractId || "";
  syncBookingAsPickerTrigger();
  renderBookingAsSheetList();
}

// Same lavender-wash-over-photo treatment as the Resort trigger
// (applyResortArtBackground(), .has-art) once a contract is selected, plus
// a small UY pill -- so the closed control reads as "this resort" the same
// way the Resort picker does, rather than a plain dropdown. A flat
// two-tone gradient was tried first, but with every resort now having real
// art (data/resort_images.js), the photo is what actually makes it
// recognizable at a glance.
function syncBookingAsPickerTrigger() {
  const trigger = document.getElementById("booking-as-picker-trigger");
  const label = document.getElementById("booking-as-picker-trigger-label");
  if (!trigger || !label) return;
  const contract = getSelectedContract();
  // The UY pill is a SIBLING of the label span, not nested inside it --
  // .picker-trigger-value truncates with an ellipsis once the contract name
  // outgrows the trigger, and a nested pill would be the first thing that
  // ellipsis ate. As its own flex item (flex-shrink:0) it always survives.
  let pill = trigger.querySelector(".booking-as-trigger-pill");
  if (contract) {
    const name = contract.nickname || resortNameForId(contract.home_resort_id);
    label.textContent = name;
    if (!pill) {
      pill = document.createElement("span");
      pill.className = "booking-as-trigger-pill";
      label.insertAdjacentElement("afterend", pill);
    }
    pill.textContent = `${contract.use_year} UY`;
    applyResortArtBackground(trigger, getResortImage(contract.home_resort_id));
  } else {
    label.textContent = "Just browsing (no contract)";
    if (pill) pill.remove();
    applyResortArtBackground(trigger, null);
  }
}

// ---- Booking As Sheet ----
// Wallet-mini-cards, same visual language as account.html's My Contracts
// deck (see .wallet-mini-card in styles.css) so picking a contract here
// feels like the same object a returning owner already recognizes.
function renderBookingAsSheetList() {
  const listEl = document.getElementById("booking-as-sheet-list");
  if (!listEl) return;
  const contracts = getActiveContracts();
  const browsingSelected = !selectedContractId;
  const cardsHTML = contracts.map(c => {
    const points = getAvailablePoints(c);
    const name = c.nickname || resortNameForId(c.home_resort_id);
    return `
      <button type="button" class="wallet-mini-btn" onclick="pickContract('${c.id}')">
        <div class="wallet-mini-card${c.id === selectedContractId ? " selected" : ""}" style="background:${resortAccentGradient(c.home_resort_id)};">
          <div class="wallet-mini-top">
            <div class="wallet-mini-name">${name}</div>
            <div style="text-align:right;">
              <div class="wallet-mini-points-num">${getStayYearRow(c).recorded ? points.toLocaleString() : "?"}</div>
              <div class="wallet-mini-points-label">${getStayYearRow(c).recorded ? "AVAILABLE" : "UNCONFIRMED"}</div>
            </div>
          </div>
          <div class="wallet-mini-bottom">
            <span class="wallet-mini-pill">${c.use_year} ${getStayYearRow(c).year} UY${getStayYearRow(c).recorded ? "" : " (unconfirmed)"}</span>
            <span class="wallet-mini-pill">${c.points_per_year.toLocaleString()}/yr</span>
          </div>
        </div>
      </button>
    `;
  }).join("");
  listEl.innerHTML = `
    <button type="button" class="wallet-mini-btn" onclick="pickContract('')">
      <div class="wallet-mini-card browsing${browsingSelected ? " selected" : ""}">Just browsing (no contract)</div>
    </button>
    ${cardsHTML}
  `;
}

function pickContract(id) {
  contractSelect.value = id;
  contractSelect.dispatchEvent(new Event("change", { bubbles: true }));
  closeBookingAsSheet();
}

function openBookingAsSheet() {
  renderBookingAsSheetList();
  document.getElementById("booking-as-sheet").classList.add("open");
}

function closeBookingAsSheet() {
  document.getElementById("booking-as-sheet").classList.remove("open");
}

// Re-renders whichever card currently shows buildContractEligibilityHTML's
// output -- the trip rail in review mode, or the normal summary panel
// otherwise. Smart Draw's action handlers call this instead of assuming
// renderSummary() is always the active render path.
function rerenderStaySummary() {
  if (isReviewMode()) renderTripRail(); else renderSummary();
}


// The recommendation card itself: a segmented bar (same visual language as
// account.html's wallet-card ledger rows, tokens.css), one plain-language
// line per nonzero bucket, guardrail call-outs, and the logging/manual
// controls. The footer explains that this preview does not change balances.
// "If you cancel" outcome plus, for a stay after the banking deadline, the
// bank-first option (rules and sources in dvc-ledger.js). Advisory only --
// dvcalc can't see whether a real Disney reservation exists, so both are
// phrased as what WOULD happen. Holding/forfeit cases are left to the
// existing <=30-day guardrail above.
function buildCancelOutcomeHTML(contract, currentRow, draws, checkInStr) {
  if (!window.DVCLedger?.cancellationOutcome || !window.DVCDates) return "";
  const D = window.DVCDates;
  const today = D.todayInEastern();
  const todayMs = D.dateOnlyUTC(today.year, today.month, today.day);
  const [y, m, d] = checkInStr.split("-").map(Number);
  const checkInMs = D.dateOnlyUTC(y, m, d);
  const bankingDeadlineMs = D.deadlineForCycle(contract.use_year, currentRow.year);
  const expiresMs = D.useYearExpiration(contract.use_year, currentRow.year);
  const outcome = window.DVCLedger.cancellationOutcome({ todayMs, checkInMs, bankingDeadlineMs });
  const fmt = D.formatDeadlineDate;
  const lastNormalCancelMs = checkInMs - 31 * 86400000;
  const lines = [];

  if (outcome.kind === "bankable" && draws.remaining > 0) {
    const after = outcome.next === "returns" ? "they come back but can't be banked" : "canceled points go to Holding";
    lines.push(`If you cancel by ${fmt(outcome.untilMs)}, your ${draws.remaining.toLocaleString()} current pts come back and can still be banked. After that, ${after}.`);
  } else if (outcome.kind === "bankable" || outcome.kind === "returns") {
    lines.push(`If you cancel by ${fmt(lastNormalCancelMs)}, points come back to your ${contract.use_year} ${currentRow.year} use year but can't be banked &mdash; use them by ${fmt(expiresMs)}.`);
  }
  if (window.DVCLedger.shouldSuggestBankFirst({ todayMs, checkInMs, bankingDeadlineMs, currentPoints: draws.remaining })) {
    lines.push(`Not booked yet and not sure you'll go? Bank by ${fmt(bankingDeadlineMs)} to keep these points safe &mdash; you can still borrow from ${currentRow.year + 1} to book this stay later.`);
  }
  return lines.length ? `<div class="smart-draw-guardrail calm">${lines.join("<br>")}</div>` : "";
}

// leadHTML: the contract's eligibility note, shown first inside the card.
function buildSmartDrawHTML(contract, currentRow, pointsNeeded, stayDates, leadHTML = "") {
  if (!currentRow.recorded) return `<div class="smart-draw-card"><div class="smart-draw-title">Balance not confirmed</div>${leadHTML}<p>Confirm ${contract.use_year} ${currentRow.year} points before assessing this stay. Your annual allotment is not a confirmed available balance.</p><a href="account.html?contract=${encodeURIComponent(contract.id)}&year=${currentRow.year}" class="text-link">Review balance &rarr;</a><div class="smart-draw-actions"><button type="button" class="smart-draw-apply-btn" onclick="logTripFromCalendar()">Record this booking</button></div></div>`;
  const { draws, after, shortfall } = computeSmartDraw(currentRow, pointsNeeded);

  const barHTML = `
    <div class="ledger-bar">
      <div class="ledger-bar-seg ledger-seg-banked" style="flex-grow:${draws.banked}"></div>
      <div class="ledger-bar-seg ledger-seg-current" style="flex-grow:${draws.remaining}"></div>
      <div class="ledger-bar-seg ledger-seg-borrowed" style="flex-grow:${draws.borrowed}"></div>
      <div class="ledger-bar-seg ledger-seg-holding" style="flex-grow:${draws.holding}"></div>
    </div>
  `;

  const lines = [];
  if (draws.holding > 0) {
    // Holding expires with its use year; entry date does not start a deadline.
    let holdingDetail = "must be used, can't be re-banked";
    if (window.DVCLedger && window.DVCDates) {
      const todayObj = window.DVCDates.todayInEastern();
      const todayMs = window.DVCDates.dateOnlyUTC(todayObj.year, todayObj.month, todayObj.day);
      const useYearExpiresMs = window.DVCDates.useYearExpiration(contract.use_year, currentRow.year);
      const deadline = window.DVCLedger.holdingExpiration(useYearExpiresMs, todayMs);
      if (deadline) holdingDetail = `use by ${window.DVCDates.formatDeadlineDate(deadline.ms)}; book within 60 days of check-in`;
    }
    lines.push(`<div><span class="smart-draw-line-swatch" style="background:var(--color-info)"></span>${draws.holding.toLocaleString()} pts Holding &mdash; ${holdingDetail}</div>`);
  }
  if (draws.banked > 0) lines.push(`<div><span class="smart-draw-line-swatch" style="background:var(--color-warning)"></span>${draws.banked.toLocaleString()} pts Banked ${currentRow.year - 1} &mdash; expires first</div>`);
  if (draws.remaining > 0) lines.push(`<div><span class="smart-draw-line-swatch" style="background:var(--color-primary)"></span>${draws.remaining.toLocaleString()} pts Current ${currentRow.year}</div>`);
  if (draws.borrowed > 0) lines.push(`<div><span class="smart-draw-line-swatch" style="background:var(--color-secondary)"></span>${draws.borrowed.toLocaleString()} pts Borrowed &mdash; already pulled from ${currentRow.year + 1}</div>`);

  const guardrails = [];
  if (shortfall > 0) {
    guardrails.push(`<div class="smart-draw-guardrail danger">Short by ${shortfall.toLocaleString()} pts on this contract even using everything available &mdash; <a href="account.html">borrow more in My Contracts</a>, pick a different contract, or shorten the stay.</div>`);
  }
  if (after.remaining > 0 && window.DVCDates) {
    const today = window.DVCDates.todayInEastern();
    const ms = window.DVCDates.deadlineForCycle(contract.use_year, currentRow.year);
    const deadline = { ms, daysUntil: Math.round((ms - window.DVCDates.dateOnlyUTC(today.year, today.month, today.day)) / 86400000) };
    // Same shared urgency scale/copy as account.html and home.html
    // (2026-09-20) -- this used to be hardcoded "warning" no matter how
    // many days were actually left.
    const tier = window.DVCDates.urgencyTier(deadline.daysUntil);
    const deadlineCopy = window.DVCDates.formatDeadlineWithCountdown(deadline.ms, deadline.daysUntil);
    guardrails.push(`<div class="smart-draw-guardrail ${tier}">Projected: ${after.remaining.toLocaleString()} current pt${after.remaining === 1 ? "" : "s"} left on this contract after this trip &mdash; ${deadline.daysUntil < 0 ? `the banking deadline for this cycle has passed (${window.DVCDates.formatDeadlineDate(deadline.ms)}).` : `bank them by ${deadlineCopy} or they can't roll into ${currentRow.year + 1}.`}</div>`);
  }
  if (stayDates.length > 0) {
    const today = new Date(); today.setHours(12, 0, 0, 0);
    const checkInDate = new Date(stayDates[0] + "T12:00:00");
    const daysUntilCheckIn = Math.round((checkInDate - today) / 86400000);
    // Advisory only: dvcalc has no visibility into whether a real Disney
    // reservation exists for this stay at all, so this is framed as "if
    // you later need to change a real booking this close to check-in,"
    // not a claim about what this Apply action itself does.
    if (daysUntilCheckIn <= 30) {
      guardrails.push(`<div class="smart-draw-guardrail warning">Check-in is ${daysUntilCheckIn <= 0 ? "today or already past" : `${daysUntilCheckIn} day${daysUntilCheckIn === 1 ? "" : "s"} away`} &mdash; if you later modify or cancel this reservation with Disney this close to check-in, those points move to a Holding Account (book within 60 days of check-in; use before the use year ends; cannot be banked).</div>`);
    }
    const cancelHTML = buildCancelOutcomeHTML(contract, currentRow, draws, stayDates[0]);
    if (cancelHTML) guardrails.push(cancelHTML);
  }
  return `
    <div class="smart-draw-card">
      <div class="smart-draw-title">Suggested draw for this trip</div>
      <div class="smart-draw-footer">${stayYearLabel(contract, currentRow)}</div>
      ${barHTML}
      <div class="smart-draw-lines">${lines.join("")}</div>
      ${leadHTML}
      ${guardrails.join("")}
      <div class="smart-draw-actions">
        <button type="button" class="smart-draw-apply-btn" onclick="logTripFromCalendar()">Record this booking</button>
      </div>
      <div class="smart-draw-footer">Planning preview only. Record this booking opens a prefilled form where you can save the stay and take its points out of your balances.</div>
    </div>
  `;
}

// Explicit handoff to trip logging. No itinerary or ledger is written here.
function logTripFromCalendar() {
  const session = window.DVCAuth?.getSession();
  const totals = calcCurrentSegmentTotals();
  if (!session || !totals || isSplitMode()) return;
  const hasFallbackCash = totals.isPriorYearCash && totals.totalCash > 0;
  const customCash = !totals.resortHasCashData && !hasFallbackCash && state.customCashRate > 0;
  const draft = {
    version: 1,
    user_id: session.user.id,
    resort_id: totals.resort.id,
    room_type_id: state.roomTypeId,
    check_in: state.checkIn,
    check_out: state.checkOut,
    points_used: totals.totalPoints,
    custom_cash_value: customCash ? state.customCashRate * totals.dates.length : totals.hasCash ? totals.totalCash : null,
    cash_is_custom: !!customCash,
    contract_id: multiContractSplitMode ? null : getSelectedContract()?.id || null,
    notes: "",
  };
  if (multiContractSplitMode) {
    const contracts = eligibleSplitContracts(totals.resort);
    const allocations = getMultiSplitAllocations(contracts, totals.totalPoints);
    const lines = contracts.filter(c => allocations[c.id] > 0)
      .map(c => (c.nickname || resortNameForId(c.home_resort_id)) + ": " + allocations[c.id] + " pts");
    draft.contract_allocations = contracts.filter(c => allocations[c.id] > 0).map(c => ({ contract_id: c.id, points: allocations[c.id] }));
    draft.notes = "Proposed contract split from calendar (confirm actual points used):\n" + lines.join("\n");
  }
  try {
    sessionStorage.setItem("dvc_trip_draft", JSON.stringify(draft));
    saveStateToSession();
    sessionStorage.setItem("dvc_return_to_calendar", "1");
  } catch (error) {
    alert("Couldn't open the trip form. Please try again, or record it from Bookings & Stays.");
    return;
  }
  window.location.href = "bookings.html";
}

// ---- Multi-Contract Split (Task 07) ----------------------------------
// Splitting one stay's points across more than one contract. Only offered
// when there are 2+ active contracts, real dates are picked, and it's a
// single-resort stay (not a split STAY across resorts -- see the state
// var's own comment on why these two "split" concepts stay clearly
// separate in naming). Every contract that can't book this resort at all
// (getContractWindowMonths() === null) is left out of the split entirely --
// unlike a merely-not-open-yet 7-month window, that's a hard block, not a
// timing issue, so there's nothing to allocate there.
function eligibleSplitContracts(resort) {
  return getActiveContracts().filter(c => getContractWindowMonths(c, resort.id) != null);
}

// Greedy per-contract fill, same "drain one before touching the next"
// spirit as computeSmartDraw()'s own within-contract bucket order --
// just one level up, across contracts instead of across buckets. Purely a
// starting point for the sliders, not a claim of optimality; the whole
// point of sliders is that the owner can override it.
function computeDefaultMultiSplit(contracts, pointsNeeded) {
  let need = pointsNeeded;
  const byContractId = {};
  for (const c of contracts) {
    const row = getStayYearRow(c);
    const available = row.remaining + row.banked + row.borrowed + row.holding;
    const draw = Math.min(available, Math.max(0, need));
    byContractId[c.id] = draw;
    need -= draw;
  }
  return byContractId;
}

function getMultiSplitAllocations(contracts, pointsNeeded) {
  const context = JSON.stringify([state.checkIn, state.checkOut, contracts.map(c => [c.id, getStayYearRow(c)])]);
  if (!multiContractAllocations || multiContractAllocations.pointsNeeded !== pointsNeeded || multiContractAllocations.context !== context) {
    multiContractAllocations = { pointsNeeded, context, byContractId: computeDefaultMultiSplit(contracts, pointsNeeded) };
  }
  return multiContractAllocations.byContractId;
}

function toggleMultiContractSplit() {
  multiContractSplitMode = !multiContractSplitMode;
  multiContractAllocations = null; // start fresh each time split mode is (re-)opened
  rerenderStaySummary();
}

// Item 2 of Task 07: warn if a contract's points are being allocated to a
// stay at a resort that isn't its home resort, before that contract's
// 7-month window has actually opened for these specific dates. Only
// meaningful for months === 7 -- an 11-month home-resort contract's window
// is open the moment you own it (no separate "not yet open" state), and a
// null (fully blocked) contract is already excluded from the split
// entirely by eligibleSplitContracts().
function contractWindowNotYetOpenWarning(contract, resort, stayDates) {
  if (stayDates.length === 0) return null;
  if (getContractWindowMonths(contract, resort.id) !== 7) return null;
  const checkIn = stayDates[0];
  const cutoff = monthsFromTodayCutoff(7);
  if (checkIn <= cutoff) return null; // already open
  const opensOn = monthsBeforeCheckIn(checkIn, 7);
  return `${resort.name} isn't this contract's home resort &mdash; its 7-month window doesn't open until <strong>${formatDisplayDate(opensOn)}</strong>. You can allocate points now, but the reservation itself can't be confirmed with Disney until then.`;
}

// Lightweight live update on every slider drag tick -- mirrors account.html's
// updateLedgerRowTotal()/app.js's own updateSmartDrawManual-style pattern:
// direct DOM writes for the row being dragged plus the shared totals line,
// no full re-render (which would reset every slider's thumb position and
// make dragging feel broken).
function updateMultiSplitRowLive(contractId, value, available, pointsNeeded) {
  const row = document.querySelector(`.multi-split-row[data-contract-id="${contractId}"]`);
  if (!row) return;
  row.querySelector(".multi-split-allocated-num").textContent = value.toLocaleString();
  row.querySelector(".multi-split-after-num").textContent = (available - value).toLocaleString();

  const allocations = multiContractAllocations?.byContractId || {};
  const totalAllocated = Object.entries(allocations).reduce((sum, [id, v]) => sum + (id === contractId ? value : v), 0);
  const totalsEl = document.getElementById("multi-split-totals");
  if (totalsEl) totalsEl.outerHTML = buildMultiSplitTotalsHTML(totalAllocated, pointsNeeded);
}

function setMultiSplitAllocation(contractId, rawValue, max, pointsNeeded) {
  const value = Math.max(0, Math.min(max, parseInt(rawValue, 10) || 0));
  if (!multiContractAllocations || multiContractAllocations.pointsNeeded !== pointsNeeded) {
    multiContractAllocations = { pointsNeeded, byContractId: {} };
  }
  multiContractAllocations.byContractId[contractId] = value;
  updateMultiSplitRowLive(contractId, value, max, pointsNeeded);
}

function buildMultiSplitTotalsHTML(totalAllocated, pointsNeeded) {
  const diff = pointsNeeded - totalAllocated;
  let text, tone;
  if (diff === 0) { text = `&check; ${totalAllocated.toLocaleString()} of ${pointsNeeded.toLocaleString()} pts allocated`; tone = "ok"; }
  else if (diff > 0) { text = `${totalAllocated.toLocaleString()} of ${pointsNeeded.toLocaleString()} pts allocated &mdash; ${diff.toLocaleString()} pts still needed`; tone = "warning"; }
  else { text = `${totalAllocated.toLocaleString()} of ${pointsNeeded.toLocaleString()} pts allocated &mdash; ${Math.abs(diff).toLocaleString()} pts over, reduce a slider`; tone = "danger"; }
  return `<div class="multi-split-totals ${tone}" id="multi-split-totals">${text}</div>`;
}

function buildMultiContractSplitHTML(resort, stayDates) {
  const totals = computeStayEntry(resort, state.roomTypeId, stayDates);
  if (totals.points == null) return "";
  const pointsNeeded = totals.points;
  const contracts = eligibleSplitContracts(resort);

  if (contracts.length === 0) {
    return `
      <div class="multi-split-card smart-draw-card">
        <div class="smart-draw-title">Split Across Contracts</div>
        <div class="smart-draw-guardrail warning">None of your active contracts can book ${resort.name}.</div>
        <button type="button" class="smart-draw-manual-toggle" onclick="toggleMultiContractSplit()">&larr; Use one contract</button>
      </div>
    `;
  }

  if (contracts.some(c => stayYearGroups(c, stayDates).length > 1)) {
    return '<div class="smart-draw-card"><div class="smart-draw-title">Review by use year</div><p>This stay crosses a use-year boundary for one or more contracts. A combined allocation could hide a shortage in one year. Select one contract to see the nightly costs assessed by use year, or preview each date range separately.</p><button type="button" class="smart-draw-manual-toggle" onclick="toggleMultiContractSplit()">&larr; Use one contract</button></div>';
  }
  const allocations = getMultiSplitAllocations(contracts, pointsNeeded);
  const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);

  const rowsHTML = contracts.map(c => {
    const currentRow = getStayYearRow(c, stayDates[0]);
    const available = currentRow.remaining + currentRow.banked + currentRow.borrowed + currentRow.holding;
    if (!currentRow.recorded) return `<div class="multi-split-row">${escapeHTML(c.nickname || resortNameForId(c.home_resort_id))}<br>${stayYearLabel(c, currentRow)}. <a href="account.html?contract=${encodeURIComponent(c.id)}&year=${currentRow.year}">Confirm balance</a></div>`;
    const allocated = Math.min(allocations[c.id] || 0, available);
    const warning = contractWindowNotYetOpenWarning(c, resort, stayDates);
    return `
      <div class="multi-split-row" data-contract-id="${c.id}">
        <div class="multi-split-row-header">
          <span class="multi-split-row-name">${escapeHTML(c.nickname || resortNameForId(c.home_resort_id))}<br><small>${stayYearLabel(c, currentRow)}</small></span>
          <span class="multi-split-row-stat"><span class="multi-split-allocated-num">${allocated.toLocaleString()}</span> / ${available.toLocaleString()} pts</span>
        </div>
        <input type="range" class="multi-split-slider" min="0" max="${available}" step="1" value="${allocated}"
          oninput="setMultiSplitAllocation('${c.id}', this.value, ${available}, ${pointsNeeded})">
        <div class="multi-split-row-footer">
          <span class="multi-split-after-label">Projected after this trip:</span> <span class="multi-split-after-num">${(available - allocated).toLocaleString()}</span> pts left
        </div>
        ${warning ? `<div class="smart-draw-guardrail warning">${warning}</div>` : ""}
      </div>
    `;
  }).join("");


  return `
    <div class="multi-split-card smart-draw-card">
      <div class="smart-draw-title">Split Across ${contracts.length} Contracts</div>
      ${contracts.some(c => !getStayYearRow(c).recorded) && totalAllocated < pointsNeeded ? `<div class="smart-draw-guardrail warning">${totalAllocated} / ${pointsNeeded} pts allocated from confirmed balances. Confirm the remaining contract balances before judging this stay.</div>` : buildMultiSplitTotalsHTML(totalAllocated, pointsNeeded)}
      <div class="multi-split-rows">${rowsHTML}</div>
      <div class="smart-draw-actions">
        <button type="button" class="smart-draw-apply-btn" onclick="logTripFromCalendar()">Record this booking</button>
        <button type="button" class="smart-draw-manual-toggle" onclick="toggleMultiContractSplit()">&larr; Use one contract</button>
      </div>
      <div class="smart-draw-footer">Planning preview only. Record this booking opens a prefilled form with this split, where you can save the stay and take its points out of your balances.</div>
    </div>
  `;
}

// ---- 11-to-7 Swap Simulator (Task 04) -----------------------------------
// A sandbox for the common DVC strategy of confirming the home resort at 11
// months as a safety net, then trying to swap to a different resort/room
// once the 7-month all-resorts window opens -- lets an owner see the real
// numbers (both booking-window dates, the point delta, and any extra
// borrowing the swap would need) before committing to that plan.
function clearSwapSimulator() {
  swapTargetResortId = null;
  swapTargetRoomTypeId = null;
  rerenderStaySummary();
}

function setSwapTargetResort(resortId) {
  swapTargetResortId = resortId || null;
  swapTargetRoomTypeId = null; // reset -- the new resort's room types are a different list
  rerenderStaySummary();
}

function setSwapTargetRoomType(roomTypeId) {
  swapTargetRoomTypeId = roomTypeId || null;
  rerenderStaySummary();
}

function buildSwapSimulatorHTML(contract, resort, stayDates) {
  const targetCandidates = resortsForYear(state.year).filter(r => r.id !== resort.id);
  const targetResort = swapTargetResortId ? targetCandidates.find(r => r.id === swapTargetResortId) : null;
  const targetRoomTypes = targetResort ? targetResort.roomTypes : [];
  const resolvedRoomTypeId = targetResort
    ? (targetRoomTypes.some(rt => rt.id === swapTargetRoomTypeId) ? swapTargetRoomTypeId : targetRoomTypes[0]?.id)
    : null;

  const resortOptionsHTML = `<option value="">Pick a resort&hellip;</option>` +
    targetCandidates.map(r => `<option value="${r.id}"${r.id === swapTargetResortId ? " selected" : ""}>${r.name}</option>`).join("");

  const pickerHTML = `
    <div class="swap-sim-picker-row">
      <div class="custom-select swap-sim-select">
        <select id="swap-target-resort-select" class="native-select">${resortOptionsHTML}</select>
        <button type="button" class="custom-select-trigger"><span class="custom-select-value"></span><span class="custom-select-arrow"></span></button>
        <div class="custom-select-dropdown"></div>
      </div>
      ${targetResort ? `
      <div class="custom-select swap-sim-select">
        <select id="swap-target-room-select" class="native-select">
          ${targetRoomTypes.map(rt => `<option value="${rt.id}"${rt.id === resolvedRoomTypeId ? " selected" : ""}>${rt.name}</option>`).join("")}
        </select>
        <button type="button" class="custom-select-trigger"><span class="custom-select-value"></span><span class="custom-select-arrow"></span></button>
        <div class="custom-select-dropdown"></div>
      </div>` : ""}
    </div>
  `;

  let resultsHTML = "";
  if (targetResort && resolvedRoomTypeId) {
    const homeEntry = computeStayEntry(resort, state.roomTypeId, stayDates);
    const targetEntry = computeStayEntry(targetResort, resolvedRoomTypeId, stayDates);
    if (homeEntry.points != null && targetEntry.points != null) {
      const delta = targetEntry.points - homeEntry.points;
      const deltaClass = delta > 0 ? "warning" : delta < 0 ? "ok" : "neutral";
      const deltaText = delta > 0 ? `+${delta.toLocaleString()}` : delta < 0 ? `${delta.toLocaleString()}` : "±0";

      const elevenMoOpens = monthsBeforeCheckIn(stayDates[0], 11);
      const sevenMoOpens = monthsBeforeCheckIn(stayDates[0], 7);

      // Borrowing risk: deliberately NOT computeSmartDraw() here -- that
      // function draws from whatever's already RECORDED as borrowed in the
      // ledger, which understates what the contract could actually cover
      // (DVC allows borrowing up to 100% of next year's allotment, not just
      // however much happens to already be borrowed -- see dvc-ledger.js's
      // MAX_BORROW_RATIO). This treats borrowing as elastic capacity
      // instead: how much of each stay's cost is left over after
      // non-borrowed buckets (Remaining/Banked/Holding), and whether that
      // leftover fits within the contract's real borrowing ceiling.
      const currentRow = getStayYearRow(contract, stayDates[0]);
      // Everything already in the cycle is spendable without a NEW borrow --
      // including points already recorded as borrowed (they were borrowed
      // once; they don't need borrowing again). What's left to borrow is
      // the ceiling minus what's already been pulled forward.
      const availableWithoutNewBorrow = currentRow.remaining + currentRow.banked + currentRow.holding + currentRow.borrowed;
      const maxBorrowable = Math.max(0, contract.points_per_year - currentRow.borrowed); // same 100%-of-allotment proxy validateBorrowedPoints() uses
      const homeBorrowNeeded = Math.max(0, homeEntry.points - availableWithoutNewBorrow);
      const targetBorrowNeeded = Math.max(0, targetEntry.points - availableWithoutNewBorrow);
      const extraBorrowNeeded = Math.max(0, targetBorrowNeeded - homeBorrowNeeded);
      const cantCoverAtAll = targetBorrowNeeded > maxBorrowable;
      const shortfall = targetBorrowNeeded - maxBorrowable;

      resultsHTML = `
        <div class="swap-sim-windows">
          <div class="swap-sim-window-row"><span>11-month window (home)</span><strong>${formatDisplayDate(elevenMoOpens)}</strong></div>
          <div class="swap-sim-window-row"><span>7-month window (swap)</span><strong>${formatDisplayDate(sevenMoOpens)}</strong></div>
        </div>
        <div class="swap-sim-delta ${deltaClass}">
          <div class="swap-sim-delta-label">Point Delta</div>
          <div class="swap-sim-delta-num">${deltaText} pts</div>
          <div class="swap-sim-delta-detail">${resort.name} (${homeEntry.points.toLocaleString()} pts) &rarr; ${targetResort.name} (${targetEntry.points.toLocaleString()} pts)</div>
        </div>
        ${cantCoverAtAll
          ? `<div class="smart-draw-guardrail danger">This contract can't cover ${targetResort.name} even after borrowing its full next-year allotment &mdash; short by ${shortfall.toLocaleString()} pts. Consider a different contract, or Split Across Contracts above.</div>`
          : extraBorrowNeeded > 0
          ? `<div class="smart-draw-guardrail warning">Covering the swap needs about ${extraBorrowNeeded.toLocaleString()} more borrowed pts than your ${resort.name} stay alone would. Borrowing is final &mdash; if ${targetResort.name} isn't actually available when the 7-month window opens, those extra points stay borrowed regardless, with no swap left to use them on.</div>`
          : `<div class="smart-draw-guardrail" style="background:var(--color-good-bg);color:var(--color-good);">No extra borrowing needed for this swap &mdash; your ${resort.name} stay already covers it.</div>`}
      `;
    }
  }

  return `
    <div class="swap-sim-card smart-draw-card">
      <div class="smart-draw-title">&#128260; Planning to swap at 7 months?</div>
      <div class="smart-draw-footer">Book ${resort.name} at 11 months, then compare switching to another resort when its 7-month window opens.</div>
      ${pickerHTML}
      ${resultsHTML}
      ${swapTargetResortId ? `<button type="button" class="edit-dates-btn" onclick="clearSwapSimulator()">Clear simulator</button>` : ""}
      <div class="smart-draw-footer">Advisory only -- doesn't check real-time room availability or execute a swap with Disney.</div>
    </div>
  `;
}

function attachSwapSimulatorListeners() {
  const resortSelect = document.getElementById("swap-target-resort-select");
  if (resortSelect) {
    window.DVCUI.initCustomSelect(resortSelect);
    resortSelect.addEventListener("change", (e) => setSwapTargetResort(e.target.value));
  }
  const roomSelect = document.getElementById("swap-target-room-select");
  if (roomSelect) {
    window.DVCUI.initCustomSelect(roomSelect);
    roomSelect.addEventListener("change", (e) => setSwapTargetRoomType(e.target.value));
  }
}

// Per-stay eligibility ("home resort, bookable 11 months out" / "resale-
// restricted") and points-remaining feedback for the contract selected in
// the top-bar "Booking As" control, embedded inside the "Your Stay" card.
// Also owns the Multi-Contract Split toggle/card (Task 07) -- only offered
// with 2+ active contracts, real dates picked, and a single-resort stay
// (not a split STAY -- see multiContractSplitMode's own comment). Living
// in this one function, rather than a separate call site, means both
// renderSummary() and renderTripRail() (review mode) get split support for
// free, since they already both call this function.
function buildContractEligibilityHTML(resort, stayDates) {
  // Splitting needs at least two contracts that can book here AND have a
  // confirmed balance for the stay's use year -- otherwise there's nothing
  // to split between, so point at the missing balance instead.
  const splitCandidates = stayDates.length > 0 && !isSplitMode() ? eligibleSplitContracts(resort) : [];
  const unconfirmedSplit = splitCandidates.filter(c => !getStayYearRow(c, stayDates[0]).recorded);
  const canSplit = splitCandidates.length - unconfirmedSplit.length >= 2;

  if (multiContractSplitMode && canSplit) {
    return `<div class="summary-divider"></div>${buildMultiContractSplitHTML(resort, stayDates)}`;
  }

  const splitOfferHTML = canSplit
    ? `<div class="multi-split-offer"><button type="button" class="edit-dates-btn" onclick="toggleMultiContractSplit()">Split points across contracts</button></div>`
    : splitCandidates.length >= 2 && unconfirmedSplit.length
      ? `<div class="multi-split-offer">To split points across contracts, <a href="account.html?contract=${encodeURIComponent(unconfirmedSplit[0].id)}">add ${escapeHTML(unconfirmedSplit[0].nickname || resortNameForId(unconfirmedSplit[0].home_resort_id))}'s balance</a>.</div>`
      : "";

  const contract = getSelectedContract();
  if (!contract) {
    return splitOfferHTML ? `<div class="summary-divider"></div>${splitOfferHTML}` : "";
  }

  // Eligibility: its own line, except when the Suggested draw card shows,
  // where it becomes that card's first note (one card, not two).
  let elig;
  const months = getContractWindowMonths(contract, resort.id);
  if (months === 11) {
    elig = { tone: "ok", text: "&check; Home resort &mdash; bookable up to 11 months out" };
  } else if (months === 7) {
    elig = { tone: "ok", text: "&check; Bookable up to 7 months out with this contract" };
  } else if (contractIsHomeOnly(contract)) {
    elig = { tone: "blocked", text: `&times; This contract can't book ${resort.name} &mdash; resale-restricted to ${resortNameForId(contract.home_resort_id)} only` };
  } else {
    elig = { tone: "blocked", text: `&times; Can't book ${resort.name} with this contract due to resale restrictions` };
  }

  // "Bookable" only means the contract can reach this resort. When the
  // window is already open and history says this room is rarely left at
  // this point, say so instead of showing an unqualified green check.
  if ((months === 11 || months === 7) && stayDates.length > 0) {
    const key = currentBookingWindowKey(stayDates[0], months);
    const avail = key ? getStayAvailability(resort.id, state.roomTypeId, stayDates) : null;
    const label = avail ? availabilityLabel(avail[key], stayDates.length) : null;
    if (label && (label.short === "NL" || label.short === "Lo")) {
      elig = { tone: "warn", text: `&check; This contract can book it, but this room is ${label.short === "NL" ? "rarely still open" : "usually scarce"} ${key === "1Mo" ? "this close to check-in" : key.replace("Mo", " months out")} (Booking Outlook: ${label.text})` };
    }
  }
  let html = `<div class="contract-eligibility contract-${elig.tone}">${elig.text}</div>`;
  const eligNoteHTML = `<div class="smart-draw-guardrail ${{ ok: "calm", warn: "warning", blocked: "danger" }[elig.tone]}">${elig.text}</div>`;

  const currentRow = getStayYearRow(contract, stayDates[0]);
  const available = currentRow.remaining + currentRow.banked + currentRow.borrowed + currentRow.holding;
  if (!currentRow.recorded && stayDates.length === 0) return `<div class="summary-divider"></div>${html}<p>${stayYearLabel(contract, currentRow)}. <a href="account.html?contract=${encodeURIComponent(contract.id)}&year=${currentRow.year}">Confirm balance</a></p>${splitOfferHTML}`;
  const hasBankOrBorrow = currentRow.banked > 0 || currentRow.borrowed > 0 || currentRow.holding > 0;

  if (stayDates.length > 0 && !isSplitMode()) {
    const totals = computeStayEntry(resort, state.roomTypeId, stayDates);
    if (totals.points != null && (months === 11 || months === 7)) {
      if (stayYearGroups(contract, stayDates).length > 1) {
        return `<div class="summary-divider"></div>${html}${buildCrossYearDrawHTML(contract, resort, stayDates)}${splitOfferHTML}`;
      }
      html = buildSmartDrawHTML(contract, currentRow, totals.points, stayDates, eligNoteHTML);
      // Swap Simulator only makes sense when booking the actual HOME
      // resort at 11 months with intent to try swapping later -- a
      // 7-month (non-home) stay is already the "swapped-to" side of that
      // scenario, not the starting point.
      // Only while the 7-month window is still ahead: once check-in is
      // inside 7 months every resort is already bookable, so there's no
      // swap to plan -- just book the other resort.
      if (months === 11 && currentRow.recorded && stayDates[0] > monthsFromTodayCutoff(7)) html += buildSwapSimulatorHTML(contract, resort, stayDates);
    } else if (totals.points != null && !currentRow.recorded) {
      html += `<p>${stayYearLabel(contract, currentRow)}. <a href="account.html?contract=${encodeURIComponent(contract.id)}&year=${currentRow.year}">Add balance</a> before assessing available points.</p>`;
    } else if (totals.points != null) {
      const leftover = available - totals.points;
      const over = leftover < 0;
      html += `
        <div class="contract-points${over ? " contract-points-over" : ""}">
          ${totals.points.toLocaleString()} pts for this stay vs. ${available.toLocaleString()} pts available on this contract
          ${over ? `&mdash; short by ${Math.abs(leftover).toLocaleString()} pts` : `&mdash; leaves ${leftover.toLocaleString()} pts after this trip`}
        </div>
      `;
    }
  } else if (!currentRow.recorded) {
    html += `<p>${stayYearLabel(contract, currentRow)}. <a href="account.html?contract=${encodeURIComponent(contract.id)}&year=${currentRow.year}">Add balance</a> before assessing available points.</p>`;
  } else {
    html += `
      <div class="contract-points">
        ${available.toLocaleString()} pts available &mdash; ${stayYearLabel(contract, currentRow)}${hasBankOrBorrow ? ` (${currentRow.remaining.toLocaleString()} remaining + ${currentRow.banked.toLocaleString()} banked + ${currentRow.borrowed.toLocaleString()} borrowed${currentRow.holding > 0 ? ` + ${currentRow.holding.toLocaleString()} holding` : ""})` : ""}
      </div>
    `;
  }

  return `<div class="summary-divider"></div>${html}${splitOfferHTML}`;
}

// Shared "stay actions" cluster (+ Add Another Resort, Compare All Resorts,
// Save Itinerary) -- used both in the normal top-of-panel spot
// (#action-buttons, non-review layouts) and inside the trip rail in review
// mode, since there it reads as part of the trip card rather than a
// separate floating block. Always call attachStayActionButtonListeners()
// right after inserting this HTML into the DOM.
function buildStayActionButtonsHTML(inSplitMode, overallCheckIn, overallCheckOut) {
  let saveItineraryHTML = "";
  const editing = editingItinerary();
  if (isSignedIn) {
    if (showingItinerarySaveForm) {
      const draftName = itineraryNameDraft != null ? itineraryNameDraft : suggestItineraryName();
      const savingNow = itinerarySaveStatus === "saving";
      const savedOk = itinerarySaveStatus === "saved";
      saveItineraryHTML = `
        <div class="itinerary-save-form">
          <input type="text" id="itinerary-name-input" aria-label="Itinerary name" value="${escapeHTML(draftName)}" placeholder="Name this itinerary" ${savingNow || savedOk ? "disabled" : ""}>
          <button class="itinerary-save-confirm" onclick="confirmSaveItinerary()" ${savingNow || savedOk ? "disabled" : ""}>${savingNow ? "Saving…" : savedOk ? "Saved!" : itinerarySaveMode === 'update' ? 'Save Changes' : itinerarySaveMode === 'copy' ? 'Save Copy' : 'Save'}</button>
          ${!savedOk ? `<button class="itinerary-save-cancel" onclick="closeItinerarySaveForm()" title="Cancel">&times;</button>` : ""}
        </div>
        ${itinerarySaveStatus === "error" ? `<div class="itinerary-save-error" role="alert">${escapeHTML(itinerarySaveError)}</div>` : ""}
      `;
    } else {
      saveItineraryHTML = editing
        ? `<p class="itinerary-edit-context">Editing ${escapeHTML(editing.name)}</p><button class="summary-save-itinerary" onclick="openItinerarySaveForm('update')">Save Changes</button><button class="summary-save-itinerary secondary" onclick="openItinerarySaveForm('copy')">Save as Copy</button>`
        : `<button class="summary-save-itinerary" onclick="openItinerarySaveForm()">&#128190; Save Itinerary</button>`;
    }
  }
  return `
    <button class="summary-add-segment" onclick="addSegment()">+ Add Another Resort</button>
    ${!inSplitMode ? `<a class="summary-compare" href="compare.html?checkin=${overallCheckIn}&checkout=${overallCheckOut}&category=${getCategoryFromRoomType()}&segment=current">Compare All Resorts</a>` : ""}
    ${saveItineraryHTML}
  `;
}

// Top-right corner of the Your Stay / Split Stay card; only once there's
// a complete stay to share.
function shareStayButtonHTML() {
  if (!getFullItinerarySegments().length) return "";
  return `<button type="button" class="card-share-btn" onclick="shareCurrentStay()" aria-label="Share this stay" title="Share this stay">${window.DVCShare.ICON}Share</button>`;
}

// Share: a link that reopens this exact stay (every split segment) for
// anyone. Resort, room and dates only -- never the contract or itinerary.
function shareCurrentStay() {
  const stays = getFullItinerarySegments();
  if (!stays.length) return;
  const first = stays[0], last = stays[stays.length - 1];
  const names = [...new Set(stays.map(st => RESORTS.find(r => r.id === st.resortId)?.name || st.resortId))].join(" + ");
  window.DVCShare.share({
    title: "DVC stay",
    text: `${names}, ${window.DVCDates.formatDateRange(first.checkIn, last.checkOut)}`,
    url: window.DVCShare.link("index.html", window.DVCShare.stayParams(stays), location.href),
  });
}

function attachStayActionButtonListeners() {
  const itineraryNameInput = document.getElementById("itinerary-name-input");
  if (itineraryNameInput) {
    itineraryNameInput.addEventListener("input", (e) => { itineraryNameDraft = e.target.value; });
    itineraryNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") confirmSaveItinerary();
      if (e.key === "Escape") closeItinerarySaveForm();
    });
  }
  // Swap Simulator's target-resort/room custom-selects also live inside
  // this same card -- wiring them here (rather than a separate call site)
  // means every renderSummary()/renderTripRail() path that already calls
  // this function picks them up for free, same reasoning buildContractEligibilityHTML's
  // own doc comment gives for living in one shared function.
  attachSwapSimulatorListeners();
}

// Renders the "Load Trip" saved-itinerary picker into the top control bar
// (#itinerary-load-control) rather than the summary panel -- same
// reasoning as renderBookingAsControl() above. Hidden entirely if signed
// out or nothing saved yet. Tapping a card in the sheet (see the Load Trip
// Sheet section below) applies it immediately and the trigger always shows
// the same static "Load a saved itinerary..." label -- it's a one-shot
// action trigger, not a persistent "currently loaded" indicator, since the
// calendar's real state (resort/dates/segments) is what actually reflects
// what's loaded.
function renderItineraryLoadControl() {
  const el = document.getElementById("itinerary-load-control");
  if (!el) return;
  if (!isSignedIn || userItineraries.length === 0) {
    el.style.display = "none";
    return;
  }

  el.style.display = "flex";
  renderItineraryLoadSheetList();
}

// A lightweight nights/points summary for one saved itinerary, used only by
// the Load Trip sheet's cards -- deliberately NOT calcSegmentTotals() (this
// file's own totals function), since that implicitly reads state.year for
// its resort lookup; a not-yet-loaded itinerary needs its OWN year instead
// of whatever year the calendar currently happens to be browsing.
function summarizeItinerary(itin) {
  let nights = 0, points = 0;
  for (const seg of itin.segments) {
    const resort = RESORTS.find(r => r.id === seg.resortId && r.year === itin.year);
    const dates = getSegmentDates(seg);
    nights += dates.length;
    for (const dateStr of dates) {
      const dateResort = getResortForStayDate(seg.resortId, dateStr, resort);
      points += getPointsForDate(dateResort, dateStr, seg.roomTypeId) || 0;
    }
  }
  return { nights, points };
}

// ---- Load Trip Sheet ----
// Same name/meta shape as itineraries.html's own card list, trimmed to just
// what helps pick the right trip here -- see .itin-mini-card in styles.css.
function renderItineraryLoadSheetList() {
  const listEl = document.getElementById("itinerary-load-sheet-list");
  if (!listEl) return;
  if (userItineraries.length === 0) {
    listEl.innerHTML = `<div class="sheet-empty">No saved itineraries yet.</div>`;
    return;
  }
  listEl.innerHTML = userItineraries.map(itin => {
    const { nights, points } = summarizeItinerary(itin);
    return `
      <button type="button" class="itin-mini-btn" onclick="pickItinerary('${itin.id}')">
        <div class="itin-mini-card">
          <div class="itin-mini-name">${itin.name}</div>
          <div class="itin-mini-meta">${nights} night${nights === 1 ? "" : "s"} &middot; ${points.toLocaleString()} pts</div>
        </div>
      </button>
    `;
  }).join("");
}

function pickItinerary(id) {
  const itin = userItineraries.find(i => i.id === id);
  if (itin) loadItineraryIntoCalendar(itin);
  closeItineraryLoadSheet();
}

function openItineraryLoadSheet() {
  renderItineraryLoadSheetList();
  document.getElementById("itinerary-load-sheet").classList.add("open");
}

function closeItineraryLoadSheet() {
  document.getElementById("itinerary-load-sheet").classList.remove("open");
}

// "Use or rent?": when a stay is worth less per point in cash than those
// points would rent for, renting them out and paying cash comes out ahead.
// Rules in dvc-rental.js; priced at the same rental slider as the tile.
function buildUseOrRentHTML(cashValue, points) {
  const r = window.DVCRental && window.DVCRental.useOrRent({ cashValue, points, rentalRate: state.rentalRate });
  if (!r) return "";
  const per = v => `$${v.toFixed(2)}/pt`;
  const text = r.verdict === "use"
    ? `<strong>Use your points.</strong> This stay is worth ${per(r.stayPerPoint)} in cash, more than the ${per(r.rentalRate)} renting them out would bring.`
    : r.verdict === "rent"
      ? `<strong>Consider renting these points out.</strong> This stay is worth ${per(r.stayPerPoint)} in cash; renting them at ${per(r.rentalRate)} and paying cash would leave you about $${Math.round(r.rentAdvantage).toLocaleString()} ahead.`
      : `<strong>About even.</strong> This stay is worth ${per(r.stayPerPoint)} in cash, close to the ${per(r.rentalRate)} renting them out would bring.`;
  return `<div class="use-or-rent ${r.verdict}"><p>${text}</p><a href="pointsorcash.html?points=${points}&cash=${Math.round(cashValue)}">Point Value &rarr;</a></div>`;
}

function renderSummary() {
  const resort = getResort();
  const stayDates = getStayDates();
  const inSplitMode = isSplitMode();

  // No dates selected and no segments
  if (stayDates.length === 0 && !inSplitMode) {
    actionButtons.innerHTML = "";
    summaryContainer.innerHTML = `
      ${buildResortAlertsHTML(resort, [])}
      <div class="summary-card">
        <h3>Your Stay</h3>
        <div class="summary-empty">
          Select check-in and check-out dates on the calendar
        </div>
        ${buildContractEligibilityHTML(resort, [])}
      </div>
    `;
    renderLayoutMode();
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
    renderLayoutMode();
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
  let priorYearFallbackYear = null;
  let anyIsEstimate = false;
  let anyMissingCash = false;

  for (const t of allSegmentTotals) {
    totalPoints += t.totalPoints;
    totalNights += t.dates.length;
    if (t.hasCash || t.totalCash > 0) { totalDisneyCash += t.totalCash; anyHasCash = true; }
    if (t.isPriorYearCash) { anyIsPriorYear = true; priorYearFallbackYear = t.fallbackYear; }
    if (t.isEstimateCash) anyIsEstimate = true;
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

  const yourStayCardHTML = `
    <div class="summary-card${inSplitMode ? " wide" : ""}">
      <div class="card-header-row"><h3>${inSplitMode ? "Split Stay" : "Your Stay"}</h3>${shareStayButtonHTML()}</div>

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

      ${!inSplitMode ? buildContractEligibilityHTML(resort, stayDates) : ""}
    </div>
  `;

  const specialEventsHTML = !inSplitMode ? buildSpecialEventsHTML(resort, stayDates) : "";
  const resortAlertsHTML = !inSplitMode ? buildResortAlertsHTML(resort, stayDates) : "";

  const availabilityHTML = !inSplitMode
    ? buildAvailabilityHTML(state.resortId, state.roomTypeId, stayDates)
    : buildSplitAvailabilityHTML(state.segments, state.resortId, state.roomTypeId, stayDates);

  const stayInsightsHTML = !inSplitMode ? buildStayInsightsHTML(resort, state.roomTypeId, stayDates) : "";

  // Whether we need to offer a custom-rate input at all (no real cash data
  // for this resort). When true, the Disney tile always renders -- as the
  // input itself before a rate's been entered, then as the computed value
  // once it has -- same as showCustomRateInput ? true.
  const showCustomRateInput = !inSplitMode && !resortHasCashData && !hasFallbackCash;
  const showDisneyTile = hasCashData || showCustomRateInput;

  const useOrRentHTML = buildUseOrRentHTML(totalDisneyCash, totalPoints);

  const costComparisonHTML = `
    <div class="summary-card wide">
      <h3>Cost Comparison</h3>

      <div class="cost-tiles">
        ${showDisneyTile ? `
        <div class="cost-tile">
          <div class="cost-tile-label">${useCustomRate ? 'Your cash rate' : 'If booking through Disney'}${!useCustomRate && anyIsEstimate ? estimateBadgeHTML() : ""}</div>
          ${showCustomRateInput ? `
          <div class="cost-tile-rate-input">
            <span>$</span><input type="number" id="custom-cash-rate" placeholder="e.g. 650" min="0" step="1" value="${state.customCashRate || ''}"><span>/night</span>
          </div>
          ` : ""}
          ${hasCashData ? `
          <div class="cost-tile-value rack">$${Math.round(totalDisneyCash).toLocaleString()}</div>
          <div class="cost-tile-sub">${useCustomRate ? `${stayDates.length} nights × $${state.customCashRate}/night` : `$${(totalDisneyCash / totalPoints).toFixed(2)}/pt`}</div>
          ${anyIsPriorYear ? `<div class="prior-year-note">* Some cash rates based on ${priorYearFallbackYear ? priorYearFallbackYear + " " : "prior-year "}pricing</div>` : ""}
          ` : `
          <div class="cost-tile-sub no-cash-note">No cash rate data for non-WDW resorts</div>
          `}
        </div>
        ` : ""}

        ${state.ownerEnabled ? `
        <div class="cost-tile">
          <div class="cost-tile-label">If using your own points</div>
          <button type="button" class="picker-trigger cost-tile-trigger" id="owner-resort-trigger" onclick="openOwnerResortSheet()">
            <span class="picker-trigger-value" id="owner-resort-trigger-label"></span>
            <span class="custom-select-arrow"></span>
          </button>
          <div class="cost-tile-value owner">$${ownerCost.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
          <div class="cost-tile-sub">${totalPoints} pts · $${ownerDues.toFixed(2)}/pt annual dues</div>
        </div>
        ` : ""}

        ${state.rentalEnabled ? `
        <div class="cost-tile">
          <div class="cost-tile-label">If renting DVC points</div>
          <div class="cost-tile-value cash">$${Math.round(rentalValue).toLocaleString()}</div>
          <div class="cost-tile-sub">${totalPoints} pts × $${state.rentalRate}/pt</div>
          ${hasCashData ? (rentalValue > totalDisneyCash
            ? `<div class="cost-tile-savings costs-more">$${Math.round(rentalValue - totalDisneyCash).toLocaleString()} more than Disney's cash price</div>`
            : `<div class="cost-tile-savings">save $${Math.round(totalDisneyCash - rentalValue).toLocaleString()} <span class="savings-badge">${savings}% off</span></div>`) : ""}
        </div>
        ` : ""}
      </div>
      ${useOrRentHTML}
      ${state.rentalEnabled ? `<div class="cost-point-value">${window.DVCPointValue.html({ id: "rental-rate", kind: "rental", value: state.rentalRate, hint: "What renting these points from an owner would cost." })}</div>` : ""}
    </div>
  `;

  const clearButtonHTML = `<button class="summary-clear" onclick="clearSelection()">Clear ${inSplitMode ? "All" : "Selection"}</button>`;

  // Review mode (a complete single-resort stay, calendar collapsed to the
  // trip rail -- see renderLayoutMode()) gets more horizontal room, so it
  // leads with the "answer" (Cost Comparison), then Stay Insights full-width
  // right under it, then the remaining cards stacked full-width. "Your Stay"
  // and Clear Selection are skipped here -- the trip rail already covers
  // both.
  if (isReviewMode()) {
    summaryContainer.innerHTML = `
      ${costComparisonHTML}
      ${stayInsightsHTML}
      ${availabilityHTML}
      ${specialEventsHTML}
      ${resortAlertsHTML}
    `;
  } else {
    summaryContainer.innerHTML = `
      ${yourStayCardHTML}
      ${specialEventsHTML}
      ${resortAlertsHTML}
      ${availabilityHTML}
      ${stayInsightsHTML}
      ${costComparisonHTML}
      ${clearButtonHTML}
    `;
  }

  // Render action buttons between settings and summary -- except in review
  // mode, where they render inside the trip rail instead (renderTripRail())
  // since that reads as "part of the trip card" rather than a floating
  // block disconnected from it.
  const hasCompleteDates = state.checkIn && state.checkOut;
  if (hasCompleteDates && !isReviewMode()) {
    actionButtons.innerHTML = buildStayActionButtonsHTML(inSplitMode, overallCheckIn, overallCheckOut);
    attachStayActionButtonListeners();
  } else {
    actionButtons.innerHTML = "";
  }

  // Attach custom cash rate input listener
  const customInput = document.getElementById("custom-cash-rate");
  if (customInput) {
    customInput.addEventListener("change", (e) => {
      const val = Math.round(parseFloat(e.target.value));
      state.customCashRate = val > 0 ? val : null;
      renderSummary();
    });
    customInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.target.blur();
    });
  }

  // The owner-resort trigger button is rendered inline inside the Cost
  // Comparison tiles (rebuilt every render) -- it opens #owner-resort-sheet
  // via its own onclick, so all that's needed here is to sync its label/art
  // to the current state.ownerResortId, same as syncResortPickerTrigger().
  syncOwnerResortTrigger();

  // Re-rendering the summary mid-drag would drop the slider, so the
  // estimate updates when the drag ends (or a preset is tapped).
  window.DVCPointValue.attach("rental-rate", (value, final) => {
    if (!final) return;
    state.rentalRate = value;
    renderSummary();
  });

  renderLayoutMode();
}

function clearSelection() {
  if (itinerarySaveStatus === 'saving') return;
  state.itineraryEdit = null;
  state.itineraryPendingSave = null;
  state.checkIn = null;
  state.checkOut = null;
  state.segments = [];
  state.customCashRate = null;
  showingItinerarySaveForm = false;
  itineraryNameDraft = null;
  itinerarySaveStatus = null;
  forceExpandCalendar = false;
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
// Picker sheets (Resort/Booking As/Load Trip): same backdrop-click and
// Escape-to-close convention as the Alternatives modal above -- one
// listener per sheet for the backdrop (each needs its own closeX()), one
// shared Escape handler that closes whichever happens to be open.
const PICKER_SHEETS = [
  { id: "resort-sheet", close: closeResortSheet },
  { id: "booking-as-sheet", close: closeBookingAsSheet },
  { id: "itinerary-load-sheet", close: closeItineraryLoadSheet },
  { id: "owner-resort-sheet", close: closeOwnerResortSheet },
];
for (const { id, close } of PICKER_SHEETS) {
  const el = document.getElementById(id);
  el.addEventListener("click", (e) => { if (e.target === el) close(); });
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (alternativesModalOpen) closeAlternativesModal();
  for (const { id, close } of PICKER_SHEETS) {
    if (document.getElementById(id).classList.contains("open")) close();
  }
  document.querySelectorAll(".tooltip-anchor.tap-open").forEach((el) => el.classList.remove("tap-open"));
});

document.getElementById("resort-sheet-search").addEventListener("input", (e) => {
  renderResortSheetList(e.target.value);
});

document.getElementById("owner-resort-sheet-search").addEventListener("input", (e) => {
  renderOwnerResortSheetList(e.target.value);
});

// Mobile tap-to-toggle for every .tooltip-anchor on this page (crowd/event
// day badges, availability outlook dots, value-score badge, distribution
// bars, crowd forecast average/range, cash-estimate badges) -- hover has
// no touchscreen equivalent at all, so this is the tap fallback; the
// existing tokens.css :hover rule keeps working unchanged for a real
// mouse. Always ADDS tap-open on the tapped anchor rather than toggling it
// (never removes it from the SAME anchor just tapped) -- a tap can also
// trigger a lingering synthetic hover on some mobile browsers, and this
// app has already learned (the documented "fixes click-stuck hovers" fix,
// and this session's own account.html/trips.html popovers) that a
// toggle-based click can immediately re-close what that hover just opened.
// Tapping anywhere else on the page (the `else` branch below, `anchor` is
// null) or Escape above closes everything instead.
// .day-body (the per-day period-color tooltip) and .trip-strip-day (the
// trip rail's add/remove-night control) are excluded: both already have
// their own primary click action (selecting a date; editing the stay), and
// .day-body's period-color meaning is already spelled out as always-visible
// text in the Travel Period legend (renderLegend()), so it doesn't need a
// second, tap-triggered explanation popping up on every date selection.
document.addEventListener("click", (e) => {
  const anchor = e.target.closest(".tooltip-anchor");
  document.querySelectorAll(".tooltip-anchor.tap-open").forEach((el) => {
    if (el !== anchor) el.classList.remove("tap-open");
  });
  if (anchor && !anchor.classList.contains("day-body") && !anchor.classList.contains("trip-strip-day")) {
    anchor.classList.add("tap-open");
  }
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

// Active Context Summary Bar toggle -- mobile-only (#controls-toggle is
// display:none above the 800px breakpoint, see styles.css), no-op-if-
// absent guard kept anyway since this is the one spot in app.js that used
// to live in the shared nav.js include.
if (controlsToggle && controlsGroups) {
  controlsToggle.addEventListener("click", () => {
    const isOpen = controlsGroups.classList.toggle("open");
    controlsToggle.setAttribute("aria-expanded", String(isOpen));
    updateActiveContextBar();
  });
}

contractSelect.addEventListener("change", (e) => setSelectedContract(e.target.value));

prevBtn.addEventListener("click", () => {
  state.month--;
  if (state.month < 0) {
    const prevYear = state.year - 1;
    if (AVAILABLE_YEARS.includes(prevYear)) {
      state.month = 11;
      state.year = prevYear;
      // Keep same resort in new year
      const resort = getResort();
      if (resort) {
        populateRoomTypes();
      }
    } else {
      state.month = 0; // clamp to Jan of current year
    }
  }
  renderCalendar();
  renderSummary();
});

nextBtn.addEventListener("click", () => {
  state.month++;
  if (state.month > 11) {
    const nextYear = state.year + 1;
    if (AVAILABLE_YEARS.includes(nextYear)) {
      state.month = 0;
      state.year = nextYear;
      // Keep same resort in new year
      const resort = getResort();
      if (resort) {
        populateRoomTypes();
      }
    } else {
      state.month = 11; // clamp to Dec of current year
    }
  }
  renderCalendar();
  renderSummary();
});

// Unique resorts (deduplicated by id — dues don't change by year), sorted by name,
// for the owner-resort sheet's list (renderOwnerResortSheetList() below).
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

// ---- Owner Resort Picker Sheet ----
// Same sheet/list visual language as the main Resort picker (#resort-sheet
// above -- hero art, search, color-swatch rows), reused here for a
// different question: which resort's dues the "If using your own points"
// cost tile computes with, independent of state.resortId (which resort's
// calendar is being browsed).
function getOwnerResortMeta() {
  return OWNER_RESORT_OPTIONS.find(r => r.id === state.ownerResortId) || null;
}

function syncOwnerResortTrigger() {
  const trigger = document.getElementById("owner-resort-trigger");
  const label = document.getElementById("owner-resort-trigger-label");
  if (!trigger || !label) return;
  const meta = getOwnerResortMeta();
  label.textContent = meta ? shorthandResortName(meta.id, meta.name) : "Choose a resort";
  applyResortArtBackground(trigger, meta ? getResortImage(meta.id) : null);
}

function openOwnerResortSheet() {
  const search = document.getElementById("owner-resort-sheet-search");
  search.value = "";
  renderOwnerResortSheetList("");
  const meta = getOwnerResortMeta();
  setThumbImage(document.getElementById("owner-resort-sheet-hero"), meta ? getResortImage(meta.id) : null);
  document.getElementById("owner-resort-sheet").classList.add("open");
}

function closeOwnerResortSheet() {
  document.getElementById("owner-resort-sheet").classList.remove("open");
}

function renderOwnerResortSheetList(filter) {
  const listEl = document.getElementById("owner-resort-sheet-list");
  if (!listEl) return;
  const query = filter.toLowerCase();
  const matches = OWNER_RESORT_OPTIONS.filter(r => r.name.toLowerCase().includes(query));
  listEl.innerHTML = matches.length === 0
    ? `<div class="sheet-empty">No resorts match "${escapeHTML(filter)}".</div>`
    : matches.map(r => {
      const isSelected = r.id === state.ownerResortId;
      const image = isSelected ? getResortImage(r.id) : null;
      const artStyle = image ? ` style="background-image:${resortArtWashCSS(image)}"` : "";
      return `
      <button type="button" class="resort-pick-row${isSelected ? " selected" : ""}${image ? " has-art" : ""}" onclick="pickOwnerResort('${r.id}')"${artStyle}>
        <span class="resort-pick-swatch" style="background:${resortAccentColor(r.id)}"></span>
        <span>${r.name}</span>
      </button>
    `;
    }).join("");
}

function pickOwnerResort(id) {
  state.ownerResortId = id;
  state.ownerResortPicked = true;
  closeOwnerResortSheet();
  renderSummary();
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
function readCalendarSession(key) { try { return sessionStorage.getItem(key); } catch (_) { return null; } }
function clearCalendarSession(key) { try { sessionStorage.removeItem(key); } catch (_) {} }
const compareSelection = window.DVCCompareHandoff.read(new URLSearchParams(window.location.search));
// A shared link (Share button here, on Saved Itineraries): replaces any
// selection, saves nothing -- see dvc-share.js.
const sharedStays = compareSelection ? null : window.DVCShare.readStays(new URLSearchParams(window.location.search));
const returningFromCompare = compareSelection ? compareSelection.segment != null : readCalendarSession("dvc_return_to_calendar");
const savedState = returningFromCompare ? readCalendarSession("dvc_calendar_state") : null;
const switchResort = returningFromCompare && !compareSelection ? readCalendarSession("dvc_switch_resort") : null;
// ?resort=<id> (Home's "Open the points calendar"): start on that resort,
// no dates picked, instead of the default or the owner's own resort.
const startResortParam = !savedState && !compareSelection && !sharedStays ? new URLSearchParams(window.location.search).get("resort") : null;
const startResort = startResortParam && resortsForYear(state.year).some(r => r.id === startResortParam) ? startResortParam : null;
if (startResort) state.resortId = startResort;
let ownerDefaultPending = !savedState && !compareSelection && !sharedStays && !startResort;
clearCalendarSession("dvc_calendar_state");
clearCalendarSession("dvc_switch_resort");
clearCalendarSession("dvc_return_to_calendar");

// ---- "Back to Suggest a Stay" banner ----
// Deliberately a separate, NOT one-shot flag from dvc_return_to_calendar
// above (which gets consumed+cleared on every load regardless) -- this
// one needs to keep the banner offering a way back for the rest of the
// session, not just the single page view right after suggest.html's
// redirect, since there's otherwise no path back to those results at all.
if (readCalendarSession("dvc_suggest_return")) {
  document.getElementById("suggest-return-banner").style.display = "";
}
document.getElementById("suggest-return-dismiss").addEventListener("click", () => {
  document.getElementById("suggest-return-banner").style.display = "none";
  sessionStorage.removeItem("dvc_suggest_return");
  sessionStorage.removeItem("dvc_suggest_state");
});

if (savedState) {
  try {
    const restored = JSON.parse(savedState);
    // A handed-off stay without a month (older Suggest a Stay links)
    // shows the month it starts in, not today's.
    if (restored.checkIn && restored.month == null) restored.month = Number(restored.checkIn.slice(5, 7)) - 1;
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

if (compareSelection) {
  const result = window.DVCCompareHandoff.apply(compareSelection, state, RESORTS);
  if (result.error) {
    const notice = document.createElement('p');
    notice.setAttribute('role','alert');
    notice.textContent = result.error;
    document.body.prepend(notice);
  } else {
    Object.assign(state, result.state);
    // Keep split context available if this explicit selection URL is reloaded.
    if (compareSelection.segment != null) {
      try { saveStateToSession(); } catch (_) {}
    }
  }
}

if (sharedStays) {
  const result = window.DVCCompareHandoff.applyShared(sharedStays, state, RESORTS);
  if (result.error) {
    const notice = document.createElement('p');
    notice.setAttribute('role','alert');
    notice.textContent = result.error;
    document.body.prepend(notice);
  } else {
    Object.assign(state, result.state);
  }
}

resortSearch.value = getResort().name;
populateRoomTypes();
roomSelect.value = state.roomTypeId;
syncResortPickerTrigger();
updateHint();
syncOwnerResortToBrowsed();
renderCalendar();
renderSummary();
initAccountPersonalization(40);
