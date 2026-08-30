// DVC Points Data — All Disney Vacation Club Resorts (2026 & 2027)
// Rack rate estimates sourced from MouseSavers 2026 data (includes 12.5% tax)

// Default rental rate per point (DVC rental market average)
const DEFAULT_RENTAL_RATE = 20;

// Annual dues per point by resort (2026, source: dvcresalemarket.com)
const DUES_PER_POINT = {
  animalKingdomVillas: 10.16,
  bayLakeTower: 8.74,
  beachClubVillas: 9.81,
  boardwalkVillas: 9.67,
  boulderRidge: 9.77,
  copperCreek: 9.02,
  fortWildernessCabins: 12.28,
  grandFloridian: 8.31,
  oldKeyWest: 11.21,
  polynesianVillas: 8.33,
  rivieraResort: 9.46,
  saratogaSprings: 9.19,
  aulani: 10.96,
  hiltonHead: 12.86,
  veroBeach: 14.89,
  disneylandHotel: 10.54,
  grandCalifornian: 9.52,
};

// Helper: All WDW DVC resorts share the same 7 season date ranges.
// Pass an array of 7 rate objects [Adventure, Dream, Choice, Select, Preferred, Premier, Holiday].
//
// Cash rate mapping from MouseSavers micro-seasons to DVC periods:
//   [0] Adventure (Sep)     ← MouseSavers "Sep 11 - Oct 1" (Fall 1) row; direct date overlap
//   [1] Dream (Jan, May)    ← MouseSavers "Jan 20 - Feb 4" (Value) row; representative low season
//   [2] Choice (May-Jun, Dec 1-23) ← Average of Dream row + Select row; transitional period
//   [3] Select (Feb, Jun-Aug) ← MouseSavers "Jul 5 - Aug 13" (Summer 2) row; peak summer
//   [4] Preferred (Oct-Nov) ← MouseSavers "Oct 5 - Nov 24" (Fall 2) row; direct date overlap
//   [5] Premier (Feb-Mar, Apr, Thanksgiving) ← MouseSavers "Mar 6 - 28" (Spring) row; spring break
//   [6] Holiday (Easter, Dec 24-31) ← Average of Easter + Holiday rows; same rate Sun-Thu & Fri-Sat
//
// All cash rates include 12.5% FL tax (MouseSavers lists pre-tax; multiply by 1.125).
// sunThu uses MouseSavers Sun-Wed column; friSat uses MouseSavers Fri-Sat column.
// Holiday period uses the same rate for both day types (no variance on MouseSavers).
function wdwPeriods(rates, cashRates) {
  const defs = [
    { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
    { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
    { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
    { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
    { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
    { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
    { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-12-24", end: "2026-12-31" }] },
  ];
  return defs.map((def, i) => {
    const period = { ...def, rates: rates[i] };
    if (cashRates && cashRates[i]) period.cashRates = cashRates[i];
    return period;
  });
}

// Helper: 2027 WDW season date ranges (shifted from 2026 for Easter/Thanksgiving).
// Same 7 period names; only Preferred, Premier, and Holiday dates differ.
function wdwPeriods2027(rates, cashRates) {
  const defs = [
    { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
    { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
    { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
    { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
    { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
    { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
    { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-12-24", end: "2027-12-31" }] },
  ];
  return defs.map((def, i) => {
    const period = { ...def, rates: rates[i] };
    if (cashRates && cashRates[i]) period.cashRates = cashRates[i];
    return period;
  });
}

const RESORTS = [

  // ===========================================================================================
  // WALT DISNEY WORLD RESORTS
  // ===========================================================================================

  // --- Disney's Animal Kingdom Villas ---
  // Views: V=Value, R=Resort, SV=Savanna, C=Club Concierge (Jambo House + Kidani Village)
  // Cash rates: MouseSavers 2026 Jambo House + Kidani Village pages, averaged where both
  // buildings offer the same view (dsR, dsSV, oneR, oneSV, threeSV). twoV/twoC omitted --
  // MouseSavers doesn't list Value or Club Concierge 2-Bedroom villas for either building.
  {
    id: "animalKingdomVillas",
    name: "Disney's Animal Kingdom Villas",
    year: 2026,
    roomTypes: [
      { id: "dsV", name: "Deluxe Studio - Value", sleeps: 4 },
      { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 4 },
      { id: "dsSV", name: "Deluxe Studio - Savanna View", sleeps: 4 },
      { id: "dsC", name: "Deluxe Studio - Club Concierge", sleeps: 4 },
      { id: "oneV", name: "One-Bedroom Villa - Value", sleeps: 5 },
      { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
      { id: "oneSV", name: "One-Bedroom Villa - Savanna View", sleeps: 5 },
      { id: "oneC", name: "One-Bedroom Villa - Club Concierge", sleeps: 5 },
      { id: "twoV", name: "Two-Bedroom Villa - Value", sleeps: 9 },
      { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
      { id: "twoSV", name: "Two-Bedroom Villa - Savanna View", sleeps: 9 },
      { id: "twoC", name: "Two-Bedroom Villa - Club Concierge", sleeps: 9 },
      { id: "threeR", name: "Three-Bedroom Grand Villa - Resort View", sleeps: 12 },
      { id: "threeSV", name: "Three-Bedroom Grand Villa - Savanna View", sleeps: 12 },
    ],
    travelPeriods: wdwPeriods([
      { sunThu: { dsV:7, dsR:10, dsSV:13, dsC:18, oneV:17, oneR:20, oneSV:27, oneC:38, twoV:22, twoR:28, twoSV:35, twoC:51, threeR:68, threeSV:73 },
        friSat: { dsV:10, dsR:13, dsSV:16, dsC:22, oneV:20, oneR:25, oneSV:31, oneC:43, twoV:28, twoR:34, twoSV:43, twoC:58, threeR:78, threeSV:85 } },
      { sunThu: { dsV:8, dsR:12, dsSV:15, dsC:20, oneV:19, oneR:24, oneSV:31, oneC:41, twoV:25, twoR:31, twoSV:39, twoC:55, threeR:73, threeSV:79 },
        friSat: { dsV:11, dsR:14, dsSV:17, dsC:23, oneV:21, oneR:28, oneSV:34, oneC:46, twoV:31, twoR:37, twoSV:48, twoC:63, threeR:82, threeSV:89 } },
      { sunThu: { dsV:8, dsR:13, dsSV:16, dsC:21, oneV:20, oneR:26, oneSV:33, oneC:43, twoV:27, twoR:32, twoSV:42, twoC:58, threeR:78, threeSV:86 },
        friSat: { dsV:12, dsR:15, dsSV:18, dsC:24, oneV:22, oneR:29, oneSV:35, oneC:49, twoV:32, twoR:39, twoSV:50, twoC:66, threeR:88, threeSV:96 } },
      { sunThu: { dsV:9, dsR:14, dsSV:17, dsC:22, oneV:21, oneR:27, oneSV:34, oneC:44, twoV:29, twoR:35, twoSV:43, twoC:60, threeR:81, threeSV:89 },
        friSat: { dsV:12, dsR:15, dsSV:20, dsC:24, oneV:24, oneR:30, oneSV:36, oneC:50, twoV:34, twoR:40, twoSV:52, twoC:66, threeR:91, threeSV:100 } },
      { sunThu: { dsV:10, dsR:15, dsSV:19, dsC:23, oneV:23, oneR:29, oneSV:35, oneC:46, twoV:30, twoR:36, twoSV:47, twoC:61, threeR:88, threeSV:96 },
        friSat: { dsV:13, dsR:16, dsSV:20, dsC:25, oneV:26, oneR:32, oneSV:39, oneC:53, twoV:35, twoR:44, twoSV:57, twoC:71, threeR:100, threeSV:110 } },
      { sunThu: { dsV:12, dsR:16, dsSV:19, dsC:23, oneV:24, oneR:32, oneSV:38, oneC:49, twoV:31, twoR:40, twoSV:52, twoC:66, threeR:97, threeSV:107 },
        friSat: { dsV:14, dsR:18, dsSV:22, dsC:26, oneV:27, oneR:35, oneSV:41, oneC:56, twoV:36, twoR:48, twoSV:61, twoC:77, threeR:111, threeSV:121 } },
      { sunThu: { dsV:16, dsR:21, dsSV:27, dsC:33, oneV:31, oneR:38, oneSV:47, oneC:65, twoV:43, twoR:55, twoSV:70, twoC:88, threeR:117, threeSV:127 },
        friSat: { dsV:17, dsR:23, dsSV:29, dsC:36, oneV:35, oneR:45, oneSV:52, oneC:73, twoV:48, twoR:60, twoSV:76, twoC:98, threeR:135, threeSV:144 } },
    ], [ // cashRates (MouseSavers 2026 rack rates incl. 12.5% tax)
      { sunThu: { dsV:666, dsR:754, dsSV:971, dsC:1086, oneV:986, oneR:1114, oneSV:1316, oneC:1540, twoR:1820, twoSV:2063, threeR:3616, threeSV:3787 },
        friSat: { dsV:752, dsR:807, dsSV:1022, dsC:1229, oneV:1116, oneR:1259, oneSV:1488, oneC:1744, twoR:1917, twoSV:2167, threeR:3818, threeSV:3974 } },
      { sunThu: { dsV:609, dsR:674, dsSV:928, dsC:1062, oneV:993, oneR:1091, oneSV:1348, oneC:1559, twoR:1664, twoSV:1886, threeR:3485, threeSV:3665 },
        friSat: { dsV:648, dsR:723, dsSV:932, dsC:1134, oneV:1054, oneR:1162, oneSV:1439, oneC:1659, twoR:1778, twoSV:1956, threeR:3592, threeSV:3840 } },
      { sunThu: { dsV:598, dsR:660, dsSV:879, dsC:1019, oneV:929, oneR:1047, oneSV:1274, oneC:1460, twoR:1607, twoSV:1817, threeR:3363, threeSV:3536 },
        friSat: { dsV:620, dsR:689, dsSV:900, dsC:1059, oneV:962, oneR:1085, oneSV:1322, oneC:1514, twoR:1684, twoSV:1874, threeR:3455, threeSV:3665 } },
      { sunThu: { dsV:587, dsR:647, dsSV:830, dsC:977, oneV:864, oneR:1004, oneSV:1199, oneC:1361, twoR:1550, twoSV:1748, threeR:3241, threeSV:3406 },
        friSat: { dsV:592, dsR:655, dsSV:869, dsC:983, oneV:870, oneR:1008, oneSV:1206, oneC:1368, twoR:1590, twoSV:1791, threeR:3319, threeSV:3490 } },
      { sunThu: { dsV:645, dsR:699, dsSV:948, dsC:1137, oneV:1091, oneR:1166, oneSV:1447, oneC:1674, twoR:1875, twoSV:2098, threeR:3641, threeSV:3806 },
        friSat: { dsV:741, dsR:804, dsSV:1071, dsC:1301, oneV:1227, oneR:1331, oneSV:1647, oneC:1907, twoR:2149, twoSV:2396, threeR:4196, threeSV:4346 } },
      { sunThu: { dsV:754, dsR:817, dsSV:1055, dsC:1274, oneV:1216, oneR:1333, oneSV:1672, oneC:1905, twoR:2265, twoSV:2715, threeR:4254, threeSV:4418 },
        friSat: { dsV:830, dsR:900, dsSV:1175, dsC:1429, oneV:1361, oneR:1498, oneSV:1875, oneC:2145, twoR:2539, twoSV:3034, threeR:4754, threeSV:4938 } },
      { sunThu: { dsV:908, dsR:983, dsSV:1304, dsC:1600, oneV:1391, oneR:1626, oneSV:1850, oneC:2120, twoR:2713, twoSV:3239, threeR:5047, threeSV:5238 },
        friSat: { dsV:908, dsR:983, dsSV:1304, dsC:1600, oneV:1391, oneR:1626, oneSV:1850, oneC:2120, twoR:2713, twoSV:3239, threeR:5047, threeSV:5238 } },
    ]),
  },

  // --- Bay Lake Tower at Disney's Contemporary Resort ---
  // Views: R=Resort, P=Preferred, TP=Theme Park
  {
    id: "bayLakeTower",
    name: "Bay Lake Tower at Disney's Contemporary Resort",
    year: 2026,
    roomTypes: [
      { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 4 },
      { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 4 },
      { id: "dsTP", name: "Deluxe Studio - Theme Park View", sleeps: 4 },
      { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
      { id: "oneP", name: "One-Bedroom Villa - Preferred View", sleeps: 5 },
      { id: "oneTP", name: "One-Bedroom Villa - Theme Park View", sleeps: 5 },
      { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
      { id: "twoP", name: "Two-Bedroom Villa - Preferred View", sleeps: 9 },
      { id: "twoTP", name: "Two-Bedroom Villa - Theme Park View", sleeps: 9 },
      { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred View", sleeps: 12 },
      { id: "threeTP", name: "Three-Bedroom Grand Villa - Theme Park View", sleeps: 12 },
    ],
    travelPeriods: wdwPeriods([
      { sunThu: { dsR:13, dsP:16, dsTP:18, oneR:24, oneP:29, oneTP:35, twoR:35, twoP:38, twoTP:48, threeP:82, threeTP:101 },
        friSat: { dsR:16, dsP:19, dsTP:23, oneR:32, oneP:36, oneTP:44, twoR:42, twoP:47, twoTP:59, threeP:98, threeTP:120 } },
      { sunThu: { dsR:15, dsP:18, dsTP:20, oneR:28, oneP:33, oneTP:39, twoR:40, twoP:43, twoTP:54, threeP:88, threeTP:106 },
        friSat: { dsR:17, dsP:19, dsTP:23, oneR:35, oneP:38, oneTP:46, twoR:45, twoP:50, twoTP:61, threeP:104, threeTP:125 } },
      { sunThu: { dsR:16, dsP:19, dsTP:21, oneR:30, oneP:35, oneTP:41, twoR:42, twoP:46, twoTP:57, threeP:96, threeTP:115 },
        friSat: { dsR:18, dsP:20, dsTP:25, oneR:38, oneP:41, oneTP:50, twoR:48, twoP:54, twoTP:66, threeP:112, threeTP:135 } },
      { sunThu: { dsR:17, dsP:19, dsTP:23, oneR:31, oneP:36, oneTP:45, twoR:43, twoP:47, twoTP:58, threeP:100, threeTP:120 },
        friSat: { dsR:19, dsP:21, dsTP:26, oneR:39, oneP:44, oneTP:53, twoR:49, twoP:58, twoTP:67, threeP:115, threeTP:141 } },
      { sunThu: { dsR:18, dsP:20, dsTP:24, oneR:33, oneP:38, oneTP:47, twoR:45, twoP:50, twoTP:60, threeP:108, threeTP:131 },
        friSat: { dsR:21, dsP:23, dsTP:27, oneR:41, oneP:47, oneTP:56, twoR:53, twoP:61, twoTP:72, threeP:126, threeTP:153 } },
      { sunThu: { dsR:19, dsP:21, dsTP:26, oneR:36, oneP:42, oneTP:49, twoR:50, twoP:54, twoTP:65, threeP:120, threeTP:143 },
        friSat: { dsR:22, dsP:24, dsTP:29, oneR:44, oneP:48, oneTP:59, twoR:57, twoP:62, twoTP:76, threeP:140, threeTP:168 } },
      { sunThu: { dsR:26, dsP:28, dsTP:34, oneR:48, oneP:53, oneTP:64, twoR:66, twoP:72, twoTP:88, threeP:146, threeTP:176 },
        friSat: { dsR:29, dsP:32, dsTP:38, oneR:56, oneP:62, oneTP:75, twoR:77, twoP:84, twoTP:98, threeP:171, threeTP:207 } },
    ], [ // cashRates (MouseSavers 2026 rack rates incl. 12.5% tax)
      { sunThu: { dsR:883, dsP:969, dsTP:1044, oneR:1282, oneP:1322, oneTP:1464, twoR:1936, twoP:2126, twoTP:2283, threeP:3862, threeTP:4294 },
        friSat: { dsR:1004, dsP:1053, dsTP:1154, oneR:1455, oneP:1501, oneTP:1664, twoR:2203, twoP:2419, twoTP:2595, threeP:4378, threeTP:4886 } },
      { sunThu: { dsR:839, dsP:980, dsTP:1105, oneR:1216, oneP:1233, oneTP:1432, twoR:1591, twoP:1792, twoTP:1982, threeP:3645, threeTP:3931 },
        friSat: { dsR:866, dsP:987, dsTP:1106, oneR:1245, oneP:1274, oneTP:1472, twoR:1638, twoP:1840, twoTP:2037, threeP:3752, threeTP:4070 } },
      { sunThu: { dsR:792, dsP:922, dsTP:1025, oneR:1138, oneP:1174, oneTP:1345, twoR:1510, twoP:1716, twoTP:1882, threeP:3414, threeTP:3707 },
        friSat: { dsR:806, dsP:928, dsTP:1026, oneR:1154, oneP:1196, oneTP:1366, twoR:1534, twoP:1740, twoTP:1910, threeP:3468, threeTP:3776 } },
      { sunThu: { dsR:744, dsP:865, dsTP:945, oneR:1060, oneP:1114, oneTP:1258, twoR:1429, twoP:1639, twoTP:1783, threeP:3183, threeTP:3483 },
        friSat: { dsR:746, dsP:870, dsTP:945, oneR:1064, oneP:1117, oneTP:1260, twoR:1430, twoP:1640, twoTP:1784, threeP:3183, threeTP:3483 } },
      { sunThu: { dsR:899, dsP:1032, dsTP:1149, oneR:1288, oneP:1392, oneTP:1538, twoR:1844, twoP:2143, twoTP:2280, threeP:3939, threeTP:4346 },
        friSat: { dsR:1024, dsP:1151, dsTP:1272, oneR:1468, oneP:1584, oneTP:1747, twoR:2102, twoP:2434, twoTP:2595, threeP:4481, threeTP:4931 } },
      { sunThu: { dsR:1053, dsP:1052, dsTP:1137, oneR:1457, oneP:1509, oneTP:1701, twoR:2403, twoP:2682, twoTP:2943, threeP:4563, threeTP:4797 },
        friSat: { dsR:1192, dsP:1191, dsTP:1278, oneR:1648, oneP:1703, oneTP:1914, twoR:2714, twoP:3041, twoTP:3324, threeP:5154, threeTP:5439 } },
      { sunThu: { dsR:1187, dsP:1248, dsTP:1365, oneR:1683, oneP:1755, oneTP:1967, twoR:2850, twoP:3076, twoTP:3385, threeP:5264, threeTP:5676 },
        friSat: { dsR:1187, dsP:1248, dsTP:1365, oneR:1683, oneP:1755, oneTP:1967, twoR:2850, twoP:3076, twoTP:3385, threeP:5264, threeTP:5676 } },
    ]),
  },

  // --- Disney's Beach Club Villas ---
  {
    id: "beachClubVillas",
    name: "Disney's Beach Club Villas",
    year: 2026,
    roomTypes: [
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    ],
    travelPeriods: wdwPeriods([
      { sunThu: { deluxeStudio:14, oneBedroom:26, twoBedroom:36 }, friSat: { deluxeStudio:15, oneBedroom:31, twoBedroom:43 } },
      { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 }, friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
      { sunThu: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 }, friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 } },
      { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 }, friSat: { deluxeStudio:18, oneBedroom:38, twoBedroom:47 } },
      { sunThu: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 }, friSat: { deluxeStudio:21, oneBedroom:39, twoBedroom:52 } },
      { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 }, friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
      { sunThu: { deluxeStudio:27, oneBedroom:51, twoBedroom:68 }, friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
    ], [ // cashRates (MouseSavers 2026 rack rates incl. 12.5% tax)
      { sunThu: { deluxeStudio:789, oneBedroom:1104, twoBedroom:1828 }, friSat: { deluxeStudio:829, oneBedroom:1191, twoBedroom:1963 } },
      { sunThu: { deluxeStudio:730, oneBedroom:1032, twoBedroom:1548 }, friSat: { deluxeStudio:760, oneBedroom:1059, twoBedroom:1591 } },
      { sunThu: { deluxeStudio:710, oneBedroom:974, twoBedroom:1482 }, friSat: { deluxeStudio:731, oneBedroom:988, twoBedroom:1504 } },
      { sunThu: { deluxeStudio:691, oneBedroom:915, twoBedroom:1415 }, friSat: { deluxeStudio:702, oneBedroom:917, twoBedroom:1418 } },
      { sunThu: { deluxeStudio:795, oneBedroom:1114, twoBedroom:1782 }, friSat: { deluxeStudio:925, oneBedroom:1236, twoBedroom:1976 } },
      { sunThu: { deluxeStudio:863, oneBedroom:1263, twoBedroom:2248 }, friSat: { deluxeStudio:963, oneBedroom:1389, twoBedroom:2474 } },
      { sunThu: { deluxeStudio:1035, oneBedroom:1452, twoBedroom:2532 }, friSat: { deluxeStudio:1035, oneBedroom:1452, twoBedroom:2532 } },
    ]),
  },

  // --- Disney's BoardWalk Villas ---
  // Views: R=Resort, BP=Boardwalk/Preferred
  {
    id: "boardwalkVillas",
    name: "Disney's BoardWalk Villas",
    year: 2026,
    roomTypes: [
      { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
      { id: "dsBP", name: "Deluxe Studio - Boardwalk/Preferred", sleeps: 5 },
      { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 4 },
      { id: "oneBP", name: "One-Bedroom Villa - Boardwalk/Preferred", sleeps: 4 },
      { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
      { id: "twoBP", name: "Two-Bedroom Villa - Boardwalk/Preferred", sleeps: 9 },
      { id: "threeBP", name: "Three-Bedroom Grand Villa - Boardwalk/Preferred", sleeps: 12 },
    ],
    travelPeriods: wdwPeriods([
      { sunThu: { dsR:10, dsBP:14, oneR:19, oneBP:26, twoR:29, twoBP:35, threeBP:76 },
        friSat: { dsR:13, dsBP:16, oneR:27, oneBP:29, twoR:35, twoBP:40, threeBP:88 } },
      { sunThu: { dsR:10, dsBP:15, oneR:23, oneBP:29, twoR:32, twoBP:39, threeBP:81 },
        friSat: { dsR:14, dsBP:16, oneR:27, oneBP:34, twoR:38, twoBP:45, threeBP:91 } },
      { sunThu: { dsR:11, dsBP:16, oneR:24, oneBP:32, twoR:31, twoBP:41, threeBP:88 },
        friSat: { dsR:15, dsBP:17, oneR:30, oneBP:37, twoR:41, twoBP:47, threeBP:97 } },
      { sunThu: { dsR:11, dsBP:16, oneR:25, oneBP:35, twoR:33, twoBP:43, threeBP:91 },
        friSat: { dsR:16, dsBP:18, oneR:31, oneBP:39, twoR:44, twoBP:47, threeBP:102 } },
      { sunThu: { dsR:14, dsBP:18, oneR:28, oneBP:35, twoR:39, twoBP:45, threeBP:101 },
        friSat: { dsR:16, dsBP:20, oneR:33, oneBP:41, twoR:45, twoBP:51, threeBP:114 } },
      { sunThu: { dsR:15, dsBP:19, oneR:31, oneBP:39, twoR:43, twoBP:51, threeBP:110 },
        friSat: { dsR:19, dsBP:22, oneR:36, oneBP:43, twoR:49, twoBP:55, threeBP:124 } },
      { sunThu: { dsR:22, dsBP:28, oneR:42, oneBP:50, twoR:60, twoBP:68, threeBP:133 },
        friSat: { dsR:24, dsBP:29, oneR:48, oneBP:56, twoR:67, twoBP:77, threeBP:145 } },
    ], [ // cashRates (MouseSavers 2026 rack rates incl. 12.5% tax)
      { sunThu: { dsR:804, dsBP:956, oneR:1098, oneBP:1108, threeBP:3494 },
        friSat: { dsR:848, dsBP:1053, oneR:1185, oneBP:1197, threeBP:3733 } },
      { sunThu: { dsR:775, dsBP:930, oneR:1026, oneBP:1035, threeBP:3404 },
        friSat: { dsR:788, dsBP:978, oneR:1051, oneBP:1061, threeBP:3508 } },
      { sunThu: { dsR:732, dsBP:883, oneR:960, oneBP:969, threeBP:3210 },
        friSat: { dsR:740, dsBP:908, oneR:974, oneBP:984, threeBP:3264 } },
      { sunThu: { dsR:688, dsBP:836, oneR:893, oneBP:903, threeBP:3017 },
        friSat: { dsR:691, dsBP:839, oneR:896, oneBP:907, threeBP:3021 } },
      { sunThu: { dsR:803, dsBP:969, oneR:1108, oneBP:1119, threeBP:3725 },
        friSat: { dsR:885, dsBP:1076, oneR:1231, oneBP:1241, threeBP:4139 } },
      { sunThu: { dsR:918, dsBP:1047, oneR:1256, oneBP:1267, threeBP:4110 },
        friSat: { dsR:1001, dsBP:1208, oneR:1380, oneBP:1394, threeBP:4478 } },
      { sunThu: { dsR:1068, dsBP:1202, oneR:1448, oneBP:1462, threeBP:4750 },
        friSat: { dsR:1068, dsBP:1202, oneR:1448, oneBP:1462, threeBP:4750 } },
    ]),
  },

  // --- Boulder Ridge Villas at Disney's Wilderness Lodge ---
  {
    id: "boulderRidge",
    name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
    year: 2026,
    roomTypes: [
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    ],
    travelPeriods: wdwPeriods([
      { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:36 }, friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 } },
      { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 }, friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
      { sunThu: { deluxeStudio:16, oneBedroom:32, twoBedroom:41 }, friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:47 } },
      { sunThu: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 }, friSat: { deluxeStudio:18, oneBedroom:39, twoBedroom:48 } },
      { sunThu: { deluxeStudio:17, oneBedroom:35, twoBedroom:46 }, friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:51 } },
      { sunThu: { deluxeStudio:19, oneBedroom:37, twoBedroom:49 }, friSat: { deluxeStudio:21, oneBedroom:42, twoBedroom:54 } },
      { sunThu: { deluxeStudio:26, oneBedroom:47, twoBedroom:64 }, friSat: { deluxeStudio:28, oneBedroom:55, twoBedroom:72 } },
    ], [ // cashRates (MouseSavers 2026 rack rates incl. 12.5% tax)
      { sunThu: { deluxeStudio:638, oneBedroom:997, twoBedroom:1780 }, friSat: { deluxeStudio:702, oneBedroom:1134, twoBedroom:2017 } },
      { sunThu: { deluxeStudio:642, oneBedroom:1000, twoBedroom:1662 }, friSat: { deluxeStudio:682, oneBedroom:1066, twoBedroom:1764 } },
      { sunThu: { deluxeStudio:618, oneBedroom:924, twoBedroom:1512 }, friSat: { deluxeStudio:638, oneBedroom:961, twoBedroom:1566 } },
      { sunThu: { deluxeStudio:594, oneBedroom:847, twoBedroom:1362 }, friSat: { deluxeStudio:594, oneBedroom:856, twoBedroom:1369 } },
      { sunThu: { deluxeStudio:685, oneBedroom:1089, twoBedroom:1924 }, friSat: { deluxeStudio:748, oneBedroom:1231, twoBedroom:2176 } },
      { sunThu: { deluxeStudio:771, oneBedroom:1268, twoBedroom:2297 }, friSat: { deluxeStudio:868, oneBedroom:1419, twoBedroom:2574 } },
      { sunThu: { deluxeStudio:946, oneBedroom:1374, twoBedroom:2608 }, friSat: { deluxeStudio:946, oneBedroom:1374, twoBedroom:2608 } },
    ]),
  },

  // --- Copper Creek Villas & Cabins at Disney's Wilderness Lodge ---
  // (Includes cash rates from MouseSavers 2026 data)
  {
    id: "copperCreek",
    name: "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
    year: 2026,
    roomTypes: [
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
      { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
      { id: "twoBedCabin", name: "Two-Bedroom Cabin", sleeps: 8 },
    ],
    travelPeriods: wdwPeriods([
      { sunThu: { deluxeStudio: 13, oneBedroom: 25, twoBedroom: 35, threeBedroom: 91, twoBedCabin: 84 },
        friSat: { deluxeStudio: 15, oneBedroom: 30, twoBedroom: 40, threeBedroom: 107, twoBedCabin: 100 } },
      { sunThu: { deluxeStudio: 15, oneBedroom: 30, twoBedroom: 38, threeBedroom: 101, twoBedCabin: 94 },
        friSat: { deluxeStudio: 16, oneBedroom: 34, twoBedroom: 44, threeBedroom: 116, twoBedCabin: 109 } },
      { sunThu: { deluxeStudio: 16, oneBedroom: 33, twoBedroom: 41, threeBedroom: 108, twoBedCabin: 101 },
        friSat: { deluxeStudio: 17, oneBedroom: 36, twoBedroom: 47, threeBedroom: 124, twoBedCabin: 117 } },
      { sunThu: { deluxeStudio: 17, oneBedroom: 34, twoBedroom: 43, threeBedroom: 113, twoBedCabin: 107 },
        friSat: { deluxeStudio: 18, oneBedroom: 38, twoBedroom: 49, threeBedroom: 130, twoBedCabin: 121 } },
      { sunThu: { deluxeStudio: 17, oneBedroom: 35, twoBedroom: 45, threeBedroom: 120, twoBedCabin: 113 },
        friSat: { deluxeStudio: 19, oneBedroom: 42, twoBedroom: 52, threeBedroom: 137, twoBedCabin: 131 } },
      { sunThu: { deluxeStudio: 18, oneBedroom: 37, twoBedroom: 50, threeBedroom: 128, twoBedCabin: 124 },
        friSat: { deluxeStudio: 21, oneBedroom: 43, twoBedroom: 56, threeBedroom: 147, twoBedCabin: 143 } },
      { sunThu: { deluxeStudio: 25, oneBedroom: 48, twoBedroom: 64, threeBedroom: 176, twoBedCabin: 171 },
        friSat: { deluxeStudio: 28, oneBedroom: 54, twoBedroom: 72, threeBedroom: 206, twoBedCabin: 196 } },
    ], [ // cashRates (MouseSavers 2026 rack rates incl. 12.5% tax)
      { sunThu: { deluxeStudio:638, oneBedroom:1131, twoBedroom:1842, threeBedroom:3470, twoBedCabin:3270 },
        friSat: { deluxeStudio:702, oneBedroom:1277, twoBedroom:2082, threeBedroom:3921, twoBedCabin:3693 } },
      { sunThu: { deluxeStudio:642, oneBedroom:1059, twoBedroom:1685, threeBedroom:3365, twoBedCabin:3187 },
        friSat: { deluxeStudio:682, oneBedroom:1126, twoBedroom:1793, threeBedroom:3573, twoBedCabin:3387 } },
      { sunThu: { deluxeStudio:618, oneBedroom:1016, twoBedroom:1550, threeBedroom:3247, twoBedCabin:3060 },
        friSat: { deluxeStudio:638, oneBedroom:1050, twoBedroom:1604, threeBedroom:3352, twoBedCabin:3165 } },
      { sunThu: { deluxeStudio:594, oneBedroom:974, twoBedroom:1416, threeBedroom:3129, twoBedCabin:2934 },
        friSat: { deluxeStudio:594, oneBedroom:974, twoBedroom:1416, threeBedroom:3130, twoBedCabin:2943 } },
      { sunThu: { deluxeStudio:685, oneBedroom:1120, twoBedroom:1960, threeBedroom:3530, twoBedCabin:3324 },
        friSat: { deluxeStudio:748, oneBedroom:1278, twoBedroom:2235, threeBedroom:4017, twoBedCabin:3786 } },
      { sunThu: { deluxeStudio:771, oneBedroom:1325, twoBedroom:2365, threeBedroom:4151, twoBedCabin:3915 },
        friSat: { deluxeStudio:868, oneBedroom:1487, twoBedroom:2653, threeBedroom:4656, twoBedCabin:4391 } },
      { sunThu: { deluxeStudio:946, oneBedroom:1496, twoBedroom:2688, threeBedroom:5132, twoBedCabin:4851 },
        friSat: { deluxeStudio:946, oneBedroom:1496, twoBedroom:2688, threeBedroom:5132, twoBedCabin:4851 } },
    ]),
  },

  // --- The Cabins at Disney's Fort Wilderness Resort ---
  {
    id: "fortWildernessCabins",
    name: "The Cabins at Disney's Fort Wilderness Resort",
    year: 2026,
    roomTypes: [
      { id: "cabin", name: "Cabin", sleeps: 6 },
    ],
    travelPeriods: wdwPeriods([
      { sunThu: { cabin:15 }, friSat: { cabin:18 } },
      { sunThu: { cabin:16 }, friSat: { cabin:19 } },
      { sunThu: { cabin:18 }, friSat: { cabin:21 } },
      { sunThu: { cabin:20 }, friSat: { cabin:24 } },
      { sunThu: { cabin:22 }, friSat: { cabin:25 } },
      { sunThu: { cabin:24 }, friSat: { cabin:28 } },
      { sunThu: { cabin:32 }, friSat: { cabin:36 } },
    ], [ // cashRates (MouseSavers 2026 rack rates incl. 12.5% tax)
      { sunThu: { cabin:600 }, friSat: { cabin:649 } },
      { sunThu: { cabin:555 }, friSat: { cabin:614 } },
      { sunThu: { cabin:560 }, friSat: { cabin:604 } },
      { sunThu: { cabin:564 }, friSat: { cabin:595 } },
      { sunThu: { cabin:645 }, friSat: { cabin:723 } },
      { sunThu: { cabin:739 }, friSat: { cabin:738 } },
      { sunThu: { cabin:887 }, friSat: { cabin:887 } },
    ]),
  },

  // --- The Villas at Disney's Grand Floridian Resort & Spa ---
  // Views: R=Resort, P=Preferred, TP=Theme Park
  // Resort Studio and Deluxe Studio have identical rates for the same view.
  {
    id: "grandFloridian",
    name: "The Villas at Disney's Grand Floridian Resort & Spa",
    year: 2026,
    roomTypes: [
      { id: "rsR", name: "Resort Studio - Resort View", sleeps: 5 },
      { id: "rsP", name: "Resort Studio - Preferred View", sleeps: 5 },
      { id: "rsTP", name: "Resort Studio - Theme Park View", sleeps: 5 },
      { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
      { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
      { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
      { id: "oneP", name: "One-Bedroom Villa - Preferred View", sleeps: 5 },
      { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
      { id: "twoP", name: "Two-Bedroom Villa - Preferred View", sleeps: 9 },
      { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred View", sleeps: 12 },
    ],
    travelPeriods: wdwPeriods([
      { sunThu: { rsR:16, rsP:19, rsTP:24, dsR:16, dsP:19, oneR:31, oneP:39, twoR:44, twoP:54, threeP:111 },
        friSat: { rsR:20, rsP:24, rsTP:27, dsR:20, dsP:24, oneR:41, oneP:48, twoR:55, twoP:65, threeP:131 } },
      { sunThu: { rsR:17, rsP:21, rsTP:25, dsR:17, dsP:21, oneR:36, oneP:43, twoR:49, twoP:59, threeP:118 },
        friSat: { rsR:20, rsP:24, rsTP:29, dsR:20, dsP:24, oneR:44, oneP:51, twoR:58, twoP:68, threeP:138 } },
      { sunThu: { rsR:18, rsP:21, rsTP:26, dsR:18, dsP:21, oneR:38, oneP:46, twoR:53, twoP:62, threeP:126 },
        friSat: { rsR:21, rsP:26, rsTP:31, dsR:21, dsP:26, oneR:46, oneP:55, twoR:61, twoP:74, threeP:148 } },
      { sunThu: { rsR:18, rsP:22, rsTP:28, dsR:18, dsP:22, oneR:41, oneP:49, twoR:56, twoP:66, threeP:131 },
        friSat: { rsR:21, rsP:27, rsTP:32, dsR:21, dsP:27, oneR:48, oneP:57, twoR:65, twoP:78, threeP:155 } },
      { sunThu: { rsR:22, rsP:26, rsTP:32, dsR:22, dsP:26, oneR:43, oneP:53, twoR:61, twoP:73, threeP:143 },
        friSat: { rsR:24, rsP:29, rsTP:36, dsR:24, dsP:29, oneR:51, oneP:61, twoR:69, twoP:82, threeP:169 } },
      { sunThu: { rsR:24, rsP:27, rsTP:34, dsR:24, dsP:27, oneR:46, oneP:55, twoR:65, twoP:75, threeP:161 },
        friSat: { rsR:26, rsP:32, rsTP:41, dsR:26, dsP:32, oneR:55, oneP:66, twoR:75, twoP:88, threeP:187 } },
      { sunThu: { rsR:32, rsP:38, rsTP:47, dsR:32, dsP:38, oneR:64, oneP:76, twoR:87, twoP:103, threeP:197 },
        friSat: { rsR:37, rsP:44, rsTP:54, dsR:37, dsP:44, oneR:75, oneP:89, twoR:103, twoP:122, threeP:227 } },
    ], [ // cashRates (MouseSavers 2026 rack rates incl. 12.5% tax)
      { sunThu: { dsR:886, dsP:948, rsR:909, rsP:948, rsTP:1154, oneR:1276, oneP:1472, twoR:2117, twoP:2413, threeP:4220 },
        friSat: { dsR:989, dsP:1091, rsR:1014, rsP:1091, rsTP:1271, oneR:1443, oneP:1663, twoR:2396, twoP:2732, threeP:4792 } },
      { sunThu: { dsR:937, dsP:973, rsR:955, rsP:973, rsTP:1118, oneR:1288, oneP:1469, twoR:2092, twoP:2290, threeP:4035 },
        friSat: { dsR:983, dsP:1020, rsR:1002, rsP:1020, rsTP:1171, oneR:1353, oneP:1546, twoR:2199, twoP:2409, threeP:4242 } },
      { sunThu: { dsR:896, dsP:928, rsR:914, rsP:928, rsTP:1054, oneR:1237, oneP:1405, twoR:1968, twoP:2184, threeP:3922 },
        friSat: { dsR:920, dsP:954, rsR:939, rsP:952, rsTP:1082, oneR:1270, oneP:1444, twoR:2022, twoP:2244, threeP:4026 } },
      { sunThu: { dsR:854, dsP:883, rsR:872, rsP:883, rsTP:990, oneR:1186, oneP:1341, twoR:1845, twoP:2078, threeP:3810 },
        friSat: { dsR:858, dsP:888, rsR:876, rsP:883, rsTP:992, oneR:1186, oneP:1341, twoR:1845, twoP:2078, threeP:3810 } },
      { sunThu: { dsR:960, dsP:997, rsR:989, rsP:997, rsTP:1203, oneR:1326, oneP:1503, twoR:2122, twoP:2462, threeP:4322 },
        friSat: { dsR:1098, dsP:1159, rsR:1131, rsP:1159, rsTP:1374, oneR:1530, oneP:1721, twoR:2436, twoP:2822, threeP:4958 } },
      { sunThu: { dsR:1018, dsP:1119, rsR:1038, rsP:1119, rsTP:1334, oneR:1587, oneP:1808, twoR:2568, twoP:2865, threeP:4870 },
        friSat: { dsR:1137, dsP:1250, rsR:1161, rsP:1250, rsTP:1490, oneR:1768, oneP:2016, twoR:2859, twoP:3187, threeP:5440 } },
      { sunThu: { dsR:1268, dsP:1348, rsR:1292, rsP:1348, rsTP:1652, oneR:1864, oneP:2108, twoR:2955, twoP:3367, threeP:5932 },
        friSat: { dsR:1268, dsP:1348, rsR:1292, rsP:1348, rsTP:1652, oneR:1864, oneP:2108, twoR:2955, twoP:3367, threeP:5932 } },
    ]),
  },

  // --- Disney's Old Key West Resort ---
  {
    id: "oldKeyWest",
    name: "Disney's Old Key West Resort",
    year: 2026,
    roomTypes: [
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
      { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    ],
    travelPeriods: wdwPeriods([
      { sunThu: { deluxeStudio:9, oneBedroom:20, twoBedroom:27, threeBedroom:46 }, friSat: { deluxeStudio:13, oneBedroom:25, twoBedroom:35, threeBedroom:56 } },
      { sunThu: { deluxeStudio:10, oneBedroom:23, twoBedroom:31, threeBedroom:50 }, friSat: { deluxeStudio:14, oneBedroom:26, twoBedroom:35, threeBedroom:59 } },
      { sunThu: { deluxeStudio:10, oneBedroom:25, twoBedroom:34, threeBedroom:53 }, friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:38, threeBedroom:64 } },
      { sunThu: { deluxeStudio:11, oneBedroom:26, twoBedroom:36, threeBedroom:56 }, friSat: { deluxeStudio:16, oneBedroom:30, twoBedroom:41, threeBedroom:69 } },
      { sunThu: { deluxeStudio:13, oneBedroom:28, twoBedroom:39, threeBedroom:59 }, friSat: { deluxeStudio:17, oneBedroom:34, twoBedroom:44, threeBedroom:71 } },
      { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:42, threeBedroom:66 }, friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:49, threeBedroom:79 } },
      { sunThu: { deluxeStudio:22, oneBedroom:40, twoBedroom:57, threeBedroom:82 }, friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:65, threeBedroom:106 } },
    ], [ // cashRates (MouseSavers 2026 rack rates incl. 12.5% tax)
      { sunThu: { deluxeStudio:596, oneBedroom:808, twoBedroom:1221, threeBedroom:2439 }, friSat: { deluxeStudio:627, oneBedroom:849, twoBedroom:1281, threeBedroom:2567 } },
      { sunThu: { deluxeStudio:560, oneBedroom:762, twoBedroom:1091, threeBedroom:2333 }, friSat: { deluxeStudio:579, oneBedroom:790, twoBedroom:1128, threeBedroom:2424 } },
      { sunThu: { deluxeStudio:558, oneBedroom:748, twoBedroom:1090, threeBedroom:2266 }, friSat: { deluxeStudio:574, oneBedroom:772, twoBedroom:1120, threeBedroom:2332 } },
      { sunThu: { deluxeStudio:557, oneBedroom:735, twoBedroom:1090, threeBedroom:2199 }, friSat: { deluxeStudio:570, oneBedroom:753, twoBedroom:1113, threeBedroom:2240 } },
      { sunThu: { deluxeStudio:601, oneBedroom:796, twoBedroom:1246, threeBedroom:2388 }, friSat: { deluxeStudio:685, oneBedroom:908, twoBedroom:1418, threeBedroom:2726 } },
      { sunThu: { deluxeStudio:666, oneBedroom:902, twoBedroom:1519, threeBedroom:2685 }, friSat: { deluxeStudio:745, oneBedroom:1006, twoBedroom:1689, threeBedroom:2995 } },
      { sunThu: { deluxeStudio:792, oneBedroom:1099, twoBedroom:1774, threeBedroom:3164 }, friSat: { deluxeStudio:792, oneBedroom:1099, twoBedroom:1774, threeBedroom:3164 } },
    ]),
  },

  // --- Disney's Polynesian Villas & Bungalows (including Island Tower) ---
  // Views: R=Resort, P=Preferred, PM=Premium, TP=Theme Park
  {
    id: "polynesianVillas",
    name: "Disney's Polynesian Villas & Bungalows",
    year: 2026,
    roomTypes: [
      { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
      { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
      { id: "dsTP", name: "Deluxe Studio - Theme Park View (Tower)", sleeps: 4 },
      { id: "twoBedBungalow", name: "Two-Bedroom Bungalow", sleeps: 8 },
      { id: "duoR", name: "Duo Studio - Resort View (Tower)", sleeps: 2 },
      { id: "duoP", name: "Duo Studio - Preferred View (Tower)", sleeps: 2 },
      { id: "duoPM", name: "Duo Studio - Premium View (Tower)", sleeps: 2 },
      { id: "oneR", name: "One-Bedroom Villa - Resort View (Tower)", sleeps: 5 },
      { id: "oneP", name: "One-Bedroom Villa - Preferred View (Tower)", sleeps: 5 },
      { id: "oneTP", name: "One-Bedroom Villa - Theme Park View (Tower)", sleeps: 5 },
      { id: "twoR", name: "Two-Bedroom Villa - Resort View (Tower)", sleeps: 9 },
      { id: "twoP", name: "Two-Bedroom Villa - Preferred View (Tower)", sleeps: 9 },
      { id: "twoTP", name: "Two-Bedroom Villa - Theme Park View (Tower)", sleeps: 9 },
      { id: "penthouseP", name: "Two-Bedroom Penthouse - Preferred (Tower)", sleeps: 8 },
      { id: "penthouseTP", name: "Two-Bedroom Penthouse - Theme Park (Tower)", sleeps: 8 },
    ],
    travelPeriods: wdwPeriods([
      { sunThu: { dsR:14, dsP:19, dsTP:24, twoBedBungalow:112, duoR:12, duoP:16, duoPM:19, oneR:28, oneP:38, oneTP:42, twoR:44, twoP:54, twoTP:68, penthouseP:86, penthouseTP:108 },
        friSat: { dsR:17, dsP:24, dsTP:29, twoBedBungalow:132, duoR:14, duoP:19, duoPM:23, oneR:34, oneP:46, oneTP:51, twoR:53, twoP:65, twoTP:79, penthouseP:104, penthouseTP:128 } },
      { sunThu: { dsR:17, dsP:22, dsTP:26, twoBedBungalow:120, duoR:14, duoP:18, duoPM:21, oneR:34, oneP:42, oneTP:47, twoR:48, twoP:60, twoTP:71, penthouseP:95, penthouseTP:117 },
        friSat: { dsR:20, dsP:24, dsTP:30, twoBedBungalow:138, duoR:16, duoP:20, duoPM:24, oneR:40, oneP:48, oneTP:54, twoR:56, twoP:68, twoTP:84, penthouseP:112, penthouseTP:135 } },
      { sunThu: { dsR:19, dsP:22, dsTP:27, twoBedBungalow:128, duoR:16, duoP:19, duoPM:22, oneR:38, oneP:47, oneTP:53, twoR:54, twoP:62, twoTP:76, penthouseP:102, penthouseTP:122 },
        friSat: { dsR:22, dsP:26, dsTP:32, twoBedBungalow:147, duoR:18, duoP:21, duoPM:26, oneR:44, oneP:52, oneTP:61, twoR:62, twoP:73, twoTP:90, penthouseP:119, penthouseTP:144 } },
      { sunThu: { dsR:20, dsP:24, dsTP:29, twoBedBungalow:136, duoR:17, duoP:20, duoPM:24, oneR:40, oneP:48, oneTP:54, twoR:56, twoP:68, twoTP:82, penthouseP:108, penthouseTP:128 },
        friSat: { dsR:23, dsP:27, dsTP:33, twoBedBungalow:157, duoR:19, duoP:22, duoPM:27, oneR:46, oneP:54, oneTP:63, twoR:65, twoP:79, twoTP:96, penthouseP:122, penthouseTP:152 } },
      { sunThu: { dsR:22, dsP:25, dsTP:31, twoBedBungalow:150, duoR:18, duoP:21, duoPM:26, oneR:44, oneP:53, oneTP:58, twoR:62, twoP:73, twoTP:90, penthouseP:115, penthouseTP:140 },
        friSat: { dsR:25, dsP:30, dsTP:36, twoBedBungalow:172, duoR:20, duoP:24, duoPM:29, oneR:50, oneP:60, oneTP:67, twoR:70, twoP:84, twoTP:101, penthouseP:132, penthouseTP:162 } },
      { sunThu: { dsR:25, dsP:28, dsTP:34, twoBedBungalow:162, duoR:20, duoP:23, duoPM:28, oneR:48, oneP:54, oneTP:65, twoR:68, twoP:79, twoTP:96, penthouseP:126, penthouseTP:153 },
        friSat: { dsR:28, dsP:32, dsTP:39, twoBedBungalow:185, duoR:23, duoP:26, duoPM:32, oneR:56, oneP:64, oneTP:75, twoR:79, twoP:90, twoTP:110, penthouseP:144, penthouseTP:179 } },
      { sunThu: { dsR:34, dsP:41, dsTP:48, twoBedBungalow:199, duoR:27, duoP:32, duoPM:39, oneR:68, oneP:78, oneTP:89, twoR:92, twoP:109, twoTP:128, penthouseP:178, penthouseTP:197 },
        friSat: { dsR:36, dsP:43, dsTP:53, twoBedBungalow:226, duoR:30, duoP:36, duoPM:43, oneR:78, oneP:86, oneTP:98, twoR:105, twoP:125, twoTP:149, penthouseP:198, penthouseTP:226 } },
    ], [ // cashRates (MouseSavers 2026 rack rates incl. 12.5% tax)
      { sunThu: { duoR:659, duoP:730, duoPM:822, dsR:884, dsP:1154, dsTP:1300, oneR:1275, oneP:1413, oneTP:1591, twoTP:2184, penthouseP:3268, penthouseTP:3671, twoBedBungalow:4183 },
        friSat: { duoR:724, duoP:802, duoPM:904, dsR:972, dsP:1296, dsTP:1459, oneR:1400, oneP:1551, oneTP:1747, twoTP:2401, penthouseP:3609, penthouseTP:4053, twoBedBungalow:4619 } },
      { sunThu: { duoR:642, duoP:712, duoPM:801, dsR:862, dsP:1076, dsTP:1213, oneR:1242, oneP:1376, oneTP:1550, twoTP:2128, penthouseP:3330, penthouseTP:3741, twoBedBungalow:4262 },
        friSat: { duoR:663, duoP:735, duoPM:828, dsR:890, dsP:1123, dsTP:1264, oneR:1281, oneP:1421, oneTP:1600, twoTP:2199, penthouseP:3444, penthouseTP:3867, twoBedBungalow:4407 } },
      { sunThu: { duoR:620, duoP:688, duoPM:774, dsR:833, dsP:1052, dsTP:1186, oneR:1200, oneP:1330, oneTP:1498, twoTP:2056, penthouseP:3194, penthouseTP:3588, twoBedBungalow:4088 },
        friSat: { duoR:630, duoP:700, duoPM:788, dsR:847, dsP:1076, dsTP:1212, oneR:1220, oneP:1352, oneTP:1523, twoTP:2092, penthouseP:3254, penthouseTP:3654, twoBedBungalow:4164 } },
      { sunThu: { duoR:598, duoP:664, duoPM:747, dsR:804, dsP:1028, dsTP:1159, oneR:1159, oneP:1284, oneTP:1446, twoTP:1984, penthouseP:3059, penthouseTP:3436, twoBedBungalow:3915 },
        friSat: { duoR:598, duoP:664, duoPM:747, dsR:804, dsP:1029, dsTP:1160, oneR:1159, oneP:1284, oneTP:1446, twoTP:1984, penthouseP:3063, penthouseTP:3441, twoBedBungalow:3921 } },
      { sunThu: { duoR:686, duoP:759, duoPM:856, dsR:920, dsP:1130, dsTP:1272, oneR:1326, oneP:1469, oneTP:1655, twoTP:2272, penthouseP:3456, penthouseTP:3881, twoBedBungalow:4422 },
        friSat: { duoR:740, duoP:820, duoPM:925, dsR:994, dsP:1323, dsTP:1491, oneR:1431, oneP:1585, oneTP:1786, twoTP:2454, penthouseP:3909, penthouseTP:4390, twoBedBungalow:5003 } },
      { sunThu: { duoR:747, duoP:828, duoPM:932, dsR:1002, dsP:1288, dsTP:1451, oneR:1443, oneP:1600, oneTP:1801, twoTP:2476, penthouseP:3859, penthouseTP:4335, twoBedBungalow:4939 },
        friSat: { duoR:781, duoP:865, duoPM:973, dsR:1047, dsP:1407, dsTP:1586, oneR:1509, oneP:1672, oneTP:1882, twoTP:2589, penthouseP:4186, penthouseTP:4701, twoBedBungalow:5357 } },
      { sunThu: { duoR:899, duoP:997, duoPM:1122, dsR:1206, dsP:1530, dsTP:1724, oneR:1738, oneP:1926, oneTP:2169, twoTP:2979, penthouseP:4803, penthouseTP:5395, twoBedBungalow:6148 },
        friSat: { duoR:899, duoP:997, duoPM:1122, dsR:1206, dsP:1530, dsTP:1724, oneR:1738, oneP:1926, oneTP:2169, twoTP:2979, penthouseP:4803, penthouseTP:5395, twoBedBungalow:6148 } },
    ]),
  },

  // --- Disney's Riviera Resort ---
  // Views: R=Resort, P=Preferred
  {
    id: "rivieraResort",
    name: "Disney's Riviera Resort",
    year: 2026,
    roomTypes: [
      { id: "towerStudio", name: "Tower Studio", sleeps: 2 },
      { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
      { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
      { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
      { id: "oneP", name: "One-Bedroom Villa - Preferred View", sleeps: 5 },
      { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
      { id: "twoP", name: "Two-Bedroom Villa - Preferred View", sleeps: 9 },
      { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    ],
    travelPeriods: wdwPeriods([
      { sunThu: { towerStudio:10, dsR:14, dsP:17, oneR:29, oneP:36, twoR:38, twoP:47, threeBedroom:103 },
        friSat: { towerStudio:13, dsR:17, dsP:22, oneR:34, oneP:46, twoR:47, twoP:58, threeBedroom:120 } },
      { sunThu: { towerStudio:12, dsR:16, dsP:19, oneR:34, oneP:41, twoR:44, twoP:52, threeBedroom:108 },
        friSat: { towerStudio:14, dsR:18, dsP:24, oneR:39, oneP:50, twoR:49, twoP:61, threeBedroom:127 } },
      { sunThu: { towerStudio:13, dsR:17, dsP:20, oneR:35, oneP:44, twoR:47, twoP:55, threeBedroom:116 },
        friSat: { towerStudio:15, dsR:19, dsP:26, oneR:42, oneP:54, twoR:53, twoP:67, threeBedroom:135 } },
      { sunThu: { towerStudio:14, dsR:17, dsP:21, oneR:36, oneP:48, twoR:50, twoP:59, threeBedroom:120 },
        friSat: { towerStudio:17, dsR:20, dsP:26, oneR:48, oneP:58, twoR:59, twoP:70, threeBedroom:141 } },
      { sunThu: { towerStudio:16, dsR:19, dsP:24, oneR:39, oneP:49, twoR:52, twoP:65, threeBedroom:129 },
        friSat: { towerStudio:18, dsR:22, dsP:28, oneR:50, oneP:59, twoR:63, twoP:74, threeBedroom:154 } },
      { sunThu: { towerStudio:17, dsR:21, dsP:27, oneR:43, oneP:53, twoR:56, twoP:71, threeBedroom:140 },
        friSat: { towerStudio:20, dsR:25, dsP:30, oneR:53, oneP:63, twoR:65, twoP:79, threeBedroom:166 } },
      { sunThu: { towerStudio:24, dsR:29, dsP:35, oneR:58, oneP:68, twoR:77, twoP:88, threeBedroom:172 },
        friSat: { towerStudio:27, dsR:32, dsP:40, oneR:68, oneP:81, twoR:90, twoP:103, threeBedroom:204 } },
    ], [ // cashRates (MouseSavers 2026 rack rates incl. 12.5% tax)
      { sunThu: { towerStudio:587, dsR:796, dsP:922, oneR:1056, oneP:1204, twoR:1807, twoP:2064, threeBedroom:3711 },
        friSat: { towerStudio:684, dsR:920, dsP:1107, oneR:1189, oneP:1308, twoR:2081, twoP:2418, threeBedroom:4249 } },
      { sunThu: { towerStudio:598, dsR:872, dsP:948, oneR:1194, oneP:1305, twoR:1960, twoP:2142, threeBedroom:3926 },
        friSat: { towerStudio:644, dsR:886, dsP:1016, oneR:1208, oneP:1365, twoR:2062, twoP:2264, threeBedroom:4112 } },
      { sunThu: { towerStudio:611, dsR:846, dsP:904, oneR:1128, oneP:1330, twoR:1799, twoP:2025, threeBedroom:3755 },
        friSat: { towerStudio:623, dsR:844, dsP:935, oneR:1162, oneP:1364, twoR:1880, twoP:2093, threeBedroom:3858 } },
      { sunThu: { towerStudio:624, dsR:820, dsP:861, oneR:1063, oneP:1354, twoR:1638, twoP:1908, threeBedroom:3584 },
        friSat: { towerStudio:602, dsR:801, dsP:854, oneR:1115, oneP:1362, twoR:1698, twoP:1922, threeBedroom:3604 } },
      { sunThu: { towerStudio:611, dsR:814, dsP:950, oneR:1074, oneP:1208, twoR:1793, twoP:2078, threeBedroom:3742 },
        friSat: { towerStudio:705, dsR:954, dsP:1156, oneR:1225, oneP:1332, twoR:2094, twoP:2466, threeBedroom:4346 } },
      { sunThu: { towerStudio:807, dsR:1073, dsP:1134, oneR:1333, oneP:1548, twoR:2300, twoP:2652, threeBedroom:4537 },
        friSat: { towerStudio:860, dsR:1161, dsP:1241, oneR:1551, oneP:1730, twoR:2645, twoP:2958, threeBedroom:5056 } },
      { sunThu: { towerStudio:907, dsR:1205, dsP:1319, oneR:1628, oneP:1868, twoR:2669, twoP:3024, threeBedroom:5374 },
        friSat: { towerStudio:907, dsR:1205, dsP:1319, oneR:1628, oneP:1868, twoR:2669, twoP:3024, threeBedroom:5374 } },
    ]),
  },

  // --- Disney's Saratoga Springs Resort & Spa ---
  // Views: S=Standard, P=Preferred
  {
    id: "saratogaSprings",
    name: "Disney's Saratoga Springs Resort & Spa",
    year: 2026,
    roomTypes: [
      { id: "dsS", name: "Deluxe Studio - Standard", sleeps: 4 },
      { id: "dsP", name: "Deluxe Studio - Preferred", sleeps: 4 },
      { id: "oneS", name: "One-Bedroom Villa - Standard", sleeps: 5 },
      { id: "oneP", name: "One-Bedroom Villa - Preferred", sleeps: 5 },
      { id: "twoS", name: "Two-Bedroom Villa - Standard", sleeps: 9 },
      { id: "twoP", name: "Two-Bedroom Villa - Preferred", sleeps: 9 },
      { id: "threeS", name: "Three-Bedroom Grand Villa - Standard", sleeps: 12 },
      { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred", sleeps: 12 },
      { id: "treehouse", name: "Three-Bedroom Treehouse Villa", sleeps: 9 },
    ],
    travelPeriods: wdwPeriods([
      { sunThu: { dsS:9, dsP:11, oneS:21, oneP:24, twoS:27, twoP:35, threeS:63, threeP:74, treehouse:38 },
        friSat: { dsS:14, dsP:16, oneS:27, oneP:30, twoS:34, twoP:39, threeS:72, threeP:84, treehouse:43 } },
      { sunThu: { dsS:12, dsP:13, oneS:24, oneP:28, twoS:32, twoP:38, threeS:68, threeP:76, treehouse:41 },
        friSat: { dsS:15, dsP:17, oneS:29, oneP:34, twoS:36, twoP:42, threeS:78, threeP:89, treehouse:45 } },
      { sunThu: { dsS:13, dsP:15, oneS:26, oneP:30, twoS:35, twoP:39, threeS:74, threeP:82, treehouse:43 },
        friSat: { dsS:15, dsP:18, oneS:31, oneP:35, twoS:39, twoP:45, threeS:83, threeP:94, treehouse:48 } },
      { sunThu: { dsS:14, dsP:15, oneS:28, oneP:32, twoS:36, twoP:41, threeS:77, threeP:87, treehouse:44 },
        friSat: { dsS:16, dsP:19, oneS:33, oneP:37, twoS:39, twoP:50, threeS:86, threeP:98, treehouse:51 } },
      { sunThu: { dsS:14, dsP:16, oneS:30, oneP:34, twoS:37, twoP:46, threeS:86, threeP:98, treehouse:47 },
        friSat: { dsS:17, dsP:19, oneS:34, oneP:39, twoS:45, twoP:54, threeS:97, threeP:112, treehouse:52 } },
      { sunThu: { dsS:15, dsP:17, oneS:32, oneP:38, twoS:41, twoP:49, threeS:93, threeP:108, treehouse:51 },
        friSat: { dsS:18, dsP:21, oneS:36, oneP:42, twoS:47, twoP:59, threeS:107, threeP:125, treehouse:58 } },
      { sunThu: { dsS:21, dsP:23, oneS:43, oneP:49, twoS:56, twoP:67, threeS:113, threeP:131, treehouse:66 },
        friSat: { dsS:25, dsP:28, oneS:47, oneP:53, twoS:63, twoP:75, threeS:127, threeP:139, treehouse:76 } },
    ], [ // cashRates (MouseSavers 2026 rack rates incl. 12.5% tax)
      { sunThu: { dsS:585, dsP:670, oneS:791, oneP:901, twoS:1195, twoP:1415, threeS:2406, threeP:2776, treehouse:1480 },
        friSat: { dsS:621, dsP:714, oneS:839, oneP:957, twoS:1272, twoP:1512, threeS:2565, threeP:2960, treehouse:1578 } },
      { sunThu: { dsS:561, dsP:649, oneS:760, oneP:872, twoS:1090, twoP:1315, threeS:2333, threeP:2697, treehouse:1362 },
        friSat: { dsS:580, dsP:674, oneS:789, oneP:903, twoS:1128, twoP:1367, threeS:2431, threeP:2807, treehouse:1418 } },
      { sunThu: { dsS:556, dsP:641, oneS:741, oneP:854, twoS:1082, twoP:1294, threeS:2252, threeP:2614, treehouse:1332 },
        friSat: { dsS:571, dsP:662, oneS:764, oneP:878, twoS:1112, twoP:1333, threeS:2322, threeP:2695, treehouse:1375 } },
      { sunThu: { dsS:550, dsP:633, oneS:722, oneP:835, twoS:1073, twoP:1274, threeS:2170, threeP:2530, treehouse:1303 },
        friSat: { dsS:562, dsP:651, oneS:738, oneP:852, twoS:1097, twoP:1299, threeS:2213, threeP:2583, treehouse:1332 } },
      { sunThu: { dsS:598, dsP:687, oneS:785, oneP:899, twoS:1230, twoP:1457, threeS:2366, threeP:2761, treehouse:1545 },
        friSat: { dsS:686, dsP:790, oneS:901, oneP:1035, twoS:1423, twoP:1685, threeS:2738, threeP:3182, treehouse:1790 } },
      { sunThu: { dsS:659, dsP:758, oneS:891, oneP:1027, twoS:1487, twoP:1793, threeS:2665, threeP:3107, treehouse:1879 },
        friSat: { dsS:734, dsP:848, oneS:992, oneP:1150, twoS:1655, twoP:1999, threeS:2968, threeP:3460, treehouse:2094 } },
      { sunThu: { dsS:784, dsP:899, oneS:1082, oneP:1235, twoS:1751, twoP:2080, threeS:3139, threeP:3604, treehouse:2197 },
        friSat: { dsS:784, dsP:899, oneS:1082, oneP:1235, twoS:1751, twoP:2080, threeS:3139, threeP:3604, treehouse:2197 } },
    ]),
  },

  // ===========================================================================================
  // OTHER DVC RESORTS (non-WDW — different season dates)
  // ===========================================================================================

  // --- Aulani, Disney Vacation Club Villas ---
  // Views: S=Standard, I=Island Gardens, P=Poolside Gardens, O=Ocean View
  // Aulani uses a FLAT daily rate (same every day). sunThu/friSat set to same value.
  {
    id: "aulani",
    name: "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
    year: 2026,
    roomTypes: [
      { id: "hotelRoom", name: "Hotel Room", sleeps: 4 },
      { id: "dsS", name: "Deluxe Studio - Standard", sleeps: 4 },
      { id: "dsI", name: "Deluxe Studio - Island Gardens", sleeps: 4 },
      { id: "dsP", name: "Deluxe Studio - Poolside Gardens", sleeps: 4 },
      { id: "dsO", name: "Deluxe Studio - Ocean View", sleeps: 4 },
      { id: "oneS", name: "One-Bedroom Villa - Standard", sleeps: 5 },
      { id: "oneI", name: "One-Bedroom Villa - Island Gardens", sleeps: 5 },
      { id: "oneP", name: "One-Bedroom Villa - Poolside Gardens", sleeps: 5 },
      { id: "oneO", name: "One-Bedroom Villa - Ocean View", sleeps: 5 },
      { id: "twoS", name: "Two-Bedroom Villa - Standard", sleeps: 9 },
      { id: "twoI", name: "Two-Bedroom Villa - Island Gardens", sleeps: 9 },
      { id: "twoP", name: "Two-Bedroom Villa - Poolside Gardens", sleeps: 9 },
      { id: "twoO", name: "Two-Bedroom Villa - Ocean View", sleeps: 9 },
      { id: "threeS", name: "Three-Bedroom Grand Villa - Standard", sleeps: 12 },
      { id: "threeO", name: "Three-Bedroom Grand Villa - Ocean View", sleeps: 12 },
    ],
    travelPeriods: [
      { name: "Value", color: "#4CAF50",
        dateRanges: [{ start: "2026-01-04", end: "2026-02-28" }, { start: "2026-09-06", end: "2026-10-10" }, { start: "2026-11-10", end: "2026-11-23" }, { start: "2026-11-29", end: "2026-12-17" }],
        rates: {
          sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 },
          friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 },
        },
      },
      { name: "Regular", color: "#2196F3",
        dateRanges: [{ start: "2026-04-12", end: "2026-04-28" }, { start: "2026-05-06", end: "2026-06-28" }, { start: "2026-10-11", end: "2026-11-09" }],
        rates: {
          sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
          friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
        },
      },
      { name: "Peak", color: "#FF9800",
        dateRanges: [{ start: "2026-03-01", end: "2026-03-24" }, { start: "2026-04-29", end: "2026-05-05" }, { start: "2026-08-10", end: "2026-09-05" }],
        rates: {
          sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 },
          friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 },
        },
      },
      { name: "Premier", color: "#F44336",
        dateRanges: [{ start: "2026-01-01", end: "2026-01-03" }, { start: "2026-03-25", end: "2026-04-11" }, { start: "2026-06-29", end: "2026-08-09" }, { start: "2026-11-24", end: "2026-11-28" }, { start: "2026-12-18", end: "2026-12-31" }],
        rates: {
          sunThu: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
          friSat: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
        },
      },
    ],
  },

  // --- Disney's Hilton Head Island Resort ---
  {
    id: "hiltonHead",
    name: "Disney's Hilton Head Island Resort",
    year: 2026,
    roomTypes: [
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
      { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    ],
    travelPeriods: [
      { name: "Value", color: "#4CAF50",
        dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-12-01", end: "2026-12-17" }],
        rates: {
          sunThu: { deluxeStudio:6, oneBedroom:14, twoBedroom:20, threeBedroom:27 },
          friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 },
        },
      },
      { name: "Regular", color: "#2196F3",
        dateRanges: [{ start: "2026-02-01", end: "2026-03-31" }, { start: "2026-11-01", end: "2026-11-30" }, { start: "2026-12-18", end: "2026-12-31" }],
        rates: {
          sunThu: { deluxeStudio:10, oneBedroom:20, twoBedroom:24, threeBedroom:47 },
          friSat: { deluxeStudio:15, oneBedroom:29, twoBedroom:36, threeBedroom:60 },
        },
      },
      { name: "Peak", color: "#FF9800",
        dateRanges: [{ start: "2026-04-01", end: "2026-06-10" }, { start: "2026-08-28", end: "2026-10-31" }],
        rates: {
          sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
          friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 },
        },
      },
      { name: "Premier", color: "#F44336",
        dateRanges: [{ start: "2026-06-11", end: "2026-08-27" }],
        rates: {
          sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
          friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:111 },
        },
      },
    ],
  },

  // --- Disney's Vero Beach Resort ---
  {
    id: "veroBeach",
    name: "Disney's Vero Beach Resort",
    year: 2026,
    roomTypes: [
      { id: "innStandard", name: "Deluxe Inn Room - Standard View", sleeps: 4 },
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
      { id: "innOcean", name: "Deluxe Inn Room - Ocean View", sleeps: 4 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
      { id: "beachCottage", name: "Three-Bedroom Beach Cottage", sleeps: 12 },
    ],
    travelPeriods: [
      { name: "Value", color: "#4CAF50",
        dateRanges: [{ start: "2026-09-01", end: "2026-11-24" }],
        rates: {
          sunThu: { innStandard:10, deluxeStudio:12, innOcean:14, oneBedroom:21, twoBedroom:30, beachCottage:60 },
          friSat: { innStandard:16, deluxeStudio:17, innOcean:17, oneBedroom:29, twoBedroom:39, beachCottage:72 },
        },
      },
      { name: "Regular", color: "#2196F3",
        dateRanges: [{ start: "2026-05-01", end: "2026-05-31" }, { start: "2026-11-28", end: "2026-12-23" }],
        rates: {
          sunThu: { innStandard:10, deluxeStudio:13, innOcean:15, oneBedroom:24, twoBedroom:33, beachCottage:61 },
          friSat: { innStandard:17, deluxeStudio:18, innOcean:19, oneBedroom:31, twoBedroom:42, beachCottage:74 },
        },
      },
      { name: "Choice", color: "#9C27B0",
        dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-06-01", end: "2026-08-31" }, { start: "2026-11-25", end: "2026-11-27" }],
        rates: {
          sunThu: { innStandard:14, deluxeStudio:16, innOcean:18, oneBedroom:29, twoBedroom:36, beachCottage:73 },
          friSat: { innStandard:17, deluxeStudio:19, innOcean:21, oneBedroom:37, twoBedroom:47, beachCottage:88 },
        },
      },
      { name: "Peak", color: "#FF9800",
        dateRanges: [{ start: "2026-02-01", end: "2026-02-21" }, { start: "2026-04-12", end: "2026-04-30" }],
        rates: {
          sunThu: { innStandard:15, deluxeStudio:17, innOcean:19, oneBedroom:31, twoBedroom:44, beachCottage:81 },
          friSat: { innStandard:20, deluxeStudio:21, innOcean:23, oneBedroom:40, twoBedroom:52, beachCottage:99 },
        },
      },
      { name: "Premier", color: "#F44336",
        dateRanges: [{ start: "2026-02-22", end: "2026-04-11" }, { start: "2026-12-24", end: "2026-12-31" }],
        rates: {
          sunThu: { innStandard:21, deluxeStudio:23, innOcean:26, oneBedroom:43, twoBedroom:61, beachCottage:105 },
          friSat: { innStandard:27, deluxeStudio:29, innOcean:31, oneBedroom:53, twoBedroom:72, beachCottage:126 },
        },
      },
    ],
  },

  // --- The Villas at Disneyland Hotel ---
  // Views: S=Standard, P=Preferred
  {
    id: "disneylandHotel",
    name: "The Villas at Disneyland Hotel",
    year: 2026,
    roomTypes: [
      { id: "duoS", name: "Duo Studio - Standard", sleeps: 2 },
      { id: "duoP", name: "Duo Studio - Preferred", sleeps: 2 },
      { id: "dsS", name: "Deluxe Studio - Standard", sleeps: 4 },
      { id: "dsP", name: "Deluxe Studio - Preferred", sleeps: 4 },
      { id: "oneP", name: "One-Bedroom Villa - Preferred", sleeps: 5 },
      { id: "twoP", name: "Two-Bedroom Villa - Preferred", sleeps: 9 },
      { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred", sleeps: 12 },
      { id: "gardenDuo", name: "Garden Room - Duo Studio", sleeps: 2 },
      { id: "gardenDS", name: "Garden Room - Deluxe Studio", sleeps: 4 },
    ],
    travelPeriods: [
      { name: "Adventure", color: "#4CAF50",
        dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }],
        rates: {
          sunThu: { duoS:10, duoP:11, dsS:13, dsP:15, oneP:30, twoP:43, threeP:96, gardenDuo:12, gardenDS:19 },
          friSat: { duoS:13, duoP:14, dsS:16, dsP:19, oneP:37, twoP:53, threeP:118, gardenDuo:15, gardenDS:23 },
        },
      },
      { name: "Dream", color: "#2196F3",
        dateRanges: [{ start: "2026-05-01", end: "2026-05-22" }, { start: "2026-08-16", end: "2026-09-15" }],
        rates: {
          sunThu: { duoS:12, duoP:13, dsS:15, dsP:18, oneP:33, twoP:49, threeP:106, gardenDuo:14, gardenDS:21 },
          friSat: { duoS:14, duoP:15, dsS:18, dsP:22, oneP:40, twoP:59, threeP:128, gardenDuo:17, gardenDS:25 },
        },
      },
      { name: "Choice", color: "#9C27B0",
        dateRanges: [{ start: "2026-02-01", end: "2026-03-14" }, { start: "2026-09-16", end: "2026-09-30" }],
        rates: {
          sunThu: { duoS:13, duoP:14, dsS:17, dsP:20, oneP:36, twoP:52, threeP:122, gardenDuo:16, gardenDS:24 },
          friSat: { duoS:15, duoP:17, dsS:20, dsP:24, oneP:42, twoP:61, threeP:146, gardenDuo:19, gardenDS:28 },
        },
      },
      { name: "Select", color: "#FF9800",
        dateRanges: [{ start: "2026-05-23", end: "2026-05-31" }, { start: "2026-10-01", end: "2026-11-23" }, { start: "2026-11-28", end: "2026-12-17" }],
        rates: {
          sunThu: { duoS:14, duoP:15, dsS:20, dsP:23, oneP:40, twoP:60, threeP:129, gardenDuo:17, gardenDS:28 },
          friSat: { duoS:16, duoP:17, dsS:23, dsP:26, oneP:46, twoP:69, threeP:152, gardenDuo:20, gardenDS:32 },
        },
      },
      { name: "Preferred", color: "#00BCD4",
        dateRanges: [{ start: "2026-06-01", end: "2026-08-15" }],
        rates: {
          sunThu: { duoS:16, duoP:18, dsS:23, dsP:26, oneP:42, twoP:65, threeP:149, gardenDuo:21, gardenDS:31 },
          friSat: { duoS:18, duoP:20, dsS:26, dsP:29, oneP:48, twoP:73, threeP:169, gardenDuo:23, gardenDS:34 },
        },
      },
      { name: "Premier", color: "#E91E63",
        dateRanges: [{ start: "2026-03-15", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }],
        rates: {
          sunThu: { duoS:16, duoP:18, dsS:24, dsP:27, oneP:42, twoP:65, threeP:149, gardenDuo:21, gardenDS:31 },
          friSat: { duoS:19, duoP:21, dsS:27, dsP:30, oneP:50, twoP:75, threeP:174, gardenDuo:24, gardenDS:35 },
        },
      },
      { name: "Holiday", color: "#F44336",
        dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-11-24", end: "2026-11-27" }, { start: "2026-12-18", end: "2026-12-31" }],
        rates: {
          sunThu: { duoS:22, duoP:24, dsS:28, dsP:31, oneP:54, twoP:82, threeP:174, gardenDuo:26, gardenDS:37 },
          friSat: { duoS:25, duoP:27, dsS:31, dsP:34, oneP:62, twoP:92, threeP:204, gardenDuo:30, gardenDS:41 },
        },
      },
    ],
  },

  // --- The Villas at Disney's Grand Californian Hotel & Spa ---
  {
    id: "grandCalifornian",
    name: "The Villas at Disney's Grand Californian Hotel & Spa",
    year: 2026,
    roomTypes: [
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
      { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    ],
    travelPeriods: [
      { name: "Value", color: "#4CAF50",
        dateRanges: [{ start: "2026-01-04", end: "2026-02-21" }, { start: "2026-09-06", end: "2026-10-01" }],
        rates: {
          sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
          friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 },
        },
      },
      { name: "Regular", color: "#2196F3",
        dateRanges: [{ start: "2026-04-12", end: "2026-06-28" }, { start: "2026-10-02", end: "2026-11-23" }, { start: "2026-11-29", end: "2026-12-17" }],
        rates: {
          sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
          friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 },
        },
      },
      { name: "Peak", color: "#FF9800",
        dateRanges: [{ start: "2026-02-22", end: "2026-03-26" }, { start: "2026-06-29", end: "2026-09-05" }],
        rates: {
          sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
          friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 },
        },
      },
      { name: "Premier", color: "#F44336",
        dateRanges: [{ start: "2026-01-01", end: "2026-01-03" }, { start: "2026-03-27", end: "2026-04-11" }, { start: "2026-11-24", end: "2026-11-28" }, { start: "2026-12-18", end: "2026-12-31" }],
        rates: {
          sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
          friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 },
        },
      },
    ],
  },

  // ===========================================================================================
  // 2027 DATA — WALT DISNEY WORLD RESORTS (same points as 2026, shifted travel period dates)
  // ===========================================================================================

  // --- AKV 2027 moved to data_historical.js ---

  // --- Bay Lake Tower at Disney's Contemporary Resort (2027) ---
  {
    id: "bayLakeTower",
    name: "Bay Lake Tower at Disney's Contemporary Resort",
    year: 2027,
    roomTypes: [
      { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 4 },
      { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 4 },
      { id: "dsTP", name: "Deluxe Studio - Theme Park View", sleeps: 4 },
      { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
      { id: "oneP", name: "One-Bedroom Villa - Preferred View", sleeps: 5 },
      { id: "oneTP", name: "One-Bedroom Villa - Theme Park View", sleeps: 5 },
      { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
      { id: "twoP", name: "Two-Bedroom Villa - Preferred View", sleeps: 9 },
      { id: "twoTP", name: "Two-Bedroom Villa - Theme Park View", sleeps: 9 },
      { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred View", sleeps: 12 },
      { id: "threeTP", name: "Three-Bedroom Grand Villa - Theme Park View", sleeps: 12 },
    ],
    travelPeriods: wdwPeriods2027([
      { sunThu: { dsR:13, dsP:16, dsTP:18, oneR:24, oneP:29, oneTP:35, twoR:35, twoP:38, twoTP:48, threeP:82, threeTP:101 },
        friSat: { dsR:16, dsP:19, dsTP:23, oneR:32, oneP:36, oneTP:44, twoR:42, twoP:47, twoTP:59, threeP:98, threeTP:120 } },
      { sunThu: { dsR:15, dsP:18, dsTP:20, oneR:28, oneP:33, oneTP:39, twoR:40, twoP:43, twoTP:54, threeP:88, threeTP:106 },
        friSat: { dsR:17, dsP:19, dsTP:23, oneR:35, oneP:38, oneTP:46, twoR:45, twoP:50, twoTP:61, threeP:104, threeTP:125 } },
      { sunThu: { dsR:16, dsP:19, dsTP:21, oneR:30, oneP:35, oneTP:41, twoR:42, twoP:46, twoTP:57, threeP:96, threeTP:115 },
        friSat: { dsR:18, dsP:20, dsTP:25, oneR:38, oneP:41, oneTP:50, twoR:48, twoP:54, twoTP:66, threeP:112, threeTP:135 } },
      { sunThu: { dsR:17, dsP:19, dsTP:23, oneR:31, oneP:36, oneTP:45, twoR:43, twoP:47, twoTP:58, threeP:100, threeTP:120 },
        friSat: { dsR:19, dsP:21, dsTP:26, oneR:39, oneP:44, oneTP:53, twoR:49, twoP:58, twoTP:67, threeP:115, threeTP:141 } },
      { sunThu: { dsR:18, dsP:20, dsTP:24, oneR:33, oneP:38, oneTP:47, twoR:45, twoP:50, twoTP:60, threeP:108, threeTP:131 },
        friSat: { dsR:21, dsP:23, dsTP:27, oneR:41, oneP:47, oneTP:56, twoR:53, twoP:61, twoTP:72, threeP:126, threeTP:153 } },
      { sunThu: { dsR:19, dsP:21, dsTP:26, oneR:36, oneP:42, oneTP:49, twoR:50, twoP:54, twoTP:65, threeP:120, threeTP:143 },
        friSat: { dsR:22, dsP:24, dsTP:29, oneR:44, oneP:48, oneTP:59, twoR:57, twoP:62, twoTP:76, threeP:140, threeTP:168 } },
      { sunThu: { dsR:26, dsP:28, dsTP:34, oneR:48, oneP:53, oneTP:64, twoR:66, twoP:72, twoTP:88, threeP:146, threeTP:176 },
        friSat: { dsR:29, dsP:32, dsTP:38, oneR:56, oneP:62, oneTP:75, twoR:77, twoP:84, twoTP:98, threeP:171, threeTP:207 } },
    ]),
  },

  // --- Disney's Beach Club Villas (2027) ---
  {
    id: "beachClubVillas",
    name: "Disney's Beach Club Villas",
    year: 2027,
    roomTypes: [
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    ],
    travelPeriods: wdwPeriods2027([
      { sunThu: { deluxeStudio:14, oneBedroom:26, twoBedroom:36 }, friSat: { deluxeStudio:15, oneBedroom:31, twoBedroom:43 } },
      { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 }, friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
      { sunThu: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 }, friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 } },
      { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 }, friSat: { deluxeStudio:18, oneBedroom:38, twoBedroom:47 } },
      { sunThu: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 }, friSat: { deluxeStudio:21, oneBedroom:39, twoBedroom:52 } },
      { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 }, friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
      { sunThu: { deluxeStudio:27, oneBedroom:51, twoBedroom:68 }, friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
    ]),
  },

  // --- Disney's BoardWalk Villas (2027) ---
  {
    id: "boardwalkVillas",
    name: "Disney's BoardWalk Villas",
    year: 2027,
    roomTypes: [
      { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
      { id: "dsBP", name: "Deluxe Studio - Boardwalk/Preferred", sleeps: 5 },
      { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 4 },
      { id: "oneBP", name: "One-Bedroom Villa - Boardwalk/Preferred", sleeps: 4 },
      { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
      { id: "twoBP", name: "Two-Bedroom Villa - Boardwalk/Preferred", sleeps: 9 },
      { id: "threeBP", name: "Three-Bedroom Grand Villa - Boardwalk/Preferred", sleeps: 12 },
    ],
    travelPeriods: wdwPeriods2027([
      { sunThu: { dsR:10, dsBP:14, oneR:19, oneBP:26, twoR:29, twoBP:35, threeBP:76 },
        friSat: { dsR:13, dsBP:16, oneR:27, oneBP:29, twoR:35, twoBP:40, threeBP:88 } },
      { sunThu: { dsR:10, dsBP:15, oneR:23, oneBP:29, twoR:32, twoBP:39, threeBP:81 },
        friSat: { dsR:14, dsBP:16, oneR:27, oneBP:34, twoR:38, twoBP:45, threeBP:91 } },
      { sunThu: { dsR:11, dsBP:16, oneR:24, oneBP:32, twoR:31, twoBP:41, threeBP:88 },
        friSat: { dsR:15, dsBP:17, oneR:30, oneBP:37, twoR:41, twoBP:47, threeBP:97 } },
      { sunThu: { dsR:11, dsBP:16, oneR:25, oneBP:35, twoR:33, twoBP:43, threeBP:91 },
        friSat: { dsR:16, dsBP:18, oneR:31, oneBP:39, twoR:44, twoBP:47, threeBP:102 } },
      { sunThu: { dsR:14, dsBP:18, oneR:28, oneBP:35, twoR:39, twoBP:45, threeBP:101 },
        friSat: { dsR:16, dsBP:20, oneR:33, oneBP:41, twoR:45, twoBP:51, threeBP:114 } },
      { sunThu: { dsR:15, dsBP:19, oneR:31, oneBP:39, twoR:43, twoBP:51, threeBP:110 },
        friSat: { dsR:19, dsBP:22, oneR:36, oneBP:43, twoR:49, twoBP:55, threeBP:124 } },
      { sunThu: { dsR:22, dsBP:28, oneR:42, oneBP:50, twoR:60, twoBP:68, threeBP:133 },
        friSat: { dsR:24, dsBP:29, oneR:48, oneBP:56, twoR:67, twoBP:77, threeBP:145 } },
    ]),
  },

  // --- Boulder Ridge Villas at Disney's Wilderness Lodge (2027) ---
  {
    id: "boulderRidge",
    name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
    year: 2027,
    roomTypes: [
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    ],
    travelPeriods: wdwPeriods2027([
      { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:36 }, friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 } },
      { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 }, friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
      { sunThu: { deluxeStudio:16, oneBedroom:32, twoBedroom:41 }, friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:47 } },
      { sunThu: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 }, friSat: { deluxeStudio:18, oneBedroom:39, twoBedroom:48 } },
      { sunThu: { deluxeStudio:17, oneBedroom:35, twoBedroom:46 }, friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:51 } },
      { sunThu: { deluxeStudio:19, oneBedroom:37, twoBedroom:49 }, friSat: { deluxeStudio:21, oneBedroom:42, twoBedroom:54 } },
      { sunThu: { deluxeStudio:26, oneBedroom:47, twoBedroom:64 }, friSat: { deluxeStudio:28, oneBedroom:55, twoBedroom:72 } },
    ]),
  },

  // --- Copper Creek Villas & Cabins at Disney's Wilderness Lodge (2027) ---
  {
    id: "copperCreek",
    name: "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
    year: 2027,
    roomTypes: [
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
      { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
      { id: "twoBedCabin", name: "Two-Bedroom Cabin", sleeps: 8 },
    ],
    travelPeriods: wdwPeriods2027([
      { sunThu: { deluxeStudio:13, oneBedroom:25, twoBedroom:35, threeBedroom:91, twoBedCabin:84 },
        friSat: { deluxeStudio:15, oneBedroom:30, twoBedroom:40, threeBedroom:107, twoBedCabin:100 } },
      { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38, threeBedroom:101, twoBedCabin:94 },
        friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44, threeBedroom:116, twoBedCabin:109 } },
      { sunThu: { deluxeStudio:16, oneBedroom:33, twoBedroom:41, threeBedroom:108, twoBedCabin:101 },
        friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:47, threeBedroom:124, twoBedCabin:117 } },
      { sunThu: { deluxeStudio:17, oneBedroom:34, twoBedroom:43, threeBedroom:113, twoBedCabin:107 },
        friSat: { deluxeStudio:18, oneBedroom:38, twoBedroom:49, threeBedroom:130, twoBedCabin:121 } },
      { sunThu: { deluxeStudio:17, oneBedroom:35, twoBedroom:45, threeBedroom:120, twoBedCabin:113 },
        friSat: { deluxeStudio:19, oneBedroom:42, twoBedroom:52, threeBedroom:137, twoBedCabin:131 } },
      { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:50, threeBedroom:128, twoBedCabin:124 },
        friSat: { deluxeStudio:21, oneBedroom:43, twoBedroom:56, threeBedroom:147, twoBedCabin:143 } },
      { sunThu: { deluxeStudio:25, oneBedroom:48, twoBedroom:64, threeBedroom:176, twoBedCabin:171 },
        friSat: { deluxeStudio:28, oneBedroom:54, twoBedroom:72, threeBedroom:206, twoBedCabin:196 } },
    ]),
  },

  // --- The Cabins at Disney's Fort Wilderness Resort (2027) ---
  {
    id: "fortWildernessCabins",
    name: "The Cabins at Disney's Fort Wilderness Resort",
    year: 2027,
    roomTypes: [
      { id: "cabin", name: "Cabin", sleeps: 6 },
    ],
    travelPeriods: wdwPeriods2027([
      { sunThu: { cabin:15 }, friSat: { cabin:18 } },
      { sunThu: { cabin:16 }, friSat: { cabin:19 } },
      { sunThu: { cabin:18 }, friSat: { cabin:21 } },
      { sunThu: { cabin:20 }, friSat: { cabin:24 } },
      { sunThu: { cabin:22 }, friSat: { cabin:25 } },
      { sunThu: { cabin:24 }, friSat: { cabin:28 } },
      { sunThu: { cabin:32 }, friSat: { cabin:36 } },
    ]),
  },

  // --- The Villas at Disney's Grand Floridian Resort & Spa (2027) ---
  {
    id: "grandFloridian",
    name: "The Villas at Disney's Grand Floridian Resort & Spa",
    year: 2027,
    roomTypes: [
      { id: "rsR", name: "Resort Studio - Resort View", sleeps: 5 },
      { id: "rsP", name: "Resort Studio - Preferred View", sleeps: 5 },
      { id: "rsTP", name: "Resort Studio - Theme Park View", sleeps: 5 },
      { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
      { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
      { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
      { id: "oneP", name: "One-Bedroom Villa - Preferred View", sleeps: 5 },
      { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
      { id: "twoP", name: "Two-Bedroom Villa - Preferred View", sleeps: 9 },
      { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred View", sleeps: 12 },
    ],
    travelPeriods: wdwPeriods2027([
      { sunThu: { rsR:16, rsP:19, rsTP:24, dsR:16, dsP:19, oneR:31, oneP:39, twoR:44, twoP:54, threeP:111 },
        friSat: { rsR:20, rsP:24, rsTP:27, dsR:20, dsP:24, oneR:41, oneP:48, twoR:55, twoP:65, threeP:131 } },
      { sunThu: { rsR:17, rsP:21, rsTP:25, dsR:17, dsP:21, oneR:36, oneP:43, twoR:49, twoP:59, threeP:118 },
        friSat: { rsR:20, rsP:24, rsTP:29, dsR:20, dsP:24, oneR:44, oneP:51, twoR:58, twoP:68, threeP:138 } },
      { sunThu: { rsR:18, rsP:21, rsTP:26, dsR:18, dsP:21, oneR:38, oneP:46, twoR:53, twoP:62, threeP:126 },
        friSat: { rsR:21, rsP:26, rsTP:31, dsR:21, dsP:26, oneR:46, oneP:55, twoR:61, twoP:74, threeP:148 } },
      { sunThu: { rsR:18, rsP:22, rsTP:28, dsR:18, dsP:22, oneR:41, oneP:49, twoR:56, twoP:66, threeP:131 },
        friSat: { rsR:21, rsP:27, rsTP:32, dsR:21, dsP:27, oneR:48, oneP:57, twoR:65, twoP:78, threeP:155 } },
      { sunThu: { rsR:22, rsP:26, rsTP:32, dsR:22, dsP:26, oneR:43, oneP:53, twoR:61, twoP:73, threeP:143 },
        friSat: { rsR:24, rsP:29, rsTP:36, dsR:24, dsP:29, oneR:51, oneP:61, twoR:69, twoP:82, threeP:169 } },
      { sunThu: { rsR:24, rsP:27, rsTP:34, dsR:24, dsP:27, oneR:46, oneP:55, twoR:65, twoP:75, threeP:161 },
        friSat: { rsR:26, rsP:32, rsTP:41, dsR:26, dsP:32, oneR:55, oneP:66, twoR:75, twoP:88, threeP:187 } },
      { sunThu: { rsR:32, rsP:38, rsTP:47, dsR:32, dsP:38, oneR:64, oneP:76, twoR:87, twoP:103, threeP:197 },
        friSat: { rsR:37, rsP:44, rsTP:54, dsR:37, dsP:44, oneR:75, oneP:89, twoR:103, twoP:122, threeP:227 } },
    ]),
  },

  // --- Disney's Old Key West Resort (2027) ---
  {
    id: "oldKeyWest",
    name: "Disney's Old Key West Resort",
    year: 2027,
    roomTypes: [
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
      { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    ],
    travelPeriods: wdwPeriods2027([
      { sunThu: { deluxeStudio:9, oneBedroom:20, twoBedroom:27, threeBedroom:46 }, friSat: { deluxeStudio:13, oneBedroom:25, twoBedroom:35, threeBedroom:56 } },
      { sunThu: { deluxeStudio:10, oneBedroom:23, twoBedroom:31, threeBedroom:50 }, friSat: { deluxeStudio:14, oneBedroom:26, twoBedroom:35, threeBedroom:59 } },
      { sunThu: { deluxeStudio:10, oneBedroom:25, twoBedroom:34, threeBedroom:53 }, friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:38, threeBedroom:64 } },
      { sunThu: { deluxeStudio:11, oneBedroom:26, twoBedroom:36, threeBedroom:56 }, friSat: { deluxeStudio:16, oneBedroom:30, twoBedroom:41, threeBedroom:69 } },
      { sunThu: { deluxeStudio:13, oneBedroom:28, twoBedroom:39, threeBedroom:59 }, friSat: { deluxeStudio:17, oneBedroom:34, twoBedroom:44, threeBedroom:71 } },
      { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:42, threeBedroom:66 }, friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:49, threeBedroom:79 } },
      { sunThu: { deluxeStudio:22, oneBedroom:40, twoBedroom:57, threeBedroom:82 }, friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:65, threeBedroom:106 } },
    ]),
  },

  // --- Disney's Polynesian Villas & Bungalows (2027) ---
  // NOTE: 2027 has small point increases vs 2026, plus new Tower Deluxe Studio Resort/Preferred views.
  {
    id: "polynesianVillas",
    name: "Disney's Polynesian Villas & Bungalows",
    year: 2027,
    roomTypes: [
      { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
      { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
      { id: "dsTP", name: "Deluxe Studio - Theme Park View (Tower)", sleeps: 4 },
      { id: "twoBedBungalow", name: "Two-Bedroom Bungalow", sleeps: 8 },
      { id: "duoR", name: "Duo Studio - Resort View (Tower)", sleeps: 2 },
      { id: "duoP", name: "Duo Studio - Preferred View (Tower)", sleeps: 2 },
      { id: "duoPM", name: "Duo Studio - Premium View (Tower)", sleeps: 2 },
      { id: "dsTwrR", name: "Deluxe Studio - Resort View (Tower)", sleeps: 4 },
      { id: "dsTwrP", name: "Deluxe Studio - Preferred View (Tower)", sleeps: 4 },
      { id: "oneR", name: "One-Bedroom Villa - Resort View (Tower)", sleeps: 5 },
      { id: "oneP", name: "One-Bedroom Villa - Preferred View (Tower)", sleeps: 5 },
      { id: "oneTP", name: "One-Bedroom Villa - Theme Park View (Tower)", sleeps: 5 },
      { id: "twoR", name: "Two-Bedroom Villa - Resort View (Tower)", sleeps: 9 },
      { id: "twoP", name: "Two-Bedroom Villa - Preferred View (Tower)", sleeps: 9 },
      { id: "twoTP", name: "Two-Bedroom Villa - Theme Park View (Tower)", sleeps: 9 },
      { id: "penthouseP", name: "Two-Bedroom Penthouse - Preferred (Tower)", sleeps: 8 },
      { id: "penthouseTP", name: "Two-Bedroom Penthouse - Theme Park (Tower)", sleeps: 8 },
    ],
    travelPeriods: wdwPeriods2027([
      { sunThu: { dsR:15, dsP:20, dsTP:25, twoBedBungalow:114, duoR:13, duoP:17, duoPM:20, dsTwrR:15, dsTwrP:20, oneR:30, oneP:39, oneTP:44, twoR:46, twoP:56, twoTP:70, penthouseP:88, penthouseTP:110 },
        friSat: { dsR:18, dsP:24, dsTP:30, twoBedBungalow:134, duoR:15, duoP:20, duoPM:24, dsTwrR:18, dsTwrP:24, oneR:36, oneP:47, oneTP:53, twoR:55, twoP:67, twoTP:81, penthouseP:105, penthouseTP:129 } },
      { sunThu: { dsR:17, dsP:22, dsTP:26, twoBedBungalow:122, duoR:14, duoP:18, duoPM:21, dsTwrR:17, dsTwrP:22, oneR:34, oneP:42, oneTP:47, twoR:49, twoP:61, twoTP:72, penthouseP:96, penthouseTP:118 },
        friSat: { dsR:20, dsP:24, dsTP:30, twoBedBungalow:140, duoR:16, duoP:20, duoPM:24, dsTwrR:20, dsTwrP:24, oneR:40, oneP:48, oneTP:54, twoR:57, twoP:69, twoTP:85, penthouseP:113, penthouseTP:136 } },
      { sunThu: { dsR:19, dsP:22, dsTP:27, twoBedBungalow:128, duoR:16, duoP:19, duoPM:22, dsTwrR:19, dsTwrP:22, oneR:38, oneP:47, oneTP:53, twoR:54, twoP:62, twoTP:76, penthouseP:102, penthouseTP:122 },
        friSat: { dsR:22, dsP:26, dsTP:32, twoBedBungalow:147, duoR:18, duoP:21, duoPM:26, dsTwrR:22, dsTwrP:26, oneR:44, oneP:52, oneTP:61, twoR:62, twoP:73, twoTP:90, penthouseP:119, penthouseTP:144 } },
      { sunThu: { dsR:20, dsP:24, dsTP:29, twoBedBungalow:136, duoR:17, duoP:20, duoPM:24, dsTwrR:20, dsTwrP:24, oneR:40, oneP:48, oneTP:54, twoR:56, twoP:68, twoTP:82, penthouseP:108, penthouseTP:128 },
        friSat: { dsR:23, dsP:27, dsTP:33, twoBedBungalow:157, duoR:19, duoP:22, duoPM:27, dsTwrR:23, dsTwrP:27, oneR:46, oneP:54, oneTP:63, twoR:65, twoP:79, twoTP:96, penthouseP:122, penthouseTP:152 } },
      { sunThu: { dsR:22, dsP:25, dsTP:31, twoBedBungalow:150, duoR:18, duoP:21, duoPM:26, dsTwrR:22, dsTwrP:25, oneR:44, oneP:53, oneTP:58, twoR:62, twoP:73, twoTP:90, penthouseP:115, penthouseTP:140 },
        friSat: { dsR:25, dsP:30, dsTP:36, twoBedBungalow:172, duoR:20, duoP:24, duoPM:29, dsTwrR:25, dsTwrP:30, oneR:50, oneP:60, oneTP:67, twoR:70, twoP:84, twoTP:101, penthouseP:132, penthouseTP:162 } },
      { sunThu: { dsR:25, dsP:28, dsTP:34, twoBedBungalow:162, duoR:20, duoP:23, duoPM:28, dsTwrR:25, dsTwrP:28, oneR:48, oneP:54, oneTP:65, twoR:68, twoP:79, twoTP:96, penthouseP:126, penthouseTP:153 },
        friSat: { dsR:28, dsP:32, dsTP:39, twoBedBungalow:185, duoR:23, duoP:26, duoPM:32, dsTwrR:28, dsTwrP:32, oneR:56, oneP:64, oneTP:75, twoR:79, twoP:90, twoTP:110, penthouseP:144, penthouseTP:179 } },
      { sunThu: { dsR:34, dsP:41, dsTP:48, twoBedBungalow:199, duoR:27, duoP:32, duoPM:39, dsTwrR:34, dsTwrP:41, oneR:68, oneP:78, oneTP:89, twoR:92, twoP:109, twoTP:128, penthouseP:178, penthouseTP:197 },
        friSat: { dsR:36, dsP:43, dsTP:53, twoBedBungalow:226, duoR:30, duoP:36, duoPM:43, dsTwrR:36, dsTwrP:43, oneR:78, oneP:86, oneTP:98, twoR:105, twoP:125, twoTP:149, penthouseP:198, penthouseTP:226 } },
    ]),
  },

  // --- Disney's Riviera Resort (2027) ---
  {
    id: "rivieraResort",
    name: "Disney's Riviera Resort",
    year: 2027,
    roomTypes: [
      { id: "towerStudio", name: "Tower Studio", sleeps: 2 },
      { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
      { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
      { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
      { id: "oneP", name: "One-Bedroom Villa - Preferred View", sleeps: 5 },
      { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
      { id: "twoP", name: "Two-Bedroom Villa - Preferred View", sleeps: 9 },
      { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    ],
    travelPeriods: wdwPeriods2027([
      { sunThu: { towerStudio:10, dsR:14, dsP:17, oneR:29, oneP:36, twoR:38, twoP:47, threeBedroom:103 },
        friSat: { towerStudio:13, dsR:17, dsP:22, oneR:34, oneP:46, twoR:47, twoP:58, threeBedroom:120 } },
      { sunThu: { towerStudio:12, dsR:16, dsP:19, oneR:34, oneP:41, twoR:44, twoP:52, threeBedroom:108 },
        friSat: { towerStudio:14, dsR:18, dsP:24, oneR:39, oneP:50, twoR:49, twoP:61, threeBedroom:127 } },
      { sunThu: { towerStudio:13, dsR:17, dsP:20, oneR:35, oneP:44, twoR:47, twoP:55, threeBedroom:116 },
        friSat: { towerStudio:15, dsR:19, dsP:26, oneR:42, oneP:54, twoR:53, twoP:67, threeBedroom:135 } },
      { sunThu: { towerStudio:14, dsR:17, dsP:21, oneR:36, oneP:48, twoR:50, twoP:59, threeBedroom:120 },
        friSat: { towerStudio:17, dsR:20, dsP:26, oneR:48, oneP:58, twoR:59, twoP:70, threeBedroom:141 } },
      { sunThu: { towerStudio:16, dsR:19, dsP:24, oneR:39, oneP:49, twoR:52, twoP:65, threeBedroom:129 },
        friSat: { towerStudio:18, dsR:22, dsP:28, oneR:50, oneP:59, twoR:63, twoP:74, threeBedroom:154 } },
      { sunThu: { towerStudio:17, dsR:21, dsP:27, oneR:43, oneP:53, twoR:56, twoP:71, threeBedroom:140 },
        friSat: { towerStudio:20, dsR:25, dsP:30, oneR:53, oneP:63, twoR:65, twoP:79, threeBedroom:166 } },
      { sunThu: { towerStudio:24, dsR:29, dsP:35, oneR:58, oneP:68, twoR:77, twoP:88, threeBedroom:172 },
        friSat: { towerStudio:27, dsR:32, dsP:40, oneR:68, oneP:81, twoR:90, twoP:103, threeBedroom:204 } },
    ]),
  },

  // --- Disney's Saratoga Springs Resort & Spa (2027) ---
  {
    id: "saratogaSprings",
    name: "Disney's Saratoga Springs Resort & Spa",
    year: 2027,
    roomTypes: [
      { id: "dsS", name: "Deluxe Studio - Standard", sleeps: 4 },
      { id: "dsP", name: "Deluxe Studio - Preferred", sleeps: 4 },
      { id: "oneS", name: "One-Bedroom Villa - Standard", sleeps: 5 },
      { id: "oneP", name: "One-Bedroom Villa - Preferred", sleeps: 5 },
      { id: "twoS", name: "Two-Bedroom Villa - Standard", sleeps: 9 },
      { id: "twoP", name: "Two-Bedroom Villa - Preferred", sleeps: 9 },
      { id: "threeS", name: "Three-Bedroom Grand Villa - Standard", sleeps: 12 },
      { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred", sleeps: 12 },
      { id: "treehouse", name: "Three-Bedroom Treehouse Villa", sleeps: 9 },
    ],
    travelPeriods: wdwPeriods2027([
      { sunThu: { dsS:9, dsP:11, oneS:21, oneP:24, twoS:27, twoP:35, threeS:63, threeP:74, treehouse:38 },
        friSat: { dsS:14, dsP:16, oneS:27, oneP:30, twoS:34, twoP:39, threeS:72, threeP:84, treehouse:43 } },
      { sunThu: { dsS:12, dsP:13, oneS:24, oneP:28, twoS:32, twoP:38, threeS:68, threeP:76, treehouse:41 },
        friSat: { dsS:15, dsP:17, oneS:29, oneP:34, twoS:36, twoP:42, threeS:78, threeP:89, treehouse:45 } },
      { sunThu: { dsS:13, dsP:15, oneS:26, oneP:30, twoS:35, twoP:39, threeS:74, threeP:82, treehouse:43 },
        friSat: { dsS:15, dsP:18, oneS:31, oneP:35, twoS:39, twoP:45, threeS:83, threeP:94, treehouse:48 } },
      { sunThu: { dsS:14, dsP:15, oneS:28, oneP:32, twoS:36, twoP:41, threeS:77, threeP:87, treehouse:44 },
        friSat: { dsS:16, dsP:19, oneS:33, oneP:37, twoS:39, twoP:50, threeS:86, threeP:98, treehouse:51 } },
      { sunThu: { dsS:14, dsP:16, oneS:30, oneP:34, twoS:37, twoP:46, threeS:86, threeP:98, treehouse:47 },
        friSat: { dsS:17, dsP:19, oneS:34, oneP:39, twoS:45, twoP:54, threeS:97, threeP:112, treehouse:52 } },
      { sunThu: { dsS:15, dsP:17, oneS:32, oneP:38, twoS:41, twoP:49, threeS:93, threeP:108, treehouse:51 },
        friSat: { dsS:18, dsP:21, oneS:36, oneP:42, twoS:47, twoP:59, threeS:107, threeP:125, treehouse:58 } },
      { sunThu: { dsS:21, dsP:23, oneS:43, oneP:49, twoS:56, twoP:67, threeS:113, threeP:131, treehouse:66 },
        friSat: { dsS:25, dsP:28, oneS:47, oneP:53, twoS:63, twoP:75, threeS:127, threeP:139, treehouse:76 } },
    ]),
  },

  // ===========================================================================================
  // 2027 DATA — OTHER DVC RESORTS (same points as 2026, shifted travel period dates)
  // ===========================================================================================

  // --- Aulani, Disney Vacation Club Villas (2027) ---
  {
    id: "aulani",
    name: "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
    year: 2027,
    roomTypes: [
      { id: "hotelRoom", name: "Hotel Room", sleeps: 4 },
      { id: "dsS", name: "Deluxe Studio - Standard", sleeps: 4 },
      { id: "dsI", name: "Deluxe Studio - Island Gardens", sleeps: 4 },
      { id: "dsP", name: "Deluxe Studio - Poolside Gardens", sleeps: 4 },
      { id: "dsO", name: "Deluxe Studio - Ocean View", sleeps: 4 },
      { id: "oneS", name: "One-Bedroom Villa - Standard", sleeps: 5 },
      { id: "oneI", name: "One-Bedroom Villa - Island Gardens", sleeps: 5 },
      { id: "oneP", name: "One-Bedroom Villa - Poolside Gardens", sleeps: 5 },
      { id: "oneO", name: "One-Bedroom Villa - Ocean View", sleeps: 5 },
      { id: "twoS", name: "Two-Bedroom Villa - Standard", sleeps: 9 },
      { id: "twoI", name: "Two-Bedroom Villa - Island Gardens", sleeps: 9 },
      { id: "twoP", name: "Two-Bedroom Villa - Poolside Gardens", sleeps: 9 },
      { id: "twoO", name: "Two-Bedroom Villa - Ocean View", sleeps: 9 },
      { id: "threeS", name: "Three-Bedroom Grand Villa - Standard", sleeps: 12 },
      { id: "threeO", name: "Three-Bedroom Grand Villa - Ocean View", sleeps: 12 },
    ],
    travelPeriods: [
      { name: "Value", color: "#4CAF50",
        dateRanges: [{ start: "2027-01-03", end: "2027-02-27" }, { start: "2027-09-05", end: "2027-10-09" }, { start: "2027-11-10", end: "2027-11-22" }, { start: "2027-11-28", end: "2027-12-23" }],
        rates: {
          sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 },
          friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 },
        },
      },
      { name: "Regular", color: "#2196F3",
        dateRanges: [{ start: "2027-04-04", end: "2027-04-28" }, { start: "2027-05-06", end: "2027-06-27" }, { start: "2027-10-10", end: "2027-11-09" }],
        rates: {
          sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
          friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
        },
      },
      { name: "Peak", color: "#FF9800",
        dateRanges: [{ start: "2027-02-28", end: "2027-03-18" }, { start: "2027-04-29", end: "2027-05-05" }, { start: "2027-08-09", end: "2027-09-04" }],
        rates: {
          sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 },
          friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 },
        },
      },
      { name: "Premier", color: "#F44336",
        dateRanges: [{ start: "2027-01-01", end: "2027-01-02" }, { start: "2027-03-19", end: "2027-04-03" }, { start: "2027-06-28", end: "2027-08-08" }, { start: "2027-11-23", end: "2027-11-27" }, { start: "2027-12-24", end: "2027-12-31" }],
        rates: {
          sunThu: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
          friSat: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
        },
      },
    ],
  },

  // --- Disney's Hilton Head Island Resort (2027) ---
  {
    id: "hiltonHead",
    name: "Disney's Hilton Head Island Resort",
    year: 2027,
    roomTypes: [
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
      { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    ],
    travelPeriods: [
      { name: "Value", color: "#4CAF50",
        dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-12-01", end: "2027-12-17" }],
        rates: {
          sunThu: { deluxeStudio:6, oneBedroom:14, twoBedroom:20, threeBedroom:27 },
          friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 },
        },
      },
      { name: "Regular", color: "#2196F3",
        dateRanges: [{ start: "2027-02-01", end: "2027-03-31" }, { start: "2027-11-01", end: "2027-11-30" }, { start: "2027-12-18", end: "2027-12-31" }],
        rates: {
          sunThu: { deluxeStudio:10, oneBedroom:20, twoBedroom:24, threeBedroom:47 },
          friSat: { deluxeStudio:15, oneBedroom:29, twoBedroom:36, threeBedroom:60 },
        },
      },
      { name: "Peak", color: "#FF9800",
        dateRanges: [{ start: "2027-04-01", end: "2027-06-10" }, { start: "2027-08-28", end: "2027-10-31" }],
        rates: {
          sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
          friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 },
        },
      },
      { name: "Premier", color: "#F44336",
        dateRanges: [{ start: "2027-06-11", end: "2027-08-27" }],
        rates: {
          sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
          friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:111 },
        },
      },
    ],
  },

  // --- Disney's Vero Beach Resort (2027) ---
  {
    id: "veroBeach",
    name: "Disney's Vero Beach Resort",
    year: 2027,
    roomTypes: [
      { id: "innStandard", name: "Deluxe Inn Room - Standard View", sleeps: 4 },
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
      { id: "innOcean", name: "Deluxe Inn Room - Ocean View", sleeps: 4 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
      { id: "beachCottage", name: "Three-Bedroom Beach Cottage", sleeps: 12 },
    ],
    travelPeriods: [
      { name: "Value", color: "#4CAF50",
        dateRanges: [{ start: "2027-09-01", end: "2027-11-23" }],
        rates: {
          sunThu: { innStandard:10, deluxeStudio:12, innOcean:14, oneBedroom:21, twoBedroom:30, beachCottage:60 },
          friSat: { innStandard:16, deluxeStudio:17, innOcean:17, oneBedroom:29, twoBedroom:39, beachCottage:72 },
        },
      },
      { name: "Regular", color: "#2196F3",
        dateRanges: [{ start: "2027-05-01", end: "2027-05-31" }, { start: "2027-11-27", end: "2027-12-23" }],
        rates: {
          sunThu: { innStandard:10, deluxeStudio:13, innOcean:15, oneBedroom:24, twoBedroom:33, beachCottage:61 },
          friSat: { innStandard:17, deluxeStudio:18, innOcean:19, oneBedroom:31, twoBedroom:42, beachCottage:74 },
        },
      },
      { name: "Choice", color: "#9C27B0",
        dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-06-01", end: "2027-08-31" }, { start: "2027-11-24", end: "2027-11-26" }],
        rates: {
          sunThu: { innStandard:14, deluxeStudio:16, innOcean:18, oneBedroom:29, twoBedroom:36, beachCottage:73 },
          friSat: { innStandard:17, deluxeStudio:19, innOcean:21, oneBedroom:37, twoBedroom:47, beachCottage:88 },
        },
      },
      { name: "Peak", color: "#FF9800",
        dateRanges: [{ start: "2027-02-01", end: "2027-02-13" }, { start: "2027-04-04", end: "2027-04-30" }],
        rates: {
          sunThu: { innStandard:15, deluxeStudio:17, innOcean:19, oneBedroom:31, twoBedroom:44, beachCottage:81 },
          friSat: { innStandard:20, deluxeStudio:21, innOcean:23, oneBedroom:40, twoBedroom:52, beachCottage:99 },
        },
      },
      { name: "Premier", color: "#F44336",
        dateRanges: [{ start: "2027-02-14", end: "2027-04-03" }, { start: "2027-12-24", end: "2027-12-31" }],
        rates: {
          sunThu: { innStandard:21, deluxeStudio:23, innOcean:26, oneBedroom:43, twoBedroom:61, beachCottage:105 },
          friSat: { innStandard:27, deluxeStudio:29, innOcean:31, oneBedroom:53, twoBedroom:72, beachCottage:126 },
        },
      },
    ],
  },

  // --- The Villas at Disneyland Hotel (2027) ---
  {
    id: "disneylandHotel",
    name: "The Villas at Disneyland Hotel",
    year: 2027,
    roomTypes: [
      { id: "duoS", name: "Duo Studio - Standard", sleeps: 2 },
      { id: "duoP", name: "Duo Studio - Preferred", sleeps: 2 },
      { id: "dsS", name: "Deluxe Studio - Standard", sleeps: 4 },
      { id: "dsP", name: "Deluxe Studio - Preferred", sleeps: 4 },
      { id: "oneP", name: "One-Bedroom Villa - Preferred", sleeps: 5 },
      { id: "twoP", name: "Two-Bedroom Villa - Preferred", sleeps: 9 },
      { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred", sleeps: 12 },
      { id: "gardenDuo", name: "Garden Room - Duo Studio", sleeps: 2 },
      { id: "gardenDS", name: "Garden Room - Deluxe Studio", sleeps: 4 },
    ],
    travelPeriods: [
      { name: "Adventure", color: "#4CAF50",
        dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }],
        rates: {
          sunThu: { duoS:10, duoP:11, dsS:13, dsP:15, oneP:30, twoP:43, threeP:96, gardenDuo:12, gardenDS:19 },
          friSat: { duoS:13, duoP:14, dsS:16, dsP:19, oneP:37, twoP:53, threeP:118, gardenDuo:15, gardenDS:23 },
        },
      },
      { name: "Dream", color: "#2196F3",
        dateRanges: [{ start: "2027-05-01", end: "2027-05-22" }, { start: "2027-08-16", end: "2027-09-15" }],
        rates: {
          sunThu: { duoS:12, duoP:13, dsS:15, dsP:18, oneP:33, twoP:49, threeP:106, gardenDuo:14, gardenDS:21 },
          friSat: { duoS:14, duoP:15, dsS:18, dsP:22, oneP:40, twoP:59, threeP:128, gardenDuo:17, gardenDS:25 },
        },
      },
      { name: "Choice", color: "#9C27B0",
        dateRanges: [{ start: "2027-02-01", end: "2027-03-14" }, { start: "2027-09-16", end: "2027-09-30" }],
        rates: {
          sunThu: { duoS:13, duoP:14, dsS:17, dsP:20, oneP:36, twoP:52, threeP:122, gardenDuo:16, gardenDS:24 },
          friSat: { duoS:15, duoP:17, dsS:20, dsP:24, oneP:42, twoP:61, threeP:146, gardenDuo:19, gardenDS:28 },
        },
      },
      { name: "Select", color: "#FF9800",
        dateRanges: [{ start: "2027-05-23", end: "2027-05-31" }, { start: "2027-10-01", end: "2027-11-22" }, { start: "2027-11-27", end: "2027-12-17" }],
        rates: {
          sunThu: { duoS:14, duoP:15, dsS:20, dsP:23, oneP:40, twoP:60, threeP:129, gardenDuo:17, gardenDS:28 },
          friSat: { duoS:16, duoP:17, dsS:23, dsP:26, oneP:46, twoP:69, threeP:152, gardenDuo:20, gardenDS:32 },
        },
      },
      { name: "Preferred", color: "#00BCD4",
        dateRanges: [{ start: "2027-06-01", end: "2027-08-15" }],
        rates: {
          sunThu: { duoS:16, duoP:18, dsS:23, dsP:26, oneP:42, twoP:65, threeP:149, gardenDuo:21, gardenDS:31 },
          friSat: { duoS:18, duoP:20, dsS:26, dsP:29, oneP:48, twoP:73, threeP:169, gardenDuo:23, gardenDS:34 },
        },
      },
      { name: "Premier", color: "#E91E63",
        dateRanges: [{ start: "2027-03-15", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }],
        rates: {
          sunThu: { duoS:16, duoP:18, dsS:24, dsP:27, oneP:42, twoP:65, threeP:149, gardenDuo:21, gardenDS:31 },
          friSat: { duoS:19, duoP:21, dsS:27, dsP:30, oneP:50, twoP:75, threeP:174, gardenDuo:24, gardenDS:35 },
        },
      },
      { name: "Holiday", color: "#F44336",
        dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-11-23", end: "2027-11-26" }, { start: "2027-12-18", end: "2027-12-31" }],
        rates: {
          sunThu: { duoS:22, duoP:24, dsS:28, dsP:31, oneP:54, twoP:82, threeP:174, gardenDuo:26, gardenDS:37 },
          friSat: { duoS:25, duoP:27, dsS:31, dsP:34, oneP:62, twoP:92, threeP:204, gardenDuo:30, gardenDS:41 },
        },
      },
    ],
  },

  // --- The Villas at Disney's Grand Californian Hotel & Spa (2027) ---
  {
    id: "grandCalifornian",
    name: "The Villas at Disney's Grand Californian Hotel & Spa",
    year: 2027,
    roomTypes: [
      { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
      { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
      { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
      { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    ],
    travelPeriods: [
      { name: "Value", color: "#4CAF50",
        dateRanges: [{ start: "2027-01-03", end: "2027-02-27" }, { start: "2027-09-05", end: "2027-09-30" }],
        rates: {
          sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
          friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 },
        },
      },
      { name: "Regular", color: "#2196F3",
        dateRanges: [{ start: "2027-04-04", end: "2027-06-27" }, { start: "2027-10-01", end: "2027-11-22" }, { start: "2027-11-28", end: "2027-12-16" }],
        rates: {
          sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
          friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 },
        },
      },
      { name: "Peak", color: "#FF9800",
        dateRanges: [{ start: "2027-02-28", end: "2027-03-18" }, { start: "2027-06-28", end: "2027-09-04" }],
        rates: {
          sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
          friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 },
        },
      },
      { name: "Premier", color: "#F44336",
        dateRanges: [{ start: "2027-01-01", end: "2027-01-02" }, { start: "2027-03-19", end: "2027-04-03" }, { start: "2027-11-23", end: "2027-11-27" }, { start: "2027-12-17", end: "2027-12-31" }],
        rates: {
          sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
          friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 },
        },
      },
    ],
  },

];

// ===========================================================================================
// Utility functions
// ===========================================================================================

// Given a date string "YYYY-MM-DD", find which travel period it belongs to
function getTravelPeriod(resort, dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  for (const period of resort.travelPeriods) {
    for (const range of period.dateRanges) {
      const start = new Date(range.start + "T00:00:00");
      const end = new Date(range.end + "T23:59:59");
      if (date >= start && date <= end) {
        return period;
      }
    }
  }
  return null;
}

// Given a date, determine if it's Fri-Sat or Sun-Thu
function getDayType(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  const day = date.getDay(); // 0=Sun, 5=Fri, 6=Sat
  return day === 5 || day === 6 ? "friSat" : "sunThu";
}

// Get points for a specific date and room type
function getPointsForDate(resort, dateStr, roomTypeId) {
  const period = getTravelPeriod(resort, dateStr);
  if (!period) return null;
  const dayType = getDayType(dateStr);
  return period.rates[dayType][roomTypeId];
}

// Get estimated Disney cash rate for a specific date and room type
function getCashRateForDate(resort, dateStr, roomTypeId) {
  const period = getTravelPeriod(resort, dateStr);
  if (!period || !period.cashRates) return null;
  const dayType = getDayType(dateStr);
  return period.cashRates[dayType][roomTypeId];
}

// Get cash rate with fallback to prior year's data if current year has none.
// Returns { rate, isPriorYear } or null if no rate found at all.
function getCashRateWithFallback(resort, dateStr, roomTypeId) {
  // Try current year first
  const rate = getCashRateForDate(resort, dateStr, roomTypeId);
  if (rate) return { rate, isPriorYear: false };

  // Check if resort has any cash data at all — if it does, the room type just isn't covered
  const period = getTravelPeriod(resort, dateStr);
  if (period && period.cashRates) return null;

  // No cash data for this year — try prior year's resort
  const priorYear = resort.year - 1;
  const priorResort = RESORTS.find(r => r.id === resort.id && r.year === priorYear);
  if (!priorResort) return null;

  // Match by travel period name (Adventure, Dream, etc.)
  const periodName = period ? period.name : null;
  if (!periodName) return null;

  const priorPeriod = priorResort.travelPeriods.find(p => p.name === periodName);
  if (!priorPeriod || !priorPeriod.cashRates) return null;

  const dayType = getDayType(dateStr);
  const priorRate = priorPeriod.cashRates[dayType]?.[roomTypeId];
  if (!priorRate) return null;

  return { rate: priorRate, isPriorYear: true, fallbackYear: priorYear };
}
