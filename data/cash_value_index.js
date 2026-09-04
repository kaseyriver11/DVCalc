// Approximate year-over-year WDW resort price index, used to deflate a
// trip's cash-value estimate for the year it actually happened -- without
// this, a 2017 stay would get priced at today's rates, meaningfully
// overstating what it actually cost (a $10,000-today stay might have
// really been closer to $6,800 back in 2017).
//
// We don't have a full historical rack-rate archive for every DVC resort
// (see trips.html's estimateTripCashValue for that caveat), so this is a
// single blended index, not a per-resort fact. Built from Disney's Port
// Orleans Resort's published historical rate table
// (https://www.portorleans.org/roomrates-historical.php), the most
// complete, consistent, single-source year-by-year series found. Port
// Orleans is a moderate resort, not deluxe (the tier DVC resorts belong
// to), but sanity-checked closely against two independent deluxe data
// points: Grand Floridian's published $800/night (2019) -> $963/night
// (2024) is a 1.204x increase over 5 years, vs. Port Orleans' $231.75 ->
// $289.13 = 1.248x over the same span -- close enough that this is a
// reasonable general proxy for "how much has a WDW resort stay's price
// grown," not a claim about any specific resort's actual rate.
//
// 2020 and 2021 are interpolated (Port Orleans was closed mid-March 2020
// through October 2021 for COVID, so no real rate was published that
// covers those years) using a smooth geometric ramp between the confirmed
// 2019 and 2022 rates -- flagged here as interpolated, not sourced.
//
// Index is normalized to 2026 = 1.0, matching data.js's cash-rate anchor
// year (rates sourced from MouseSavers 2026 data).
const CASH_VALUE_INDEX = {
  2007: 0.4747, 2008: 0.4747, 2009: 0.4747, 2010: 0.4747,
  2011: 0.4906, 2012: 0.5066, 2013: 0.5161,
  2014: 0.5799, 2015: 0.5799,
  2016: 0.6276, 2017: 0.6785, 2018: 0.6952, 2019: 0.7384,
  2020: 0.7719, // interpolated -- resort closed for COVID
  2021: 0.8073, // interpolated -- resort closed for COVID
  2022: 0.8442, 2023: 0.8889, 2024: 0.9212, 2025: 0.9212, 2026: 1.0000,
};

// Multiplier for a given year, clamped to the nearest year on record for
// anything outside the index's range (e.g. a resort that opened after
// 2026, or a trip logged before 2007).
function getCashValueMultiplier(year) {
  if (CASH_VALUE_INDEX[year] != null) return CASH_VALUE_INDEX[year];
  const years = Object.keys(CASH_VALUE_INDEX).map(Number);
  const clampedYear = Math.max(Math.min(...years), Math.min(year, Math.max(...years)));
  return CASH_VALUE_INDEX[clampedYear];
}
