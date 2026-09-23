// One ownership-value model for Home and Membership Value.
// tripCashValue resolves the logged value attributable to owned contracts.
//
// Owner-entered actual costs (Prompt 6, migration 028) are optional: the
// `actuals` argument is DVCActualCosts.index() output, { [contractId]:
// { dues: {year: cents}, interest: {year: cents}, closing: cents|null } }.
// Where an actual exists it replaces the estimate (published dues rate,
// estimated closing cost); everything else stays modeled, and every figure
// carries its source. Financing interest is added only as entered -- the
// purchase price is already the principal, so loan principal is never
// counted twice. Future years always use projected dues.
(function () {
  function create(tripCashValue) {
const FALLBACK_PRICE_PER_POINT = 140;
const dollars = cents => cents / 100;
const actualFor = (actuals, c) => (actuals && actuals[c.id]) || null;

function contractInitialCostBreakdown(c, actual = null) {
  const closingActual = actual?.closing != null;
  const closing = closingActual ? dollars(actual.closing) : c.purchase_type === "resale" ? 1500 : 0;
  const priceEntered = c.purchase_price != null;
  const price = priceEntered
    ? Number(c.purchase_price)
    : (RESORT_INVESTMENT_DATA[c.home_resort_id]?.resalePricePerPoint || FALLBACK_PRICE_PER_POINT) * c.points_per_year;
  return { price, closing, total: price + closing, priceSource: priceEntered ? "entered" : "estimated", closingSource: closingActual ? "actual" : "estimated" };
}

function contractInitialCost(c, actual = null) {
  return contractInitialCostBreakdown(c, actual).total;
}

// One calendar year's dues for a contract: the owner's actual when entered
// (past and current years only), else the published rate; projected after
// this year.
function duesForYear(c, year, actual, currentYear, duesGrowthRate) {
  if (year > currentYear) return { amount: c.points_per_year * projectedDuesForYear(c.home_resort_id, year, duesGrowthRate), source: "projected" };
  if (actual?.dues?.[year] != null) return { amount: dollars(actual.dues[year]), source: "actual" };
  return { amount: getDuesForYear(c.home_resort_id, year) * c.points_per_year, source: "published" };
}
const interestForYear = (actual, year) => (actual?.interest?.[year] != null ? dollars(actual.interest[year]) : 0);

function contractOwnershipStartYear(c) {
  const currentYear = new Date().getFullYear();
  return c.purchase_date ? parseInt(c.purchase_date.slice(0, 4), 10) : currentYear - 2;
}

function contractDeedExpirationYear(c) {
  const exp = RESORT_INVESTMENT_DATA[c.home_resort_id]?.contractExpirationYear;
  return exp == null ? null : exp;
}

function contractExpiredBy(c, year) {
  const exp = contractDeedExpirationYear(c);
  return exp != null && year > exp;
}

function contractDuesPaidToDate(c, actual = null) {
  const currentYear = new Date().getFullYear();
  const startYear = contractOwnershipStartYear(c);
  let total = 0;
  for (let y = startYear; y <= currentYear; y++) {
    total += duesForYear(c, y, actual, currentYear, 0).amount;
  }
  return total;
}

// Everything one contract has cost so far, year by year, with each
// figure's source -- the per-contract breakdown on Membership Value.
function contractCostBreakdown(c, actual = null) {
  const currentYear = new Date().getFullYear();
  const startYear = contractOwnershipStartYear(c);
  const years = [];
  let duesTotal = 0, interestTotal = 0, actualDuesYears = 0;
  for (let y = startYear; y <= currentYear; y++) {
    const d = duesForYear(c, y, actual, currentYear, 0);
    const interest = actual?.interest?.[y] != null ? dollars(actual.interest[y]) : null;
    years.push({ year: y, dues: d.amount, duesSource: d.source, publishedRate: getDuesForYear(c.home_resort_id, y), interest });
    duesTotal += d.amount;
    interestTotal += interest || 0;
    if (d.source === "actual") actualDuesYears++;
  }
  const initial = contractInitialCostBreakdown(c, actual);
  return { contract: c, startYear, startEstimated: !c.purchase_date, years, duesTotal, interestTotal, actualDuesYears,
    ...initial, totalToDate: initial.total + duesTotal + interestTotal };
}

function projectedDuesForYear(resortId, year, duesGrowthRate) {
  const history = DUES_HISTORY[resortId];
  const raw = getDuesForYear(resortId, year);
  if (!history) return raw;
  const lastKnownYear = Math.max(...Object.keys(history).map(Number));
  if (year <= lastKnownYear) return raw;
  return raw * Math.pow(1 + duesGrowthRate, year - lastKnownYear);
}

function contractBaselineGrossValue(c, yearsFromNow, settings) {
  return c.points_per_year * settings.point_value_baseline * Math.pow(1 + settings.value_growth_rate, yearsFromNow);
}

function contractBaselinePotentialValue(c, year, yearsFromNow, settings) {
  const grossValue = contractBaselineGrossValue(c, yearsFromNow, settings);
  const dues = c.points_per_year * projectedDuesForYear(c.home_resort_id, year, settings.dues_growth_rate);
  return Math.max(0, grossValue - dues);
}

function buildHouseMoneySeries(contracts, trips, paceReady, actualPace, currentYear, settings, actuals = null) {
  if (contracts.length === 0) return null;
  const activeContracts = contracts.filter(c => c.is_active);
  const startYear = contracts.reduce((min, c) => Math.min(min, contractOwnershipStartYear(c)), currentYear);

  const tripValueByYear = {};
  for (const t of trips) {
    const v = tripCashValue(t, contracts);
    if (!v || !Number.isFinite(v.cash)) continue;
    const y = parseInt(t.check_out.slice(0, 4), 10);
    tripValueByYear[y] = (tripValueByYear[y] || 0) + v.cash;
  }

  const years = [], outlay = [], value = [], altFund = [];
  let cumOutlay = 0, cumValue = 0, crossoverYear = null;
  let fund = 0, altFundDepletionYear = null;

  const MAX_YEARS = 60;
  let projectionEndYear = currentYear;
  let horizonIsDeed = false;
  for (const c of activeContracts) {
    const exp = contractDeedExpirationYear(c);
    const contractEnd = exp ?? currentYear + 30;
    if (contractEnd > projectionEndYear) {
      projectionEndYear = contractEnd;
      horizonIsDeed = exp != null;
    }
  }
  const endYear = Math.min(projectionEndYear, currentYear + MAX_YEARS);

  for (let y = startYear; y <= endYear; y++) {
    let duesThisYear = 0;
    let pointsThisYear = 0;
    for (const c of contracts) {
      if (contractOwnershipStartYear(c) === y) {
        const initialCost = contractInitialCostBreakdown(c, actualFor(actuals, c)).total;
        cumOutlay += initialCost;
        fund += initialCost;
      }
    }
    for (const c of contracts) {
      const ownedThisYear = contractOwnershipStartYear(c) <= y
        && !contractExpiredBy(c, y)
        && (c.is_active || y <= currentYear);
      if (!ownedThisYear) continue;
      const actual = actualFor(actuals, c);
      const dues = duesForYear(c, y, actual, currentYear, settings.dues_growth_rate).amount;
      // Entered financing interest is cash spent that year (principal is
      // already the purchase price); like the buy-in, it's cash the
      // alternative fund would have kept.
      const interest = y <= currentYear ? interestForYear(actual, y) : 0;
      cumOutlay += dues + interest;
      fund += interest;
      duesThisYear += dues;
      pointsThisYear += c.points_per_year;
    }

    let valueThisYear;
    if (y <= currentYear) {
      valueThisYear = tripValueByYear[y] || 0;
    } else {
      const yearsFromNow = y - currentYear;
      const yearBaseline = activeContracts
        .filter(c => !contractExpiredBy(c, y))
        .reduce((sum, c) => sum + contractBaselineGrossValue(c, yearsFromNow, settings), 0);
      valueThisYear = paceReady ? (actualPace + yearBaseline) / 2 : yearBaseline;
    }
    cumValue += valueThisYear;

    const yearsFromStart = y - startYear;
    const grossRoomCost = pointsThisYear * settings.point_value_baseline * Math.pow(1 + settings.value_growth_rate, yearsFromStart);
    const netVacationWithdrawal = Math.max(0, grossRoomCost - duesThisYear);
    if (fund > 0) fund *= 1 + settings.opportunity_cost_rate;
    fund -= netVacationWithdrawal;
    if (fund <= 0) {
      if (altFundDepletionYear == null && netVacationWithdrawal > 0) altFundDepletionYear = y;
      fund = 0;
    }

    years.push(y);
    outlay.push(cumOutlay);
    value.push(cumValue);
    altFund.push(fund);

    if (crossoverYear == null && cumValue >= cumOutlay) crossoverYear = y;
  }

  return { years, outlay, value, altFund, crossoverYear, altFundDepletionYear, currentYear, horizonIsDeed };
}

function computeHouseMoneyStats(contracts, trips, settings, actuals = null) {
  settings = { ...window.DVCAuth.DEFAULT_USER_SETTINGS, ...settings };
  const currentYear = new Date().getFullYear();
  let totalPurchasePrice = 0;
  let totalClosingCosts = 0;
  let totalDuesPaid = 0;
  let totalInterestPaid = 0;
  let earliestStartYear = currentYear;
  // Which figures are the owner's own and which are modeled.
  const costSources = { duesYears: 0, actualDuesYears: 0, closingActual: 0, closingEstimated: 0, estimatedPrices: 0, estimatedStarts: 0, interestYears: 0 };
  const perContract = contracts.map(c => contractCostBreakdown(c, actualFor(actuals, c)));
  for (const b of perContract) {
    totalPurchasePrice += b.price;
    totalClosingCosts += b.closing;
    totalDuesPaid += b.duesTotal;
    totalInterestPaid += b.interestTotal;
    earliestStartYear = Math.min(earliestStartYear, b.startYear);
    costSources.duesYears += b.years.length;
    costSources.actualDuesYears += b.actualDuesYears;
    costSources.interestYears += b.years.filter(y => y.interest != null).length;
    if (b.closingSource === "actual") costSources.closingActual++; else if (b.closing > 0) costSources.closingEstimated++;
    if (b.priceSource === "estimated") costSources.estimatedPrices++;
    if (b.startEstimated) costSources.estimatedStarts++;
  }
  const totalInitialCost = totalPurchasePrice + totalClosingCosts;
  const totalOutlay = totalInitialCost + totalDuesPaid + totalInterestPaid;

  let lifetimeValue = 0;
  let tripsWithValue = 0;
  let loggedOwnedPoints = 0;
  for (const t of trips) {
    const v = tripCashValue(t, contracts);
    if (v && Number.isFinite(v.cash) && v.ownedPoints > 0) {
      lifetimeValue += v.cash;
      tripsWithValue++;
      loggedOwnedPoints += v.ownedPoints;
    }
  }

  const yearsOwned = contracts.length ? Math.max(1, currentYear - earliestStartYear + 1) : 1;
  const paybackPct = totalOutlay > 0 ? Math.min(100, Math.floor((lifetimeValue / totalOutlay) * 100)) : 0;
  const remaining = Math.max(0, totalOutlay - lifetimeValue);

  const actualPace = tripsWithValue > 0
    ? Math.max(lifetimeValue / yearsOwned, lifetimeValue / tripsWithValue)
    : 0;

  const baselinePotential = contracts
    .filter(c => c.is_active)
    .reduce((sum, c) => sum + contractBaselinePotentialValue(c, currentYear, 0, settings), 0);

  // Trip history only earns a say in the projection once it covers at least
  // one full year of the owner's points. Before that, a new owner's first
  // logged stay is a fraction of a year's usage, and blending it in 50/50
  // made logging that first trip push the payback date years LATER.
  const annualPoints = contracts.filter(c => c.is_active).reduce((sum, c) => sum + (c.points_per_year || 0), 0);
  const paceReady = tripsWithValue > 0 && loggedOwnedPoints >= annualPoints;

  let annualVelocity, velocitySource;
  if (!paceReady) {
    annualVelocity = baselinePotential;
    velocitySource = baselinePotential > 0 ? (tripsWithValue ? "baseline-early" : "baseline") : "none";
  } else {
    annualVelocity = (actualPace + baselinePotential) / 2;
    velocitySource = baselinePotential > 0 ? "blended" : "trips";
  }

  const series = buildHouseMoneySeries(contracts, trips, paceReady, actualPace, currentYear, settings, actuals);
  let estimatedHouseMoneyDate = null;
  const projectedIndex = series ? series.years.findIndex((year, i) => year > currentYear && series.value[i] >= series.outlay[i]) : -1;
  if (paybackPct < 100 && annualVelocity > 0 && projectedIndex >= 0) {
    const idx = projectedIndex;
    const prevOutlay = idx > 0 ? series.outlay[idx - 1] : 0;
    const prevValue = idx > 0 ? series.value[idx - 1] : 0;
    const remainingAtStart = Math.max(0, prevOutlay - prevValue);
    const yearGain = (series.value[idx] - prevValue) - (series.outlay[idx] - prevOutlay);
    const monthsIntoYear = yearGain > 0 ? Math.min(12, Math.ceil((remainingAtStart / yearGain) * 12)) : 12;
    // Series entries are calendar years. Interpolate net value after that
    // year's costs; do not offset from whatever month the page is opened.
    estimatedHouseMoneyDate = new Date(series.years[idx], Math.max(0, monthsIntoYear - 1), 1);
  }

  return {
    totalPurchasePrice, totalClosingCosts, totalInitialCost, totalDuesPaid, totalInterestPaid, totalOutlay, lifetimeValue,
    costSources, perContract,
    paybackPct, remaining, yearsOwned, actualPace, baselinePotential, annualVelocity, velocitySource,
    estimatedHouseMoneyDate, series, settings,
    tripsLogged: trips.length,
    netFreeVacations: lifetimeValue - totalOutlay,
  };
}


return { contractInitialCostBreakdown, contractInitialCost, contractOwnershipStartYear, contractDeedExpirationYear, contractExpiredBy, contractDuesPaidToDate, contractCostBreakdown, duesForYear, projectedDuesForYear, contractBaselineGrossValue, contractBaselinePotentialValue, buildHouseMoneySeries, computeHouseMoneyStats };
}
window.DVCOwnerValue = { create };
})();
