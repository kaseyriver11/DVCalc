// ---- State ----
// Sort resorts alphabetically once at startup
RESORTS.sort((a, b) => a.name.localeCompare(b.name));

// Discover available years from the data
const AVAILABLE_YEARS = [...new Set(RESORTS.map(r => r.year))].sort();

function resortsForYear(year) {
  return RESORTS.filter(r => r.year === year);
}

const defaultYear = AVAILABLE_YEARS[0];
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
  ownerEnabled: true,
  ownerResortId: "saratogaSprings",
  customCashRate: null, // user-entered nightly cash rate for resorts without data
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
const rentalRateSlider = document.getElementById("rental-rate");
const rentalRateValue = document.getElementById("rental-rate-value");
const ownerToggle = document.getElementById("owner-toggle");
const ownershipDetails = document.getElementById("ownership-details");
const ownerResortSelect = document.getElementById("owner-resort");
const ownerDuesInfo = document.getElementById("owner-dues-info");

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

const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  state.checkIn = null;
  state.checkOut = null;
  state.customCashRate = null;
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
  if (!state.checkIn) {
    selectionHint.innerHTML = "Click a check-in date";
  } else if (!state.checkOut) {
    selectionHint.innerHTML = `Check-in: <span class="checkin-date">${formatDisplayDate(state.checkIn)}</span> — now click a check-out date`;
  } else {
    const nights = getStayDates().length;
    selectionHint.innerHTML = `${formatDisplayDate(state.checkIn)} — ${formatDisplayDate(state.checkOut)} (${nights} night${nights !== 1 ? "s" : ""})`;
  }
}

// ---- Handle Date Click ----
function handleDateClick(dateStr) {
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

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement("div");
    el.className = "day-cell empty";
    calendarGrid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(year, month, d);
    const period = getTravelPeriod(resort, dateStr);
    const points = getPointsForDate(resort, dateStr, state.roomTypeId);
    const cashRate = getCashRateForDate(resort, dateStr, state.roomTypeId);
    const dayOfWeek = new Date(year, month, d).getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    const isStayNight = stayDates.has(dateStr);
    const isCheckIn = dateStr === state.checkIn;
    const isCheckOut = dateStr === state.checkOut;

    const el = document.createElement("div");
    el.className = "day-cell";
    if (isStayNight) el.classList.add("selected");
    if (isCheckIn) el.classList.add("checkin");
    if (isCheckOut) el.classList.add("checkout");

    if (period) {
      el.style.backgroundColor = period.color + "20";
      el.style.borderLeft = `3px solid ${period.color}`;
    }

    if (period) {
      el.title = `${period.name} season — ${isWeekend ? "Fri/Sat" : "Sun-Thu"} rate`;
    }

    const cashLabel = cashRate ? `<span class="day-cash">$${cashRate.toLocaleString()}</span>` : "";

    el.innerHTML = `
      ${cashLabel}
      <span class="day-number">${d}</span>
      <span class="day-points" style="color: ${period ? period.color : '#333'}">${points ?? "—"}</span>
      <span class="day-type-label">${isWeekend ? "Fri/Sat" : "Sun-Thu"}</span>
    `;

    el.addEventListener("click", () => handleDateClick(dateStr));
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
function renderSummary() {
  const resort = getResort();
  const stayDates = getStayDates();

  if (stayDates.length === 0) {
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

  // Calculate totals
  let totalPoints = 0;
  let totalDisneyCash = 0;
  const nightlyBreakdown = [];
  const resortHasCashData = resort.travelPeriods.some(p => p.cashRates);

  for (const dateStr of stayDates) {
    const pts = getPointsForDate(resort, dateStr, state.roomTypeId);
    const cashRate = getCashRateForDate(resort, dateStr, state.roomTypeId);
    const dayOfWeek = new Date(dateStr + "T12:00:00").getDay();
    const dayType = dayOfWeek === 5 || dayOfWeek === 6 ? "Fri/Sat" : "Sun-Thu";
    if (pts) totalPoints += pts;
    if (cashRate) totalDisneyCash += cashRate;
    nightlyBreakdown.push({
      date: dateStr,
      points: pts,
      cashRate,
      dayType,
      dayName: DAY_NAMES_SHORT[dayOfWeek],
    });
  }

  // Apply custom cash rate for resorts without built-in data
  if (!resortHasCashData && state.customCashRate) {
    totalDisneyCash = state.customCashRate * stayDates.length;
  }

  const rentalValue = totalPoints * state.rentalRate;
  const savings = totalDisneyCash > 0
    ? Math.round(((totalDisneyCash - rentalValue) / totalDisneyCash) * 100)
    : 0;

  // Ownership cost calculation
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

  // Build ownership section HTML
  const ownerResort = RESORTS.find(r => r.id === state.ownerResortId);
  const ownerSectionHTML = state.ownerEnabled ? `
        <div class="summary-section-label">If using your own points</div>
        <div class="summary-row">
          <span class="row-label">${totalPoints} pts x $${ownerDues.toFixed(2)}/pt dues</span>
          <span class="row-value owner">$${ownerCost.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
        </div>
        <div class="summary-row">
          <span class="row-label">vs. renting points</span>
          <span class="row-value cash">
            <span class="save-amount">save $${Math.round(ownerSavingsVsRental).toLocaleString()}</span>
            <span class="savings-badge">${ownerPctVsRental}% off</span>
          </span>
        </div>
        ${totalDisneyCash > 0 ? `
        <div class="summary-row">
          <span class="row-label">vs cash rate</span>
          <span class="row-value cash">
            <span class="save-amount">save $${Math.round(ownerSavingsVsDisney).toLocaleString()}</span>
            <span class="savings-badge">${ownerPctVsDisney}% off</span>
          </span>
        </div>` : ""}
  ` : "";

  // Build nightly rows
  const hasCashData = totalDisneyCash > 0;
  const useCustomRate = !resortHasCashData && state.customCashRate;
  const nightlyRows = nightlyBreakdown
    .map(
      (n) => {
        const displayCash = useCustomRate ? state.customCashRate : n.cashRate;
        return `
    <div class="nightly-row">
      <span class="night-date">${n.dayName} ${formatShortDate(n.date)}</span>
      <span class="night-points">${n.points} pts</span>
      ${hasCashData ? `<span class="night-cash">$${displayCash ? displayCash.toLocaleString() : "—"}</span>` : ""}
    </div>
  `;
      }
    )
    .join("");

  summaryContainer.innerHTML = `
    <div class="summary-card">
      <h3>Your Stay</h3>

      <div class="summary-dates-display">
        <div class="date-row">
          <span class="date-label">Check-in</span>
          <span class="date-value">${formatDisplayDate(state.checkIn)}</span>
        </div>
        <div class="date-row">
          <span class="date-label">Check-out</span>
          <span class="date-value">${formatDisplayDate(state.checkOut)}</span>
        </div>
      </div>

      <div class="summary-divider"></div>

      <div class="summary-stats">
        <div class="summary-row">
          <span class="row-label">Nights</span>
          <span class="row-value">${stayDates.length}</span>
        </div>
        <div class="summary-row total">
          <span class="row-label">Total Points</span>
          <span class="row-value">${totalPoints.toLocaleString()}</span>
        </div>

        <div class="summary-section-label">If renting DVC points</div>
        <div class="summary-row">
          <span class="row-label">${totalPoints} pts x $${state.rentalRate}/pt</span>
          <span class="row-value cash">$${rentalValue.toLocaleString()}</span>
        </div>

        ${!resortHasCashData ? `
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
        <div class="summary-section-label">${resortHasCashData ? 'If booking through Disney' : 'Your cash rate'}</div>
        <div class="summary-row">
          <span class="row-label">${resortHasCashData ? 'Est. Disney cash rate' : `${stayDates.length} nights x $${state.customCashRate}/night`}</span>
          <span class="row-value rack">$${totalDisneyCash.toLocaleString()} <span class="cost-per-point">$${(totalDisneyCash / totalPoints).toFixed(2)}/pt</span></span>
        </div>

        <div class="summary-divider"></div>
        <div class="summary-row">
          <span class="row-label">Rental savings vs. cash</span>
          <span class="row-value cash">
            $${(totalDisneyCash - rentalValue).toLocaleString()}
            <span class="savings-badge">${savings}% off</span>
          </span>
        </div>
        ` : ""}

        ${ownerSectionHTML}
      </div>

      <div class="summary-nightly open">
        <h4 onclick="this.parentElement.classList.toggle('open')">Nightly Breakdown (${stayDates.length} nights)${hasCashData ? " — pts / cash" : ""}</h4>
        <div class="nightly-rows">
          ${nightlyRows}
        </div>
      </div>

      <button class="summary-clear" onclick="clearSelection()">Clear Selection</button>
    </div>
  `;

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

// ---- Init ----
resortSearch.value = getResort().name;
populateYears();
populateRoomTypes();
populateOwnerResorts();
ownerToggle.checked = state.ownerEnabled;
ownershipDetails.style.display = state.ownerEnabled ? "block" : "none";
updateHint();
renderCalendar();
renderLegend();
renderSummary();
