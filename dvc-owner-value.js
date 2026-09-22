// One ownership-value model for Home and Membership Value.
// tripCashValue resolves the logged value attributable to owned contracts.
(function () {
  function create(tripCashValue) {
const FALLBACK_PRICE_PER_POINT = 140;

function contractInitialCostBreakdown(c) {
  const closing = c.purchase_type === "resale" ? 1500 : 0;
  const price = c.purchase_price != null
    ? c.purchase_price
    : (RESORT_INVESTMENT_DATA[c.home_resort_id]?.resalePricePerPoint || FALLBACK_PRICE_PER_POINT) * c.points_per_year;
  return { price, closing, total: price + closing };
}

function contractInitialCost(c) {
  return contractInitialCostBreakdown(c).total;
}

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

function contractDuesPaidToDate(c) {
  const currentYear = new Date().getFullYear();
  const startYear = contractOwnershipStartYear(c);
  let total = 0;
  for (let y = startYear; y <= currentYear; y++) {
    total += getDuesForYear(c.home_resort_id, y) * c.points_per_year;
  }
  return total;
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

function buildHouseMoneySeries(contracts, trips, tripsWithValue, actualPace, currentYear, settings) {
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
        const initialCost = contractInitialCostBreakdown(c).total;
        cumOutlay += initialCost;
        fund += initialCost;
      }
    }
    for (const c of contracts) {
      const ownedThisYear = contractOwnershipStartYear(c) <= y
        && !contractExpiredBy(c, y)
        && (c.is_active || y <= currentYear);
      if (!ownedThisYear) continue;
      const rate = y <= currentYear ? getDuesForYear(c.home_resort_id, y) : projectedDuesForYear(c.home_resort_id, y, settings.dues_growth_rate);
      const dues = c.points_per_year * rate;
      cumOutlay += dues;
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
      valueThisYear = tripsWithValue === 0 ? yearBaseline : (actualPace + yearBaseline) / 2;
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

function computeHouseMoneyStats(contracts, trips, settings) {
  settings = { ...window.DVCAuth.DEFAULT_USER_SETTINGS, ...settings };
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
  const paybackPct = totalOutlay > 0 ? Math.min(100, Math.floor((lifetimeValue / totalOutlay) * 100)) : 0;
  const remaining = Math.max(0, totalOutlay - lifetimeValue);

  const actualPace = tripsWithValue > 0
    ? Math.max(lifetimeValue / yearsOwned, lifetimeValue / tripsWithValue)
    : 0;

  const baselinePotential = contracts
    .filter(c => c.is_active)
    .reduce((sum, c) => sum + contractBaselinePotentialValue(c, currentYear, 0, settings), 0);

  let annualVelocity, velocitySource;
  if (tripsWithValue === 0) {
    annualVelocity = baselinePotential;
    velocitySource = baselinePotential > 0 ? "baseline" : "none";
  } else {
    annualVelocity = (actualPace + baselinePotential) / 2;
    velocitySource = baselinePotential > 0 ? "blended" : "trips";
  }

  const series = buildHouseMoneySeries(contracts, trips, tripsWithValue, actualPace, currentYear, settings);
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
    totalPurchasePrice, totalClosingCosts, totalInitialCost, totalDuesPaid, totalOutlay, lifetimeValue,
    paybackPct, remaining, yearsOwned, actualPace, baselinePotential, annualVelocity, velocitySource,
    estimatedHouseMoneyDate, series, settings,
    tripsLogged: trips.length,
    netFreeVacations: lifetimeValue - totalOutlay,
  };
}


return { contractInitialCostBreakdown, contractInitialCost, contractOwnershipStartYear, contractDeedExpirationYear, contractExpiredBy, contractDuesPaidToDate, projectedDuesForYear, contractBaselineGrossValue, contractBaselinePotentialValue, buildHouseMoneySeries, computeHouseMoneyStats };
}
window.DVCOwnerValue = { create };
})();
