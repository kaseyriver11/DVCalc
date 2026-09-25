// One ownership-value model for Home, Membership Value and the Trophy Room.
// tripCashValue resolves the logged value attributable to owned contracts.
//
// Costs to date: the purchase price as entered -- what the owner paid all
// in, closing included, so nothing is added on top (a resale-price
// estimate stands in only when no price was entered) -- each year's
// published dues rate, and the owner's own estimate of financing interest
// paid to date (contracts.financing_interest_paid, migration 029), if any.
// The purchase price is the loan principal, so interest never counts it
// twice. Future years use projected dues.
//
// A sold or ended contract (contracts.ended_on, migration 030) stops paying
// dues after its end year, and what the owner got back (sale_proceeds, net
// of fees) comes off what ownership has cost.
(function () {
  function create(tripCashValue) {
const FALLBACK_PRICE_PER_POINT = 140;

function contractInitialCostBreakdown(c) {
  const priceEntered = c.purchase_price != null;
  const price = priceEntered
    ? Number(c.purchase_price)
    : (RESORT_INVESTMENT_DATA[c.home_resort_id]?.resalePricePerPoint || FALLBACK_PRICE_PER_POINT) * c.points_per_year;
  return { price, total: price, priceSource: priceEntered ? "entered" : "estimated" };
}

function contractInitialCost(c) {
  return contractInitialCostBreakdown(c).total;
}

// The owner's estimate of financing interest paid so far (0 if none).
function contractInterestPaid(c) {
  const n = Number(c.financing_interest_paid);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// One calendar year's dues: the published rate, projected after this year.
// A year past the last one in DUES_HISTORY is projected too, even once it's
// here -- getDuesForYear() would otherwise quietly hand back the last
// published rate as if it were that year's.
function lastPublishedDuesYear(resortId) {
  const history = DUES_HISTORY[resortId];
  return history ? Math.max(...Object.keys(history).map(Number)) : null;
}
function duesForYear(c, year, currentYear, duesGrowthRate) {
  const lastKnown = lastPublishedDuesYear(c.home_resort_id);
  if (year > currentYear || (lastKnown != null && year > lastKnown)) {
    return { amount: c.points_per_year * projectedDuesForYear(c.home_resort_id, year, duesGrowthRate), source: "projected" };
  }
  return { amount: getDuesForYear(c.home_resort_id, year) * c.points_per_year, source: "published" };
}

// The calendar year a sold/ended contract stopped (ended_on), or null.
function contractEndYear(c) {
  return c.ended_on ? parseInt(String(c.ended_on).slice(0, 4), 10) : null;
}

// What the owner got back selling it, net of fees (0 if none entered).
function contractSaleProceeds(c) {
  const n = Number(c.sale_proceeds);
  return c.ended_on && Number.isFinite(n) && n > 0 ? n : 0;
}

// Whether a contract was held (and paid dues) in a calendar year. An
// inactive contract with no end date keeps counting through this year,
// since nothing says when it stopped.
function contractOwnedInYear(c, year, currentYear) {
  if (contractOwnershipStartYear(c) > year || contractExpiredBy(c, year)) return false;
  const end = contractEndYear(c);
  if (end != null) return year <= end;
  return c.is_active || year <= currentYear;
}

// The last calendar year dues have been paid through, as of this year.
function contractLastPaidYear(c, currentYear) {
  const end = contractEndYear(c);
  return end != null ? Math.min(end, currentYear) : currentYear;
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
  for (let y = startYear; y <= contractLastPaidYear(c, currentYear); y++) {
    total += duesForYear(c, y, currentYear, 0).amount;
  }
  return total;
}

// Everything one contract has cost so far -- the per-contract cards on
// Membership Value -- with the price's and start year's source.
function contractCostBreakdown(c) {
  const currentYear = new Date().getFullYear();
  const startYear = contractOwnershipStartYear(c);
  const years = [];
  let duesTotal = 0;
  for (let y = startYear; y <= contractLastPaidYear(c, currentYear); y++) {
    const d = duesForYear(c, y, currentYear, 0);
    years.push({ year: y, dues: d.amount, rate: d.amount / c.points_per_year, rateSource: d.source });
    duesTotal += d.amount;
  }
  const initial = contractInitialCostBreakdown(c);
  const interest = contractInterestPaid(c);
  const saleProceeds = contractSaleProceeds(c);
  return { contract: c, startYear, startEstimated: !c.purchase_date, endYear: contractEndYear(c), years, duesTotal, interest,
    saleProceeds, ...initial, totalToDate: initial.total + duesTotal + interest - saleProceeds };
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

// Points held in a calendar year across the given contracts.
function pointsOwnedInYear(contracts, year, currentYear) {
  return contracts.reduce((sum, c) => sum + (contractOwnedInYear(c, year, currentYear) ? c.points_per_year : 0), 0);
}

// paceValuePerPoint: logged value per point-year owned, or null before trip
// history counts. Projected years scale it by the points still held that
// year and grow it at the vacation-value rate, like the contract baseline.
function buildHouseMoneySeries(contracts, trips, paceValuePerPoint, currentYear, settings) {
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
        // Financing interest to date is part of what buying cost, so it lands
        // with the buy-in (the chart has no per-year interest to spread it by).
        const initialCost = contractInitialCostBreakdown(c).total + contractInterestPaid(c);
        cumOutlay += initialCost;
        fund += initialCost;
      }
    }
    for (const c of contracts) {
      if (contractEndYear(c) === y) cumOutlay -= contractSaleProceeds(c);
    }
    for (const c of contracts) {
      if (!contractOwnedInYear(c, y, currentYear)) continue;
      const dues = duesForYear(c, y, currentYear, settings.dues_growth_rate).amount;
      cumOutlay += dues;
      duesThisYear += dues;
      pointsThisYear += c.points_per_year;
    }

    let valueThisYear;
    if (y <= currentYear) {
      valueThisYear = tripValueByYear[y] || 0;
    } else {
      const yearsFromNow = y - currentYear;
      const held = activeContracts.filter(c => contractOwnedInYear(c, y, currentYear));
      const yearBaseline = held.reduce((sum, c) => sum + contractBaselineGrossValue(c, yearsFromNow, settings), 0);
      if (paceValuePerPoint != null) {
        const heldPoints = held.reduce((sum, c) => sum + c.points_per_year, 0);
        const tripPace = paceValuePerPoint * heldPoints * Math.pow(1 + settings.value_growth_rate, yearsFromNow);
        valueThisYear = (tripPace + yearBaseline) / 2;
      } else {
        valueThisYear = yearBaseline;
      }
    }
    cumValue += valueThisYear;

    // The invested-instead fund buys the same rooms at the same $/pt as the
    // value line: today's setting grown (or, for past years, shrunk) from
    // this year, not from the purchase year.
    const grossRoomCost = pointsThisYear * settings.point_value_baseline * Math.pow(1 + settings.value_growth_rate, y - currentYear);
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
  let totalDuesPaid = 0;
  let totalInterestPaid = 0;
  let totalSaleProceeds = 0;
  let earliestStartYear = currentYear;
  // Which figures are estimated rather than entered by the owner.
  const costSources = { estimatedPrices: 0, estimatedStarts: 0 };
  const perContract = contracts.map(c => contractCostBreakdown(c));
  for (const b of perContract) {
    totalPurchasePrice += b.price;
    totalDuesPaid += b.duesTotal;
    totalInterestPaid += b.interest;
    totalSaleProceeds += b.saleProceeds;
    earliestStartYear = Math.min(earliestStartYear, b.startYear);
    if (b.priceSource === "estimated") costSources.estimatedPrices++;
    if (b.startEstimated) costSources.estimatedStarts++;
  }
  const totalInitialCost = totalPurchasePrice;
  const totalOutlay = totalInitialCost + totalDuesPaid + totalInterestPaid - totalSaleProceeds;

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

  // Trip pace is logged value per point-year actually owned -- not per trip,
  // which read one big stay as that much every year -- stated at this
  // year's holdings.
  let pointYearsOwned = 0;
  for (let y = earliestStartYear; y <= currentYear; y++) pointYearsOwned += pointsOwnedInYear(contracts, y, currentYear);
  const paceValuePerPoint = tripsWithValue > 0 && pointYearsOwned > 0 ? lifetimeValue / pointYearsOwned : 0;
  const activeHeld = contracts.filter(c => c.is_active && contractOwnedInYear(c, currentYear, currentYear));
  const actualPace = paceValuePerPoint * activeHeld.reduce((sum, c) => sum + c.points_per_year, 0);

  // Value before dues, like the chart's value line (where dues count as
  // cost), so the pace and the chart measure the same thing.
  const baselinePotential = activeHeld.reduce((sum, c) => sum + contractBaselineGrossValue(c, 0, settings), 0);

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

  const series = buildHouseMoneySeries(contracts, trips, paceReady ? paceValuePerPoint : null, currentYear, settings);
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
    totalPurchasePrice, totalInitialCost, totalDuesPaid, totalInterestPaid, totalSaleProceeds, totalOutlay, lifetimeValue,
    costSources, perContract,
    paybackPct, remaining, yearsOwned, actualPace, baselinePotential, annualVelocity, velocitySource,
    estimatedHouseMoneyDate, series, settings,
    tripsLogged: trips.length,
    netFreeVacations: lifetimeValue - totalOutlay,
  };
}


return { FALLBACK_PRICE_PER_POINT, contractEndYear, contractSaleProceeds, contractOwnedInYear, contractInitialCostBreakdown, contractInitialCost, contractInterestPaid, contractOwnershipStartYear, contractDeedExpirationYear, contractExpiredBy, contractDuesPaidToDate, contractCostBreakdown, duesForYear, projectedDuesForYear, contractBaselineGrossValue, contractBaselinePotentialValue, buildHouseMoneySeries, computeHouseMoneyStats };
}
window.DVCOwnerValue = { create };
})();
