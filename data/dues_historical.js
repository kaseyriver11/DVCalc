// Historical annual DVC dues per point, by resort and calendar year.
// Used by trips.html's cost-of-ownership amortization so a contract's
// dues cost reflects what was actually charged each year, not today's
// rate applied retroactively.
//
// Sourced 2026-09-04 from dvcnews.com's historical dues-by-resort table
// (https://dvcnews.com/dvc-program-menu/financial/annual-dues-by-resort),
// cross-checked against dvcresalemarket.com's 2026 dues blog post and
// dvcresaleexperts.com's historical dues report. All 2026 figures match
// data.js's DUES_PER_POINT exactly. No fabricated or interpolated values
// -- every number here came from a real published source; see caveats
// below for the two spots where confidence is lower or coverage starts
// later than the resort's building-opening date.
//
// Caveats:
// - grandFloridian 2016-2023 rests on a single source (dvcresaleexperts.com)
//   rather than two independent ones -- dvcnews.com's own table had an
//   internally-inconsistent dip in that stretch that didn't match the
//   confirmed 2024-2026 trend, so it was set aside in favor of the
//   sequence that threads consistently into the confirmed years.
// - disneylandHotel (Villas at Disneyland Hotel) dues data starts 2023,
//   not earlier -- DVC sales for this property didn't open until May
//   2023, regardless of when the building itself opened.
// - fortWildernessCabins dues data starts 2024 -- DVC sales opened
//   Feb 2024, with resort occupancy beginning that July.
const DUES_HISTORY = {
  oldKeyWest: {
    2016: 6.01, 2017: 6.41, 2018: 6.72, 2019: 7.23, 2020: 7.84,
    2021: 8.36, 2022: 8.81, 2023: 9.36, 2024: 9.87, 2025: 10.50, 2026: 11.21,
  },
  boardwalkVillas: {
    2016: 6.18, 2017: 6.47, 2018: 6.55, 2019: 7.17, 2020: 7.37,
    2021: 7.81, 2022: 8.08, 2023: 8.53, 2024: 8.67, 2025: 9.06, 2026: 9.67,
  },
  beachClubVillas: {
    2016: 6.13, 2017: 6.27, 2018: 6.44, 2019: 6.94, 2020: 7.06,
    2021: 7.44, 2022: 7.54, 2023: 8.17, 2024: 8.63, 2025: 9.12, 2026: 9.81,
  },
  boulderRidge: {
    2016: 6.22, 2017: 6.54, 2018: 6.93, 2019: 7.32, 2020: 7.78,
    2021: 8.11, 2022: 8.15, 2023: 8.51, 2024: 8.68, 2025: 9.19, 2026: 9.77,
  },
  bayLakeTower: {
    2016: 5.28, 2017: 5.62, 2018: 5.92, 2019: 6.40, 2020: 6.58,
    2021: 6.90, 2022: 7.08, 2023: 7.43, 2024: 7.59, 2025: 8.02, 2026: 8.74,
  },
  grandFloridian: {
    2016: 5.71, 2017: 5.90, 2018: 6.13, 2019: 6.39, 2020: 6.56,
    2021: 6.81, 2022: 7.01, 2023: 7.33, 2024: 7.57, 2025: 7.93, 2026: 8.31,
  },
  saratogaSprings: {
    2016: 5.44, 2017: 5.60, 2018: 5.86, 2019: 6.40, 2020: 6.77,
    2021: 7.11, 2022: 7.33, 2023: 7.86, 2024: 8.14, 2025: 8.54, 2026: 9.19,
  },
  animalKingdomVillas: {
    2016: 6.42, 2017: 6.59, 2018: 6.76, 2019: 7.44, 2020: 7.67,
    2021: 8.07, 2022: 8.24, 2023: 8.81, 2024: 9.08, 2025: 9.65, 2026: 10.16,
  },
  polynesianVillas: {
    2016: 6.09, 2017: 6.14, 2018: 6.20, 2019: 6.76, 2020: 6.79,
    2021: 7.05, 2022: 7.39, 2023: 7.95, 2024: 8.23, 2025: 7.93, 2026: 8.33,
  },
  copperCreek: {
    2017: 7.33, 2018: 7.26, 2019: 7.42, 2020: 7.45, 2021: 7.59,
    2022: 7.60, 2023: 7.92, 2024: 8.09, 2025: 8.49, 2026: 9.02,
  },
  rivieraResort: {
    2019: 8.31, 2020: 8.31, 2021: 8.38, 2022: 8.38,
    2023: 8.50, 2024: 8.85, 2025: 9.06, 2026: 9.46,
  },
  disneylandHotel: {
    2023: 9.06, 2024: 9.53, 2025: 9.82, 2026: 10.54,
  },
  fortWildernessCabins: {
    2024: 12.16, 2025: 11.88, 2026: 12.28,
  },
  aulani: {
    2011: 5.73, 2012: 5.96, 2013: 6.25, 2014: 6.44, 2015: 6.51,
    2016: 6.79, 2017: 7.03, 2018: 7.53, 2019: 7.86, 2020: 8.33,
    2021: 8.35, 2022: 8.67, 2023: 9.14, 2024: 9.76, 2025: 10.12, 2026: 10.96,
  },
  grandCalifornian: {
    2009: 3.82, 2010: 3.94, 2011: 4.07, 2012: 4.33, 2013: 4.58,
    2014: 4.94, 2015: 5.15, 2016: 5.37, 2017: 5.61, 2018: 5.88,
    2019: 6.27, 2020: 6.60, 2021: 6.99, 2022: 7.48, 2023: 8.04,
    2024: 8.55, 2025: 8.80, 2026: 9.52,
  },
  veroBeach: {
    2016: 8.08, 2017: 8.11, 2018: 8.53, 2019: 9.48, 2020: 10.13,
    2021: 11.23, 2022: 11.94, 2023: 12.85, 2024: 13.86, 2025: 14.30, 2026: 14.89,
  },
  hiltonHead: {
    2016: 6.82, 2017: 7.27, 2018: 7.72, 2019: 8.56, 2020: 9.10,
    2021: 9.97, 2022: 10.07, 2023: 10.73, 2024: 11.31, 2025: 11.92, 2026: 12.86,
  },
};

// Dues for a resort in a given year, falling back to the nearest year on
// record when the requested year falls outside a resort's known range
// (e.g. a contract purchased before the resort's dues history starts, or
// a projection year past the most recent published rate).
function getDuesForYear(resortId, year) {
  const history = DUES_HISTORY[resortId];
  if (!history) return DUES_PER_POINT[resortId] || 0;
  if (history[year] != null) return history[year];
  const years = Object.keys(history).map(Number);
  const clampedYear = Math.max(Math.min(...years), Math.min(year, Math.max(...years)));
  return history[clampedYear];
}
