// ---- Home dashboard ----------------------------------------------------
// Landing page widgets: Contracts Summary, House Money Progress, and a
// Saved Stays preview. All three read real Supabase-backed data via
// window.DVCAuth (getContracts/getTrips/getItineraries) -- the same
// account data account.html/trips.html/itineraries.html already show,
// just summarized. There's no separate "dvc_contracts"/"dvc_trips"
// localStorage store anywhere in this app; contracts, logged trips, and
// saved itineraries have only ever lived in Supabase (see auth.js), so a
// widget reading from localStorage would just always show empty for every
// real user.
//
// The House Money math (calcStay() down through computeHouseMoneyStats())
// is copied from trips.html rather than shared, matching how every other
// self-contained page in this app (compare.html, changes.html, trips.html
// itself) already duplicates calcStay()/estimateTripCashValue() instead of
// depending on another page's inline <script>. This is the same
// computeHouseMoneyStats() trips.html's own "Membership Value" gauge
// uses -- not an approximation -- so the dashboard number always agrees
// with the full page it links to.

// Same destructure account.html uses -- dvc-dates.js loads before this file
// (see home.html's script order).
const { currentUYYear, todayInEastern, isBankingWindowOpen, nextDeadlineForUseYear, useYearExpiration, dateOnlyUTC, formatDeadlineDate, urgencyTier, formatDeadlineWithCountdown } = window.DVCDates;

// ---- calcStay + trip cash/points estimation (copied from trips.html) ----
const MAX_TRIP_NIGHTS = 90;

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function nightsBetween(checkIn, checkOut) {
  const ci = new Date(checkIn + "T12:00:00");
  const co = new Date(checkOut + "T12:00:00");
  const nights = Math.round((co - ci) / 86400000);
  return Number.isFinite(nights) ? nights : 0;
}

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

function latestCashYear(resortId) {
  const years = [...new Set(RESORTS.filter(r => r.id === resortId).map(r => r.year))].sort((a, b) => b - a);
  for (const y of years) {
    const resort = RESORTS.find(r => r.id === resortId && r.year === y);
    if (resort?.travelPeriods?.some(p => p.cashRates)) return y;
  }
  return years[0] || null;
}

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

function tripCashValue(trip, ownedContracts) {
  const est = trip.custom_cash_value != null
    ? { cash: Number(trip.custom_cash_value), isCustom: true }
    : estimateTripCashValue(trip.resort_id, trip.room_type_id, trip.check_in, trip.check_out);
  if (!est) return null;
  const credited = window.DVCTripFunding.credit(trip, est.cash, ownedContracts);
  return credited ? { ...est, ...credited } : null;
}

// ---- House Money economics (copied from trips.html) ----
const FALLBACK_PRICE_PER_POINT = 140;

function contractInitialCostBreakdown(c) {
  const closing = c.purchase_type === "resale" ? 1500 : 0;
  const price = c.purchase_price != null
    ? c.purchase_price
    : (RESORT_INVESTMENT_DATA[c.home_resort_id]?.resalePricePerPoint || FALLBACK_PRICE_PER_POINT) * c.points_per_year;
  return { price, closing, total: price + closing };
}

function contractOwnershipStartYear(c) {
  const currentYear = new Date().getFullYear();
  return c.purchase_date ? parseInt(c.purchase_date.slice(0, 4), 10) : currentYear - 2;
}

function contractDuesPaidToDate(c) {
  const currentYear = new Date().getFullYear();
  const startYear = contractOwnershipStartYear(c);
  let total = 0;
  for (let y = startYear; y <= currentYear; y++) {
    total += getDuesForYear(c.home_resort_id, y) * c.points_per_year;
  }
  return total;
}

// $35/pt + 5%/yr value growth + 4%/yr dues growth -- same fix (and same
// reasoning) as trips.html's copy of this file: see its own comments on
// STANDARD_DELUXE_VALUE_PER_POINT/projectedDuesForYear for the full
// writeup (a DVC-literate user flagged the old $19/pt as far too low, and
// pointed out dues were silently frozen at today's rate forever past this
// app's known dues-history data, 2026-09-20). Kept in sync with
// trips.html's copy by hand, same as every other duplicated function in
// this file.
const STANDARD_DELUXE_VALUE_PER_POINT = 35;
const STANDARD_VALUE_GROWTH = 0.05;
const STANDARD_DUES_GROWTH = 0.04;

function projectedDuesForYear(resortId, year) {
  const history = DUES_HISTORY[resortId];
  const raw = getDuesForYear(resortId, year);
  if (!history) return raw;
  const lastKnownYear = Math.max(...Object.keys(history).map(Number));
  if (year <= lastKnownYear) return raw;
  return raw * Math.pow(1 + STANDARD_DUES_GROWTH, year - lastKnownYear);
}

function contractBaselinePotentialValue(c, year, yearsFromNow) {
  const grossValue = c.points_per_year * STANDARD_DELUXE_VALUE_PER_POINT * Math.pow(1 + STANDARD_VALUE_GROWTH, yearsFromNow);
  const dues = c.points_per_year * projectedDuesForYear(c.home_resort_id, year);
  return Math.max(0, grossValue - dues);
}

function computeHouseMoneyStats(contracts, trips) {
  const currentYear = new Date().getFullYear();
  let totalPurchasePrice = 0;
  let totalClosingCosts = 0;
  let totalDuesPaid = 0;
  let earliestStartYear = currentYear;
  for (const c of contracts) {
    const breakdown = contractInitialCostBreakdown(c);
    totalPurchasePrice += breakdown.price;
    totalClosingCosts += breakdown.closing;
    totalDuesPaid += contractDuesPaidToDate(c);
    earliestStartYear = Math.min(earliestStartYear, contractOwnershipStartYear(c));
  }
  const totalInitialCost = totalPurchasePrice + totalClosingCosts;
  const totalOutlay = totalInitialCost + totalDuesPaid;

  let lifetimeValue = 0;
  let tripsWithValue = 0;
  for (const t of trips) {
    const v = tripCashValue(t, contracts);
    if (v && Number.isFinite(v.cash) && v.ownedPoints > 0) {
      lifetimeValue += v.cash;
      tripsWithValue++;
    }
  }

  const yearsOwned = contracts.length ? Math.max(1, currentYear - earliestStartYear + 1) : 1;
  const paybackPct = totalOutlay > 0 ? Math.min(100, Math.round((lifetimeValue / totalOutlay) * 100)) : 0;
  const remaining = Math.max(0, totalOutlay - lifetimeValue);

  const actualPace = tripsWithValue > 0
    ? Math.max(lifetimeValue / yearsOwned, lifetimeValue / tripsWithValue)
    : 0;

  const baselinePotential = contracts
    .filter(c => c.is_active)
    .reduce((sum, c) => sum + contractBaselinePotentialValue(c, currentYear, 0), 0);

  let annualVelocity, velocitySource;
  if (tripsWithValue === 0) {
    annualVelocity = baselinePotential;
    velocitySource = baselinePotential > 0 ? "baseline" : "none";
  } else {
    annualVelocity = (actualPace + baselinePotential) / 2;
    velocitySource = baselinePotential > 0 ? "blended" : "trips";
  }

  // Simulated year by year (not a flat remaining/annualVelocity division)
  // -- see trips.html's copy of this same function for the full writeup.
  let estimatedHouseMoneyDate = null;
  if (paybackPct < 100 && annualVelocity > 0) {
    const activeContracts = contracts.filter(c => c.is_active);
    let cumulative = 0;
    let yearsElapsed = 0;
    const MAX_PROJECTION_YEARS = 60;
    while (cumulative < remaining && yearsElapsed < MAX_PROJECTION_YEARS) {
      const yearBaseline = activeContracts.reduce(
        (sum, c) => sum + contractBaselinePotentialValue(c, currentYear + yearsElapsed, yearsElapsed), 0
      );
      const yearPace = tripsWithValue === 0 ? yearBaseline : (actualPace + yearBaseline) / 2;
      cumulative += yearPace;
      yearsElapsed++;
    }
    if (cumulative >= remaining) {
      const finalYearPace = activeContracts.reduce(
        (sum, c) => sum + contractBaselinePotentialValue(c, currentYear + yearsElapsed - 1, yearsElapsed - 1), 0
      );
      const finalYearPaceBlended = tripsWithValue === 0 ? finalYearPace : (actualPace + finalYearPace) / 2;
      const overshoot = cumulative - remaining;
      const monthsIntoFinalYear = finalYearPaceBlended > 0
        ? Math.max(0, 12 - Math.ceil((overshoot / finalYearPaceBlended) * 12))
        : 12;
      const totalMonths = (yearsElapsed - 1) * 12 + monthsIntoFinalYear;
      estimatedHouseMoneyDate = new Date();
      estimatedHouseMoneyDate.setDate(1);
      estimatedHouseMoneyDate.setMonth(estimatedHouseMoneyDate.getMonth() + totalMonths);
    }
  }

  return {
    totalPurchasePrice, totalClosingCosts, totalInitialCost, totalDuesPaid, totalOutlay, lifetimeValue,
    paybackPct, remaining, yearsOwned, actualPace, baselinePotential, annualVelocity, velocitySource,
    estimatedHouseMoneyDate,
    tripsLogged: trips.length,
    netFreeVacations: lifetimeValue - totalOutlay,
  };
}

// ---- Itinerary helpers (copied from itineraries.html) ----
function resortName(id, year) {
  const r = RESORTS.find(r => r.id === id && r.year === year) || RESORTS.find(r => r.id === id);
  return r ? r.name : id;
}

function roomTypeName(resortId, year, roomTypeId) {
  const r = RESORTS.find(r => r.id === resortId && r.year === year) || RESORTS.find(r => r.id === resortId);
  const rt = r?.roomTypes.find(rt => rt.id === roomTypeId);
  return rt ? rt.name : roomTypeId;
}

function calcItineraryTotals(itinerary) {
  let totalPoints = 0, totalNights = 0;
  for (const seg of itinerary.segments) {
    const resort = RESORTS.find(r => r.id === seg.resortId && r.year === itinerary.year);
    if (!resort) continue;
    const nights = nightsBetween(seg.checkIn, seg.checkOut);
    totalNights += nights;
    for (const dateStr of stayDateRange(seg.checkIn, nights)) {
      const pts = getPointsForDate(resort, dateStr, seg.roomTypeId);
      if (pts) totalPoints += pts;
    }
  }
  return { totalPoints, totalNights };
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmt(n) {
  return "$" + Math.round(n).toLocaleString();
}

// ---- At-Risk Points Health Banner ----------------------------------------
// Same evaluateContractDeadlineStatus()/computeEarliestDeadline() logic as
// account.html's ledger (copied, not shared -- see this file's own header
// comment), reading the current use-year row's points_remaining to judge
// whether a contract still has an open banking/borrowing window or has
// already moved into "use it or lose it" territory.
function getYearPointsRow(yearPointsByContract, contractId, year, pointsPerYear) {
  const found = (yearPointsByContract[contractId] || []).find(r => r.use_year_label === year);
  return found ? { points_remaining: found.points_remaining } : { points_remaining: pointsPerYear };
}

function evaluateContractDeadlineStatus(contract, yearPointsByContract, today) {
  return window.DVCPointAttention.evaluate(contract, yearPointsByContract, today);
}

function computeEarliestDeadline(contracts, yearPointsByContract, today) {
  return window.DVCPointAttention.earliest(contracts, yearPointsByContract, today);
}

// The dashboard's own coarser 3-state read, distinct from account.html's
// day-based urgencyTier gradient (14/30d, used for its per-card/banner
// shading everywhere in My Contracts). Here, green/yellow/red is tied to
// real forfeiture risk rather than pure day-count:
//   green  -- nothing to do, or still comfortably bankable (45+ days out)
//   yellow -- still bankable but under 45 days, OR the window already
//             closed with plenty of runway (60+ days) left to just use them
//   red    -- the window already closed AND fewer than 60 days remain to
//             use them before they expire outright -- banking is no longer
//             an option at all, using them is the only way left to not
//             lose them
// Maps the shared calm/warning/danger urgency tier (dvc-dates.js) onto
// this banner's existing green/yellow/red levels -- keeps the CSS
// classes and BANNER_WASH colors below unchanged.
const URGENCY_TIER_TO_LEVEL = { calm: "green", warning: "yellow", danger: "red" };

function healthBannerState(earliest) {
  if (earliest?.kind === 'unconfirmed') return {
    level: 'yellow', icon: '?', label: 'Balance not confirmed',
    detail: `<strong>${window.DVCPointAttention.label(earliest.contract, resortName(earliest.contract.home_resort_id))}</strong> &mdash; confirm your ${earliest.year} use-year balance to see available points and deadline guidance.`,
    hint: 'Annual points are not your available balance.', actions: ['review'],
  };
  if (!earliest || earliest.kind === "accounted") {
    return { level: "green", icon: "✅", label: "Points Status", detail: "All points are accounted for -- nothing at risk right now.", actions: [] };
  }
  if (earliest.kind === "bankable") {
    // 2026-09-20: now uses the same urgency scale as everywhere else, so
    // this can reach "red" under 30 days even while banking is still
    // possible -- it used to cap out at yellow no matter how close the
    // deadline got.
    const { contract, deadline } = earliest;
    const level = URGENCY_TIER_TO_LEVEL[urgencyTier(deadline.daysUntil)];
    return {
      level,
      icon: level === "green" ? "✅" : level === "red" ? "🔴" : "⏳",
      label: level === "green" ? "Points Status" : level === "red" ? "Bank Urgently" : "Bank Soon",
      detail: `<strong>${window.DVCPointAttention.label(contract, resortName(contract.home_resort_id))}</strong> &mdash; ${earliest.points} current pts; bank by <strong>${formatDeadlineWithCountdown(deadline.ms, deadline.daysUntil)}</strong>`,
      actions: level === "green" ? [] : ["bank", "draft"],
    };
  }
  // kind === "use-by": the banking window already closed for this
  // contract. Color now follows the same unified urgency scale as
  // everything else (proximity to actual forfeiture, not to the window
  // closing) -- the 🔒 icon and "Banking Closed" label are the separate
  // signal that banking specifically is no longer an option, independent
  // of how urgent the color itself reads.
  const { contract, expiresMs, daysUntil } = earliest;
  const level = URGENCY_TIER_TO_LEVEL[urgencyTier(daysUntil)];
  return {
    level,
    icon: "🔒",
    label: earliest.holding ? "Holding Points to Use" : "Points to Use",
    detail: `<strong>${window.DVCPointAttention.label(contract, resortName(contract.home_resort_id))}</strong> &mdash; ${earliest.points} pts (${earliest.buckets}) must be used by <strong>${formatDeadlineWithCountdown(expiresMs, daysUntil)}</strong> or they're forfeited.${earliest.holding ? ' Holding points can only book stays within 60 days of check-in.' : ''}`,
    actions: ["review", "draft"], // banking is no longer possible once the window's closed
  };
}

const HEALTH_BANNER_ACTIONS = {
  review: { href: "account.html", label: "Review points &rarr;" },
  bank: { href: "account.html", label: "Review banking →" },
  draft: { href: "suggest.html", label: "Draft a Trip →" },
};

// Shared by both the per-action <a href> below and the banner-wide click
// handler -- the whole point of factoring it out is that "which contract
// to deep-link" can never drift between the two (a real risk if this
// string were duplicated: the visible button and the banner's own click
// would silently disagree about where "the" action goes).
function healthBannerActionHref(actionKey, earliest) {
  const base = HEALTH_BANNER_ACTIONS[actionKey].href;
  return actionKey !== "draft" && earliest?.contract
    ? `${base}?contract=${encodeURIComponent(earliest.contract.id)}`
    : base;
}

function renderHealthBanner(contracts, yearPointsByContract) {
  const container = document.getElementById("home-health-banner");
  const active = contracts.filter(c => c.is_active);
  if (active.length === 0) {
    container.innerHTML = "";
    return;
  }
  const today = todayInEastern();
  const earliest = computeEarliestDeadline(contracts, yearPointsByContract, today);
  const state = healthBannerState(earliest);
  const unconfirmed = active.filter(c => window.DVCPointAttention.evaluate(c, yearPointsByContract, today).kind === 'unconfirmed');
  // Renamed from "expandable" -- the banner used to hide its action
  // button(s) behind a tap-to-reveal toggle (reported directly as a real
  // usability bug: clicking a banner with an obvious action just exposed
  // ANOTHER button to tap, instead of going there). Actions are always
  // visible now, and clicking anywhere on the banner outside those links
  // navigates straight to state.actions[0] -- the array order already
  // encodes priority (see healthBannerState(): "bank" before "draft",
  // "review" before "draft"), so a state with 2 options doesn't need a
  // separate "which one is primary" decision made here too.
  const clickable = state.actions.length > 0;
  // Faded resort art behind the banner (data/resort_images.js), for the
  // one resort actually at risk (earliest.contract) -- the pure "nothing
  // owned yet"/all-accounted "accounted" case has no single resort to
  // point at, so it never gets one, but the "bankable, comfortably far
  // out" GREEN case does (it's still tied to a real contract) and gets
  // art same as yellow/red. "Look 1" card (2026-09-20 app-wide art-card
  // sweep): a translucent version of .health-banner's own bold status
  // color (home.html) over the photo -- not a separate pale tint -- so
  // the color reads exactly as strongly as the flat (no-art) version.
  const bannerResortId = earliest?.contract?.home_resort_id;
  const bannerImage = bannerResortId && typeof getResortImage === "function" ? getResortImage(bannerResortId) : null;
  const BANNER_WASH = {
    green: "rgba(46, 125, 50, 0.68)",
    yellow: "rgba(239, 108, 0, 0.68)",
    red: "rgba(183, 28, 28, 0.68)",
  };
  const bannerStyle = bannerImage && BANNER_WASH[state.level]
    ? ` style="background-image: linear-gradient(${BANNER_WASH[state.level]}, ${BANNER_WASH[state.level]}), url('${bannerImage}')"`
    : "";
  container.innerHTML = `
    <div class="health-banner ${state.level}${clickable ? " clickable" : ""}" id="health-banner-el"${bannerStyle}>
      <span class="health-banner-icon">${state.icon}</span>
      <div class="health-banner-body">
        <div class="health-banner-label">${state.label}</div>
        <div class="health-banner-detail">${state.detail}</div>
        ${state.hint ? `<div class="health-banner-hint">${state.hint}</div>` : ""}
        ${clickable ? `
        <div class="health-banner-actions">
          ${state.actions.map(a => `<a href="${healthBannerActionHref(a, earliest)}" class="health-banner-action-btn">${HEALTH_BANNER_ACTIONS[a].label}</a>`).join("")}
        </div>` : ""}
      </div>
    </div>
  `;
  if (unconfirmed.length && earliest?.kind !== "unconfirmed") container.insertAdjacentHTML("beforeend", `<p class="house-money-note">${unconfirmed.length} contract balance(s) still need confirmation. <a href="account.html?contract=${encodeURIComponent(unconfirmed[0].id)}">Review balances</a></p>`);
  if (clickable) {
    const el = document.getElementById("health-banner-el");
    // Whole banner navigates to the PRIORITY action (state.actions[0]) --
    // a state with a single action used to require tapping the banner
    // just to reveal that one action's button, then tapping it again
    // (the actual reported bug). A state with 2 actions still shows both
    // buttons (visible unconditionally now, not gated behind a tap), so
    // the less-common second choice stays reachable -- clicking a real
    // <a> always wins over this (stopPropagation isn't even needed: the
    // early return below just declines to also navigate the banner's own
    // target on top of the link's).
    el.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      window.location.href = healthBannerActionHref(state.actions[0], earliest);
    });
  }
}

// ---- Widget rendering ----------------------------------------------------
// One sign-in prompt for the whole dashboard, not one per widget -- all
// three account-backed widgets need the exact same session, so repeating
// "Sign in with Google" three times over just reads as broken/spammy
// (reported directly against a screenshot). The locked widgets themselves
// just point up at it.
const DASHBOARD_SIGNIN_HTML = `
  <div class="dashboard-signin-banner">
    <p>Sign in to see your personalized dashboard.</p>
    <div class="dashboard-signin-slot"></div>
  </div>
`;
const WIDGET_LOCKED_HTML = `<div class="widget-empty">Sign in above to see this.</div>`;
const UNCONFIGURED_HTML = `<div class="widget-empty">Accounts aren't set up on this deployment yet.</div>`;

function renderContractsWidget(contracts) {
  const container = document.getElementById("home-contracts-summary");
  const active = contracts.filter(c => c.is_active);
  if (active.length === 0) {
    container.innerHTML = `
      <div class="widget-empty-welcome">
        <p>No contracts added yet. Track your home resorts and annual points here.</p>
        <a href="account.html" class="widget-empty-cta">+ Add your first contract</a>
      </div>
    `;
    return;
  }
  const totalPoints = active.reduce((sum, c) => sum + (c.points_per_year || 0), 0);
  const resortNames = [...new Set(active.map(c => resortName(c.home_resort_id, c.use_year)))];
  container.innerHTML = `
    <div class="contracts-summary-row"><span>Active Contracts</span><strong>${active.length}</strong></div>
    <div class="contracts-summary-row"><span>Total Annual Points</span><strong>${totalPoints.toLocaleString()} pts</strong></div>
    <div class="contracts-resort-list">${resortNames.join(" &middot; ")}</div>
  `;
}

function renderHouseMoneyWidget(contracts, trips) {
  const container = document.getElementById("home-house-money");
  const stats = computeHouseMoneyStats(contracts, trips);
  const achieved = stats.paybackPct >= 100;
  const dateLabel = stats.estimatedHouseMoneyDate
    ? stats.estimatedHouseMoneyDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;
  // Same "nothing to project from" guard as trips.html's own gauge -- no
  // active contracts' potential AND no trip history at all.
  const nothingToProjectFrom = stats.velocitySource === "none" && !dateLabel;

  if (nothingToProjectFrom) {
    container.innerHTML = `
      <div class="widget-empty-welcome">
        <p>Add a contract or log your first past trip to start tracking how much Deluxe hotel value your membership has delivered.</p>
        <a href="trips.html" class="widget-empty-cta">+ Log your first trip</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    ${trips.some(t => !window.DVCTripFunding.summary(t, contracts).valid) ? `<p class="house-money-note">Some trips are excluded until you <a href="trips.html#trip-list">review their point sources</a>.</p>` : ""}
    <div class="house-money-pct-row">
      <span>${fmt(stats.lifetimeValue)} of ${fmt(stats.totalOutlay)} paid back</span>
      <strong>${stats.paybackPct}%</strong>
    </div>
    <div class="house-money-bar-track"><div class="house-money-bar-fill" style="width:${stats.paybackPct}%"></div></div>
    <div class="house-money-note">
      ${achieved
        ? `&#127881; You're living on House Money -- +${fmt(stats.netFreeVacations)} in free vacations so far`
        : (dateLabel
            ? `Estimated House Money: <strong>${dateLabel}</strong> &middot; ${fmt(stats.remaining)} remaining`
            : `${fmt(stats.remaining)} remaining to reach House Money`)}
    </div>
  `;
}

// Same last-segment-checkout-vs-today check as itineraries.html's own
// itineraryIsPast() -- duplicated, not shared, per this file's own
// established convention (see the header comment on calcStay()).
function itineraryIsPast(itin) {
  if (itin.segments.length === 0) return false;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return itin.segments[itin.segments.length - 1].checkOut < todayStr;
}

function renderItinerariesWidget(itineraries) {
  const container = document.getElementById("home-itineraries");
  if (itineraries.length === 0) {
    container.innerHTML = `
      <div class="widget-empty-welcome">
        <p>No saved itineraries yet. Plan a stay on the calendar and save it to see it here.</p>
        <a href="index.html" class="widget-empty-cta">+ Plan your first stay</a>
      </div>
    `;
    return;
  }
  const recent = itineraries.slice(0, 3);
  container.innerHTML = recent.map(itin => {
    const totals = calcItineraryTotals(itin);
    const first = itin.segments[0];
    const isPast = itineraryIsPast(itin);
    const summary = first
      ? `${resortName(first.resortId, itin.year)} &middot; ${roomTypeName(first.resortId, itin.year, first.roomTypeId)}${itin.segments.length > 1 ? ` +${itin.segments.length - 1} more` : ""}`
      : "";
    // Faded art (data/resort_images.js) for the itinerary's first resort,
    // when that resort has any -- same wash-over-photo technique used
    // throughout the app. A split-stay's later segments/resorts aren't
    // represented here, just the primary/first one, matching how the
    // summary line above already only names the first resort by default.
    const rowImage = first && typeof getResortImage === "function" ? getResortImage(first.resortId) : null;
    const rowStyle = rowImage
      ? ` style="background-image: linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url('${rowImage}')"`
      : "";
    return `
      <div class="home-itin-row${isPast ? " past" : ""}"${rowStyle}>
        <div>
          <div class="home-itin-name">${itin.name}${isPast ? `<span class="home-itin-past-badge">Past</span>` : ""}</div>
          <div class="home-itin-meta">${summary}${first ? ` &middot; ${formatDisplayDate(first.checkIn)} &rarr; ${formatDisplayDate(itin.segments[itin.segments.length - 1].checkOut)}` : ""} &middot; ${totals.totalNights} night${totals.totalNights === 1 ? "" : "s"}, ${totals.totalPoints.toLocaleString()} pts</div>
        </div>
        <a href="itineraries.html" class="home-itin-view">View</a>
      </div>
    `;
  }).join("");
}

// ---- Auth-gated data load, same waitForAuth/onAuthChange pattern as
// trips.html/itineraries.html ----
async function renderSignedIn() {
  const [contracts, trips, itineraries, yearPoints] = await Promise.all([
    window.DVCAuth.getContracts(),
    window.DVCAuth.getTrips(),
    window.DVCAuth.getItineraries(),
    window.DVCAuth.getContractYearPoints(),
  ]);
  const yearPointsByContract = {};
  for (const row of yearPoints) {
    (yearPointsByContract[row.contract_id] ||= []).push(row);
  }
  renderHealthBanner(contracts, yearPointsByContract);
  renderContractsWidget(contracts);
  renderHouseMoneyWidget(contracts, trips);
  renderItinerariesWidget(itineraries);
}

function renderSignedOut() {
  document.getElementById("home-health-banner").innerHTML = DASHBOARD_SIGNIN_HTML;
  window.DVCAuth.renderSignInButton(document.querySelector(".dashboard-signin-slot"), "widget-signin-btn", "large");
  document.getElementById("home-contracts-summary").innerHTML = WIDGET_LOCKED_HTML;
  document.getElementById("home-house-money").innerHTML = WIDGET_LOCKED_HTML;
  document.getElementById("home-itineraries").innerHTML = WIDGET_LOCKED_HTML;
}

function renderUnconfigured() {
  document.getElementById("home-health-banner").innerHTML = "";
  document.getElementById("home-contracts-summary").innerHTML = UNCONFIGURED_HTML;
  document.getElementById("home-house-money").innerHTML = UNCONFIGURED_HTML;
  document.getElementById("home-itineraries").innerHTML = UNCONFIGURED_HTML;
}

function render(session) {
  if (!window.DVCAuth.isConfigured()) {
    renderUnconfigured();
  } else if (session) {
    renderSignedIn();
  } else {
    renderSignedOut();
  }
}

function waitForAuth(attempts) {
  if (window.DVCAuth) {
    window.DVCAuth.onAuthChange(render);
  } else if (attempts > 0) {
    setTimeout(() => waitForAuth(attempts - 1), 50);
  } else {
    renderUnconfigured();
  }
}
waitForAuth(40);
