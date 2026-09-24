// ---- Home dashboard ----------------------------------------------------
// The landing page answers two questions: what needs attention, and what
// points are recorded (2026-09-23 redesign, docs/home_redesign_todo.md).
// A "Next up" card, a compact points portfolio, a Membership Value
// preview, and one Record a booking action. All read real Supabase-backed
// data via window.DVCAuth (getContracts/getTrips/getContractYearPoints) --
// the same account data account.html/trips.html already show, summarized.
// Saved itineraries are plans, not records, and live on itineraries.html. There's no separate "dvc_contracts"/"dvc_trips"
// localStorage store anywhere in this app; contracts, logged trips, and
// saved itineraries have only ever lived in Supabase (see auth.js), so a
// widget reading from localStorage would just always show empty for every
// real user.
//
// Ownership-value calculations are shared with Membership Value.

// Same destructure account.html uses -- dvc-dates.js loads before this file
// (see home.html's script order).
const { currentUYYear, todayInEastern, isBankingWindowOpen, nextDeadlineForUseYear, useYearExpiration, dateOnlyUTC, formatDeadlineDate, urgencyTier, expirationTier, formatDeadlineWithCountdown } = window.DVCDates;

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

// Shared model; both screens pass the owner's saved assumptions.
const { computeHouseMoneyStats } = window.DVCOwnerValue.create(tripCashValue);


function resortName(id) {
  const r = RESORTS.find(r => r.id === id);
  return r ? r.name : id;
}

function fmt(n) {
  return "$" + Math.round(n).toLocaleString();
}

// Contract display name, HTML-escaped (DVCPointAttention.label()).
function contractName(contract) {
  return window.DVCPointAttention.label(contract, resortName(contract.home_resort_id));
}

// ---- "Next up" attention card (2026-09-23) --------------------------------
// Only the single earliest actionable item across every active contract --
// DVCPointAttention.earliest(), unchanged, with dvc-dates.js's own urgency
// tiers -- so Home never restates a deadline twice. Every other deadline
// stays on My Contracts.
const ATTENTION_EYEBROW = { danger: "Act soon", warning: "Coming up", calm: "Next up" };
function renderAttentionCard(contracts, yearPointsByContract) {
  const container = document.getElementById("home-attention");
  const today = todayInEastern();
  const event = window.DVCPointAttention.earliest(contracts, yearPointsByContract, today);
  const card = window.DVCHomeSummary.attentionCard(event, {
    name: event?.contract ? contractName(event.contract) : "",
    tiers: { urgency: urgencyTier, expiration: expirationTier },
    formatDate: formatDeadlineDate,
    describe: window.DVCPointAttention.describe,
    total: window.DVCPointAttention.timeline(contracts, yearPointsByContract, today).length,
    todayMs: dateOnlyUTC(today.year, today.month, today.day),
  });
  if (!card) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = `
    <section class="attention-card ${card.tone}" aria-labelledby="attention-title">
      <div class="attention-body">
        <div class="attention-eyebrow">${ATTENTION_EYEBROW[card.tone] || "Next up"}</div>
        <div class="attention-title" id="attention-title">${card.title}</div>
        ${card.detail ? `<div class="attention-detail">${card.detail}</div>` : ""}
        ${card.note ? `<div class="attention-note">${card.note}</div>` : ""}
        ${card.check ? `<div class="attention-check"><span>${card.check.note}.</span> <a href="${card.check.href}">${card.check.label}</a></div>` : ""}
      </div>
      <div class="attention-links">
        <a class="attention-action" href="${card.action.href}">${card.action.label} &rarr;</a>
        ${card.more ? `<a class="attention-more" href="${card.more.href}">${card.more.label}</a>` : ""}
      </div>
    </section>
  `;
}

// ---- Points portfolio (2026-09-23) ----------------------------------------
// Headline: recorded points left in each active contract's current use year
// (all four buckets, dvc-home-summary.js recordedTotal()). A missing balance
// is never counted as zero or as the annual allotment.
const HOME_CONTRACT_ROWS = 3;
function renderContractsWidget(contracts, yearPointsByContract) {
  const container = document.getElementById("home-contracts-summary");
  const active = contracts.filter(c => c.is_active);
  if (contracts.length === 0) {
    // A brand-new owner: adding a contract is the one first step, so it's
    // the page's only primary action (renderActions hides the row below).
    container.innerHTML = `
      <div class="widget-empty-welcome">
        <p>No contracts added yet. Add one to see its points and deadlines here.</p>
        <a href="${ADD_CONTRACT_HREF}" class="home-primary-btn">+ Add your first contract</a>
      </div>
    `;
    return;
  }
  if (active.length === 0) {
    container.innerHTML = `
      <div class="widget-empty-welcome">
        <p>None of your contracts are active.</p>
        <a href="account.html" class="widget-empty-cta">Manage contracts</a>
      </div>
    `;
    return;
  }
  const today = todayInEastern();
  const summary = window.DVCHomeSummary.portfolioSummary(active, yearPointsByContract, {
    currentYear: c => currentUYYear(c.use_year, today),
    name: contractName,
    limit: HOME_CONTRACT_ROWS,
  });
  // How recently the counted balances were checked against Disney.
  const fresh = window.DVCHomeSummary.freshnessLine(summary, {
    todayMs: dateOnlyUTC(today.year, today.month, today.day),
    formatDate: formatDeadlineDate,
  });
  const value = cycle => cycle.total == null ? `<span class="missing">Add balance</span>` : `${cycle.total.toLocaleString()} pts`;
  container.innerHTML = `
    <div class="portfolio-headline">
      ${summary.allMissing
        ? `<span class="portfolio-total needed">Current balances needed</span>`
        : `<span class="portfolio-total">${summary.total.toLocaleString()}</span><span class="portfolio-label">Recorded points left</span>`}
      ${summary.missing && !summary.allMissing ? `<span class="portfolio-missing">${summary.missing} current balance${summary.missing === 1 ? "" : "s"} needed</span>` : ""}
    </div>
    ${fresh ? `<p class="portfolio-freshness ${fresh.tone}">${fresh.text}</p>` : ""}
    <ul class="portfolio-rows">
      ${summary.rows.map(row => `<li><a class="portfolio-row" href="${row.href}">
        <span class="portfolio-row-body">
          <span class="portfolio-row-name">${row.name}</span>
          <span class="portfolio-row-years"><span>Now &middot; ${row.now.year}: ${value(row.now)}</span><span>Next &middot; ${row.next.year}: ${value(row.next)}</span></span>
        </span>
        <span class="portfolio-row-arrow" aria-hidden="true">&rarr;</span>
      </a></li>`).join("")}
    </ul>
    ${summary.hidden ? `<a class="widget-link-inline portfolio-more" href="account.html">View all ${summary.count} contracts &rarr;</a>` : ""}
  `;
}

// ---- Membership Value preview ---------------------------------------------
// Just the payback figure; the model, its assumptions and the projection
// live on Membership Value (trips.html).
function renderHouseMoneyWidget(contracts, trips, settings) {
  const container = document.getElementById("home-house-money");
  if (contracts.length === 0) {
    container.innerHTML = `<p class="value-note">Add a contract to see what your membership has paid back.</p>`;
    return;
  }
  const stats = computeHouseMoneyStats(contracts, trips, settings);
  const needsReview = trips.filter(t => !window.DVCTripFunding.summary(t, contracts).valid).length;
  const review = needsReview ? `<p class="value-note">${needsReview === 1 ? "1 stay needs" : needsReview + " stays need"} point sources reviewed. <a href="bookings.html#needs-review">Review</a></p>` : "";
  if (stats.velocitySource === "none" && !stats.estimatedHouseMoneyDate) {
    container.innerHTML = `${review}<p class="value-note">Record the stays you book to see how much your membership has paid back.</p>`;
    return;
  }
  container.innerHTML = `
    <div class="value-preview"><span class="value-pct">${stats.paybackPct}%</span><span class="value-pct-label">paid back</span></div>
    <p class="value-note">Based on the booked value of your recorded bookings and stays.</p>
    ${review}
    <a href="trips.html" class="widget-link-inline">View membership value &rarr;</a>
  `;
}

// The action row below the cards: Record a booking for signed-in members,
// Plan a stay for everyone.
function renderActions(member) {
  document.getElementById("home-actions").innerHTML = `
    ${member ? `<a href="bookings.html#record-booking" class="home-primary-btn">+ Record a booking</a>` : ""}
    <a href="index.html" class="home-secondary-link">Plan a stay &rarr;</a>
  `;
}

// ---- Signed-out / member / load states ------------------------------------
// Signed out: what the app does, one primary action (add a first contract,
// which carries through sign-in on My Contracts -- ?start=add-contract),
// the public calendar as the secondary path, then the labeled example
// (dvc-owner-preview.js, shared with the membership gate). The CTA comes
// before the example so a phone shows the promise and action unscrolled.
// Non-members see the membership gate instead of the widgets -- empty
// locked cards would show nothing.
const ADD_CONTRACT_HREF = "account.html?start=add-contract";
function dashboardSignInHTML() {
  return `
  <div class="home-signed-out">
  <section class="home-intro" aria-labelledby="home-intro-title">
    <h1 class="home-intro-title" id="home-intro-title">Keep your DVC contracts, points and deadlines in one place</h1>
    <p class="home-intro-body">Record your contracts and balances, see your upcoming banking and expiration dates, and plan stays with your own contract details.</p>
    <div class="home-intro-actions">
      <a href="${ADD_CONTRACT_HREF}" class="home-primary-btn" data-funnel="home-cta">Add my first contract</a>
      <a href="index.html" class="home-secondary-link">Explore the points calendar &rarr;</a>
    </div>
    <p class="home-intro-note">You enter your balances from Disney. DVC Companion doesn't connect to your Disney account. ${window.DVCAuth.membershipTermsLine()}</p>
    <p class="home-intro-returning">Already added your contracts? <a href="account.html">Sign in</a></p>
  </section>
  ${window.DVCOwnerPreview.render({ caption: false })}
  </div>
`;
}
document.addEventListener("click", (e) => {
  if (e.target.closest('[data-funnel="home-cta"]')) window.DVCFunnel?.event("home-cta");
});
const UNCONFIGURED_HTML = `<div class="widget-empty">Accounts aren't set up on this deployment yet.</div>`;

// The two widgets only make sense with an owner's own data behind them.
function showDashboard(show) {
  document.getElementById("home-dashboard").hidden = !show;
}

function renderNonMember() {
  const top = document.getElementById("home-attention");
  top.innerHTML = `<div class="home-member-gate"></div>`;
  window.DVCAuth.renderMembershipGate(top.firstElementChild, {
    title: "Record and manage your DVC contracts",
    body: "See every contract's recorded points, the next deadline to act on, and your membership's payback in one place.",
    preview: true,
  });
  showDashboard(false);
  renderActions(false);
}

async function renderSignedIn() {
  showHeader(true);
  if (!(await window.DVCAuth.hasMembership())) return renderNonMember();
  showDashboard(true);
  const [contracts, trips, yearPoints, settings] = await Promise.all([
    window.DVCAuth.getContracts(),
    window.DVCAuth.getTrips(),
    window.DVCAuth.getContractYearPoints(),
    window.DVCAuth.getUserSettings(),
  ]);
  const yearPointsByContract = {};
  for (const row of yearPoints) {
    (yearPointsByContract[row.contract_id] ||= []).push(row);
  }
  // A failed read is not an empty account: show Retry, never onboarding
  // or an "all clear" (UX2-05).
  const failed = (...names) => window.DVCAuth.readFailed(...names);
  const contractsFailed = failed("contracts", "contract_year_points");
  // Zero contracts (a successful, empty read) is contract first: no
  // booking or planning row competing with "+ Add your first contract".
  if (!contractsFailed && contracts.length === 0) document.getElementById("home-actions").innerHTML = "";
  else renderActions(true);
  if (contractsFailed) {
    document.getElementById("home-attention").innerHTML = "";
    document.getElementById("home-contracts-summary").innerHTML = loadErrorHTML("your contracts");
  } else {
    renderAttentionCard(contracts, yearPointsByContract);
    renderContractsWidget(contracts, yearPointsByContract);
  }
  if (contractsFailed || failed("trips")) document.getElementById("home-house-money").innerHTML = loadErrorHTML("your membership value");
  else renderHouseMoneyWidget(contracts, trips, settings);
}

function loadErrorHTML(what) {
  return `<div class="widget-load-error" role="alert"><p>Couldn't load ${what}. Nothing has been lost.</p><button type="button" class="widget-empty-cta" data-home-retry>Retry</button></div>`;
}
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-home-retry]")) renderSignedIn();
});

function renderSignedOut() {
  document.getElementById("home-attention").innerHTML = dashboardSignInHTML();
  showHeader(false);
  showDashboard(false);
  document.getElementById("home-actions").innerHTML = "";
}

// The plain "Home" heading gives way to the intro's own headline when
// signed out.
function showHeader(show) {
  document.querySelector(".page-header-row").hidden = !show;
}

function renderUnconfigured() {
  showHeader(true);
  showDashboard(true);
  document.getElementById("home-attention").innerHTML = "";
  document.getElementById("home-contracts-summary").innerHTML = UNCONFIGURED_HTML;
  document.getElementById("home-house-money").innerHTML = UNCONFIGURED_HTML;
  renderActions(false);
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
