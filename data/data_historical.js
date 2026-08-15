// DVC Points Data — All Resorts (Historical)
// Auto-extracted from official DVC PDFs via scripts/extract_all_historical.py
// Source: https://dvcfieldguide.com/point-archive
//
// This file pushes historical resort entries onto the RESORTS array.
// Include after data.js in index.html.

// Generic period builder — combines period definitions with rate arrays.
// Supports optional cashRates as third argument.
function buildPeriods(periodDefs, rates, cashRates) {
  return periodDefs.map((def, i) => {
    const period = { ...def, rates: rates[i] };
    if (cashRates && cashRates[i]) period.cashRates = cashRates[i];
    return period;
  });
}

// ======================================================================
// Disney's Animal Kingdom Villas
// ======================================================================

// === 2016 — 5 travel periods ===
const AKV_2016 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2016-01-01", end: "2016-01-31" }, { start: "2016-09-01", end: "2016-09-30" }, { start: "2016-12-01", end: "2016-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2016-10-01", end: "2016-11-22" }, { start: "2016-11-26", end: "2016-11-30" }, { start: "2016-12-15", end: "2016-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2016-02-01", end: "2016-02-15" }, { start: "2016-05-01", end: "2016-06-10" }, { start: "2016-08-16", end: "2016-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2016-02-16", end: "2016-03-19" }, { start: "2016-04-03", end: "2016-04-30" }, { start: "2016-06-11", end: "2016-08-15" }, { start: "2016-11-23", end: "2016-11-25" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2016-03-20", end: "2016-04-02" }, { start: "2016-12-24", end: "2016-12-31" }] },
];

RESORTS.push({
  id: "animalKingdomVillas",
  name: "Disney's Animal Kingdom Villas",
  year: 2016,
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
  travelPeriods: buildPeriods(AKV_2016, [
    { sunThu: { dsV:9, dsR:11, dsSV:14, dsC:17, oneV:19, oneR:22, oneSV:29, oneC:35, twoV:25, twoR:30, twoSV:37, twoC:47, threeR:69, threeSV:75 },
      friSat: { dsV:12, dsR:13, dsSV:16, dsC:20, oneV:22, oneR:26, oneSV:32, oneC:39, twoV:30, twoR:35, twoSV:44, twoC:54, threeR:78, threeSV:85 } },
    { sunThu: { dsV:9, dsR:12, dsSV:16, dsC:18, oneV:22, oneR:25, oneSV:31, oneC:37, twoV:29, twoR:31, twoSV:40, twoC:50, threeR:73, threeSV:79 },
      friSat: { dsV:12, dsR:14, dsSV:18, dsC:21, oneV:24, oneR:28, oneSV:34, oneC:42, twoV:34, twoR:37, twoSV:48, twoC:56, threeR:82, threeSV:89 } },
    { sunThu: { dsV:10, dsR:13, dsSV:17, dsC:20, oneV:23, oneR:28, oneSV:34, oneC:40, twoV:30, twoR:35, twoSV:43, twoC:54, threeR:83, threeSV:90 },
      friSat: { dsV:13, dsR:15, dsSV:19, dsC:22, oneV:26, oneR:30, oneSV:36, oneC:46, twoV:35, twoR:40, twoSV:51, twoC:62, threeR:94, threeSV:102 } },
    { sunThu: { dsV:13, dsR:16, dsSV:19, dsC:21, oneV:26, oneR:32, oneSV:38, oneC:45, twoV:33, twoR:39, twoSV:50, twoC:61, threeR:97, threeSV:105 },
      friSat: { dsV:15, dsR:18, dsSV:22, dsC:24, oneV:29, oneR:34, oneSV:41, oneC:51, twoV:39, twoR:46, twoSV:61, twoC:69, threeR:111, threeSV:121 } },
    { sunThu: { dsV:16, dsR:20, dsSV:25, dsC:29, oneV:32, oneR:37, oneSV:46, oneC:58, twoV:44, twoR:53, twoSV:67, twoC:79, threeR:116, threeSV:126 },
      friSat: { dsV:19, dsR:23, dsSV:28, dsC:33, oneV:37, oneR:44, oneSV:52, oneC:66, twoV:51, twoR:59, twoSV:75, twoC:90, threeR:135, threeSV:144 } },
  ]),
});

// === 2017 — 5 travel periods ===
const AKV_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-01-01", end: "2017-01-31" }, { start: "2017-09-01", end: "2017-09-30" }, { start: "2017-12-01", end: "2017-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-10-01", end: "2017-11-21" }, { start: "2017-11-25", end: "2017-11-30" }, { start: "2017-12-15", end: "2017-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2017-02-01", end: "2017-02-15" }, { start: "2017-05-01", end: "2017-06-10" }, { start: "2017-08-16", end: "2017-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-02-16", end: "2017-04-08" }, { start: "2017-04-23", end: "2017-04-30" }, { start: "2017-06-11", end: "2017-08-15" }, { start: "2017-11-22", end: "2017-11-24" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-04-09", end: "2017-04-22" }, { start: "2017-12-24", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "animalKingdomVillas",
  name: "Disney's Animal Kingdom Villas",
  year: 2017,
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
  travelPeriods: buildPeriods(AKV_2017, [
    { sunThu: { dsV:9, dsR:11, dsSV:14, dsC:17, oneV:19, oneR:22, oneSV:29, oneC:35, twoV:25, twoR:30, twoSV:37, twoC:47, threeR:69, threeSV:75 },
      friSat: { dsV:12, dsR:13, dsSV:16, dsC:20, oneV:22, oneR:26, oneSV:32, oneC:39, twoV:30, twoR:35, twoSV:44, twoC:54, threeR:78, threeSV:85 } },
    { sunThu: { dsV:9, dsR:12, dsSV:16, dsC:18, oneV:22, oneR:25, oneSV:31, oneC:37, twoV:29, twoR:31, twoSV:40, twoC:50, threeR:73, threeSV:79 },
      friSat: { dsV:12, dsR:14, dsSV:18, dsC:21, oneV:24, oneR:28, oneSV:34, oneC:42, twoV:34, twoR:37, twoSV:48, twoC:56, threeR:82, threeSV:89 } },
    { sunThu: { dsV:10, dsR:13, dsSV:17, dsC:20, oneV:23, oneR:28, oneSV:34, oneC:40, twoV:30, twoR:35, twoSV:43, twoC:54, threeR:83, threeSV:90 },
      friSat: { dsV:13, dsR:15, dsSV:19, dsC:22, oneV:26, oneR:30, oneSV:36, oneC:46, twoV:35, twoR:40, twoSV:51, twoC:62, threeR:94, threeSV:102 } },
    { sunThu: { dsV:13, dsR:16, dsSV:19, dsC:21, oneV:26, oneR:32, oneSV:38, oneC:45, twoV:33, twoR:39, twoSV:50, twoC:61, threeR:97, threeSV:105 },
      friSat: { dsV:15, dsR:18, dsSV:22, dsC:24, oneV:29, oneR:34, oneSV:41, oneC:51, twoV:39, twoR:46, twoSV:61, twoC:69, threeR:111, threeSV:121 } },
    { sunThu: { dsV:16, dsR:20, dsSV:25, dsC:29, oneV:32, oneR:37, oneSV:46, oneC:58, twoV:44, twoR:53, twoSV:67, twoC:79, threeR:116, threeSV:126 },
      friSat: { dsV:19, dsR:23, dsSV:28, dsC:33, oneV:37, oneR:44, oneSV:52, oneC:66, twoV:51, twoR:59, twoSV:75, twoC:90, threeR:135, threeSV:144 } },
  ]),
});

// === 2018 — 5 travel periods ===
const AKV_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-01-01", end: "2018-01-31" }, { start: "2018-09-01", end: "2018-09-30" }, { start: "2018-12-01", end: "2018-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-10-01", end: "2018-11-20" }, { start: "2018-11-24", end: "2018-11-30" }, { start: "2018-12-15", end: "2018-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2018-02-01", end: "2018-02-15" }, { start: "2018-05-01", end: "2018-06-10" }, { start: "2018-08-16", end: "2018-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2018-02-16", end: "2018-03-24" }, { start: "2018-04-08", end: "2018-04-30" }, { start: "2018-06-11", end: "2018-08-15" }, { start: "2018-11-21", end: "2018-11-23" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-03-25", end: "2018-04-07" }, { start: "2018-12-24", end: "2018-12-31" }] },
];

RESORTS.push({
  id: "animalKingdomVillas",
  name: "Disney's Animal Kingdom Villas",
  year: 2018,
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
  travelPeriods: buildPeriods(AKV_2018, [
    { sunThu: { dsV:9, dsR:11, dsSV:14, dsC:17, oneV:19, oneR:22, oneSV:29, oneC:35, twoV:25, twoR:30, twoSV:37, twoC:47, threeR:69, threeSV:75 },
      friSat: { dsV:12, dsR:13, dsSV:16, dsC:20, oneV:22, oneR:26, oneSV:32, oneC:39, twoV:30, twoR:35, twoSV:44, twoC:54, threeR:78, threeSV:85 } },
    { sunThu: { dsV:9, dsR:12, dsSV:16, dsC:18, oneV:22, oneR:25, oneSV:31, oneC:37, twoV:29, twoR:31, twoSV:40, twoC:50, threeR:73, threeSV:79 },
      friSat: { dsV:12, dsR:14, dsSV:18, dsC:21, oneV:24, oneR:28, oneSV:34, oneC:42, twoV:34, twoR:37, twoSV:48, twoC:56, threeR:82, threeSV:89 } },
    { sunThu: { dsV:10, dsR:13, dsSV:17, dsC:20, oneV:23, oneR:28, oneSV:34, oneC:40, twoV:30, twoR:35, twoSV:43, twoC:54, threeR:83, threeSV:90 },
      friSat: { dsV:13, dsR:15, dsSV:19, dsC:22, oneV:26, oneR:30, oneSV:36, oneC:46, twoV:35, twoR:40, twoSV:51, twoC:62, threeR:94, threeSV:102 } },
    { sunThu: { dsV:13, dsR:16, dsSV:19, dsC:21, oneV:26, oneR:32, oneSV:38, oneC:45, twoV:33, twoR:39, twoSV:50, twoC:61, threeR:97, threeSV:105 },
      friSat: { dsV:15, dsR:18, dsSV:22, dsC:24, oneV:29, oneR:34, oneSV:41, oneC:51, twoV:39, twoR:46, twoSV:61, twoC:69, threeR:111, threeSV:121 } },
    { sunThu: { dsV:16, dsR:20, dsSV:25, dsC:29, oneV:32, oneR:37, oneSV:46, oneC:58, twoV:44, twoR:53, twoSV:67, twoC:79, threeR:116, threeSV:126 },
      friSat: { dsV:19, dsR:23, dsSV:28, dsC:33, oneV:37, oneR:44, oneSV:52, oneC:66, twoV:51, twoR:59, twoSV:75, twoC:90, threeR:135, threeSV:144 } },
  ]),
});

// === 2019 — 5 travel periods ===
const AKV_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-01", end: "2019-01-31" }, { start: "2019-09-01", end: "2019-09-30" }, { start: "2019-12-01", end: "2019-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-10-01", end: "2019-11-26" }, { start: "2019-11-30", end: "2019-11-30" }, { start: "2019-12-15", end: "2019-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2019-02-01", end: "2019-02-15" }, { start: "2019-05-01", end: "2019-06-10" }, { start: "2019-08-16", end: "2019-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-16", end: "2019-04-13" }, { start: "2019-04-28", end: "2019-04-30" }, { start: "2019-06-11", end: "2019-08-15" }, { start: "2019-11-27", end: "2019-11-29" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-04-14", end: "2019-04-27" }, { start: "2019-12-24", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "animalKingdomVillas",
  name: "Disney's Animal Kingdom Villas",
  year: 2019,
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
  travelPeriods: buildPeriods(AKV_2019, [
    { sunThu: { dsV:8, dsR:11, dsSV:14, dsC:19, oneV:18, oneR:22, oneSV:29, oneC:39, twoV:23, twoR:30, twoSV:37, twoC:52, threeR:69, threeSV:75 },
      friSat: { dsV:10, dsR:13, dsSV:16, dsC:22, oneV:20, oneR:26, oneSV:32, oneC:43, twoV:28, twoR:35, twoSV:44, twoC:58, threeR:78, threeSV:85 } },
    { sunThu: { dsV:9, dsR:12, dsSV:16, dsC:20, oneV:20, oneR:25, oneSV:31, oneC:41, twoV:27, twoR:31, twoSV:40, twoC:55, threeR:73, threeSV:79 },
      friSat: { dsV:11, dsR:14, dsSV:18, dsC:23, oneV:22, oneR:28, oneSV:34, oneC:46, twoV:32, twoR:37, twoSV:48, twoC:63, threeR:82, threeSV:89 } },
    { sunThu: { dsV:10, dsR:13, dsSV:17, dsC:22, oneV:21, oneR:28, oneSV:34, oneC:44, twoV:28, twoR:35, twoSV:43, twoC:60, threeR:83, threeSV:90 },
      friSat: { dsV:11, dsR:15, dsSV:19, dsC:24, oneV:24, oneR:30, oneSV:36, oneC:51, twoV:33, twoR:40, twoSV:51, twoC:68, threeR:94, threeSV:102 } },
    { sunThu: { dsV:12, dsR:16, dsSV:19, dsC:23, oneV:24, oneR:32, oneSV:38, oneC:50, twoV:31, twoR:39, twoSV:50, twoC:66, threeR:97, threeSV:105 },
      friSat: { dsV:14, dsR:18, dsSV:22, dsC:26, oneV:27, oneR:34, oneSV:41, oneC:56, twoV:36, twoR:46, twoSV:61, twoC:77, threeR:111, threeSV:121 } },
    { sunThu: { dsV:15, dsR:20, dsSV:25, dsC:32, oneV:30, oneR:37, oneSV:46, oneC:64, twoV:41, twoR:53, twoSV:67, twoC:86, threeR:116, threeSV:126 },
      friSat: { dsV:18, dsR:23, dsSV:28, dsC:36, oneV:35, oneR:44, oneSV:52, oneC:73, twoV:48, twoR:59, twoSV:75, twoC:98, threeR:135, threeSV:144 } },
  ]),
});

// === 2020 — 5 travel periods ===
const AKV_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-09-01", end: "2020-09-30" }, { start: "2020-12-01", end: "2020-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-10-01", end: "2020-11-24" }, { start: "2020-11-28", end: "2020-11-30" }, { start: "2020-12-15", end: "2020-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-02-01", end: "2020-02-15" }, { start: "2020-05-01", end: "2020-06-10" }, { start: "2020-08-16", end: "2020-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-16", end: "2020-04-04" }, { start: "2020-04-19", end: "2020-04-30" }, { start: "2020-06-11", end: "2020-08-15" }, { start: "2020-11-25", end: "2020-11-27" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-04-05", end: "2020-04-18" }, { start: "2020-12-24", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "animalKingdomVillas",
  name: "Disney's Animal Kingdom Villas",
  year: 2020,
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
  travelPeriods: buildPeriods(AKV_2020, [
    { sunThu: { dsV:8, dsR:11, dsSV:14, dsC:19, oneV:18, oneR:22, oneSV:29, oneC:39, twoV:23, twoR:30, twoSV:37, twoC:52, threeR:69, threeSV:75 },
      friSat: { dsV:10, dsR:13, dsSV:16, dsC:22, oneV:20, oneR:26, oneSV:32, oneC:43, twoV:28, twoR:35, twoSV:44, twoC:58, threeR:78, threeSV:85 } },
    { sunThu: { dsV:9, dsR:12, dsSV:16, dsC:20, oneV:20, oneR:25, oneSV:31, oneC:41, twoV:27, twoR:31, twoSV:40, twoC:55, threeR:73, threeSV:79 },
      friSat: { dsV:11, dsR:14, dsSV:18, dsC:23, oneV:22, oneR:28, oneSV:34, oneC:46, twoV:32, twoR:37, twoSV:48, twoC:63, threeR:82, threeSV:89 } },
    { sunThu: { dsV:10, dsR:13, dsSV:17, dsC:22, oneV:21, oneR:28, oneSV:34, oneC:44, twoV:28, twoR:35, twoSV:43, twoC:60, threeR:83, threeSV:90 },
      friSat: { dsV:11, dsR:15, dsSV:19, dsC:24, oneV:24, oneR:30, oneSV:36, oneC:51, twoV:33, twoR:40, twoSV:51, twoC:68, threeR:94, threeSV:102 } },
    { sunThu: { dsV:12, dsR:16, dsSV:19, dsC:23, oneV:24, oneR:32, oneSV:38, oneC:50, twoV:31, twoR:39, twoSV:50, twoC:66, threeR:97, threeSV:105 },
      friSat: { dsV:14, dsR:18, dsSV:22, dsC:26, oneV:27, oneR:34, oneSV:41, oneC:56, twoV:36, twoR:46, twoSV:61, twoC:77, threeR:111, threeSV:121 } },
    { sunThu: { dsV:15, dsR:20, dsSV:25, dsC:32, oneV:30, oneR:37, oneSV:46, oneC:64, twoV:41, twoR:53, twoSV:67, twoC:86, threeR:116, threeSV:126 },
      friSat: { dsV:18, dsR:23, dsSV:28, dsC:36, oneV:35, oneR:44, oneSV:52, oneC:73, twoV:48, twoR:59, twoSV:75, twoC:98, threeR:135, threeSV:144 } },
  ]),
});

// === 2021 — 7 travel periods ===
const AKV_2021 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2021-09-01", end: "2021-09-19" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-09-20", end: "2021-09-30" }, { start: "2021-12-01", end: "2021-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2021-05-01", end: "2021-06-10" }, { start: "2021-10-01", end: "2021-11-23" }, { start: "2021-11-27", end: "2021-11-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2021-02-01", end: "2021-02-15" }, { start: "2021-08-16", end: "2021-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2021-04-11", end: "2021-04-30" }, { start: "2021-06-11", end: "2021-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2021-02-16", end: "2021-02-28" }, { start: "2021-03-01", end: "2021-03-27" }, { start: "2021-04-05", end: "2021-04-10" }, { start: "2021-11-24", end: "2021-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2021-03-28", end: "2021-04-04" }, { start: "2021-12-24", end: "2021-12-31" }] },
];

RESORTS.push({
  id: "animalKingdomVillas",
  name: "Disney's Animal Kingdom Villas",
  year: 2021,
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
  travelPeriods: buildPeriods(AKV_2021, [
    { sunThu: { dsV:7, dsR:10, dsSV:13, dsC:18, oneV:17, oneR:21, oneSV:28, oneC:38, twoV:22, twoR:29, twoSV:36, twoC:51, threeR:68, threeSV:74 },
      friSat: { dsV:10, dsR:13, dsSV:16, dsC:22, oneV:20, oneR:26, oneSV:32, oneC:43, twoV:28, twoR:35, twoSV:44, twoC:58, threeR:78, threeSV:85 } },
    { sunThu: { dsV:8, dsR:12, dsSV:15, dsC:20, oneV:19, oneR:24, oneSV:31, oneC:41, twoV:25, twoR:30, twoSV:39, twoC:55, threeR:72, threeSV:79 },
      friSat: { dsV:11, dsR:14, dsSV:17, dsC:23, oneV:21, oneR:28, oneSV:34, oneC:46, twoV:31, twoR:37, twoSV:48, twoC:63, threeR:82, threeSV:89 } },
    { sunThu: { dsV:9, dsR:13, dsSV:17, dsC:21, oneV:21, oneR:27, oneSV:33, oneC:43, twoV:28, twoR:34, twoSV:43, twoC:58, threeR:78, threeSV:86 },
      friSat: { dsV:11, dsR:15, dsSV:19, dsC:24, oneV:23, oneR:29, oneSV:35, oneC:49, twoV:32, twoR:39, twoSV:50, twoC:66, threeR:88, threeSV:96 } },
    { sunThu: { dsV:10, dsR:14, dsSV:18, dsC:22, oneV:21, oneR:28, oneSV:34, oneC:44, twoV:28, twoR:36, twoSV:44, twoC:60, threeR:83, threeSV:90 },
      friSat: { dsV:11, dsR:15, dsSV:19, dsC:24, oneV:24, oneR:30, oneSV:36, oneC:51, twoV:33, twoR:40, twoSV:51, twoC:68, threeR:94, threeSV:102 } },
    { sunThu: { dsV:11, dsR:15, dsSV:18, dsC:23, oneV:23, oneR:30, oneSV:36, oneC:47, twoV:30, twoR:38, twoSV:48, twoC:63, threeR:90, threeSV:99 },
      friSat: { dsV:13, dsR:17, dsSV:21, dsC:25, oneV:26, oneR:32, oneSV:39, oneC:54, twoV:35, twoR:44, twoSV:57, twoC:73, threeR:103, threeSV:113 } },
    { sunThu: { dsV:12, dsR:16, dsSV:20, dsC:23, oneV:24, oneR:32, oneSV:38, oneC:50, twoV:31, twoR:39, twoSV:51, twoC:66, threeR:97, threeSV:106 },
      friSat: { dsV:14, dsR:18, dsSV:22, dsC:26, oneV:27, oneR:35, oneSV:41, oneC:56, twoV:36, twoR:47, twoSV:61, twoC:78, threeR:111, threeSV:121 } },
    { sunThu: { dsV:16, dsR:21, dsSV:26, dsC:33, oneV:31, oneR:38, oneSV:47, oneC:65, twoV:43, twoR:55, twoSV:69, twoC:88, threeR:117, threeSV:127 },
      friSat: { dsV:18, dsR:23, dsSV:29, dsC:36, oneV:35, oneR:45, oneSV:52, oneC:73, twoV:48, twoR:60, twoSV:76, twoC:98, threeR:135, threeSV:144 } },
  ]),
});

// === 2022 — 7 travel periods ===
const AKV_2022 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2022-09-01", end: "2022-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-12-01", end: "2022-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2022-05-01", end: "2022-06-10" }, { start: "2022-12-15", end: "2022-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2022-02-01", end: "2022-02-15" }, { start: "2022-06-11", end: "2022-08-31" }, { start: "2022-10-01", end: "2022-11-22" }, { start: "2022-11-26", end: "2022-11-30" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2022-04-24", end: "2022-04-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2022-02-16", end: "2022-02-28" }, { start: "2022-03-01", end: "2022-04-09" }, { start: "2022-04-18", end: "2022-04-23" }, { start: "2022-11-23", end: "2022-11-25" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2022-04-10", end: "2022-04-17" }, { start: "2022-12-24", end: "2022-12-31" }] },
];

RESORTS.push({
  id: "animalKingdomVillas",
  name: "Disney's Animal Kingdom Villas",
  year: 2022,
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
  travelPeriods: buildPeriods(AKV_2022, [
    { sunThu: { dsV:7, dsR:10, dsSV:13, dsC:18, oneV:17, oneR:20, oneSV:27, oneC:38, twoV:22, twoR:28, twoSV:35, twoC:51, threeR:68, threeSV:74 },
      friSat: { dsV:10, dsR:13, dsSV:16, dsC:22, oneV:20, oneR:25, oneSV:31, oneC:43, twoV:28, twoR:34, twoSV:43, twoC:58, threeR:78, threeSV:85 } },
    { sunThu: { dsV:8, dsR:12, dsSV:15, dsC:20, oneV:19, oneR:24, oneSV:31, oneC:41, twoV:25, twoR:31, twoSV:39, twoC:55, threeR:73, threeSV:79 },
      friSat: { dsV:11, dsR:14, dsSV:17, dsC:23, oneV:21, oneR:28, oneSV:34, oneC:46, twoV:31, twoR:37, twoSV:48, twoC:63, threeR:82, threeSV:89 } },
    { sunThu: { dsV:8, dsR:13, dsSV:16, dsC:21, oneV:20, oneR:26, oneSV:33, oneC:43, twoV:27, twoR:32, twoSV:42, twoC:58, threeR:78, threeSV:86 },
      friSat: { dsV:12, dsR:15, dsSV:18, dsC:24, oneV:22, oneR:29, oneSV:35, oneC:49, twoV:32, twoR:39, twoSV:50, twoC:66, threeR:88, threeSV:96 } },
    { sunThu: { dsV:9, dsR:14, dsSV:18, dsC:22, oneV:21, oneR:28, oneSV:35, oneC:44, twoV:29, twoR:36, twoSV:45, twoC:61, threeR:84, threeSV:92 },
      friSat: { dsV:12, dsR:15, dsSV:20, dsC:24, oneV:24, oneR:30, oneSV:36, oneC:51, twoV:34, twoR:41, twoSV:53, twoC:68, threeR:94, threeSV:103 } },
    { sunThu: { dsV:11, dsR:16, dsSV:19, dsC:23, oneV:23, oneR:30, oneSV:36, oneC:47, twoV:30, twoR:38, twoSV:49, twoC:63, threeR:90, threeSV:99 },
      friSat: { dsV:13, dsR:17, dsSV:21, dsC:25, oneV:26, oneR:32, oneSV:40, oneC:54, twoV:35, twoR:45, twoSV:58, twoC:73, threeR:103, threeSV:113 } },
    { sunThu: { dsV:12, dsR:16, dsSV:19, dsC:23, oneV:24, oneR:32, oneSV:38, oneC:50, twoV:31, twoR:40, twoSV:52, twoC:66, threeR:97, threeSV:107 },
      friSat: { dsV:14, dsR:18, dsSV:22, dsC:26, oneV:27, oneR:35, oneSV:41, oneC:56, twoV:36, twoR:48, twoSV:61, twoC:77, threeR:111, threeSV:121 } },
    { sunThu: { dsV:16, dsR:21, dsSV:27, dsC:33, oneV:31, oneR:38, oneSV:47, oneC:65, twoV:43, twoR:55, twoSV:70, twoC:88, threeR:117, threeSV:127 },
      friSat: { dsV:17, dsR:23, dsSV:29, dsC:36, oneV:35, oneR:45, oneSV:52, oneC:73, twoV:48, twoR:60, twoSV:76, twoC:98, threeR:135, threeSV:144 } },
  ]),
});

// === 2023 — 7 travel periods ===
const AKV_2023 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2023-09-01", end: "2023-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-05-01", end: "2023-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2023-05-15", end: "2023-06-10" }, { start: "2023-12-01", end: "2023-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2023-02-01", end: "2023-02-15" }, { start: "2023-06-11", end: "2023-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2023-10-01", end: "2023-11-21" }, { start: "2023-11-25", end: "2023-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2023-02-16", end: "2023-02-28" }, { start: "2023-03-01", end: "2023-04-01" }, { start: "2023-04-10", end: "2023-04-30" }, { start: "2023-11-22", end: "2023-11-24" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2023-04-02", end: "2023-04-09" }, { start: "2023-12-24", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "animalKingdomVillas",
  name: "Disney's Animal Kingdom Villas",
  year: 2023,
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
  travelPeriods: buildPeriods(AKV_2023, [
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
  ]),
});

// === 2024 — 7 travel periods ===
const AKV_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-05-01", end: "2024-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-05-15", end: "2024-06-10" }, { start: "2024-12-01", end: "2024-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-02-01", end: "2024-02-15" }, { start: "2024-06-11", end: "2024-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2024-10-01", end: "2024-11-26" }, { start: "2024-11-30", end: "2024-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-02-16", end: "2024-02-29" }, { start: "2024-03-01", end: "2024-03-23" }, { start: "2024-04-01", end: "2024-04-30" }, { start: "2024-11-27", end: "2024-11-29" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-03-24", end: "2024-03-31" }, { start: "2024-12-24", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "animalKingdomVillas",
  name: "Disney's Animal Kingdom Villas",
  year: 2024,
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
  travelPeriods: buildPeriods(AKV_2024, [
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
  ]),
});

// === 2025 — 7 travel periods ===
const AKV_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-05-01", end: "2025-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-05-15", end: "2025-06-10" }, { start: "2025-12-01", end: "2025-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-02-15" }, { start: "2025-06-11", end: "2025-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2025-10-01", end: "2025-11-25" }, { start: "2025-11-29", end: "2025-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-02-16", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }, { start: "2025-11-26", end: "2025-11-28" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-04-13", end: "2025-04-20" }, { start: "2025-12-24", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "animalKingdomVillas",
  name: "Disney's Animal Kingdom Villas",
  year: 2025,
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
  travelPeriods: buildPeriods(AKV_2025, [
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
  ]),
});

// === 2026 — 7 travel periods ===
const AKV_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-12-24", end: "2026-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(AKV_2026, [
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
  ]),
});

// === 2027 — 7 travel periods ===
const AKV_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
  id: "animalKingdomVillas",
  name: "Disney's Animal Kingdom Villas",
  year: 2027,
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
  travelPeriods: buildPeriods(AKV_2027, [
    { sunThu: { dsV:8, dsR:10, dsSV:12, dsC:20, oneV:19, oneR:20, oneSV:26, oneC:41, twoV:25, twoR:28, twoSV:35, twoC:55, threeR:68, threeSV:73 },
      friSat: { dsV:11, dsR:13, dsSV:15, dsC:24, oneV:23, oneR:25, oneSV:30, oneC:46, twoV:32, twoR:34, twoSV:43, twoC:62, threeR:78, threeSV:85 } },
    { sunThu: { dsV:9, dsR:12, dsSV:14, dsC:23, oneV:21, oneR:24, oneSV:30, oneC:43, twoV:28, twoR:31, twoSV:39, twoC:59, threeR:73, threeSV:79 },
      friSat: { dsV:12, dsR:14, dsSV:16, dsC:26, oneV:23, oneR:28, oneSV:33, oneC:48, twoV:34, twoR:37, twoSV:47, twoC:68, threeR:82, threeSV:89 } },
    { sunThu: { dsV:9, dsR:13, dsSV:15, dsC:23, oneV:23, oneR:26, oneSV:32, oneC:45, twoV:31, twoR:32, twoSV:42, twoC:63, threeR:78, threeSV:86 },
      friSat: { dsV:13, dsR:15, dsSV:17, dsC:26, oneV:24, oneR:29, oneSV:35, oneC:51, twoV:35, twoR:39, twoSV:50, twoC:70, threeR:88, threeSV:96 } },
    { sunThu: { dsV:10, dsR:14, dsSV:15, dsC:25, oneV:23, oneR:27, oneSV:33, oneC:47, twoV:32, twoR:35, twoSV:43, twoC:65, threeR:81, threeSV:89 },
      friSat: { dsV:13, dsR:15, dsSV:18, dsC:27, oneV:25, oneR:30, oneSV:35, oneC:51, twoV:36, twoR:40, twoSV:50, twoC:72, threeR:91, threeSV:100 } },
    { sunThu: { dsV:11, dsR:15, dsSV:17, dsC:26, oneV:25, oneR:29, oneSV:34, oneC:50, twoV:35, twoR:36, twoSV:47, twoC:68, threeR:88, threeSV:96 },
      friSat: { dsV:14, dsR:16, dsSV:19, dsC:29, oneV:27, oneR:32, oneSV:39, oneC:57, twoV:40, twoR:44, twoSV:57, twoC:79, threeR:100, threeSV:110 } },
    { sunThu: { dsV:13, dsR:16, dsSV:17, dsC:27, oneV:26, oneR:32, oneSV:37, oneC:54, twoV:37, twoR:40, twoSV:52, twoC:74, threeR:97, threeSV:107 },
      friSat: { dsV:16, dsR:18, dsSV:21, dsC:31, oneV:29, oneR:35, oneSV:41, oneC:61, twoV:43, twoR:48, twoSV:61, twoC:87, threeR:111, threeSV:121 } },
    { sunThu: { dsV:17, dsR:21, dsSV:26, dsC:37, oneV:34, oneR:38, oneSV:45, oneC:67, twoV:51, twoR:55, twoSV:70, twoC:99, threeR:117, threeSV:127 },
      friSat: { dsV:19, dsR:23, dsSV:29, dsC:40, oneV:39, oneR:45, oneSV:51, oneC:74, twoV:56, twoR:60, twoSV:76, twoC:109, threeR:135, threeSV:144 } },
  ]),
});

// ======================================================================
// Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i
// ======================================================================

// === 2016 — 4 travel periods ===
const AUL_2016 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2016-01-03", end: "2016-02-20" }, { start: "2016-09-04", end: "2016-10-08" }, { start: "2016-11-15", end: "2016-11-21" }, { start: "2016-11-27", end: "2016-12-22" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2016-04-03", end: "2016-04-28" }, { start: "2016-05-06", end: "2016-06-26" }, { start: "2016-10-09", end: "2016-11-14" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2016-02-21", end: "2016-03-17" }, { start: "2016-08-15", end: "2016-09-03" }, { start: "2016-11-22", end: "2016-11-26" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2016-01-01", end: "2016-01-02" }, { start: "2016-03-18", end: "2016-04-02" }, { start: "2016-04-29", end: "2016-05-05" }, { start: "2016-06-27", end: "2016-08-14" }, { start: "2016-12-23", end: "2016-12-31" }] },
];

RESORTS.push({
  id: "aulani",
  name: "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
  year: 2016,
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
  travelPeriods: buildPeriods(AUL_2016, [
    { sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:35, oneI:36, oneP:44, oneO:46, twoS:48, twoI:50, twoP:59, twoO:62, threeS:96, threeO:122 },
      friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:35, oneI:36, oneP:44, oneO:46, twoS:48, twoI:50, twoP:59, twoO:62, threeS:96, threeO:122 } },
    { sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
      friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 } },
    { sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:158 },
      friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:158 } },
    { sunThu: { hotelRoom:22, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
      friSat: { hotelRoom:22, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 } },
  ]),
});

// === 2017 — 4 travel periods ===
const AUL_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-01-08", end: "2017-02-25" }, { start: "2017-09-03", end: "2017-10-07" }, { start: "2017-11-14", end: "2017-11-20" }, { start: "2017-11-26", end: "2017-12-21" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-04-23", end: "2017-04-28" }, { start: "2017-05-06", end: "2017-06-25" }, { start: "2017-10-08", end: "2017-11-13" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-02-26", end: "2017-04-06" }, { start: "2017-08-14", end: "2017-09-02" }, { start: "2017-11-21", end: "2017-11-25" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-01-01", end: "2017-01-07" }, { start: "2017-04-07", end: "2017-04-22" }, { start: "2017-04-29", end: "2017-05-05" }, { start: "2017-06-26", end: "2017-08-13" }, { start: "2017-12-22", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "aulani",
  name: "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
  year: 2017,
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
  travelPeriods: buildPeriods(AUL_2017, [
    { sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:35, oneI:36, oneP:44, oneO:46, twoS:48, twoI:50, twoP:59, twoO:62, threeS:96, threeO:122 },
      friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:35, oneI:36, oneP:44, oneO:46, twoS:48, twoI:50, twoP:59, twoO:62, threeS:96, threeO:122 } },
    { sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
      friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 } },
    { sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:158 },
      friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:158 } },
    { sunThu: { hotelRoom:22, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
      friSat: { hotelRoom:22, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 } },
  ]),
});

// === 2018 — 4 travel periods ===
const AUL_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-01-07", end: "2018-02-24" }, { start: "2018-09-02", end: "2018-10-06" }, { start: "2018-11-13", end: "2018-11-19" }, { start: "2018-11-25", end: "2018-12-20" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-04-08", end: "2018-04-28" }, { start: "2018-05-06", end: "2018-06-24" }, { start: "2018-10-07", end: "2018-11-12" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2018-02-25", end: "2018-03-22" }, { start: "2018-08-13", end: "2018-09-01" }, { start: "2018-11-20", end: "2018-11-24" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-01-01", end: "2018-01-06" }, { start: "2018-03-23", end: "2018-04-07" }, { start: "2018-04-29", end: "2018-05-05" }, { start: "2018-06-25", end: "2018-08-12" }, { start: "2018-12-21", end: "2018-12-31" }] },
];

RESORTS.push({
  id: "aulani",
  name: "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
  year: 2018,
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
  travelPeriods: buildPeriods(AUL_2018, [
    { sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:35, oneI:36, oneP:44, oneO:46, twoS:48, twoI:50, twoP:59, twoO:62, threeS:96, threeO:122 },
      friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:35, oneI:36, oneP:44, oneO:46, twoS:48, twoI:50, twoP:59, twoO:62, threeS:96, threeO:122 } },
    { sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
      friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 } },
    { sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:158 },
      friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:158 } },
    { sunThu: { hotelRoom:22, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
      friSat: { hotelRoom:22, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 } },
  ]),
});

// === 2019 — 4 travel periods ===
const AUL_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-06", end: "2019-02-23" }, { start: "2019-09-01", end: "2019-10-12" }, { start: "2019-11-12", end: "2019-11-25" }, { start: "2019-12-01", end: "2019-12-19" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-04-28", end: "2019-04-28" }, { start: "2019-05-06", end: "2019-06-23" }, { start: "2019-10-13", end: "2019-11-11" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-24", end: "2019-04-11" }, { start: "2019-08-12", end: "2019-08-31" }, { start: "2019-11-26", end: "2019-11-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-01-01", end: "2019-01-05" }, { start: "2019-04-12", end: "2019-04-27" }, { start: "2019-04-29", end: "2019-05-05" }, { start: "2019-06-24", end: "2019-08-11" }, { start: "2019-12-20", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "aulani",
  name: "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
  year: 2019,
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
  travelPeriods: buildPeriods(AUL_2019, [
    { sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:35, oneI:36, oneP:44, oneO:46, twoS:48, twoI:50, twoP:59, twoO:62, threeS:96, threeO:122 },
      friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:35, oneI:36, oneP:44, oneO:46, twoS:48, twoI:50, twoP:59, twoO:62, threeS:96, threeO:122 } },
    { sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
      friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 } },
    { sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:158 },
      friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:158 } },
    { sunThu: { hotelRoom:22, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
      friSat: { hotelRoom:22, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 } },
  ]),
});

// === 2020 — 4 travel periods ===
const AUL_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-05", end: "2020-02-22" }, { start: "2020-09-06", end: "2020-10-10" }, { start: "2020-11-10", end: "2020-11-23" }, { start: "2020-11-29", end: "2020-12-17" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-04-19", end: "2020-04-28" }, { start: "2020-05-06", end: "2020-06-28" }, { start: "2020-10-11", end: "2020-11-09" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-23", end: "2020-04-02" }, { start: "2020-08-10", end: "2020-09-05" }, { start: "2020-11-24", end: "2020-11-28" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-01-01", end: "2020-01-04" }, { start: "2020-04-03", end: "2020-04-18" }, { start: "2020-04-29", end: "2020-05-05" }, { start: "2020-06-29", end: "2020-08-09" }, { start: "2020-12-18", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "aulani",
  name: "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
  year: 2020,
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
  travelPeriods: buildPeriods(AUL_2020, [
    { sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:35, oneI:36, oneP:44, oneO:46, twoS:48, twoI:50, twoP:59, twoO:62, threeS:96, threeO:122 },
      friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:35, oneI:36, oneP:44, oneO:46, twoS:48, twoI:50, twoP:59, twoO:62, threeS:96, threeO:122 } },
    { sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
      friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 } },
    { sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:158 },
      friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:158 } },
    { sunThu: { hotelRoom:22, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
      friSat: { hotelRoom:22, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 } },
  ]),
});

// === 2021 — 4 travel periods ===
const AUL_2021 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2021-01-03", end: "2021-02-20" }, { start: "2021-09-05", end: "2021-10-09" }, { start: "2021-11-09", end: "2021-11-22" }, { start: "2021-11-28", end: "2021-12-16" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2021-04-11", end: "2021-04-28" }, { start: "2021-05-06", end: "2021-06-27" }, { start: "2021-10-10", end: "2021-11-08" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2021-02-21", end: "2021-03-25" }, { start: "2021-08-09", end: "2021-09-04" }, { start: "2021-11-23", end: "2021-11-27" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2021-01-01", end: "2021-01-02" }, { start: "2021-03-26", end: "2021-04-10" }, { start: "2021-04-29", end: "2021-05-05" }, { start: "2021-06-28", end: "2021-08-08" }, { start: "2021-12-17", end: "2021-12-31" }] },
];

RESORTS.push({
  id: "aulani",
  name: "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
  year: 2021,
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
  travelPeriods: buildPeriods(AUL_2021, [
    { sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 },
      friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 } },
    { sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
      friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 } },
    { sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 },
      friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 } },
    { sunThu: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
      friSat: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 } },
  ]),
});

// === 2022 — 4 travel periods ===
const AUL_2022 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2022-01-02", end: "2022-02-26" }, { start: "2022-09-04", end: "2022-10-08" }, { start: "2022-11-15", end: "2022-11-21" }, { start: "2022-11-27", end: "2022-12-22" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2022-04-24", end: "2022-04-28" }, { start: "2022-05-06", end: "2022-06-26" }, { start: "2022-10-09", end: "2022-11-14" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2022-02-27", end: "2022-04-07" }, { start: "2022-08-15", end: "2022-09-03" }, { start: "2022-11-22", end: "2022-11-26" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2022-01-01", end: "2022-01-01" }, { start: "2022-04-08", end: "2022-04-23" }, { start: "2022-04-29", end: "2022-05-05" }, { start: "2022-06-27", end: "2022-08-14" }, { start: "2022-12-23", end: "2022-12-31" }] },
];

RESORTS.push({
  id: "aulani",
  name: "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
  year: 2022,
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
  travelPeriods: buildPeriods(AUL_2022, [
    { sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 },
      friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 } },
    { sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
      friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 } },
    { sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 },
      friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 } },
    { sunThu: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
      friSat: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 } },
  ]),
});

// === 2023 — 4 travel periods ===
const AUL_2023 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2023-01-06", end: "2023-02-25" }, { start: "2023-09-03", end: "2023-10-07" }, { start: "2023-11-14", end: "2023-11-20" }, { start: "2023-11-26", end: "2023-12-21" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2023-04-16", end: "2023-04-28" }, { start: "2023-05-06", end: "2023-06-25" }, { start: "2023-10-08", end: "2023-11-13" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2023-02-26", end: "2023-03-30" }, { start: "2023-08-14", end: "2023-09-02" }, { start: "2023-11-21", end: "2023-11-25" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2023-01-01", end: "2023-01-05" }, { start: "2023-03-31", end: "2023-04-15" }, { start: "2023-04-29", end: "2023-05-05" }, { start: "2023-06-26", end: "2023-08-13" }, { start: "2023-12-22", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "aulani",
  name: "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
  year: 2023,
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
  travelPeriods: buildPeriods(AUL_2023, [
    { sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 },
      friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 } },
    { sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
      friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 } },
    { sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 },
      friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 } },
    { sunThu: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
      friSat: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 } },
  ]),
});

// === 2024 — 4 travel periods ===
const AUL_2024 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2024-01-07", end: "2024-02-24" }, { start: "2024-09-01", end: "2024-10-12" }, { start: "2024-11-12", end: "2024-11-25" }, { start: "2024-12-01", end: "2024-12-19" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2024-04-07", end: "2024-04-28" }, { start: "2024-05-06", end: "2024-06-23" }, { start: "2024-10-13", end: "2024-11-11" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2024-02-25", end: "2024-03-21" }, { start: "2024-08-12", end: "2024-08-31" }, { start: "2024-11-26", end: "2024-11-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2024-01-01", end: "2024-01-06" }, { start: "2024-03-22", end: "2024-04-06" }, { start: "2024-04-29", end: "2024-05-05" }, { start: "2024-06-24", end: "2024-08-11" }, { start: "2024-12-20", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "aulani",
  name: "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
  year: 2024,
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
  travelPeriods: buildPeriods(AUL_2024, [
    { sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 },
      friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 } },
    { sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
      friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 } },
    { sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 },
      friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 } },
    { sunThu: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
      friSat: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 } },
  ]),
});

// === 2025 — 4 travel periods ===
const AUL_2025 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2025-01-05", end: "2025-02-22" }, { start: "2025-08-31", end: "2025-10-11" }, { start: "2025-11-11", end: "2025-11-24" }, { start: "2025-11-30", end: "2025-12-18" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2025-04-27", end: "2025-04-28" }, { start: "2025-05-06", end: "2025-06-29" }, { start: "2025-10-12", end: "2025-11-10" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2025-02-23", end: "2025-04-10" }, { start: "2025-08-11", end: "2025-08-30" }, { start: "2025-11-25", end: "2025-11-29" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2025-01-01", end: "2025-01-04" }, { start: "2025-04-11", end: "2025-04-26" }, { start: "2025-04-29", end: "2025-05-05" }, { start: "2025-06-30", end: "2025-08-10" }, { start: "2025-12-19", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "aulani",
  name: "Aulani, Disney Vacation Club Villas, Ko Olina, Hawai'i",
  year: 2025,
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
  travelPeriods: buildPeriods(AUL_2025, [
    { sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 },
      friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 } },
    { sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
      friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 } },
    { sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 },
      friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 } },
    { sunThu: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
      friSat: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 } },
  ]),
});

// === 2026 — 4 travel periods ===
const AUL_2026 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2026-01-04", end: "2026-02-28" }, { start: "2026-09-06", end: "2026-10-10" }, { start: "2026-11-10", end: "2026-11-23" }, { start: "2026-11-29", end: "2026-12-17" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2026-04-12", end: "2026-04-28" }, { start: "2026-05-06", end: "2026-06-28" }, { start: "2026-10-11", end: "2026-11-09" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2026-03-01", end: "2026-03-24" }, { start: "2026-04-29", end: "2026-05-05" }, { start: "2026-08-10", end: "2026-09-05" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2026-01-01", end: "2026-01-03" }, { start: "2026-03-25", end: "2026-04-11" }, { start: "2026-06-29", end: "2026-08-09" }, { start: "2026-11-24", end: "2026-11-28" }, { start: "2026-12-18", end: "2026-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(AUL_2026, [
    { sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 },
      friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 } },
    { sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
      friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 } },
    { sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 },
      friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 } },
    { sunThu: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
      friSat: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 } },
  ]),
});

// === 2027 — 4 travel periods ===
const AUL_2027 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2027-01-03", end: "2027-02-27" }, { start: "2027-09-05", end: "2027-10-09" }, { start: "2027-11-10", end: "2027-11-22" }, { start: "2027-11-28", end: "2027-12-23" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2027-04-04", end: "2027-04-28" }, { start: "2027-05-06", end: "2027-06-27" }, { start: "2027-10-10", end: "2027-11-09" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2027-02-28", end: "2027-03-18" }, { start: "2027-04-29", end: "2027-05-05" }, { start: "2027-08-09", end: "2027-09-04" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2027-01-01", end: "2027-01-02" }, { start: "2027-03-19", end: "2027-04-03" }, { start: "2027-06-28", end: "2027-08-08" }, { start: "2027-11-23", end: "2027-11-27" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(AUL_2027, [
    { sunThu: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 },
      friSat: { hotelRoom:16, dsS:17, dsI:19, dsP:23, dsO:25, oneS:34, oneI:35, oneP:44, oneO:46, twoS:47, twoI:49, twoP:59, twoO:62, threeS:95, threeO:122 } },
    { sunThu: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 },
      friSat: { hotelRoom:17, dsS:19, dsI:21, dsP:24, dsO:26, oneS:37, oneI:44, oneP:46, oneO:50, twoS:51, twoI:59, twoP:62, twoO:69, threeS:103, threeO:134 } },
    { sunThu: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 },
      friSat: { hotelRoom:18, dsS:22, dsI:25, dsP:26, dsO:29, oneS:44, oneI:46, oneP:50, oneO:58, twoS:60, twoI:62, twoP:70, twoO:79, threeS:121, threeO:157 } },
    { sunThu: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 },
      friSat: { hotelRoom:21, dsS:24, dsI:27, dsP:29, dsO:31, oneS:46, oneI:50, oneP:58, oneO:62, twoS:64, twoI:71, twoP:79, twoO:84, threeS:140, threeO:184 } },
  ]),
});

// ======================================================================
// Disney's Beach Club Villas
// ======================================================================

// === 2016 — 5 travel periods ===
const BCV_2016 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2016-01-01", end: "2016-01-31" }, { start: "2016-09-01", end: "2016-09-30" }, { start: "2016-12-01", end: "2016-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2016-10-01", end: "2016-11-22" }, { start: "2016-11-26", end: "2016-11-30" }, { start: "2016-12-15", end: "2016-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2016-02-01", end: "2016-02-15" }, { start: "2016-05-01", end: "2016-06-10" }, { start: "2016-08-16", end: "2016-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2016-02-16", end: "2016-03-19" }, { start: "2016-04-03", end: "2016-04-30" }, { start: "2016-06-11", end: "2016-08-15" }, { start: "2016-11-23", end: "2016-11-25" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2016-03-20", end: "2016-04-02" }, { start: "2016-12-24", end: "2016-12-31" }] },
];

RESORTS.push({
  id: "beachClubVillas",
  name: "Disney's Beach Club Villas",
  year: 2016,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BCV_2016, [
    { sunThu: { deluxeStudio:15, oneBedroom:27, twoBedroom:37 },
      friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:43 } },
    { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:43 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:25, oneBedroom:50, twoBedroom:65 },
      friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
  ]),
});

// === 2017 — 5 travel periods ===
const BCV_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-01-01", end: "2017-01-31" }, { start: "2017-09-01", end: "2017-09-30" }, { start: "2017-12-01", end: "2017-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-10-01", end: "2017-11-21" }, { start: "2017-11-25", end: "2017-11-30" }, { start: "2017-12-15", end: "2017-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2017-02-01", end: "2017-02-15" }, { start: "2017-05-01", end: "2017-06-10" }, { start: "2017-08-16", end: "2017-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-02-16", end: "2017-04-08" }, { start: "2017-04-23", end: "2017-04-30" }, { start: "2017-06-11", end: "2017-08-15" }, { start: "2017-11-22", end: "2017-11-24" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-04-09", end: "2017-04-22" }, { start: "2017-12-24", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "beachClubVillas",
  name: "Disney's Beach Club Villas",
  year: 2017,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BCV_2017, [
    { sunThu: { deluxeStudio:15, oneBedroom:27, twoBedroom:37 },
      friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:43 } },
    { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:43 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:25, oneBedroom:50, twoBedroom:65 },
      friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
  ]),
});

// === 2018 — 5 travel periods ===
const BCV_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-01-01", end: "2018-01-31" }, { start: "2018-09-01", end: "2018-09-30" }, { start: "2018-12-01", end: "2018-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-10-01", end: "2018-11-20" }, { start: "2018-11-24", end: "2018-11-30" }, { start: "2018-12-15", end: "2018-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2018-02-01", end: "2018-02-15" }, { start: "2018-05-01", end: "2018-06-10" }, { start: "2018-08-16", end: "2018-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2018-02-16", end: "2018-03-24" }, { start: "2018-04-08", end: "2018-04-30" }, { start: "2018-06-11", end: "2018-08-15" }, { start: "2018-11-21", end: "2018-11-23" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-03-25", end: "2018-04-07" }, { start: "2018-12-24", end: "2018-12-31" }] },
];

RESORTS.push({
  id: "beachClubVillas",
  name: "Disney's Beach Club Villas",
  year: 2018,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BCV_2018, [
    { sunThu: { deluxeStudio:15, oneBedroom:27, twoBedroom:37 },
      friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:43 } },
    { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:43 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:25, oneBedroom:50, twoBedroom:65 },
      friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
  ]),
});

// === 2019 — 5 travel periods ===
const BCV_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-01", end: "2019-01-31" }, { start: "2019-09-01", end: "2019-09-30" }, { start: "2019-12-01", end: "2019-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-10-01", end: "2019-11-26" }, { start: "2019-11-30", end: "2019-11-30" }, { start: "2019-12-15", end: "2019-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2019-02-01", end: "2019-02-15" }, { start: "2019-05-01", end: "2019-06-10" }, { start: "2019-08-16", end: "2019-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-16", end: "2019-04-13" }, { start: "2019-04-28", end: "2019-04-30" }, { start: "2019-06-11", end: "2019-08-15" }, { start: "2019-11-27", end: "2019-11-29" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-04-14", end: "2019-04-27" }, { start: "2019-12-24", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "beachClubVillas",
  name: "Disney's Beach Club Villas",
  year: 2019,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BCV_2019, [
    { sunThu: { deluxeStudio:15, oneBedroom:27, twoBedroom:37 },
      friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:43 } },
    { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:43 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:25, oneBedroom:50, twoBedroom:65 },
      friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
  ]),
});

// === 2020 — 5 travel periods ===
const BCV_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-09-01", end: "2020-09-30" }, { start: "2020-12-01", end: "2020-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-10-01", end: "2020-11-24" }, { start: "2020-11-28", end: "2020-11-30" }, { start: "2020-12-15", end: "2020-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-02-01", end: "2020-02-15" }, { start: "2020-05-01", end: "2020-06-10" }, { start: "2020-08-16", end: "2020-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-16", end: "2020-04-04" }, { start: "2020-04-19", end: "2020-04-30" }, { start: "2020-06-11", end: "2020-08-15" }, { start: "2020-11-25", end: "2020-11-27" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-04-05", end: "2020-04-18" }, { start: "2020-12-24", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "beachClubVillas",
  name: "Disney's Beach Club Villas",
  year: 2020,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BCV_2020, [
    { sunThu: { deluxeStudio:15, oneBedroom:27, twoBedroom:37 },
      friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:43 } },
    { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:43 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:25, oneBedroom:50, twoBedroom:65 },
      friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
  ]),
});

// === 2021 — 7 travel periods ===
const BCV_2021 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2021-09-01", end: "2021-09-19" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-09-20", end: "2021-09-30" }, { start: "2021-12-01", end: "2021-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2021-05-01", end: "2021-06-10" }, { start: "2021-10-01", end: "2021-11-23" }, { start: "2021-11-27", end: "2021-11-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2021-02-01", end: "2021-02-15" }, { start: "2021-08-16", end: "2021-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2021-04-11", end: "2021-04-30" }, { start: "2021-06-11", end: "2021-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2021-02-16", end: "2021-02-28" }, { start: "2021-03-01", end: "2021-03-27" }, { start: "2021-04-05", end: "2021-04-10" }, { start: "2021-11-24", end: "2021-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2021-03-28", end: "2021-04-04" }, { start: "2021-12-24", end: "2021-12-31" }] },
];

RESORTS.push({
  id: "beachClubVillas",
  name: "Disney's Beach Club Villas",
  year: 2021,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BCV_2021, [
    { sunThu: { deluxeStudio:14, oneBedroom:26, twoBedroom:36 },
      friSat: { deluxeStudio:15, oneBedroom:31, twoBedroom:43 } },
    { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:32, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:48 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49 } },
    { sunThu: { deluxeStudio:17, oneBedroom:36, twoBedroom:47 },
      friSat: { deluxeStudio:21, oneBedroom:40, twoBedroom:54 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:27, oneBedroom:51, twoBedroom:68 },
      friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
  ]),
});

// === 2022 — 7 travel periods ===
const BCV_2022 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2022-09-01", end: "2022-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-12-01", end: "2022-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2022-05-01", end: "2022-06-10" }, { start: "2022-12-15", end: "2022-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2022-02-01", end: "2022-02-15" }, { start: "2022-06-11", end: "2022-08-31" }, { start: "2022-10-01", end: "2022-11-22" }, { start: "2022-11-26", end: "2022-11-30" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2022-04-24", end: "2022-04-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2022-02-16", end: "2022-02-28" }, { start: "2022-03-01", end: "2022-04-09" }, { start: "2022-04-18", end: "2022-04-23" }, { start: "2022-11-23", end: "2022-11-25" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2022-04-10", end: "2022-04-17" }, { start: "2022-12-24", end: "2022-12-31" }] },
];

RESORTS.push({
  id: "beachClubVillas",
  name: "Disney's Beach Club Villas",
  year: 2022,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BCV_2022, [
    { sunThu: { deluxeStudio:14, oneBedroom:26, twoBedroom:36 },
      friSat: { deluxeStudio:15, oneBedroom:31, twoBedroom:43 } },
    { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:47 } },
    { sunThu: { deluxeStudio:17, oneBedroom:35, twoBedroom:45 },
      friSat: { deluxeStudio:18, oneBedroom:39, twoBedroom:48 } },
    { sunThu: { deluxeStudio:17, oneBedroom:37, twoBedroom:47 },
      friSat: { deluxeStudio:21, oneBedroom:40, twoBedroom:54 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:27, oneBedroom:51, twoBedroom:68 },
      friSat: { deluxeStudio:28, oneBedroom:57, twoBedroom:71 } },
  ]),
});

// === 2023 — 7 travel periods ===
const BCV_2023 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2023-09-01", end: "2023-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-05-01", end: "2023-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2023-05-15", end: "2023-06-10" }, { start: "2023-12-01", end: "2023-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2023-02-01", end: "2023-02-15" }, { start: "2023-06-11", end: "2023-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2023-10-01", end: "2023-11-21" }, { start: "2023-11-25", end: "2023-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2023-02-16", end: "2023-02-28" }, { start: "2023-03-01", end: "2023-04-01" }, { start: "2023-04-10", end: "2023-04-30" }, { start: "2023-11-22", end: "2023-11-24" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2023-04-02", end: "2023-04-09" }, { start: "2023-12-24", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "beachClubVillas",
  name: "Disney's Beach Club Villas",
  year: 2023,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BCV_2023, [
    { sunThu: { deluxeStudio:14, oneBedroom:26, twoBedroom:36 },
      friSat: { deluxeStudio:15, oneBedroom:31, twoBedroom:43 } },
    { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 },
      friSat: { deluxeStudio:18, oneBedroom:38, twoBedroom:47 } },
    { sunThu: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 },
      friSat: { deluxeStudio:21, oneBedroom:39, twoBedroom:52 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:27, oneBedroom:51, twoBedroom:68 },
      friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
  ]),
});

// === 2024 — 7 travel periods ===
const BCV_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-05-01", end: "2024-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-05-15", end: "2024-06-10" }, { start: "2024-12-01", end: "2024-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-02-01", end: "2024-02-15" }, { start: "2024-06-11", end: "2024-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2024-10-01", end: "2024-11-26" }, { start: "2024-11-30", end: "2024-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-02-16", end: "2024-02-29" }, { start: "2024-03-01", end: "2024-03-23" }, { start: "2024-04-01", end: "2024-04-30" }, { start: "2024-11-27", end: "2024-11-29" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-03-24", end: "2024-03-31" }, { start: "2024-12-24", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "beachClubVillas",
  name: "Disney's Beach Club Villas",
  year: 2024,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BCV_2024, [
    { sunThu: { deluxeStudio:14, oneBedroom:26, twoBedroom:36 },
      friSat: { deluxeStudio:15, oneBedroom:31, twoBedroom:43 } },
    { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 },
      friSat: { deluxeStudio:18, oneBedroom:38, twoBedroom:47 } },
    { sunThu: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 },
      friSat: { deluxeStudio:21, oneBedroom:39, twoBedroom:52 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:27, oneBedroom:51, twoBedroom:68 },
      friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
  ]),
});

// === 2025 — 7 travel periods ===
const BCV_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-05-01", end: "2025-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-05-15", end: "2025-06-10" }, { start: "2025-12-01", end: "2025-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-02-15" }, { start: "2025-06-11", end: "2025-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2025-10-01", end: "2025-11-25" }, { start: "2025-11-29", end: "2025-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-02-16", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }, { start: "2025-11-26", end: "2025-11-28" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-04-13", end: "2025-04-20" }, { start: "2025-12-24", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "beachClubVillas",
  name: "Disney's Beach Club Villas",
  year: 2025,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BCV_2025, [
    { sunThu: { deluxeStudio:14, oneBedroom:26, twoBedroom:36 },
      friSat: { deluxeStudio:15, oneBedroom:31, twoBedroom:43 } },
    { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 },
      friSat: { deluxeStudio:18, oneBedroom:38, twoBedroom:47 } },
    { sunThu: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 },
      friSat: { deluxeStudio:21, oneBedroom:39, twoBedroom:52 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:27, oneBedroom:51, twoBedroom:68 },
      friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
  ]),
});

// === 2026 — 7 travel periods ===
const BCV_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-12-24", end: "2026-12-31" }] },
];

RESORTS.push({
  id: "beachClubVillas",
  name: "Disney's Beach Club Villas",
  year: 2026,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BCV_2026, [
    { sunThu: { deluxeStudio:14, oneBedroom:26, twoBedroom:36 },
      friSat: { deluxeStudio:15, oneBedroom:31, twoBedroom:43 } },
    { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 },
      friSat: { deluxeStudio:18, oneBedroom:38, twoBedroom:47 } },
    { sunThu: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 },
      friSat: { deluxeStudio:21, oneBedroom:39, twoBedroom:52 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:27, oneBedroom:51, twoBedroom:68 },
      friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
  ]),
});

// === 2027 — 7 travel periods ===
const BCV_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
  id: "beachClubVillas",
  name: "Disney's Beach Club Villas",
  year: 2027,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BCV_2027, [
    { sunThu: { deluxeStudio:14, oneBedroom:26, twoBedroom:36 },
      friSat: { deluxeStudio:15, oneBedroom:31, twoBedroom:43 } },
    { sunThu: { deluxeStudio:15, oneBedroom:29, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:33, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 },
      friSat: { deluxeStudio:18, oneBedroom:38, twoBedroom:47 } },
    { sunThu: { deluxeStudio:17, oneBedroom:36, twoBedroom:46 },
      friSat: { deluxeStudio:21, oneBedroom:39, twoBedroom:52 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:22, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:27, oneBedroom:51, twoBedroom:68 },
      friSat: { deluxeStudio:28, oneBedroom:56, twoBedroom:71 } },
  ]),
});

// ======================================================================
// Bay Lake Tower at Disney's Contemporary Resort
// ======================================================================

// === 2016 — 5 travel periods ===
const BLT_2016 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2016-01-01", end: "2016-01-31" }, { start: "2016-09-01", end: "2016-09-30" }, { start: "2016-12-01", end: "2016-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2016-10-01", end: "2016-11-22" }, { start: "2016-11-26", end: "2016-11-30" }, { start: "2016-12-15", end: "2016-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2016-02-01", end: "2016-02-15" }, { start: "2016-05-01", end: "2016-06-10" }, { start: "2016-08-16", end: "2016-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2016-02-16", end: "2016-03-19" }, { start: "2016-04-03", end: "2016-04-30" }, { start: "2016-06-11", end: "2016-08-15" }, { start: "2016-11-23", end: "2016-11-25" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2016-03-20", end: "2016-04-02" }, { start: "2016-12-24", end: "2016-12-31" }] },
];

RESORTS.push({
  id: "bayLakeTower",
  name: "Bay Lake Tower at Disney's Contemporary Resort",
  year: 2016,
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
  travelPeriods: buildPeriods(BLT_2016, [
    { sunThu: { dsR:14, dsP:17, dsTP:19, oneR:26, oneP:31, oneTP:37, twoR:37, twoP:40, twoTP:50, threeP:84, threeTP:102 },
      friSat: { dsR:16, dsP:19, dsTP:23, oneR:32, oneP:36, oneTP:44, twoR:44, twoP:48, twoTP:59, threeP:99, threeTP:120 } },
    { sunThu: { dsR:15, dsP:18, dsTP:21, oneR:28, oneP:33, oneTP:39, twoR:39, twoP:43, twoTP:53, threeP:88, threeTP:106 },
      friSat: { dsR:17, dsP:19, dsTP:23, oneR:35, oneP:38, oneTP:46, twoR:45, twoP:50, twoTP:61, threeP:104, threeTP:125 } },
    { sunThu: { dsR:17, dsP:19, dsTP:24, oneR:34, oneP:37, oneTP:47, twoR:43, twoP:48, twoTP:58, threeP:101, threeTP:122 },
      friSat: { dsR:19, dsP:23, dsTP:27, oneR:40, oneP:45, oneTP:53, twoR:51, twoP:58, twoTP:70, threeP:119, threeTP:144 } },
    { sunThu: { dsR:19, dsP:21, dsTP:25, oneR:36, oneP:41, oneTP:49, twoR:48, twoP:52, twoTP:64, threeP:120, threeTP:145 },
      friSat: { dsR:22, dsP:24, dsTP:29, oneR:44, oneP:48, oneTP:59, twoR:57, twoP:63, twoTP:76, threeP:141, threeTP:170 } },
    { sunThu: { dsR:25, dsP:27, dsTP:33, oneR:47, oneP:52, oneTP:63, twoR:64, twoP:70, twoTP:86, threeP:145, threeTP:175 },
      friSat: { dsR:29, dsP:32, dsTP:38, oneR:56, oneP:62, oneTP:75, twoR:77, twoP:84, twoTP:98, threeP:170, threeTP:206 } },
  ]),
});

// === 2017 — 5 travel periods ===
const BLT_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-01-01", end: "2017-01-31" }, { start: "2017-09-01", end: "2017-09-30" }, { start: "2017-12-01", end: "2017-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-10-01", end: "2017-11-21" }, { start: "2017-11-25", end: "2017-11-30" }, { start: "2017-12-15", end: "2017-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2017-02-01", end: "2017-02-15" }, { start: "2017-05-01", end: "2017-06-10" }, { start: "2017-08-16", end: "2017-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-02-16", end: "2017-04-08" }, { start: "2017-04-23", end: "2017-04-30" }, { start: "2017-06-11", end: "2017-08-15" }, { start: "2017-11-22", end: "2017-11-24" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-04-09", end: "2017-04-22" }, { start: "2017-12-24", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "bayLakeTower",
  name: "Bay Lake Tower at Disney's Contemporary Resort",
  year: 2017,
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
  travelPeriods: buildPeriods(BLT_2017, [
    { sunThu: { dsR:14, dsP:17, dsTP:19, oneR:26, oneP:31, oneTP:37, twoR:37, twoP:40, twoTP:50, threeP:84, threeTP:102 },
      friSat: { dsR:16, dsP:19, dsTP:23, oneR:32, oneP:36, oneTP:44, twoR:44, twoP:48, twoTP:59, threeP:99, threeTP:120 } },
    { sunThu: { dsR:15, dsP:18, dsTP:21, oneR:28, oneP:33, oneTP:39, twoR:39, twoP:43, twoTP:53, threeP:88, threeTP:106 },
      friSat: { dsR:17, dsP:19, dsTP:23, oneR:35, oneP:38, oneTP:46, twoR:45, twoP:50, twoTP:61, threeP:104, threeTP:125 } },
    { sunThu: { dsR:17, dsP:19, dsTP:24, oneR:34, oneP:37, oneTP:47, twoR:43, twoP:48, twoTP:58, threeP:101, threeTP:122 },
      friSat: { dsR:19, dsP:23, dsTP:27, oneR:40, oneP:45, oneTP:53, twoR:51, twoP:58, twoTP:70, threeP:119, threeTP:144 } },
    { sunThu: { dsR:19, dsP:21, dsTP:25, oneR:36, oneP:41, oneTP:49, twoR:48, twoP:52, twoTP:64, threeP:120, threeTP:145 },
      friSat: { dsR:22, dsP:24, dsTP:29, oneR:44, oneP:48, oneTP:59, twoR:57, twoP:63, twoTP:76, threeP:141, threeTP:170 } },
    { sunThu: { dsR:25, dsP:27, dsTP:33, oneR:47, oneP:52, oneTP:63, twoR:64, twoP:70, twoTP:86, threeP:145, threeTP:175 },
      friSat: { dsR:29, dsP:32, dsTP:38, oneR:56, oneP:62, oneTP:75, twoR:77, twoP:84, twoTP:98, threeP:170, threeTP:206 } },
  ]),
});

// === 2018 — 5 travel periods ===
const BLT_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-01-01", end: "2018-01-31" }, { start: "2018-09-01", end: "2018-09-30" }, { start: "2018-12-01", end: "2018-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-10-01", end: "2018-11-20" }, { start: "2018-11-24", end: "2018-11-30" }, { start: "2018-12-15", end: "2018-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2018-02-01", end: "2018-02-15" }, { start: "2018-05-01", end: "2018-06-10" }, { start: "2018-08-16", end: "2018-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2018-02-16", end: "2018-03-24" }, { start: "2018-04-08", end: "2018-04-30" }, { start: "2018-06-11", end: "2018-08-15" }, { start: "2018-11-21", end: "2018-11-23" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-03-25", end: "2018-04-07" }, { start: "2018-12-24", end: "2018-12-31" }] },
];

RESORTS.push({
  id: "bayLakeTower",
  name: "Bay Lake Tower at Disney's Contemporary Resort",
  year: 2018,
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
  travelPeriods: buildPeriods(BLT_2018, [
    { sunThu: { dsR:14, dsP:17, dsTP:19, oneR:26, oneP:31, oneTP:37, twoR:37, twoP:40, twoTP:50, threeP:84, threeTP:102 },
      friSat: { dsR:16, dsP:19, dsTP:23, oneR:32, oneP:36, oneTP:44, twoR:44, twoP:48, twoTP:59, threeP:99, threeTP:120 } },
    { sunThu: { dsR:15, dsP:18, dsTP:21, oneR:28, oneP:33, oneTP:39, twoR:39, twoP:43, twoTP:53, threeP:88, threeTP:106 },
      friSat: { dsR:17, dsP:19, dsTP:23, oneR:35, oneP:38, oneTP:46, twoR:45, twoP:50, twoTP:61, threeP:104, threeTP:125 } },
    { sunThu: { dsR:17, dsP:19, dsTP:24, oneR:34, oneP:37, oneTP:47, twoR:43, twoP:48, twoTP:58, threeP:101, threeTP:122 },
      friSat: { dsR:19, dsP:23, dsTP:27, oneR:40, oneP:45, oneTP:53, twoR:51, twoP:58, twoTP:70, threeP:119, threeTP:144 } },
    { sunThu: { dsR:19, dsP:21, dsTP:25, oneR:36, oneP:41, oneTP:49, twoR:48, twoP:52, twoTP:64, threeP:120, threeTP:145 },
      friSat: { dsR:22, dsP:24, dsTP:29, oneR:44, oneP:48, oneTP:59, twoR:57, twoP:63, twoTP:76, threeP:141, threeTP:170 } },
    { sunThu: { dsR:25, dsP:27, dsTP:33, oneR:47, oneP:52, oneTP:63, twoR:64, twoP:70, twoTP:86, threeP:145, threeTP:175 },
      friSat: { dsR:29, dsP:32, dsTP:38, oneR:56, oneP:62, oneTP:75, twoR:77, twoP:84, twoTP:98, threeP:170, threeTP:206 } },
  ]),
});

// === 2019 — 5 travel periods ===
const BLT_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-01", end: "2019-01-31" }, { start: "2019-09-01", end: "2019-09-30" }, { start: "2019-12-01", end: "2019-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-10-01", end: "2019-11-26" }, { start: "2019-11-30", end: "2019-11-30" }, { start: "2019-12-15", end: "2019-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2019-02-01", end: "2019-02-15" }, { start: "2019-05-01", end: "2019-06-10" }, { start: "2019-08-16", end: "2019-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-16", end: "2019-04-13" }, { start: "2019-04-28", end: "2019-04-30" }, { start: "2019-06-11", end: "2019-08-15" }, { start: "2019-11-27", end: "2019-11-29" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-04-14", end: "2019-04-27" }, { start: "2019-12-24", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "bayLakeTower",
  name: "Bay Lake Tower at Disney's Contemporary Resort",
  year: 2019,
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
  travelPeriods: buildPeriods(BLT_2019, [
    { sunThu: { dsR:14, dsP:17, dsTP:19, oneR:26, oneP:31, oneTP:37, twoR:37, twoP:40, twoTP:50, threeP:84, threeTP:102 },
      friSat: { dsR:16, dsP:19, dsTP:23, oneR:32, oneP:36, oneTP:44, twoR:44, twoP:48, twoTP:59, threeP:99, threeTP:120 } },
    { sunThu: { dsR:15, dsP:18, dsTP:21, oneR:28, oneP:33, oneTP:39, twoR:39, twoP:43, twoTP:53, threeP:88, threeTP:106 },
      friSat: { dsR:17, dsP:19, dsTP:23, oneR:35, oneP:38, oneTP:46, twoR:45, twoP:50, twoTP:61, threeP:104, threeTP:125 } },
    { sunThu: { dsR:17, dsP:19, dsTP:24, oneR:34, oneP:37, oneTP:47, twoR:43, twoP:48, twoTP:58, threeP:101, threeTP:122 },
      friSat: { dsR:19, dsP:23, dsTP:27, oneR:40, oneP:45, oneTP:53, twoR:51, twoP:58, twoTP:70, threeP:119, threeTP:144 } },
    { sunThu: { dsR:19, dsP:21, dsTP:25, oneR:36, oneP:41, oneTP:49, twoR:48, twoP:52, twoTP:64, threeP:120, threeTP:145 },
      friSat: { dsR:22, dsP:24, dsTP:29, oneR:44, oneP:48, oneTP:59, twoR:57, twoP:63, twoTP:76, threeP:141, threeTP:170 } },
    { sunThu: { dsR:25, dsP:27, dsTP:33, oneR:47, oneP:52, oneTP:63, twoR:64, twoP:70, twoTP:86, threeP:145, threeTP:175 },
      friSat: { dsR:29, dsP:32, dsTP:38, oneR:56, oneP:62, oneTP:75, twoR:77, twoP:84, twoTP:98, threeP:170, threeTP:206 } },
  ]),
});

// === 2020 — 5 travel periods ===
const BLT_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-09-01", end: "2020-09-30" }, { start: "2020-12-01", end: "2020-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-10-01", end: "2020-11-24" }, { start: "2020-11-28", end: "2020-11-30" }, { start: "2020-12-15", end: "2020-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-02-01", end: "2020-02-15" }, { start: "2020-05-01", end: "2020-06-10" }, { start: "2020-08-16", end: "2020-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-16", end: "2020-04-04" }, { start: "2020-04-19", end: "2020-04-30" }, { start: "2020-06-11", end: "2020-08-15" }, { start: "2020-11-25", end: "2020-11-27" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-04-05", end: "2020-04-18" }, { start: "2020-12-24", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "bayLakeTower",
  name: "Bay Lake Tower at Disney's Contemporary Resort",
  year: 2020,
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
  travelPeriods: buildPeriods(BLT_2020, [
    { sunThu: { dsR:14, dsP:17, dsTP:19, oneR:26, oneP:31, oneTP:37, twoR:37, twoP:40, twoTP:50, threeP:84, threeTP:102 },
      friSat: { dsR:16, dsP:19, dsTP:23, oneR:32, oneP:36, oneTP:44, twoR:44, twoP:48, twoTP:59, threeP:99, threeTP:120 } },
    { sunThu: { dsR:15, dsP:18, dsTP:21, oneR:28, oneP:33, oneTP:39, twoR:39, twoP:43, twoTP:53, threeP:88, threeTP:106 },
      friSat: { dsR:17, dsP:19, dsTP:23, oneR:35, oneP:38, oneTP:46, twoR:45, twoP:50, twoTP:61, threeP:104, threeTP:125 } },
    { sunThu: { dsR:17, dsP:19, dsTP:24, oneR:34, oneP:37, oneTP:47, twoR:43, twoP:48, twoTP:58, threeP:101, threeTP:122 },
      friSat: { dsR:19, dsP:23, dsTP:27, oneR:40, oneP:45, oneTP:53, twoR:51, twoP:58, twoTP:70, threeP:119, threeTP:144 } },
    { sunThu: { dsR:19, dsP:21, dsTP:25, oneR:36, oneP:41, oneTP:49, twoR:48, twoP:52, twoTP:64, threeP:120, threeTP:145 },
      friSat: { dsR:22, dsP:24, dsTP:29, oneR:44, oneP:48, oneTP:59, twoR:57, twoP:63, twoTP:76, threeP:141, threeTP:170 } },
    { sunThu: { dsR:25, dsP:27, dsTP:33, oneR:47, oneP:52, oneTP:63, twoR:64, twoP:70, twoTP:86, threeP:145, threeTP:175 },
      friSat: { dsR:29, dsP:32, dsTP:38, oneR:56, oneP:62, oneTP:75, twoR:77, twoP:84, twoTP:98, threeP:170, threeTP:206 } },
  ]),
});

// === 2021 — 7 travel periods ===
const BLT_2021 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2021-09-01", end: "2021-09-19" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-09-20", end: "2021-09-30" }, { start: "2021-12-01", end: "2021-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2021-05-01", end: "2021-06-10" }, { start: "2021-10-01", end: "2021-11-23" }, { start: "2021-11-27", end: "2021-11-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2021-02-01", end: "2021-02-15" }, { start: "2021-08-16", end: "2021-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2021-04-11", end: "2021-04-30" }, { start: "2021-06-11", end: "2021-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2021-02-16", end: "2021-02-28" }, { start: "2021-03-01", end: "2021-03-27" }, { start: "2021-04-05", end: "2021-04-10" }, { start: "2021-11-24", end: "2021-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2021-03-28", end: "2021-04-04" }, { start: "2021-12-24", end: "2021-12-31" }] },
];

RESORTS.push({
  id: "bayLakeTower",
  name: "Bay Lake Tower at Disney's Contemporary Resort",
  year: 2021,
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
  travelPeriods: buildPeriods(BLT_2021, [
    { sunThu: { dsR:13, dsP:16, dsTP:18, oneR:25, oneP:30, oneTP:36, twoR:36, twoP:39, twoTP:49, threeP:83, threeTP:101 },
      friSat: { dsR:16, dsP:19, dsTP:23, oneR:32, oneP:36, oneTP:44, twoR:44, twoP:48, twoTP:59, threeP:99, threeTP:120 } },
    { sunThu: { dsR:15, dsP:18, dsTP:20, oneR:28, oneP:33, oneTP:39, twoR:39, twoP:43, twoTP:53, threeP:88, threeTP:106 },
      friSat: { dsR:17, dsP:19, dsTP:23, oneR:35, oneP:38, oneTP:46, twoR:45, twoP:50, twoTP:61, threeP:104, threeTP:125 } },
    { sunThu: { dsR:16, dsP:19, dsTP:23, oneR:30, oneP:35, oneTP:42, twoR:42, twoP:46, twoTP:57, threeP:97, threeTP:115 },
      friSat: { dsR:18, dsP:20, dsTP:25, oneR:38, oneP:42, oneTP:50, twoR:48, twoP:54, twoTP:66, threeP:112, threeTP:135 } },
    { sunThu: { dsR:17, dsP:19, dsTP:24, oneR:34, oneP:37, oneTP:47, twoR:43, twoP:48, twoTP:58, threeP:101, threeTP:122 },
      friSat: { dsR:19, dsP:23, dsTP:27, oneR:40, oneP:45, oneTP:53, twoR:51, twoP:58, twoTP:70, threeP:119, threeTP:144 } },
    { sunThu: { dsR:18, dsP:20, dsTP:25, oneR:35, oneP:39, oneTP:48, twoR:47, twoP:51, twoTP:62, threeP:112, threeTP:135 },
      friSat: { dsR:21, dsP:24, dsTP:28, oneR:42, oneP:47, oneTP:56, twoR:54, twoP:62, twoTP:73, threeP:130, threeTP:157 } },
    { sunThu: { dsR:20, dsP:21, dsTP:26, oneR:36, oneP:42, oneTP:49, twoR:49, twoP:53, twoTP:65, threeP:120, threeTP:145 },
      friSat: { dsR:22, dsP:24, dsTP:29, oneR:44, oneP:48, oneTP:59, twoR:57, twoP:63, twoTP:76, threeP:141, threeTP:170 } },
    { sunThu: { dsR:26, dsP:28, dsTP:34, oneR:48, oneP:53, oneTP:64, twoR:66, twoP:72, twoTP:88, threeP:146, threeTP:176 },
      friSat: { dsR:29, dsP:32, dsTP:38, oneR:56, oneP:62, oneTP:75, twoR:77, twoP:84, twoTP:98, threeP:171, threeTP:207 } },
  ]),
});

// === 2022 — 7 travel periods ===
const BLT_2022 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2022-09-01", end: "2022-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-12-01", end: "2022-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2022-05-01", end: "2022-06-10" }, { start: "2022-12-15", end: "2022-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2022-02-01", end: "2022-02-15" }, { start: "2022-06-11", end: "2022-08-31" }, { start: "2022-10-01", end: "2022-11-22" }, { start: "2022-11-26", end: "2022-11-30" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2022-04-24", end: "2022-04-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2022-02-16", end: "2022-02-28" }, { start: "2022-03-01", end: "2022-04-09" }, { start: "2022-04-18", end: "2022-04-23" }, { start: "2022-11-23", end: "2022-11-25" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2022-04-10", end: "2022-04-17" }, { start: "2022-12-24", end: "2022-12-31" }] },
];

RESORTS.push({
  id: "bayLakeTower",
  name: "Bay Lake Tower at Disney's Contemporary Resort",
  year: 2022,
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
  travelPeriods: buildPeriods(BLT_2022, [
    { sunThu: { dsR:13, dsP:16, dsTP:18, oneR:24, oneP:29, oneTP:35, twoR:35, twoP:38, twoTP:48, threeP:82, threeTP:101 },
      friSat: { dsR:16, dsP:19, dsTP:23, oneR:32, oneP:36, oneTP:44, twoR:42, twoP:47, twoTP:59, threeP:98, threeTP:120 } },
    { sunThu: { dsR:15, dsP:18, dsTP:20, oneR:28, oneP:33, oneTP:39, twoR:40, twoP:43, twoTP:54, threeP:88, threeTP:106 },
      friSat: { dsR:17, dsP:19, dsTP:23, oneR:35, oneP:38, oneTP:46, twoR:45, twoP:50, twoTP:61, threeP:104, threeTP:125 } },
    { sunThu: { dsR:16, dsP:19, dsTP:21, oneR:30, oneP:35, oneTP:42, twoR:42, twoP:46, twoTP:58, threeP:96, threeTP:115 },
      friSat: { dsR:18, dsP:20, dsTP:25, oneR:38, oneP:41, oneTP:50, twoR:48, twoP:54, twoTP:66, threeP:112, threeTP:135 } },
    { sunThu: { dsR:17, dsP:19, dsTP:24, oneR:32, oneP:37, oneTP:45, twoR:44, twoP:48, twoTP:59, threeP:103, threeTP:123 },
      friSat: { dsR:19, dsP:21, dsTP:27, oneR:40, oneP:45, oneTP:53, twoR:51, twoP:59, twoTP:69, threeP:119, threeTP:144 } },
    { sunThu: { dsR:18, dsP:20, dsTP:25, oneR:35, oneP:39, oneTP:48, twoR:47, twoP:51, twoTP:62, threeP:112, threeTP:135 },
      friSat: { dsR:21, dsP:24, dsTP:28, oneR:42, oneP:47, oneTP:56, twoR:54, twoP:62, twoTP:73, threeP:130, threeTP:157 } },
    { sunThu: { dsR:19, dsP:21, dsTP:26, oneR:36, oneP:42, oneTP:49, twoR:50, twoP:54, twoTP:65, threeP:121, threeTP:145 },
      friSat: { dsR:22, dsP:24, dsTP:29, oneR:44, oneP:48, oneTP:59, twoR:57, twoP:63, twoTP:76, threeP:141, threeTP:170 } },
    { sunThu: { dsR:26, dsP:28, dsTP:34, oneR:48, oneP:53, oneTP:64, twoR:66, twoP:72, twoTP:88, threeP:146, threeTP:176 },
      friSat: { dsR:29, dsP:32, dsTP:38, oneR:56, oneP:62, oneTP:75, twoR:77, twoP:84, twoTP:98, threeP:171, threeTP:207 } },
  ]),
});

// === 2023 — 7 travel periods ===
const BLT_2023 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2023-09-01", end: "2023-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-05-01", end: "2023-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2023-05-15", end: "2023-06-10" }, { start: "2023-12-01", end: "2023-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2023-02-01", end: "2023-02-15" }, { start: "2023-06-11", end: "2023-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2023-10-01", end: "2023-11-21" }, { start: "2023-11-25", end: "2023-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2023-02-16", end: "2023-02-28" }, { start: "2023-03-01", end: "2023-04-01" }, { start: "2023-04-10", end: "2023-04-30" }, { start: "2023-11-22", end: "2023-11-24" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2023-04-02", end: "2023-04-09" }, { start: "2023-12-24", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "bayLakeTower",
  name: "Bay Lake Tower at Disney's Contemporary Resort",
  year: 2023,
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
  travelPeriods: buildPeriods(BLT_2023, [
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
});

// === 2024 — 7 travel periods ===
const BLT_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-05-01", end: "2024-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-05-15", end: "2024-06-10" }, { start: "2024-12-01", end: "2024-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-02-01", end: "2024-02-15" }, { start: "2024-06-11", end: "2024-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2024-10-01", end: "2024-11-26" }, { start: "2024-11-30", end: "2024-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-02-16", end: "2024-02-29" }, { start: "2024-03-01", end: "2024-03-23" }, { start: "2024-04-01", end: "2024-04-30" }, { start: "2024-11-27", end: "2024-11-29" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-03-24", end: "2024-03-31" }, { start: "2024-12-24", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "bayLakeTower",
  name: "Bay Lake Tower at Disney's Contemporary Resort",
  year: 2024,
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
  travelPeriods: buildPeriods(BLT_2024, [
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
});

// === 2025 — 7 travel periods ===
const BLT_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-05-01", end: "2025-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-05-15", end: "2025-06-10" }, { start: "2025-12-01", end: "2025-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-02-15" }, { start: "2025-06-11", end: "2025-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2025-10-01", end: "2025-11-25" }, { start: "2025-11-29", end: "2025-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-02-16", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }, { start: "2025-11-26", end: "2025-11-28" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-04-13", end: "2025-04-20" }, { start: "2025-12-24", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "bayLakeTower",
  name: "Bay Lake Tower at Disney's Contemporary Resort",
  year: 2025,
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
  travelPeriods: buildPeriods(BLT_2025, [
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
});

// === 2026 — 7 travel periods ===
const BLT_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-12-24", end: "2026-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(BLT_2026, [
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
});

// === 2027 — 7 travel periods ===
const BLT_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(BLT_2027, [
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
});

// ======================================================================
// Boulder Ridge Villas at Disney's Wilderness Lodge
// ======================================================================

// === 2016 — 5 travel periods ===
const BRV_2016 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2016-01-01", end: "2016-01-31" }, { start: "2016-09-01", end: "2016-09-30" }, { start: "2016-12-01", end: "2016-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2016-10-01", end: "2016-11-22" }, { start: "2016-11-26", end: "2016-11-30" }, { start: "2016-12-15", end: "2016-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2016-02-01", end: "2016-02-15" }, { start: "2016-05-01", end: "2016-06-10" }, { start: "2016-08-16", end: "2016-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2016-02-16", end: "2016-03-19" }, { start: "2016-04-03", end: "2016-04-30" }, { start: "2016-06-11", end: "2016-08-15" }, { start: "2016-11-23", end: "2016-11-25" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2016-03-20", end: "2016-04-02" }, { start: "2016-12-24", end: "2016-12-31" }] },
];

RESORTS.push({
  id: "boulderRidge",
  name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
  year: 2016,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BRV_2016, [
    { sunThu: { deluxeStudio:15, oneBedroom:28, twoBedroom:37 },
      friSat: { deluxeStudio:16, oneBedroom:32, twoBedroom:42 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49 } },
    { sunThu: { deluxeStudio:17, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:21, oneBedroom:43, twoBedroom:55 } },
    { sunThu: { deluxeStudio:24, oneBedroom:47, twoBedroom:63 },
      friSat: { deluxeStudio:28, oneBedroom:53, twoBedroom:71 } },
  ]),
});

// === 2017 — 5 travel periods ===
const BRV_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-01-01", end: "2017-01-31" }, { start: "2017-09-01", end: "2017-09-30" }, { start: "2017-12-01", end: "2017-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-10-01", end: "2017-11-21" }, { start: "2017-11-25", end: "2017-11-30" }, { start: "2017-12-15", end: "2017-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2017-02-01", end: "2017-02-15" }, { start: "2017-05-01", end: "2017-06-10" }, { start: "2017-08-16", end: "2017-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-02-16", end: "2017-04-08" }, { start: "2017-04-23", end: "2017-04-30" }, { start: "2017-06-11", end: "2017-08-15" }, { start: "2017-11-22", end: "2017-11-24" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-04-09", end: "2017-04-22" }, { start: "2017-12-24", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "boulderRidge",
  name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
  year: 2017,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BRV_2017, [
    { sunThu: { deluxeStudio:15, oneBedroom:28, twoBedroom:37 },
      friSat: { deluxeStudio:16, oneBedroom:32, twoBedroom:42 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49 } },
    { sunThu: { deluxeStudio:17, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:21, oneBedroom:43, twoBedroom:55 } },
    { sunThu: { deluxeStudio:24, oneBedroom:47, twoBedroom:63 },
      friSat: { deluxeStudio:28, oneBedroom:53, twoBedroom:71 } },
  ]),
});

// === 2018 — 5 travel periods ===
const BRV_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-01-01", end: "2018-01-31" }, { start: "2018-09-01", end: "2018-09-30" }, { start: "2018-12-01", end: "2018-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-10-01", end: "2018-11-20" }, { start: "2018-11-24", end: "2018-11-30" }, { start: "2018-12-15", end: "2018-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2018-02-01", end: "2018-02-15" }, { start: "2018-05-01", end: "2018-06-10" }, { start: "2018-08-16", end: "2018-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2018-02-16", end: "2018-03-24" }, { start: "2018-04-08", end: "2018-04-30" }, { start: "2018-06-11", end: "2018-08-15" }, { start: "2018-11-21", end: "2018-11-23" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-03-25", end: "2018-04-07" }, { start: "2018-12-24", end: "2018-12-31" }] },
];

RESORTS.push({
  id: "boulderRidge",
  name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
  year: 2018,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BRV_2018, [
    { sunThu: { deluxeStudio:15, oneBedroom:28, twoBedroom:37 },
      friSat: { deluxeStudio:16, oneBedroom:32, twoBedroom:42 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49 } },
    { sunThu: { deluxeStudio:17, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:21, oneBedroom:43, twoBedroom:55 } },
    { sunThu: { deluxeStudio:24, oneBedroom:47, twoBedroom:63 },
      friSat: { deluxeStudio:28, oneBedroom:53, twoBedroom:71 } },
  ]),
});

// === 2019 — 5 travel periods ===
const BRV_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-01", end: "2019-01-31" }, { start: "2019-09-01", end: "2019-09-30" }, { start: "2019-12-01", end: "2019-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-10-01", end: "2019-11-26" }, { start: "2019-11-30", end: "2019-11-30" }, { start: "2019-12-15", end: "2019-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2019-02-01", end: "2019-02-15" }, { start: "2019-05-01", end: "2019-06-10" }, { start: "2019-08-16", end: "2019-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-16", end: "2019-04-13" }, { start: "2019-04-28", end: "2019-04-30" }, { start: "2019-06-11", end: "2019-08-15" }, { start: "2019-11-27", end: "2019-11-29" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-04-14", end: "2019-04-27" }, { start: "2019-12-24", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "boulderRidge",
  name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
  year: 2019,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BRV_2019, [
    { sunThu: { deluxeStudio:15, oneBedroom:28, twoBedroom:37 },
      friSat: { deluxeStudio:16, oneBedroom:32, twoBedroom:42 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49 } },
    { sunThu: { deluxeStudio:17, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:21, oneBedroom:43, twoBedroom:55 } },
    { sunThu: { deluxeStudio:24, oneBedroom:47, twoBedroom:63 },
      friSat: { deluxeStudio:28, oneBedroom:53, twoBedroom:71 } },
  ]),
});

// === 2020 — 5 travel periods ===
const BRV_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-09-01", end: "2020-09-30" }, { start: "2020-12-01", end: "2020-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-10-01", end: "2020-11-24" }, { start: "2020-11-28", end: "2020-11-30" }, { start: "2020-12-15", end: "2020-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-02-01", end: "2020-02-15" }, { start: "2020-05-01", end: "2020-06-10" }, { start: "2020-08-16", end: "2020-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-16", end: "2020-04-04" }, { start: "2020-04-19", end: "2020-04-30" }, { start: "2020-06-11", end: "2020-08-15" }, { start: "2020-11-25", end: "2020-11-27" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-04-05", end: "2020-04-18" }, { start: "2020-12-24", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "boulderRidge",
  name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
  year: 2020,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BRV_2020, [
    { sunThu: { deluxeStudio:15, oneBedroom:28, twoBedroom:37 },
      friSat: { deluxeStudio:16, oneBedroom:32, twoBedroom:42 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49 } },
    { sunThu: { deluxeStudio:17, oneBedroom:37, twoBedroom:48 },
      friSat: { deluxeStudio:21, oneBedroom:43, twoBedroom:55 } },
    { sunThu: { deluxeStudio:24, oneBedroom:47, twoBedroom:63 },
      friSat: { deluxeStudio:28, oneBedroom:53, twoBedroom:71 } },
  ]),
});

// === 2021 — 7 travel periods ===
const BRV_2021 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2021-09-01", end: "2021-09-19" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-09-20", end: "2021-09-30" }, { start: "2021-12-01", end: "2021-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2021-05-01", end: "2021-06-10" }, { start: "2021-10-01", end: "2021-11-23" }, { start: "2021-11-27", end: "2021-11-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2021-02-01", end: "2021-02-15" }, { start: "2021-08-16", end: "2021-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2021-04-11", end: "2021-04-30" }, { start: "2021-06-11", end: "2021-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2021-02-16", end: "2021-02-28" }, { start: "2021-03-01", end: "2021-03-27" }, { start: "2021-04-05", end: "2021-04-10" }, { start: "2021-11-24", end: "2021-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2021-03-28", end: "2021-04-04" }, { start: "2021-12-24", end: "2021-12-31" }] },
];

RESORTS.push({
  id: "boulderRidge",
  name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
  year: 2021,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BRV_2021, [
    { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:36 },
      friSat: { deluxeStudio:16, oneBedroom:32, twoBedroom:42 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:32, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:37, twoBedroom:48 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:50 } },
    { sunThu: { deluxeStudio:18, oneBedroom:36, twoBedroom:47 },
      friSat: { deluxeStudio:20, oneBedroom:42, twoBedroom:53 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:49 },
      friSat: { deluxeStudio:21, oneBedroom:42, twoBedroom:55 } },
    { sunThu: { deluxeStudio:26, oneBedroom:47, twoBedroom:64 },
      friSat: { deluxeStudio:28, oneBedroom:54, twoBedroom:72 } },
  ]),
});

// === 2022 — 7 travel periods ===
const BRV_2022 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2022-09-01", end: "2022-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-12-01", end: "2022-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2022-05-01", end: "2022-06-10" }, { start: "2022-12-15", end: "2022-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2022-02-01", end: "2022-02-15" }, { start: "2022-06-11", end: "2022-08-31" }, { start: "2022-10-01", end: "2022-11-22" }, { start: "2022-11-26", end: "2022-11-30" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2022-04-24", end: "2022-04-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2022-02-16", end: "2022-02-28" }, { start: "2022-03-01", end: "2022-04-09" }, { start: "2022-04-18", end: "2022-04-23" }, { start: "2022-11-23", end: "2022-11-25" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2022-04-10", end: "2022-04-17" }, { start: "2022-12-24", end: "2022-12-31" }] },
];

RESORTS.push({
  id: "boulderRidge",
  name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
  year: 2022,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BRV_2022, [
    { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:36 },
      friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:32, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:47 } },
    { sunThu: { deluxeStudio:17, oneBedroom:34, twoBedroom:45 },
      friSat: { deluxeStudio:18, oneBedroom:40, twoBedroom:49 } },
    { sunThu: { deluxeStudio:18, oneBedroom:36, twoBedroom:47 },
      friSat: { deluxeStudio:20, oneBedroom:41, twoBedroom:53 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:49 },
      friSat: { deluxeStudio:21, oneBedroom:42, twoBedroom:54 } },
    { sunThu: { deluxeStudio:26, oneBedroom:47, twoBedroom:64 },
      friSat: { deluxeStudio:28, oneBedroom:54, twoBedroom:72 } },
  ]),
});

// === 2023 — 6 travel periods ===
const BRV_2023 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2023-09-01", end: "2023-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-05-01", end: "2023-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2023-05-15", end: "2023-06-10" }, { start: "2023-12-01", end: "2023-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2023-02-01", end: "2023-02-15" }, { start: "2023-06-11", end: "2023-08-31" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2023-10-01", end: "2023-11-21" }, { start: "2023-11-25", end: "2023-11-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2023-02-16", end: "2023-02-28" }, { start: "2023-03-01", end: "2023-04-01" }, { start: "2023-04-10", end: "2023-04-30" }, { start: "2023-11-22", end: "2023-11-24" }] },
];

RESORTS.push({
  id: "boulderRidge",
  name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
  year: 2023,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BRV_2023, [
    { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:36 },
      friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:32, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:47 } },
    { sunThu: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 },
      friSat: { deluxeStudio:18, oneBedroom:39, twoBedroom:48 } },
    { sunThu: { deluxeStudio:17, oneBedroom:35, twoBedroom:46 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:51 } },
    { sunThu: { deluxeStudio:19, oneBedroom:37, twoBedroom:49 },
      friSat: { deluxeStudio:21, oneBedroom:42, twoBedroom:54 } },
  ]),
});

// === 2024 — 6 travel periods ===
const BRV_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-05-01", end: "2024-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-05-15", end: "2024-06-10" }, { start: "2024-12-01", end: "2024-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-02-01", end: "2024-02-15" }, { start: "2024-06-11", end: "2024-08-31" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-10-01", end: "2024-11-26" }, { start: "2024-11-30", end: "2024-11-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-02-16", end: "2024-02-29" }, { start: "2024-03-01", end: "2024-03-23" }, { start: "2024-04-01", end: "2024-04-30" }, { start: "2024-11-27", end: "2024-11-29" }] },
];

RESORTS.push({
  id: "boulderRidge",
  name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
  year: 2024,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BRV_2024, [
    { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:36 },
      friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:32, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:47 } },
    { sunThu: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 },
      friSat: { deluxeStudio:18, oneBedroom:39, twoBedroom:48 } },
    { sunThu: { deluxeStudio:17, oneBedroom:35, twoBedroom:46 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:51 } },
    { sunThu: { deluxeStudio:19, oneBedroom:37, twoBedroom:49 },
      friSat: { deluxeStudio:21, oneBedroom:42, twoBedroom:54 } },
  ]),
});

// === 2025 — 6 travel periods ===
const BRV_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-05-01", end: "2025-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-05-15", end: "2025-06-10" }, { start: "2025-12-01", end: "2025-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-02-15" }, { start: "2025-06-11", end: "2025-08-31" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-10-01", end: "2025-11-25" }, { start: "2025-11-29", end: "2025-11-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-02-16", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }, { start: "2025-11-26", end: "2025-11-28" }] },
];

RESORTS.push({
  id: "boulderRidge",
  name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
  year: 2025,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BRV_2025, [
    { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:36 },
      friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:32, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:47 } },
    { sunThu: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 },
      friSat: { deluxeStudio:18, oneBedroom:39, twoBedroom:48 } },
    { sunThu: { deluxeStudio:17, oneBedroom:35, twoBedroom:46 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:51 } },
    { sunThu: { deluxeStudio:19, oneBedroom:37, twoBedroom:49 },
      friSat: { deluxeStudio:21, oneBedroom:42, twoBedroom:54 } },
  ]),
});

// === 2026 — 6 travel periods ===
const BRV_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
];

RESORTS.push({
  id: "boulderRidge",
  name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
  year: 2026,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BRV_2026, [
    { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:36 },
      friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:32, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:47 } },
    { sunThu: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 },
      friSat: { deluxeStudio:18, oneBedroom:39, twoBedroom:48 } },
    { sunThu: { deluxeStudio:17, oneBedroom:35, twoBedroom:46 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:51 } },
    { sunThu: { deluxeStudio:19, oneBedroom:37, twoBedroom:49 },
      friSat: { deluxeStudio:21, oneBedroom:42, twoBedroom:54 } },
  ]),
});

// === 2027 — 6 travel periods ===
const BRV_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
];

RESORTS.push({
  id: "boulderRidge",
  name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
  year: 2027,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 5 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(BRV_2027, [
    { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:36 },
      friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:41 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 } },
    { sunThu: { deluxeStudio:16, oneBedroom:32, twoBedroom:41 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:47 } },
    { sunThu: { deluxeStudio:16, oneBedroom:34, twoBedroom:44 },
      friSat: { deluxeStudio:18, oneBedroom:39, twoBedroom:48 } },
    { sunThu: { deluxeStudio:17, oneBedroom:35, twoBedroom:46 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:51 } },
    { sunThu: { deluxeStudio:19, oneBedroom:37, twoBedroom:49 },
      friSat: { deluxeStudio:21, oneBedroom:42, twoBedroom:54 } },
  ]),
});

// ======================================================================
// Disney's BoardWalk Villas
// ======================================================================

// === 2016 — 5 travel periods ===
const BWV_2016 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2016-01-01", end: "2016-01-31" }, { start: "2016-09-01", end: "2016-09-30" }, { start: "2016-12-01", end: "2016-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2016-10-01", end: "2016-11-22" }, { start: "2016-11-26", end: "2016-11-30" }, { start: "2016-12-15", end: "2016-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2016-02-01", end: "2016-02-15" }, { start: "2016-05-01", end: "2016-06-10" }, { start: "2016-08-16", end: "2016-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2016-02-16", end: "2016-03-19" }, { start: "2016-04-03", end: "2016-04-30" }, { start: "2016-06-11", end: "2016-08-15" }, { start: "2016-11-23", end: "2016-11-25" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2016-03-20", end: "2016-04-02" }, { start: "2016-12-24", end: "2016-12-31" }] },
];

RESORTS.push({
  id: "boardwalkVillas",
  name: "Disney's BoardWalk Villas",
  year: 2016,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsBP", name: "Deluxe Studio - Boardwalk/Preferred", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 4 },
    { id: "oneBP", name: "One-Bedroom Villa - Boardwalk/Preferred", sleeps: 4 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoBP", name: "Two-Bedroom Villa - Boardwalk/Preferred", sleeps: 9 },
    { id: "threeBP", name: "Three-Bedroom Grand Villa - Boardwalk/Preferred", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(BWV_2016, [
    { sunThu: { dsR:10, dsBP:15, oneR:20, oneBP:28, twoR:30, twoBP:37, threeBP:77 },
      friSat: { dsR:13, dsBP:16, oneR:27, oneBP:31, twoR:35, twoBP:42, threeBP:88 } },
    { sunThu: { dsR:10, dsBP:15, oneR:22, oneBP:29, twoR:31, twoBP:39, threeBP:81 },
      friSat: { dsR:14, dsBP:16, oneR:28, oneBP:34, twoR:38, twoBP:44, threeBP:91 } },
    { sunThu: { dsR:14, dsBP:17, oneR:28, oneBP:35, twoR:38, twoBP:43, threeBP:93 },
      friSat: { dsR:17, dsBP:20, oneR:33, oneBP:40, twoR:45, twoBP:49, threeBP:105 } },
    { sunThu: { dsR:14, dsBP:18, oneR:30, oneBP:37, twoR:41, twoBP:48, threeBP:110 },
      friSat: { dsR:19, dsBP:21, oneR:35, oneBP:43, twoR:48, twoBP:55, threeBP:125 } },
    { sunThu: { dsR:20, dsBP:26, oneR:42, oneBP:49, twoR:58, twoBP:64, threeBP:132 },
      friSat: { dsR:25, dsBP:29, oneR:48, oneBP:56, twoR:67, twoBP:75, threeBP:145 } },
  ]),
});

// === 2017 — 5 travel periods ===
const BWV_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-01-01", end: "2017-01-31" }, { start: "2017-09-01", end: "2017-09-30" }, { start: "2017-12-01", end: "2017-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-10-01", end: "2017-11-21" }, { start: "2017-11-25", end: "2017-11-30" }, { start: "2017-12-15", end: "2017-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2017-02-01", end: "2017-02-15" }, { start: "2017-05-01", end: "2017-06-10" }, { start: "2017-08-16", end: "2017-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-02-16", end: "2017-04-08" }, { start: "2017-04-23", end: "2017-04-30" }, { start: "2017-06-11", end: "2017-08-15" }, { start: "2017-11-22", end: "2017-11-24" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-04-09", end: "2017-04-22" }, { start: "2017-12-24", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "boardwalkVillas",
  name: "Disney's BoardWalk Villas",
  year: 2017,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsBP", name: "Deluxe Studio - Boardwalk/Preferred", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 4 },
    { id: "oneBP", name: "One-Bedroom Villa - Boardwalk/Preferred", sleeps: 4 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoBP", name: "Two-Bedroom Villa - Boardwalk/Preferred", sleeps: 9 },
    { id: "threeBP", name: "Three-Bedroom Grand Villa - Boardwalk/Preferred", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(BWV_2017, [
    { sunThu: { dsR:10, dsBP:15, oneR:20, oneBP:28, twoR:30, twoBP:37, threeBP:77 },
      friSat: { dsR:13, dsBP:16, oneR:27, oneBP:31, twoR:35, twoBP:42, threeBP:88 } },
    { sunThu: { dsR:10, dsBP:15, oneR:22, oneBP:29, twoR:31, twoBP:39, threeBP:81 },
      friSat: { dsR:14, dsBP:16, oneR:28, oneBP:34, twoR:38, twoBP:44, threeBP:91 } },
    { sunThu: { dsR:14, dsBP:17, oneR:28, oneBP:35, twoR:38, twoBP:43, threeBP:93 },
      friSat: { dsR:17, dsBP:20, oneR:33, oneBP:40, twoR:45, twoBP:49, threeBP:105 } },
    { sunThu: { dsR:14, dsBP:18, oneR:30, oneBP:37, twoR:41, twoBP:48, threeBP:110 },
      friSat: { dsR:19, dsBP:21, oneR:35, oneBP:43, twoR:48, twoBP:55, threeBP:125 } },
    { sunThu: { dsR:20, dsBP:26, oneR:42, oneBP:49, twoR:58, twoBP:65, threeBP:132 },
      friSat: { dsR:25, dsBP:29, oneR:48, oneBP:56, twoR:67, twoBP:76, threeBP:145 } },
  ]),
});

// === 2019 — 5 travel periods ===
const BWV_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-01", end: "2019-01-31" }, { start: "2019-09-01", end: "2019-09-30" }, { start: "2019-12-01", end: "2019-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-10-01", end: "2019-11-26" }, { start: "2019-11-30", end: "2019-11-30" }, { start: "2019-12-15", end: "2019-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2019-02-01", end: "2019-02-15" }, { start: "2019-05-01", end: "2019-06-10" }, { start: "2019-08-16", end: "2019-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-16", end: "2019-04-13" }, { start: "2019-04-28", end: "2019-04-30" }, { start: "2019-06-11", end: "2019-08-15" }, { start: "2019-11-27", end: "2019-11-29" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-04-14", end: "2019-04-27" }, { start: "2019-12-24", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "boardwalkVillas",
  name: "Disney's BoardWalk Villas",
  year: 2019,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsBP", name: "Deluxe Studio - Boardwalk/Preferred", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 4 },
    { id: "oneBP", name: "One-Bedroom Villa - Boardwalk/Preferred", sleeps: 4 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoBP", name: "Two-Bedroom Villa - Boardwalk/Preferred", sleeps: 9 },
    { id: "threeBP", name: "Three-Bedroom Grand Villa - Boardwalk/Preferred", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(BWV_2019, [
    { sunThu: { dsR:10, dsBP:15, oneR:20, oneBP:28, twoR:30, twoBP:37, threeBP:77 },
      friSat: { dsR:13, dsBP:16, oneR:27, oneBP:31, twoR:35, twoBP:42, threeBP:88 } },
    { sunThu: { dsR:10, dsBP:15, oneR:22, oneBP:29, twoR:31, twoBP:39, threeBP:81 },
      friSat: { dsR:14, dsBP:16, oneR:28, oneBP:34, twoR:38, twoBP:44, threeBP:91 } },
    { sunThu: { dsR:14, dsBP:17, oneR:28, oneBP:35, twoR:38, twoBP:43, threeBP:93 },
      friSat: { dsR:17, dsBP:20, oneR:33, oneBP:40, twoR:45, twoBP:49, threeBP:105 } },
    { sunThu: { dsR:14, dsBP:18, oneR:30, oneBP:37, twoR:41, twoBP:48, threeBP:110 },
      friSat: { dsR:19, dsBP:21, oneR:35, oneBP:43, twoR:48, twoBP:55, threeBP:125 } },
    { sunThu: { dsR:20, dsBP:26, oneR:42, oneBP:49, twoR:58, twoBP:65, threeBP:132 },
      friSat: { dsR:25, dsBP:29, oneR:48, oneBP:56, twoR:67, twoBP:76, threeBP:145 } },
  ]),
});

// === 2020 — 5 travel periods ===
const BWV_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-09-01", end: "2020-09-30" }, { start: "2020-12-01", end: "2020-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-10-01", end: "2020-11-24" }, { start: "2020-11-28", end: "2020-11-30" }, { start: "2020-12-15", end: "2020-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-02-01", end: "2020-02-15" }, { start: "2020-05-01", end: "2020-06-10" }, { start: "2020-08-16", end: "2020-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-16", end: "2020-04-04" }, { start: "2020-04-19", end: "2020-04-30" }, { start: "2020-06-11", end: "2020-08-15" }, { start: "2020-11-25", end: "2020-11-27" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-04-05", end: "2020-04-18" }, { start: "2020-12-24", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "boardwalkVillas",
  name: "Disney's BoardWalk Villas",
  year: 2020,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsBP", name: "Deluxe Studio - Boardwalk/Preferred", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 4 },
    { id: "oneBP", name: "One-Bedroom Villa - Boardwalk/Preferred", sleeps: 4 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoBP", name: "Two-Bedroom Villa - Boardwalk/Preferred", sleeps: 9 },
    { id: "threeBP", name: "Three-Bedroom Grand Villa - Boardwalk/Preferred", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(BWV_2020, [
    { sunThu: { dsR:10, dsBP:15, oneR:20, oneBP:28, twoR:30, twoBP:37, threeBP:77 },
      friSat: { dsR:13, dsBP:16, oneR:27, oneBP:31, twoR:35, twoBP:42, threeBP:88 } },
    { sunThu: { dsR:10, dsBP:15, oneR:22, oneBP:29, twoR:31, twoBP:39, threeBP:81 },
      friSat: { dsR:14, dsBP:16, oneR:28, oneBP:34, twoR:38, twoBP:44, threeBP:91 } },
    { sunThu: { dsR:14, dsBP:17, oneR:28, oneBP:35, twoR:38, twoBP:43, threeBP:93 },
      friSat: { dsR:17, dsBP:20, oneR:33, oneBP:40, twoR:45, twoBP:49, threeBP:105 } },
    { sunThu: { dsR:14, dsBP:18, oneR:30, oneBP:37, twoR:41, twoBP:48, threeBP:110 },
      friSat: { dsR:19, dsBP:21, oneR:35, oneBP:43, twoR:48, twoBP:55, threeBP:125 } },
    { sunThu: { dsR:20, dsBP:26, oneR:42, oneBP:49, twoR:58, twoBP:65, threeBP:132 },
      friSat: { dsR:25, dsBP:29, oneR:48, oneBP:56, twoR:67, twoBP:76, threeBP:145 } },
  ]),
});

// === 2021 — 7 travel periods ===
const BWV_2021 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2021-09-01", end: "2021-09-19" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-09-20", end: "2021-09-30" }, { start: "2021-12-01", end: "2021-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2021-05-01", end: "2021-06-10" }, { start: "2021-10-01", end: "2021-11-23" }, { start: "2021-11-27", end: "2021-11-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2021-02-01", end: "2021-02-15" }, { start: "2021-08-16", end: "2021-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2021-04-11", end: "2021-04-30" }, { start: "2021-06-11", end: "2021-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2021-02-16", end: "2021-02-28" }, { start: "2021-03-01", end: "2021-03-27" }, { start: "2021-04-05", end: "2021-04-10" }, { start: "2021-11-24", end: "2021-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2021-03-28", end: "2021-04-04" }, { start: "2021-12-24", end: "2021-12-31" }] },
];

RESORTS.push({
  id: "boardwalkVillas",
  name: "Disney's BoardWalk Villas",
  year: 2021,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsBP", name: "Deluxe Studio - Boardwalk/Preferred", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 4 },
    { id: "oneBP", name: "One-Bedroom Villa - Boardwalk/Preferred", sleeps: 4 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoBP", name: "Two-Bedroom Villa - Boardwalk/Preferred", sleeps: 9 },
    { id: "threeBP", name: "Three-Bedroom Grand Villa - Boardwalk/Preferred", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(BWV_2021, [
    { sunThu: { dsR:9, dsBP:14, oneR:19, oneBP:27, twoR:29, twoBP:36, threeBP:76 },
      friSat: { dsR:13, dsBP:16, oneR:27, oneBP:30, twoR:35, twoBP:41, threeBP:88 } },
    { sunThu: { dsR:10, dsBP:15, oneR:22, oneBP:29, twoR:31, twoBP:39, threeBP:81 },
      friSat: { dsR:14, dsBP:16, oneR:28, oneBP:34, twoR:38, twoBP:44, threeBP:91 } },
    { sunThu: { dsR:12, dsBP:16, oneR:24, oneBP:32, twoR:32, twoBP:41, threeBP:88 },
      friSat: { dsR:15, dsBP:17, oneR:30, oneBP:37, twoR:41, twoBP:47, threeBP:98 } },
    { sunThu: { dsR:14, dsBP:17, oneR:28, oneBP:35, twoR:38, twoBP:43, threeBP:93 },
      friSat: { dsR:17, dsBP:20, oneR:33, oneBP:40, twoR:45, twoBP:49, threeBP:104 } },
    { sunThu: { dsR:14, dsBP:18, oneR:30, oneBP:36, twoR:41, twoBP:47, threeBP:103 },
      friSat: { dsR:18, dsBP:21, oneR:34, oneBP:42, twoR:47, twoBP:54, threeBP:117 } },
    { sunThu: { dsR:15, dsBP:19, oneR:30, oneBP:38, twoR:42, twoBP:50, threeBP:111 },
      friSat: { dsR:19, dsBP:22, oneR:35, oneBP:43, twoR:48, twoBP:56, threeBP:125 } },
    { sunThu: { dsR:21, dsBP:27, oneR:41, oneBP:50, twoR:59, twoBP:67, threeBP:133 },
      friSat: { dsR:25, dsBP:29, oneR:48, oneBP:56, twoR:67, twoBP:77, threeBP:145 } },
  ]),
});

// === 2022 — 7 travel periods ===
const BWV_2022 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2022-09-01", end: "2022-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-12-01", end: "2022-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2022-05-01", end: "2022-06-10" }, { start: "2022-12-15", end: "2022-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2022-02-01", end: "2022-02-15" }, { start: "2022-06-11", end: "2022-08-31" }, { start: "2022-10-01", end: "2022-11-22" }, { start: "2022-11-26", end: "2022-11-30" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2022-04-24", end: "2022-04-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2022-02-16", end: "2022-02-28" }, { start: "2022-03-01", end: "2022-04-09" }, { start: "2022-04-18", end: "2022-04-23" }, { start: "2022-11-23", end: "2022-11-25" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2022-04-10", end: "2022-04-17" }, { start: "2022-12-24", end: "2022-12-31" }] },
];

RESORTS.push({
  id: "boardwalkVillas",
  name: "Disney's BoardWalk Villas",
  year: 2022,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsBP", name: "Deluxe Studio - Boardwalk/Preferred", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 4 },
    { id: "oneBP", name: "One-Bedroom Villa - Boardwalk/Preferred", sleeps: 4 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoBP", name: "Two-Bedroom Villa - Boardwalk/Preferred", sleeps: 9 },
    { id: "threeBP", name: "Three-Bedroom Grand Villa - Boardwalk/Preferred", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(BWV_2022, [
    { sunThu: { dsR:9, dsBP:14, oneR:19, oneBP:26, twoR:29, twoBP:35, threeBP:76 },
      friSat: { dsR:13, dsBP:16, oneR:27, oneBP:29, twoR:35, twoBP:40, threeBP:88 } },
    { sunThu: { dsR:9, dsBP:15, oneR:23, oneBP:29, twoR:32, twoBP:39, threeBP:81 },
      friSat: { dsR:14, dsBP:16, oneR:28, oneBP:34, twoR:38, twoBP:45, threeBP:91 } },
    { sunThu: { dsR:11, dsBP:16, oneR:24, oneBP:32, twoR:31, twoBP:41, threeBP:89 },
      friSat: { dsR:15, dsBP:17, oneR:30, oneBP:37, twoR:41, twoBP:47, threeBP:98 } },
    { sunThu: { dsR:13, dsBP:17, oneR:26, oneBP:35, twoR:35, twoBP:44, threeBP:94 },
      friSat: { dsR:16, dsBP:18, oneR:32, oneBP:40, twoR:45, twoBP:48, threeBP:105 } },
    { sunThu: { dsR:15, dsBP:19, oneR:30, oneBP:36, twoR:42, twoBP:48, threeBP:104 },
      friSat: { dsR:18, dsBP:21, oneR:34, oneBP:42, twoR:48, twoBP:54, threeBP:117 } },
    { sunThu: { dsR:15, dsBP:19, oneR:31, oneBP:39, twoR:43, twoBP:51, threeBP:111 },
      friSat: { dsR:19, dsBP:22, oneR:36, oneBP:43, twoR:49, twoBP:56, threeBP:125 } },
    { sunThu: { dsR:22, dsBP:28, oneR:42, oneBP:50, twoR:60, twoBP:68, threeBP:133 },
      friSat: { dsR:24, dsBP:29, oneR:48, oneBP:56, twoR:67, twoBP:77, threeBP:145 } },
  ]),
});

// === 2023 — 7 travel periods ===
const BWV_2023 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2023-09-01", end: "2023-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-05-01", end: "2023-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2023-05-15", end: "2023-06-10" }, { start: "2023-12-01", end: "2023-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2023-02-01", end: "2023-02-15" }, { start: "2023-06-11", end: "2023-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2023-10-01", end: "2023-11-21" }, { start: "2023-11-25", end: "2023-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2023-02-16", end: "2023-02-28" }, { start: "2023-03-01", end: "2023-04-01" }, { start: "2023-04-10", end: "2023-04-30" }, { start: "2023-11-22", end: "2023-11-24" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2023-04-02", end: "2023-04-09" }, { start: "2023-12-24", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "boardwalkVillas",
  name: "Disney's BoardWalk Villas",
  year: 2023,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsBP", name: "Deluxe Studio - Boardwalk/Preferred", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 4 },
    { id: "oneBP", name: "One-Bedroom Villa - Boardwalk/Preferred", sleeps: 4 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoBP", name: "Two-Bedroom Villa - Boardwalk/Preferred", sleeps: 9 },
    { id: "threeBP", name: "Three-Bedroom Grand Villa - Boardwalk/Preferred", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(BWV_2023, [
    { sunThu: { dsR:9, dsBP:14, oneR:19, oneBP:26, twoR:29, twoBP:35, threeBP:76 },
      friSat: { dsR:13, dsBP:16, oneR:27, oneBP:29, twoR:35, twoBP:40, threeBP:88 } },
    { sunThu: { dsR:9, dsBP:15, oneR:23, oneBP:29, twoR:32, twoBP:39, threeBP:81 },
      friSat: { dsR:14, dsBP:16, oneR:28, oneBP:34, twoR:38, twoBP:45, threeBP:91 } },
    { sunThu: { dsR:10, dsBP:16, oneR:24, oneBP:32, twoR:31, twoBP:41, threeBP:88 },
      friSat: { dsR:15, dsBP:17, oneR:30, oneBP:37, twoR:41, twoBP:47, threeBP:97 } },
    { sunThu: { dsR:12, dsBP:16, oneR:25, oneBP:35, twoR:33, twoBP:43, threeBP:91 },
      friSat: { dsR:16, dsBP:18, oneR:31, oneBP:39, twoR:44, twoBP:47, threeBP:102 } },
    { sunThu: { dsR:14, dsBP:18, oneR:28, oneBP:35, twoR:39, twoBP:45, threeBP:101 },
      friSat: { dsR:17, dsBP:20, oneR:33, oneBP:41, twoR:45, twoBP:51, threeBP:114 } },
    { sunThu: { dsR:15, dsBP:19, oneR:31, oneBP:39, twoR:43, twoBP:51, threeBP:110 },
      friSat: { dsR:19, dsBP:22, oneR:36, oneBP:43, twoR:49, twoBP:55, threeBP:124 } },
    { sunThu: { dsR:22, dsBP:28, oneR:42, oneBP:50, twoR:60, twoBP:68, threeBP:133 },
      friSat: { dsR:24, dsBP:29, oneR:48, oneBP:56, twoR:67, twoBP:77, threeBP:145 } },
  ]),
});

// === 2024 — 7 travel periods ===
const BWV_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-05-01", end: "2024-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-05-15", end: "2024-06-10" }, { start: "2024-12-01", end: "2024-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-02-01", end: "2024-02-15" }, { start: "2024-06-11", end: "2024-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2024-10-01", end: "2024-11-26" }, { start: "2024-11-30", end: "2024-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-02-16", end: "2024-02-29" }, { start: "2024-03-01", end: "2024-03-23" }, { start: "2024-04-01", end: "2024-04-30" }, { start: "2024-11-27", end: "2024-11-29" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-03-24", end: "2024-03-31" }, { start: "2024-12-24", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "boardwalkVillas",
  name: "Disney's BoardWalk Villas",
  year: 2024,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsBP", name: "Deluxe Studio - Boardwalk/Preferred", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 4 },
    { id: "oneBP", name: "One-Bedroom Villa - Boardwalk/Preferred", sleeps: 4 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoBP", name: "Two-Bedroom Villa - Boardwalk/Preferred", sleeps: 9 },
    { id: "threeBP", name: "Three-Bedroom Grand Villa - Boardwalk/Preferred", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(BWV_2024, [
    { sunThu: { dsR:9, dsBP:14, oneR:19, oneBP:26, twoR:29, twoBP:35, threeBP:76 },
      friSat: { dsR:13, dsBP:16, oneR:27, oneBP:29, twoR:35, twoBP:40, threeBP:88 } },
    { sunThu: { dsR:9, dsBP:15, oneR:23, oneBP:29, twoR:32, twoBP:39, threeBP:81 },
      friSat: { dsR:14, dsBP:16, oneR:28, oneBP:34, twoR:38, twoBP:45, threeBP:91 } },
    { sunThu: { dsR:10, dsBP:16, oneR:24, oneBP:32, twoR:31, twoBP:41, threeBP:88 },
      friSat: { dsR:15, dsBP:17, oneR:30, oneBP:37, twoR:41, twoBP:47, threeBP:97 } },
    { sunThu: { dsR:12, dsBP:16, oneR:25, oneBP:35, twoR:33, twoBP:43, threeBP:91 },
      friSat: { dsR:16, dsBP:18, oneR:31, oneBP:39, twoR:44, twoBP:47, threeBP:102 } },
    { sunThu: { dsR:14, dsBP:18, oneR:28, oneBP:35, twoR:39, twoBP:45, threeBP:101 },
      friSat: { dsR:17, dsBP:20, oneR:33, oneBP:41, twoR:45, twoBP:51, threeBP:114 } },
    { sunThu: { dsR:15, dsBP:19, oneR:31, oneBP:39, twoR:43, twoBP:51, threeBP:110 },
      friSat: { dsR:19, dsBP:22, oneR:36, oneBP:43, twoR:49, twoBP:55, threeBP:124 } },
    { sunThu: { dsR:22, dsBP:28, oneR:42, oneBP:50, twoR:60, twoBP:68, threeBP:133 },
      friSat: { dsR:24, dsBP:29, oneR:48, oneBP:56, twoR:67, twoBP:77, threeBP:145 } },
  ]),
});

// === 2025 — 7 travel periods ===
const BWV_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-05-01", end: "2025-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-05-15", end: "2025-06-10" }, { start: "2025-12-01", end: "2025-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-02-15" }, { start: "2025-06-11", end: "2025-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2025-10-01", end: "2025-11-25" }, { start: "2025-11-29", end: "2025-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-02-16", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }, { start: "2025-11-26", end: "2025-11-28" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-04-13", end: "2025-04-20" }, { start: "2025-12-24", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "boardwalkVillas",
  name: "Disney's BoardWalk Villas",
  year: 2025,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsBP", name: "Deluxe Studio - Boardwalk/Preferred", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 4 },
    { id: "oneBP", name: "One-Bedroom Villa - Boardwalk/Preferred", sleeps: 4 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoBP", name: "Two-Bedroom Villa - Boardwalk/Preferred", sleeps: 9 },
    { id: "threeBP", name: "Three-Bedroom Grand Villa - Boardwalk/Preferred", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(BWV_2025, [
    { sunThu: { dsR:9, dsBP:14, oneR:19, oneBP:26, twoR:29, twoBP:35, threeBP:76 },
      friSat: { dsR:13, dsBP:16, oneR:27, oneBP:29, twoR:35, twoBP:40, threeBP:88 } },
    { sunThu: { dsR:9, dsBP:15, oneR:23, oneBP:29, twoR:32, twoBP:39, threeBP:81 },
      friSat: { dsR:14, dsBP:16, oneR:28, oneBP:34, twoR:38, twoBP:45, threeBP:91 } },
    { sunThu: { dsR:10, dsBP:16, oneR:24, oneBP:32, twoR:31, twoBP:41, threeBP:88 },
      friSat: { dsR:15, dsBP:17, oneR:30, oneBP:37, twoR:41, twoBP:47, threeBP:97 } },
    { sunThu: { dsR:12, dsBP:16, oneR:25, oneBP:35, twoR:33, twoBP:43, threeBP:91 },
      friSat: { dsR:16, dsBP:18, oneR:31, oneBP:39, twoR:44, twoBP:47, threeBP:102 } },
    { sunThu: { dsR:14, dsBP:18, oneR:28, oneBP:35, twoR:39, twoBP:45, threeBP:101 },
      friSat: { dsR:17, dsBP:20, oneR:33, oneBP:41, twoR:45, twoBP:51, threeBP:114 } },
    { sunThu: { dsR:15, dsBP:19, oneR:31, oneBP:39, twoR:43, twoBP:51, threeBP:110 },
      friSat: { dsR:19, dsBP:22, oneR:36, oneBP:43, twoR:49, twoBP:55, threeBP:124 } },
    { sunThu: { dsR:22, dsBP:28, oneR:42, oneBP:50, twoR:60, twoBP:68, threeBP:133 },
      friSat: { dsR:24, dsBP:29, oneR:48, oneBP:56, twoR:67, twoBP:77, threeBP:145 } },
  ]),
});

// === 2026 — 7 travel periods ===
const BWV_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-12-24", end: "2026-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(BWV_2026, [
    { sunThu: { dsR:10, dsBP:14, oneR:19, oneBP:26, twoR:29, twoBP:35, threeBP:76 },
      friSat: { dsR:13, dsBP:16, oneR:27, oneBP:29, twoR:35, twoBP:40, threeBP:88 } },
    { sunThu: { dsR:10, dsBP:15, oneR:23, oneBP:29, twoR:32, twoBP:39, threeBP:81 },
      friSat: { dsR:14, dsBP:16, oneR:28, oneBP:34, twoR:38, twoBP:45, threeBP:91 } },
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
});

// === 2027 — 7 travel periods ===
const BWV_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(BWV_2027, [
    { sunThu: { dsR:10, dsBP:14, oneR:19, oneBP:26, twoR:29, twoBP:35, threeBP:76 },
      friSat: { dsR:13, dsBP:16, oneR:27, oneBP:29, twoR:35, twoBP:40, threeBP:88 } },
    { sunThu: { dsR:10, dsBP:15, oneR:23, oneBP:29, twoR:32, twoBP:39, threeBP:81 },
      friSat: { dsR:14, dsBP:16, oneR:28, oneBP:34, twoR:38, twoBP:45, threeBP:91 } },
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
});

// ======================================================================
// Copper Creek Villas & Cabins at Disney's Wilderness Lodge
// ======================================================================

// === 2017 — 5 travel periods ===
const CCV_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-09-01", end: "2017-09-30" }, { start: "2017-12-01", end: "2017-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-10-01", end: "2017-11-21" }, { start: "2017-11-25", end: "2017-11-30" }, { start: "2017-12-15", end: "2017-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2017-08-16", end: "2017-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-07-17", end: "2017-08-15" }, { start: "2017-11-22", end: "2017-11-24" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-12-24", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "copperCreek",
  name: "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
  year: 2017,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    { id: "twoBedCabin", name: "Two-Bedroom Cabin", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(CCV_2017, [
    { sunThu: { deluxeStudio:15, oneBedroom:28, twoBedroom:37, threeBedroom:94, twoBedCabin:87 },
      friSat: { deluxeStudio:16, oneBedroom:32, twoBedroom:42, threeBedroom:109, twoBedCabin:102 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38, threeBedroom:101, twoBedCabin:94 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44, threeBedroom:116, twoBedCabin:109 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44, threeBedroom:115, twoBedCabin:108 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49, threeBedroom:132, twoBedCabin:125 } },
    { sunThu: { deluxeStudio:17, oneBedroom:37, twoBedroom:48, threeBedroom:128, twoBedCabin:121 },
      friSat: { deluxeStudio:21, oneBedroom:43, twoBedroom:55, threeBedroom:148, twoBedCabin:140 } },
    { sunThu: { deluxeStudio:24, oneBedroom:47, twoBedroom:63, threeBedroom:176, twoBedCabin:168 },
      friSat: { deluxeStudio:28, oneBedroom:53, twoBedroom:71, threeBedroom:204, twoBedCabin:195 } },
  ]),
});

// === 2018 — 5 travel periods ===
const CCV_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-01-01", end: "2018-01-31" }, { start: "2018-09-01", end: "2018-09-30" }, { start: "2018-12-01", end: "2018-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-10-01", end: "2018-11-20" }, { start: "2018-11-24", end: "2018-11-30" }, { start: "2018-12-15", end: "2018-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2018-02-01", end: "2018-02-15" }, { start: "2018-05-01", end: "2018-06-10" }, { start: "2018-08-16", end: "2018-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2018-02-16", end: "2018-03-24" }, { start: "2018-04-08", end: "2018-04-30" }, { start: "2018-06-11", end: "2018-08-15" }, { start: "2018-11-21", end: "2018-11-23" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-03-25", end: "2018-04-07" }, { start: "2018-12-24", end: "2018-12-31" }] },
];

RESORTS.push({
  id: "copperCreek",
  name: "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
  year: 2018,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    { id: "twoBedCabin", name: "Two-Bedroom Cabin", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(CCV_2018, [
    { sunThu: { deluxeStudio:15, oneBedroom:28, twoBedroom:37, threeBedroom:94, twoBedCabin:87 },
      friSat: { deluxeStudio:16, oneBedroom:32, twoBedroom:42, threeBedroom:109, twoBedCabin:102 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38, threeBedroom:101, twoBedCabin:94 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44, threeBedroom:116, twoBedCabin:109 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44, threeBedroom:115, twoBedCabin:108 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49, threeBedroom:132, twoBedCabin:125 } },
    { sunThu: { deluxeStudio:17, oneBedroom:37, twoBedroom:48, threeBedroom:128, twoBedCabin:121 },
      friSat: { deluxeStudio:21, oneBedroom:43, twoBedroom:55, threeBedroom:148, twoBedCabin:140 } },
    { sunThu: { deluxeStudio:24, oneBedroom:47, twoBedroom:63, threeBedroom:176, twoBedCabin:168 },
      friSat: { deluxeStudio:28, oneBedroom:53, twoBedroom:71, threeBedroom:204, twoBedCabin:195 } },
  ]),
});

// === 2019 — 5 travel periods ===
const CCV_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-01", end: "2019-01-31" }, { start: "2019-09-01", end: "2019-09-30" }, { start: "2019-12-01", end: "2019-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-10-01", end: "2019-11-26" }, { start: "2019-11-30", end: "2019-11-30" }, { start: "2019-12-15", end: "2019-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2019-02-01", end: "2019-02-15" }, { start: "2019-05-01", end: "2019-06-10" }, { start: "2019-08-16", end: "2019-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-16", end: "2019-04-13" }, { start: "2019-04-28", end: "2019-04-30" }, { start: "2019-06-11", end: "2019-08-15" }, { start: "2019-11-27", end: "2019-11-29" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-04-14", end: "2019-04-27" }, { start: "2019-12-24", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "copperCreek",
  name: "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
  year: 2019,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    { id: "twoBedCabin", name: "Two-Bedroom Cabin", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(CCV_2019, [
    { sunThu: { deluxeStudio:15, oneBedroom:28, twoBedroom:37, threeBedroom:94, twoBedCabin:87 },
      friSat: { deluxeStudio:16, oneBedroom:32, twoBedroom:42, threeBedroom:109, twoBedCabin:102 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38, threeBedroom:101, twoBedCabin:94 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44, threeBedroom:116, twoBedCabin:109 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44, threeBedroom:115, twoBedCabin:108 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49, threeBedroom:132, twoBedCabin:125 } },
    { sunThu: { deluxeStudio:17, oneBedroom:37, twoBedroom:48, threeBedroom:128, twoBedCabin:121 },
      friSat: { deluxeStudio:21, oneBedroom:43, twoBedroom:55, threeBedroom:148, twoBedCabin:140 } },
    { sunThu: { deluxeStudio:24, oneBedroom:47, twoBedroom:63, threeBedroom:176, twoBedCabin:168 },
      friSat: { deluxeStudio:28, oneBedroom:53, twoBedroom:71, threeBedroom:204, twoBedCabin:195 } },
  ]),
});

// === 2020 — 5 travel periods ===
const CCV_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-09-01", end: "2020-09-30" }, { start: "2020-12-01", end: "2020-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-10-01", end: "2020-11-24" }, { start: "2020-11-28", end: "2020-11-30" }, { start: "2020-12-15", end: "2020-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-02-01", end: "2020-02-15" }, { start: "2020-05-01", end: "2020-06-10" }, { start: "2020-08-16", end: "2020-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-16", end: "2020-04-04" }, { start: "2020-04-19", end: "2020-04-30" }, { start: "2020-06-11", end: "2020-08-15" }, { start: "2020-11-25", end: "2020-11-27" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-04-05", end: "2020-04-18" }, { start: "2020-12-24", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "copperCreek",
  name: "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
  year: 2020,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    { id: "twoBedCabin", name: "Two-Bedroom Cabin", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(CCV_2020, [
    { sunThu: { deluxeStudio:15, oneBedroom:28, twoBedroom:37, threeBedroom:94, twoBedCabin:87 },
      friSat: { deluxeStudio:16, oneBedroom:32, twoBedroom:42, threeBedroom:109, twoBedCabin:102 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38, threeBedroom:101, twoBedCabin:94 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44, threeBedroom:116, twoBedCabin:109 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44, threeBedroom:115, twoBedCabin:108 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49, threeBedroom:132, twoBedCabin:125 } },
    { sunThu: { deluxeStudio:17, oneBedroom:37, twoBedroom:48, threeBedroom:128, twoBedCabin:121 },
      friSat: { deluxeStudio:21, oneBedroom:43, twoBedroom:55, threeBedroom:148, twoBedCabin:140 } },
    { sunThu: { deluxeStudio:24, oneBedroom:47, twoBedroom:63, threeBedroom:176, twoBedCabin:168 },
      friSat: { deluxeStudio:28, oneBedroom:53, twoBedroom:71, threeBedroom:204, twoBedCabin:195 } },
  ]),
});

// === 2021 — 6 travel periods ===
const CCV_2021 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2021-09-01", end: "2021-09-19" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-09-20", end: "2021-09-30" }, { start: "2021-12-01", end: "2021-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2021-05-01", end: "2021-06-10" }, { start: "2021-10-01", end: "2021-11-23" }, { start: "2021-11-27", end: "2021-11-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2021-02-01", end: "2021-02-15" }, { start: "2021-08-16", end: "2021-08-31" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2021-04-11", end: "2021-04-30" }, { start: "2021-06-11", end: "2021-08-15" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2021-02-16", end: "2021-02-28" }, { start: "2021-03-01", end: "2021-03-27" }, { start: "2021-04-05", end: "2021-04-10" }, { start: "2021-11-24", end: "2021-11-26" }] },
];

RESORTS.push({
  id: "copperCreek",
  name: "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
  year: 2021,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    { id: "twoBedCabin", name: "Two-Bedroom Cabin", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(CCV_2021, [
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:36, threeBedroom:93, twoBedCabin:86 },
      friSat: { deluxeStudio:16, oneBedroom:32, twoBedroom:42, threeBedroom:109, twoBedCabin:102 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38, threeBedroom:101, twoBedCabin:94 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44, threeBedroom:116, twoBedCabin:109 } },
    { sunThu: { deluxeStudio:16, oneBedroom:32, twoBedroom:41, threeBedroom:108, twoBedCabin:102 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:47, threeBedroom:124, twoBedCabin:119 } },
    { sunThu: { deluxeStudio:16, oneBedroom:35, twoBedroom:44, threeBedroom:115, twoBedCabin:108 },
      friSat: { deluxeStudio:20, oneBedroom:40, twoBedroom:49, threeBedroom:132, twoBedCabin:126 } },
    { sunThu: { deluxeStudio:17, oneBedroom:36, twoBedroom:47, threeBedroom:123, twoBedCabin:116 },
      friSat: { deluxeStudio:20, oneBedroom:42, twoBedroom:53, threeBedroom:140, twoBedCabin:134 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:50, threeBedroom:128, twoBedCabin:123 },
      friSat: { deluxeStudio:22, oneBedroom:43, twoBedroom:56, threeBedroom:148, twoBedCabin:142 } },
  ]),
});

// === 2022 — 6 travel periods ===
const CCV_2022 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2022-09-01", end: "2022-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-12-01", end: "2022-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2022-05-01", end: "2022-06-10" }, { start: "2022-12-15", end: "2022-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2022-02-01", end: "2022-02-15" }, { start: "2022-06-11", end: "2022-08-31" }, { start: "2022-10-01", end: "2022-11-22" }, { start: "2022-11-26", end: "2022-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2022-04-24", end: "2022-04-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2022-02-16", end: "2022-02-28" }, { start: "2022-03-01", end: "2022-04-09" }, { start: "2022-04-18", end: "2022-04-23" }, { start: "2022-11-23", end: "2022-11-25" }] },
];

RESORTS.push({
  id: "copperCreek",
  name: "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
  year: 2022,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    { id: "twoBedCabin", name: "Two-Bedroom Cabin", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(CCV_2022, [
    { sunThu: { deluxeStudio:13, oneBedroom:25, twoBedroom:35, threeBedroom:91, twoBedCabin:84 },
      friSat: { deluxeStudio:16, oneBedroom:30, twoBedroom:40, threeBedroom:107, twoBedCabin:100 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:38, threeBedroom:101, twoBedCabin:94 },
      friSat: { deluxeStudio:16, oneBedroom:34, twoBedroom:44, threeBedroom:116, twoBedCabin:109 } },
    { sunThu: { deluxeStudio:16, oneBedroom:33, twoBedroom:41, threeBedroom:108, twoBedCabin:101 },
      friSat: { deluxeStudio:17, oneBedroom:36, twoBedroom:47, threeBedroom:124, twoBedCabin:117 } },
    { sunThu: { deluxeStudio:17, oneBedroom:35, twoBedroom:44, threeBedroom:115, twoBedCabin:110 },
      friSat: { deluxeStudio:18, oneBedroom:39, twoBedroom:50, threeBedroom:132, twoBedCabin:124 } },
    { sunThu: { deluxeStudio:17, oneBedroom:36, twoBedroom:47, threeBedroom:123, twoBedCabin:116 },
      friSat: { deluxeStudio:20, oneBedroom:42, twoBedroom:53, threeBedroom:140, twoBedCabin:134 } },
    { sunThu: { deluxeStudio:18, oneBedroom:37, twoBedroom:50, threeBedroom:129, twoBedCabin:124 },
      friSat: { deluxeStudio:21, oneBedroom:43, twoBedroom:56, threeBedroom:148, twoBedCabin:143 } },
  ]),
});

// === 2023 — 6 travel periods ===
const CCV_2023 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2023-09-01", end: "2023-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-05-01", end: "2023-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2023-05-15", end: "2023-06-10" }, { start: "2023-12-01", end: "2023-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2023-02-01", end: "2023-02-15" }, { start: "2023-06-11", end: "2023-08-31" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2023-10-01", end: "2023-11-21" }, { start: "2023-11-25", end: "2023-11-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2023-02-16", end: "2023-02-28" }, { start: "2023-03-01", end: "2023-04-01" }, { start: "2023-04-10", end: "2023-04-30" }, { start: "2023-11-22", end: "2023-11-24" }] },
];

RESORTS.push({
  id: "copperCreek",
  name: "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
  year: 2023,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    { id: "twoBedCabin", name: "Two-Bedroom Cabin", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(CCV_2023, [
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
  ]),
});

// === 2024 — 6 travel periods ===
const CCV_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-05-01", end: "2024-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-05-15", end: "2024-06-10" }, { start: "2024-12-01", end: "2024-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-02-01", end: "2024-02-15" }, { start: "2024-06-11", end: "2024-08-31" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-10-01", end: "2024-11-26" }, { start: "2024-11-30", end: "2024-11-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-02-16", end: "2024-02-29" }, { start: "2024-03-01", end: "2024-03-23" }, { start: "2024-04-01", end: "2024-04-30" }, { start: "2024-11-27", end: "2024-11-29" }] },
];

RESORTS.push({
  id: "copperCreek",
  name: "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
  year: 2024,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    { id: "twoBedCabin", name: "Two-Bedroom Cabin", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(CCV_2024, [
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
  ]),
});

// === 2025 — 7 travel periods ===
const CCV_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-05-01", end: "2025-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-05-15", end: "2025-06-10" }, { start: "2025-12-01", end: "2025-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-02-15" }, { start: "2025-06-11", end: "2025-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2025-10-01", end: "2025-11-25" }, { start: "2025-11-29", end: "2025-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-02-16", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }, { start: "2025-11-26", end: "2025-11-28" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-04-13", end: "2025-04-20" }, { start: "2025-12-24", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "copperCreek",
  name: "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
  year: 2025,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 4 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 8 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
    { id: "twoBedCabin", name: "Two-Bedroom Cabin", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(CCV_2025, [
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
});

// === 2026 — 7 travel periods ===
const CCV_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-12-24", end: "2026-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(CCV_2026, [
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
});

// === 2027 — 7 travel periods ===
const CCV_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(CCV_2027, [
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
});

// ======================================================================
// The Cabins at Disney's Fort Wilderness Resort
// ======================================================================

// === 2024 — 6 travel periods ===
const CFW_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-12-01", end: "2024-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-07-01", end: "2024-08-31" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-10-01", end: "2024-11-26" }, { start: "2024-11-30", end: "2024-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-11-27", end: "2024-11-29" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-12-24", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "fortWildernessCabins",
  name: "The Cabins at Disney's Fort Wilderness Resort",
  year: 2024,
  roomTypes: [
    { id: "cabin", name: "Cabin", sleeps: 6 },
  ],
  travelPeriods: buildPeriods(CFW_2024, [
    { sunThu: { cabin:15 },
      friSat: { cabin:18 } },
    { sunThu: { cabin:18 },
      friSat: { cabin:21 } },
    { sunThu: { cabin:20 },
      friSat: { cabin:24 } },
    { sunThu: { cabin:22 },
      friSat: { cabin:25 } },
    { sunThu: { cabin:24 },
      friSat: { cabin:28 } },
    { sunThu: { cabin:32 },
      friSat: { cabin:36 } },
  ]),
});

// === 2025 — 7 travel periods ===
const CFW_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-05-01", end: "2025-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-05-15", end: "2025-06-10" }, { start: "2025-12-01", end: "2025-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-02-15" }, { start: "2025-06-11", end: "2025-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2025-10-01", end: "2025-11-25" }, { start: "2025-11-29", end: "2025-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-02-16", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }, { start: "2025-11-26", end: "2025-11-28" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-04-13", end: "2025-04-20" }, { start: "2025-12-24", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "fortWildernessCabins",
  name: "The Cabins at Disney's Fort Wilderness Resort",
  year: 2025,
  roomTypes: [
    { id: "cabin", name: "Cabin", sleeps: 6 },
  ],
  travelPeriods: buildPeriods(CFW_2025, [
    { sunThu: { cabin:15 },
      friSat: { cabin:18 } },
    { sunThu: { cabin:16 },
      friSat: { cabin:19 } },
    { sunThu: { cabin:18 },
      friSat: { cabin:21 } },
    { sunThu: { cabin:20 },
      friSat: { cabin:24 } },
    { sunThu: { cabin:22 },
      friSat: { cabin:25 } },
    { sunThu: { cabin:24 },
      friSat: { cabin:28 } },
    { sunThu: { cabin:32 },
      friSat: { cabin:36 } },
  ]),
});

// === 2026 — 7 travel periods ===
const CFW_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-12-24", end: "2026-12-31" }] },
];

RESORTS.push({
  id: "fortWildernessCabins",
  name: "The Cabins at Disney's Fort Wilderness Resort",
  year: 2026,
  roomTypes: [
    { id: "cabin", name: "Cabin", sleeps: 6 },
  ],
  travelPeriods: buildPeriods(CFW_2026, [
    { sunThu: { cabin:15 },
      friSat: { cabin:18 } },
    { sunThu: { cabin:16 },
      friSat: { cabin:19 } },
    { sunThu: { cabin:18 },
      friSat: { cabin:21 } },
    { sunThu: { cabin:20 },
      friSat: { cabin:24 } },
    { sunThu: { cabin:22 },
      friSat: { cabin:25 } },
    { sunThu: { cabin:24 },
      friSat: { cabin:28 } },
    { sunThu: { cabin:32 },
      friSat: { cabin:36 } },
  ]),
});

// === 2027 — 7 travel periods ===
const CFW_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
  id: "fortWildernessCabins",
  name: "The Cabins at Disney's Fort Wilderness Resort",
  year: 2027,
  roomTypes: [
    { id: "cabin", name: "Cabin", sleeps: 6 },
  ],
  travelPeriods: buildPeriods(CFW_2027, [
    { sunThu: { cabin:15 },
      friSat: { cabin:18 } },
    { sunThu: { cabin:16 },
      friSat: { cabin:19 } },
    { sunThu: { cabin:18 },
      friSat: { cabin:21 } },
    { sunThu: { cabin:20 },
      friSat: { cabin:24 } },
    { sunThu: { cabin:22 },
      friSat: { cabin:25 } },
    { sunThu: { cabin:24 },
      friSat: { cabin:28 } },
    { sunThu: { cabin:32 },
      friSat: { cabin:36 } },
  ]),
});

// ======================================================================
// The Villas at Disney's Grand Californian Hotel & Spa
// ======================================================================

// === 2016 — 4 travel periods ===
const GCV_2016 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2016-01-03", end: "2016-02-20" }, { start: "2016-09-04", end: "2016-10-06" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2016-04-03", end: "2016-06-26" }, { start: "2016-10-07", end: "2016-11-21" }, { start: "2016-11-27", end: "2016-12-22" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2016-02-21", end: "2016-03-17" }, { start: "2016-06-27", end: "2016-09-03" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2016-01-01", end: "2016-01-02" }, { start: "2016-03-18", end: "2016-04-02" }, { start: "2016-11-22", end: "2016-11-26" }, { start: "2016-12-23", end: "2016-12-31" }] },
];

RESORTS.push({
  id: "grandCalifornian",
  name: "The Villas at Disney's Grand Californian Hotel & Spa",
  year: 2016,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(GCV_2016, [
    { sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
      friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 } },
    { sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
      friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 } },
    { sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
      friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 } },
    { sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
      friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 } },
  ]),
});

// === 2017 — 4 travel periods ===
const GCV_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-01-08", end: "2017-02-25" }, { start: "2017-09-03", end: "2017-10-05" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-04-23", end: "2017-06-25" }, { start: "2017-10-06", end: "2017-11-20" }, { start: "2017-11-26", end: "2017-12-21" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-02-26", end: "2017-04-06" }, { start: "2017-06-26", end: "2017-09-02" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-01-01", end: "2017-01-07" }, { start: "2017-04-07", end: "2017-04-22" }, { start: "2017-11-21", end: "2017-11-25" }, { start: "2017-12-22", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "grandCalifornian",
  name: "The Villas at Disney's Grand Californian Hotel & Spa",
  year: 2017,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(GCV_2017, [
    { sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
      friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 } },
    { sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
      friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 } },
    { sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
      friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 } },
    { sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
      friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 } },
  ]),
});

// === 2018 — 4 travel periods ===
const GCV_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-01-07", end: "2018-02-24" }, { start: "2018-09-02", end: "2018-10-04" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-04-08", end: "2018-06-24" }, { start: "2018-10-05", end: "2018-11-19" }, { start: "2018-11-25", end: "2018-12-20" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2018-02-25", end: "2018-03-22" }, { start: "2018-06-25", end: "2018-09-01" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-01-01", end: "2018-01-06" }, { start: "2018-03-23", end: "2018-04-07" }, { start: "2018-11-20", end: "2018-11-24" }, { start: "2018-12-21", end: "2018-12-31" }] },
];

RESORTS.push({
  id: "grandCalifornian",
  name: "The Villas at Disney's Grand Californian Hotel & Spa",
  year: 2018,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(GCV_2018, [
    { sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
      friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 } },
    { sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
      friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 } },
    { sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
      friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 } },
    { sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
      friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 } },
  ]),
});

// === 2019 — 4 travel periods ===
const GCV_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-06", end: "2019-02-23" }, { start: "2019-09-01", end: "2019-10-03" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-04-28", end: "2019-06-23" }, { start: "2019-10-04", end: "2019-11-25" }, { start: "2019-12-01", end: "2019-12-19" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-24", end: "2019-04-11" }, { start: "2019-06-24", end: "2019-08-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-01-01", end: "2019-01-05" }, { start: "2019-04-12", end: "2019-04-27" }, { start: "2019-11-26", end: "2019-11-30" }, { start: "2019-12-20", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "grandCalifornian",
  name: "The Villas at Disney's Grand Californian Hotel & Spa",
  year: 2019,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(GCV_2019, [
    { sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
      friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 } },
    { sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
      friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 } },
    { sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
      friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 } },
    { sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
      friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 } },
  ]),
});

// === 2020 — 4 travel periods ===
const GCV_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-05", end: "2020-02-22" }, { start: "2020-09-06", end: "2020-10-01" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-04-19", end: "2020-06-28" }, { start: "2020-10-02", end: "2020-11-23" }, { start: "2020-11-29", end: "2020-12-17" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-23", end: "2020-04-02" }, { start: "2020-06-29", end: "2020-09-05" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-01-01", end: "2020-01-04" }, { start: "2020-04-03", end: "2020-04-18" }, { start: "2020-11-24", end: "2020-11-28" }, { start: "2020-12-18", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "grandCalifornian",
  name: "The Villas at Disney's Grand Californian Hotel & Spa",
  year: 2020,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(GCV_2020, [
    { sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
      friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 } },
    { sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
      friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 } },
    { sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
      friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 } },
    { sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
      friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 } },
  ]),
});

// === 2021 — 4 travel periods ===
const GCV_2021 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2021-01-03", end: "2021-02-20" }, { start: "2021-09-05", end: "2021-09-30" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2021-04-11", end: "2021-06-27" }, { start: "2021-10-01", end: "2021-11-22" }, { start: "2021-11-28", end: "2021-12-16" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2021-02-21", end: "2021-03-25" }, { start: "2021-06-28", end: "2021-09-04" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2021-01-01", end: "2021-01-02" }, { start: "2021-03-26", end: "2021-04-10" }, { start: "2021-11-23", end: "2021-11-27" }, { start: "2021-12-17", end: "2021-12-31" }] },
];

RESORTS.push({
  id: "grandCalifornian",
  name: "The Villas at Disney's Grand Californian Hotel & Spa",
  year: 2021,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(GCV_2021, [
    { sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
      friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 } },
    { sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
      friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 } },
    { sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
      friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 } },
    { sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
      friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 } },
  ]),
});

// === 2022 — 4 travel periods ===
const GCV_2022 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2022-01-02", end: "2022-02-26" }, { start: "2022-09-04", end: "2022-10-06" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2022-04-24", end: "2022-06-26" }, { start: "2022-10-07", end: "2022-11-21" }, { start: "2022-11-27", end: "2022-12-22" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2022-02-27", end: "2022-04-07" }, { start: "2022-06-27", end: "2022-09-03" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2022-01-01", end: "2022-01-01" }, { start: "2022-04-08", end: "2022-04-23" }, { start: "2022-11-22", end: "2022-11-26" }, { start: "2022-12-23", end: "2022-12-31" }] },
];

RESORTS.push({
  id: "grandCalifornian",
  name: "The Villas at Disney's Grand Californian Hotel & Spa",
  year: 2022,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(GCV_2022, [
    { sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
      friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 } },
    { sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
      friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 } },
    { sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
      friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 } },
    { sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
      friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 } },
  ]),
});

// === 2023 — 4 travel periods ===
const GCV_2023 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2023-01-08", end: "2023-02-25" }, { start: "2023-09-03", end: "2023-10-05" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2023-04-16", end: "2023-06-25" }, { start: "2023-10-06", end: "2023-11-20" }, { start: "2023-11-26", end: "2023-12-21" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2023-02-26", end: "2023-03-30" }, { start: "2023-06-26", end: "2023-09-02" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2023-01-01", end: "2023-01-07" }, { start: "2023-03-31", end: "2023-04-15" }, { start: "2023-11-21", end: "2023-11-25" }, { start: "2023-12-22", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "grandCalifornian",
  name: "The Villas at Disney's Grand Californian Hotel & Spa",
  year: 2023,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(GCV_2023, [
    { sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
      friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 } },
    { sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
      friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 } },
    { sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
      friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 } },
    { sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
      friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 } },
  ]),
});

// === 2024 — 4 travel periods ===
const GCV_2024 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2024-01-07", end: "2024-02-24" }, { start: "2024-09-01", end: "2024-10-03" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2024-04-07", end: "2024-06-23" }, { start: "2024-10-04", end: "2024-11-25" }, { start: "2024-12-01", end: "2024-12-19" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2024-02-25", end: "2024-03-21" }, { start: "2024-06-24", end: "2024-08-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2024-01-01", end: "2024-01-06" }, { start: "2024-03-22", end: "2024-04-06" }, { start: "2024-11-26", end: "2024-11-30" }, { start: "2024-12-20", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "grandCalifornian",
  name: "The Villas at Disney's Grand Californian Hotel & Spa",
  year: 2024,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(GCV_2024, [
    { sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
      friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 } },
    { sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
      friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 } },
    { sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
      friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 } },
    { sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
      friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 } },
  ]),
});

// === 2025 — 4 travel periods ===
const GCV_2025 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2025-01-05", end: "2025-02-22" }, { start: "2025-08-31", end: "2025-10-02" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2025-04-27", end: "2025-06-29" }, { start: "2025-10-03", end: "2025-11-24" }, { start: "2025-11-30", end: "2025-12-18" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2025-02-23", end: "2025-04-10" }, { start: "2025-06-30", end: "2025-08-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2025-01-01", end: "2025-01-04" }, { start: "2025-04-11", end: "2025-04-26" }, { start: "2025-11-25", end: "2025-11-29" }, { start: "2025-12-19", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "grandCalifornian",
  name: "The Villas at Disney's Grand Californian Hotel & Spa",
  year: 2025,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(GCV_2025, [
    { sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
      friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 } },
    { sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
      friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 } },
    { sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
      friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 } },
    { sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
      friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 } },
  ]),
});

// === 2026 — 4 travel periods ===
const GCV_2026 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2026-01-04", end: "2026-02-21" }, { start: "2026-09-06", end: "2026-10-01" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2026-04-12", end: "2026-06-28" }, { start: "2026-10-02", end: "2026-11-23" }, { start: "2026-11-29", end: "2026-12-17" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2026-02-22", end: "2026-03-26" }, { start: "2026-06-29", end: "2026-09-05" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2026-01-01", end: "2026-01-03" }, { start: "2026-03-27", end: "2026-04-11" }, { start: "2026-11-24", end: "2026-11-28" }, { start: "2026-12-18", end: "2026-12-31" }] },
];

RESORTS.push({
  id: "grandCalifornian",
  name: "The Villas at Disney's Grand Californian Hotel & Spa",
  year: 2026,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(GCV_2026, [
    { sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
      friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 } },
    { sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
      friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 } },
    { sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
      friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 } },
    { sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
      friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 } },
  ]),
});

// === 2027 — 4 travel periods ===
const GCV_2027 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2027-01-03", end: "2027-02-27" }, { start: "2027-09-05", end: "2027-09-30" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2027-04-04", end: "2027-06-27" }, { start: "2027-10-01", end: "2027-11-22" }, { start: "2027-11-28", end: "2027-12-16" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2027-02-28", end: "2027-03-18" }, { start: "2027-06-28", end: "2027-09-04" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2027-01-01", end: "2027-01-02" }, { start: "2027-03-19", end: "2027-04-03" }, { start: "2027-11-23", end: "2027-11-27" }, { start: "2027-12-17", end: "2027-12-31" }] },
];

RESORTS.push({
  id: "grandCalifornian",
  name: "The Villas at Disney's Grand Californian Hotel & Spa",
  year: 2027,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(GCV_2027, [
    { sunThu: { deluxeStudio:17, oneBedroom:31, twoBedroom:46, threeBedroom:94 },
      friSat: { deluxeStudio:22, oneBedroom:40, twoBedroom:56, threeBedroom:119 } },
    { sunThu: { deluxeStudio:20, oneBedroom:39, twoBedroom:52, threeBedroom:106 },
      friSat: { deluxeStudio:24, oneBedroom:48, twoBedroom:65, threeBedroom:133 } },
    { sunThu: { deluxeStudio:26, oneBedroom:52, twoBedroom:70, threeBedroom:152 },
      friSat: { deluxeStudio:32, oneBedroom:64, twoBedroom:88, threeBedroom:188 } },
    { sunThu: { deluxeStudio:30, oneBedroom:62, twoBedroom:86, threeBedroom:182 },
      friSat: { deluxeStudio:37, oneBedroom:76, twoBedroom:108, threeBedroom:224 } },
  ]),
});

// ======================================================================
// Disney's Hilton Head Island Resort
// ======================================================================

// === 2016 — 4 travel periods ===
const HHI_2016 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2016-01-01", end: "2016-01-31" }, { start: "2016-12-01", end: "2016-12-17" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2016-02-01", end: "2016-03-31" }, { start: "2016-11-01", end: "2016-11-30" }, { start: "2016-12-18", end: "2016-12-31" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2016-04-01", end: "2016-06-10" }, { start: "2016-08-28", end: "2016-10-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2016-06-11", end: "2016-08-27" }] },
];

RESORTS.push({
  id: "hiltonHead",
  name: "Disney's Hilton Head Island Resort",
  year: 2016,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(HHI_2016, [
    { sunThu: { deluxeStudio:6, oneBedroom:13, twoBedroom:19, threeBedroom:28 },
      friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 } },
    { sunThu: { deluxeStudio:10, oneBedroom:21, twoBedroom:25, threeBedroom:47 },
      friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:35, threeBedroom:60 } },
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
      friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
      friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:112 } },
  ]),
});

// === 2017 — 4 travel periods ===
const HHI_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-01-01", end: "2017-01-31" }, { start: "2017-12-01", end: "2017-12-17" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-02-01", end: "2017-03-31" }, { start: "2017-11-01", end: "2017-11-30" }, { start: "2017-12-18", end: "2017-12-31" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2017-04-01", end: "2017-06-10" }, { start: "2017-08-28", end: "2017-10-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-06-11", end: "2017-08-27" }] },
];

RESORTS.push({
  id: "hiltonHead",
  name: "Disney's Hilton Head Island Resort",
  year: 2017,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(HHI_2017, [
    { sunThu: { deluxeStudio:6, oneBedroom:13, twoBedroom:19, threeBedroom:28 },
      friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 } },
    { sunThu: { deluxeStudio:10, oneBedroom:21, twoBedroom:25, threeBedroom:47 },
      friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:35, threeBedroom:60 } },
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
      friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
      friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:112 } },
  ]),
});

// === 2018 — 4 travel periods ===
const HHI_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-01-01", end: "2018-01-31" }, { start: "2018-12-01", end: "2018-12-17" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-02-01", end: "2018-03-31" }, { start: "2018-11-01", end: "2018-11-30" }, { start: "2018-12-18", end: "2018-12-31" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2018-04-01", end: "2018-06-10" }, { start: "2018-08-28", end: "2018-10-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-06-11", end: "2018-08-27" }] },
];

RESORTS.push({
  id: "hiltonHead",
  name: "Disney's Hilton Head Island Resort",
  year: 2018,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(HHI_2018, [
    { sunThu: { deluxeStudio:6, oneBedroom:13, twoBedroom:19, threeBedroom:28 },
      friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 } },
    { sunThu: { deluxeStudio:10, oneBedroom:21, twoBedroom:25, threeBedroom:47 },
      friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:35, threeBedroom:60 } },
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
      friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
      friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:112 } },
  ]),
});

// === 2019 — 4 travel periods ===
const HHI_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-01", end: "2019-01-31" }, { start: "2019-12-01", end: "2019-12-17" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-02-01", end: "2019-03-31" }, { start: "2019-11-01", end: "2019-11-30" }, { start: "2019-12-18", end: "2019-12-31" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2019-04-01", end: "2019-06-10" }, { start: "2019-08-28", end: "2019-10-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-06-11", end: "2019-08-27" }] },
];

RESORTS.push({
  id: "hiltonHead",
  name: "Disney's Hilton Head Island Resort",
  year: 2019,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(HHI_2019, [
    { sunThu: { deluxeStudio:6, oneBedroom:13, twoBedroom:19, threeBedroom:28 },
      friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 } },
    { sunThu: { deluxeStudio:10, oneBedroom:21, twoBedroom:25, threeBedroom:47 },
      friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:35, threeBedroom:60 } },
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
      friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
      friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:112 } },
  ]),
});

// === 2020 — 4 travel periods ===
const HHI_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-12-01", end: "2020-12-17" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-02-01", end: "2020-03-31" }, { start: "2020-11-01", end: "2020-11-30" }, { start: "2020-12-18", end: "2020-12-31" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-04-01", end: "2020-06-10" }, { start: "2020-08-28", end: "2020-10-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-06-11", end: "2020-08-27" }] },
];

RESORTS.push({
  id: "hiltonHead",
  name: "Disney's Hilton Head Island Resort",
  year: 2020,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(HHI_2020, [
    { sunThu: { deluxeStudio:6, oneBedroom:13, twoBedroom:19, threeBedroom:28 },
      friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 } },
    { sunThu: { deluxeStudio:10, oneBedroom:21, twoBedroom:25, threeBedroom:47 },
      friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:35, threeBedroom:60 } },
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
      friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
      friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:112 } },
  ]),
});

// === 2021 — 4 travel periods ===
const HHI_2021 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-12-01", end: "2021-12-17" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2021-02-01", end: "2021-03-31" }, { start: "2021-11-01", end: "2021-11-30" }, { start: "2021-12-18", end: "2021-12-31" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2021-04-01", end: "2021-06-10" }, { start: "2021-08-28", end: "2021-10-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2021-06-11", end: "2021-08-27" }] },
];

RESORTS.push({
  id: "hiltonHead",
  name: "Disney's Hilton Head Island Resort",
  year: 2021,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(HHI_2021, [
    { sunThu: { deluxeStudio:6, oneBedroom:14, twoBedroom:20, threeBedroom:27 },
      friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 } },
    { sunThu: { deluxeStudio:10, oneBedroom:20, twoBedroom:24, threeBedroom:47 },
      friSat: { deluxeStudio:15, oneBedroom:29, twoBedroom:36, threeBedroom:60 } },
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
      friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
      friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:111 } },
  ]),
});

// === 2022 — 4 travel periods ===
const HHI_2022 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-12-01", end: "2022-12-17" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2022-02-01", end: "2022-03-31" }, { start: "2022-11-01", end: "2022-11-30" }, { start: "2022-12-18", end: "2022-12-31" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2022-04-01", end: "2022-06-10" }, { start: "2022-08-28", end: "2022-10-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2022-06-11", end: "2022-08-27" }] },
];

RESORTS.push({
  id: "hiltonHead",
  name: "Disney's Hilton Head Island Resort",
  year: 2022,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(HHI_2022, [
    { sunThu: { deluxeStudio:6, oneBedroom:14, twoBedroom:20, threeBedroom:27 },
      friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 } },
    { sunThu: { deluxeStudio:10, oneBedroom:20, twoBedroom:24, threeBedroom:47 },
      friSat: { deluxeStudio:15, oneBedroom:29, twoBedroom:36, threeBedroom:60 } },
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
      friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
      friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:111 } },
  ]),
});

// === 2023 — 4 travel periods ===
const HHI_2023 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-12-01", end: "2023-12-17" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2023-02-01", end: "2023-03-31" }, { start: "2023-11-01", end: "2023-11-30" }, { start: "2023-12-18", end: "2023-12-31" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2023-04-01", end: "2023-06-10" }, { start: "2023-08-28", end: "2023-10-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2023-06-11", end: "2023-08-27" }] },
];

RESORTS.push({
  id: "hiltonHead",
  name: "Disney's Hilton Head Island Resort",
  year: 2023,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(HHI_2023, [
    { sunThu: { deluxeStudio:6, oneBedroom:14, twoBedroom:20, threeBedroom:27 },
      friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 } },
    { sunThu: { deluxeStudio:10, oneBedroom:20, twoBedroom:24, threeBedroom:47 },
      friSat: { deluxeStudio:15, oneBedroom:29, twoBedroom:36, threeBedroom:60 } },
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
      friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
      friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:111 } },
  ]),
});

// === 2024 — 4 travel periods ===
const HHI_2024 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-12-01", end: "2024-12-17" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2024-02-01", end: "2024-03-31" }, { start: "2024-11-01", end: "2024-11-30" }, { start: "2024-12-18", end: "2024-12-31" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2024-04-01", end: "2024-06-10" }, { start: "2024-08-28", end: "2024-10-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2024-06-11", end: "2024-08-27" }] },
];

RESORTS.push({
  id: "hiltonHead",
  name: "Disney's Hilton Head Island Resort",
  year: 2024,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(HHI_2024, [
    { sunThu: { deluxeStudio:6, oneBedroom:14, twoBedroom:20, threeBedroom:27 },
      friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 } },
    { sunThu: { deluxeStudio:10, oneBedroom:20, twoBedroom:24, threeBedroom:47 },
      friSat: { deluxeStudio:15, oneBedroom:29, twoBedroom:36, threeBedroom:60 } },
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
      friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
      friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:111 } },
  ]),
});

// === 2025 — 4 travel periods ===
const HHI_2025 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-12-01", end: "2025-12-17" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2025-02-01", end: "2025-03-31" }, { start: "2025-11-01", end: "2025-11-30" }, { start: "2025-12-18", end: "2025-12-31" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2025-04-01", end: "2025-06-10" }, { start: "2025-08-28", end: "2025-10-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2025-06-11", end: "2025-08-27" }] },
];

RESORTS.push({
  id: "hiltonHead",
  name: "Disney's Hilton Head Island Resort",
  year: 2025,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(HHI_2025, [
    { sunThu: { deluxeStudio:6, oneBedroom:14, twoBedroom:20, threeBedroom:27 },
      friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 } },
    { sunThu: { deluxeStudio:10, oneBedroom:20, twoBedroom:24, threeBedroom:47 },
      friSat: { deluxeStudio:15, oneBedroom:29, twoBedroom:36, threeBedroom:60 } },
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
      friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
      friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:111 } },
  ]),
});

// === 2026 — 4 travel periods ===
const HHI_2026 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-12-01", end: "2026-12-17" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2026-02-01", end: "2026-03-31" }, { start: "2026-11-01", end: "2026-11-30" }, { start: "2026-12-18", end: "2026-12-31" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2026-04-01", end: "2026-06-10" }, { start: "2026-08-28", end: "2026-10-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2026-06-11", end: "2026-08-27" }] },
];

RESORTS.push({
  id: "hiltonHead",
  name: "Disney's Hilton Head Island Resort",
  year: 2026,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(HHI_2026, [
    { sunThu: { deluxeStudio:6, oneBedroom:14, twoBedroom:20, threeBedroom:27 },
      friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 } },
    { sunThu: { deluxeStudio:10, oneBedroom:20, twoBedroom:24, threeBedroom:47 },
      friSat: { deluxeStudio:15, oneBedroom:29, twoBedroom:36, threeBedroom:60 } },
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
      friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
      friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:111 } },
  ]),
});

// === 2027 — 4 travel periods ===
const HHI_2027 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-12-01", end: "2027-12-17" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2027-02-01", end: "2027-03-31" }, { start: "2027-11-01", end: "2027-11-30" }, { start: "2027-12-18", end: "2027-12-31" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2027-04-01", end: "2027-06-10" }, { start: "2027-08-28", end: "2027-10-31" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2027-06-11", end: "2027-08-27" }] },
];

RESORTS.push({
  id: "hiltonHead",
  name: "Disney's Hilton Head Island Resort",
  year: 2027,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(HHI_2027, [
    { sunThu: { deluxeStudio:6, oneBedroom:14, twoBedroom:20, threeBedroom:27 },
      friSat: { deluxeStudio:12, oneBedroom:19, twoBedroom:23, threeBedroom:39 } },
    { sunThu: { deluxeStudio:10, oneBedroom:20, twoBedroom:24, threeBedroom:47 },
      friSat: { deluxeStudio:15, oneBedroom:29, twoBedroom:36, threeBedroom:60 } },
    { sunThu: { deluxeStudio:14, oneBedroom:27, twoBedroom:33, threeBedroom:59 },
      friSat: { deluxeStudio:23, oneBedroom:44, twoBedroom:56, threeBedroom:95 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:41, threeBedroom:71 },
      friSat: { deluxeStudio:27, oneBedroom:52, twoBedroom:66, threeBedroom:111 } },
  ]),
});

// ======================================================================
// Disney's Old Key West Resort
// ======================================================================

// === 2016 — 5 travel periods ===
const OKW_2016 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2016-01-01", end: "2016-01-31" }, { start: "2016-09-01", end: "2016-09-30" }, { start: "2016-12-01", end: "2016-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2016-10-01", end: "2016-11-22" }, { start: "2016-11-26", end: "2016-11-30" }, { start: "2016-12-15", end: "2016-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2016-02-01", end: "2016-02-15" }, { start: "2016-05-01", end: "2016-06-10" }, { start: "2016-08-16", end: "2016-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2016-02-16", end: "2016-03-19" }, { start: "2016-04-03", end: "2016-04-30" }, { start: "2016-06-11", end: "2016-08-15" }, { start: "2016-11-23", end: "2016-11-25" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2016-03-20", end: "2016-04-02" }, { start: "2016-12-24", end: "2016-12-31" }] },
];

RESORTS.push({
  id: "oldKeyWest",
  name: "Disney's Old Key West Resort",
  year: 2016,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(OKW_2016, [
    { sunThu: { deluxeStudio:10, oneBedroom:21, twoBedroom:29, threeBedroom:47 },
      friSat: { deluxeStudio:13, oneBedroom:26, twoBedroom:36, threeBedroom:57 } },
    { sunThu: { deluxeStudio:10, oneBedroom:24, twoBedroom:32, threeBedroom:48 },
      friSat: { deluxeStudio:14, oneBedroom:27, twoBedroom:36, threeBedroom:59 } },
    { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:37, threeBedroom:58 },
      friSat: { deluxeStudio:17, oneBedroom:32, twoBedroom:42, threeBedroom:69 } },
    { sunThu: { deluxeStudio:14, oneBedroom:30, twoBedroom:40, threeBedroom:63 },
      friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:48, threeBedroom:81 } },
    { sunThu: { deluxeStudio:20, oneBedroom:40, twoBedroom:54, threeBedroom:81 },
      friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:64, threeBedroom:105 } },
  ]),
});

// === 2017 — 5 travel periods ===
const OKW_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-01-01", end: "2017-01-31" }, { start: "2017-09-01", end: "2017-09-30" }, { start: "2017-12-01", end: "2017-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-10-01", end: "2017-11-21" }, { start: "2017-11-25", end: "2017-11-30" }, { start: "2017-12-15", end: "2017-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2017-02-01", end: "2017-02-15" }, { start: "2017-05-01", end: "2017-06-10" }, { start: "2017-08-16", end: "2017-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-02-16", end: "2017-04-08" }, { start: "2017-04-23", end: "2017-04-30" }, { start: "2017-06-11", end: "2017-08-15" }, { start: "2017-11-22", end: "2017-11-24" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-04-09", end: "2017-04-22" }, { start: "2017-12-24", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "oldKeyWest",
  name: "Disney's Old Key West Resort",
  year: 2017,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(OKW_2017, [
    { sunThu: { deluxeStudio:10, oneBedroom:21, twoBedroom:29, threeBedroom:47 },
      friSat: { deluxeStudio:13, oneBedroom:26, twoBedroom:36, threeBedroom:57 } },
    { sunThu: { deluxeStudio:10, oneBedroom:24, twoBedroom:32, threeBedroom:48 },
      friSat: { deluxeStudio:14, oneBedroom:27, twoBedroom:36, threeBedroom:59 } },
    { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:37, threeBedroom:58 },
      friSat: { deluxeStudio:17, oneBedroom:32, twoBedroom:42, threeBedroom:69 } },
    { sunThu: { deluxeStudio:14, oneBedroom:30, twoBedroom:40, threeBedroom:63 },
      friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:48, threeBedroom:81 } },
    { sunThu: { deluxeStudio:20, oneBedroom:40, twoBedroom:54, threeBedroom:81 },
      friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:64, threeBedroom:105 } },
  ]),
});

// === 2018 — 5 travel periods ===
const OKW_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-01-01", end: "2018-01-31" }, { start: "2018-09-01", end: "2018-09-30" }, { start: "2018-12-01", end: "2018-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-10-01", end: "2018-11-20" }, { start: "2018-11-24", end: "2018-11-30" }, { start: "2018-12-15", end: "2018-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2018-02-01", end: "2018-02-15" }, { start: "2018-05-01", end: "2018-06-10" }, { start: "2018-08-16", end: "2018-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2018-02-16", end: "2018-03-24" }, { start: "2018-04-08", end: "2018-04-30" }, { start: "2018-06-11", end: "2018-08-15" }, { start: "2018-11-21", end: "2018-11-23" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-03-25", end: "2018-04-07" }, { start: "2018-12-24", end: "2018-12-31" }] },
];

RESORTS.push({
  id: "oldKeyWest",
  name: "Disney's Old Key West Resort",
  year: 2018,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(OKW_2018, [
    { sunThu: { deluxeStudio:10, oneBedroom:21, twoBedroom:29, threeBedroom:47 },
      friSat: { deluxeStudio:13, oneBedroom:26, twoBedroom:36, threeBedroom:57 } },
    { sunThu: { deluxeStudio:10, oneBedroom:24, twoBedroom:32, threeBedroom:48 },
      friSat: { deluxeStudio:14, oneBedroom:27, twoBedroom:36, threeBedroom:59 } },
    { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:37, threeBedroom:58 },
      friSat: { deluxeStudio:17, oneBedroom:32, twoBedroom:42, threeBedroom:69 } },
    { sunThu: { deluxeStudio:14, oneBedroom:30, twoBedroom:40, threeBedroom:63 },
      friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:48, threeBedroom:81 } },
    { sunThu: { deluxeStudio:20, oneBedroom:40, twoBedroom:54, threeBedroom:81 },
      friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:64, threeBedroom:105 } },
  ]),
});

// === 2019 — 5 travel periods ===
const OKW_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-01", end: "2019-01-31" }, { start: "2019-09-01", end: "2019-09-30" }, { start: "2019-12-01", end: "2019-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-10-01", end: "2019-11-26" }, { start: "2019-11-30", end: "2019-11-30" }, { start: "2019-12-15", end: "2019-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2019-02-01", end: "2019-02-15" }, { start: "2019-05-01", end: "2019-06-10" }, { start: "2019-08-16", end: "2019-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-16", end: "2019-04-13" }, { start: "2019-04-28", end: "2019-04-30" }, { start: "2019-06-11", end: "2019-08-15" }, { start: "2019-11-27", end: "2019-11-29" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-04-14", end: "2019-04-27" }, { start: "2019-12-24", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "oldKeyWest",
  name: "Disney's Old Key West Resort",
  year: 2019,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(OKW_2019, [
    { sunThu: { deluxeStudio:10, oneBedroom:21, twoBedroom:29, threeBedroom:47 },
      friSat: { deluxeStudio:13, oneBedroom:26, twoBedroom:36, threeBedroom:57 } },
    { sunThu: { deluxeStudio:10, oneBedroom:24, twoBedroom:32, threeBedroom:48 },
      friSat: { deluxeStudio:14, oneBedroom:27, twoBedroom:36, threeBedroom:59 } },
    { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:37, threeBedroom:58 },
      friSat: { deluxeStudio:17, oneBedroom:32, twoBedroom:42, threeBedroom:69 } },
    { sunThu: { deluxeStudio:14, oneBedroom:30, twoBedroom:40, threeBedroom:63 },
      friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:48, threeBedroom:81 } },
    { sunThu: { deluxeStudio:20, oneBedroom:40, twoBedroom:54, threeBedroom:81 },
      friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:64, threeBedroom:105 } },
  ]),
});

// === 2020 — 5 travel periods ===
const OKW_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-09-01", end: "2020-09-30" }, { start: "2020-12-01", end: "2020-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-10-01", end: "2020-11-24" }, { start: "2020-11-28", end: "2020-11-30" }, { start: "2020-12-15", end: "2020-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-02-01", end: "2020-02-15" }, { start: "2020-05-01", end: "2020-06-10" }, { start: "2020-08-16", end: "2020-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-16", end: "2020-04-04" }, { start: "2020-04-19", end: "2020-04-30" }, { start: "2020-06-11", end: "2020-08-15" }, { start: "2020-11-25", end: "2020-11-27" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-04-05", end: "2020-04-18" }, { start: "2020-12-24", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "oldKeyWest",
  name: "Disney's Old Key West Resort",
  year: 2020,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(OKW_2020, [
    { sunThu: { deluxeStudio:10, oneBedroom:21, twoBedroom:29, threeBedroom:47 },
      friSat: { deluxeStudio:13, oneBedroom:26, twoBedroom:36, threeBedroom:57 } },
    { sunThu: { deluxeStudio:10, oneBedroom:24, twoBedroom:32, threeBedroom:48 },
      friSat: { deluxeStudio:14, oneBedroom:27, twoBedroom:36, threeBedroom:59 } },
    { sunThu: { deluxeStudio:13, oneBedroom:27, twoBedroom:37, threeBedroom:58 },
      friSat: { deluxeStudio:17, oneBedroom:32, twoBedroom:42, threeBedroom:69 } },
    { sunThu: { deluxeStudio:14, oneBedroom:30, twoBedroom:40, threeBedroom:63 },
      friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:48, threeBedroom:81 } },
    { sunThu: { deluxeStudio:20, oneBedroom:40, twoBedroom:54, threeBedroom:81 },
      friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:64, threeBedroom:105 } },
  ]),
});

// === 2021 — 7 travel periods ===
const OKW_2021 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2021-09-01", end: "2021-09-19" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-09-20", end: "2021-09-30" }, { start: "2021-12-01", end: "2021-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2021-05-01", end: "2021-06-10" }, { start: "2021-10-01", end: "2021-11-23" }, { start: "2021-11-27", end: "2021-11-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2021-02-01", end: "2021-02-15" }, { start: "2021-08-16", end: "2021-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2021-04-11", end: "2021-04-30" }, { start: "2021-06-11", end: "2021-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2021-02-16", end: "2021-02-28" }, { start: "2021-03-01", end: "2021-03-27" }, { start: "2021-04-05", end: "2021-04-10" }, { start: "2021-11-24", end: "2021-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2021-03-28", end: "2021-04-04" }, { start: "2021-12-24", end: "2021-12-31" }] },
];

RESORTS.push({
  id: "oldKeyWest",
  name: "Disney's Old Key West Resort",
  year: 2021,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(OKW_2021, [
    { sunThu: { deluxeStudio:9, oneBedroom:21, twoBedroom:28, threeBedroom:46 },
      friSat: { deluxeStudio:13, oneBedroom:26, twoBedroom:36, threeBedroom:56 } },
    { sunThu: { deluxeStudio:10, oneBedroom:23, twoBedroom:32, threeBedroom:49 },
      friSat: { deluxeStudio:14, oneBedroom:26, twoBedroom:35, threeBedroom:59 } },
    { sunThu: { deluxeStudio:11, oneBedroom:26, twoBedroom:35, threeBedroom:53 },
      friSat: { deluxeStudio:15, oneBedroom:29, twoBedroom:39, threeBedroom:64 } },
    { sunThu: { deluxeStudio:13, oneBedroom:26, twoBedroom:36, threeBedroom:59 },
      friSat: { deluxeStudio:17, oneBedroom:32, twoBedroom:42, threeBedroom:70 } },
    { sunThu: { deluxeStudio:14, oneBedroom:29, twoBedroom:40, threeBedroom:61 },
      friSat: { deluxeStudio:18, oneBedroom:34, twoBedroom:45, threeBedroom:73 } },
    { sunThu: { deluxeStudio:15, oneBedroom:30, twoBedroom:41, threeBedroom:65 },
      friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:48, threeBedroom:82 } },
    { sunThu: { deluxeStudio:21, oneBedroom:40, twoBedroom:55, threeBedroom:82 },
      friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:64, threeBedroom:107 } },
  ]),
});

// === 2022 — 7 travel periods ===
const OKW_2022 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2022-09-01", end: "2022-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-12-01", end: "2022-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2022-05-01", end: "2022-06-10" }, { start: "2022-12-15", end: "2022-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2022-02-01", end: "2022-02-15" }, { start: "2022-06-11", end: "2022-08-31" }, { start: "2022-10-01", end: "2022-11-22" }, { start: "2022-11-26", end: "2022-11-30" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2022-04-24", end: "2022-04-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2022-02-16", end: "2022-02-28" }, { start: "2022-03-01", end: "2022-04-09" }, { start: "2022-04-18", end: "2022-04-23" }, { start: "2022-11-23", end: "2022-11-25" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2022-04-10", end: "2022-04-17" }, { start: "2022-12-24", end: "2022-12-31" }] },
];

RESORTS.push({
  id: "oldKeyWest",
  name: "Disney's Old Key West Resort",
  year: 2022,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(OKW_2022, [
    { sunThu: { deluxeStudio:9, oneBedroom:20, twoBedroom:27, threeBedroom:46 },
      friSat: { deluxeStudio:13, oneBedroom:25, twoBedroom:35, threeBedroom:56 } },
    { sunThu: { deluxeStudio:10, oneBedroom:23, twoBedroom:32, threeBedroom:50 },
      friSat: { deluxeStudio:14, oneBedroom:26, twoBedroom:35, threeBedroom:59 } },
    { sunThu: { deluxeStudio:10, oneBedroom:25, twoBedroom:34, threeBedroom:53 },
      friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:38, threeBedroom:64 } },
    { sunThu: { deluxeStudio:12, oneBedroom:27, twoBedroom:37, threeBedroom:58 },
      friSat: { deluxeStudio:16, oneBedroom:31, twoBedroom:42, threeBedroom:70 } },
    { sunThu: { deluxeStudio:14, oneBedroom:29, twoBedroom:40, threeBedroom:61 },
      friSat: { deluxeStudio:18, oneBedroom:34, twoBedroom:45, threeBedroom:73 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:42, threeBedroom:66 },
      friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:49, threeBedroom:79 } },
    { sunThu: { deluxeStudio:22, oneBedroom:40, twoBedroom:57, threeBedroom:82 },
      friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:65, threeBedroom:107 } },
  ]),
});

// === 2023 — 7 travel periods ===
const OKW_2023 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2023-09-01", end: "2023-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-05-01", end: "2023-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2023-05-15", end: "2023-06-10" }, { start: "2023-12-01", end: "2023-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2023-02-01", end: "2023-02-15" }, { start: "2023-06-11", end: "2023-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2023-10-01", end: "2023-11-21" }, { start: "2023-11-25", end: "2023-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2023-02-16", end: "2023-02-28" }, { start: "2023-03-01", end: "2023-04-01" }, { start: "2023-04-10", end: "2023-04-30" }, { start: "2023-11-22", end: "2023-11-24" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2023-04-02", end: "2023-04-09" }, { start: "2023-12-24", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "oldKeyWest",
  name: "Disney's Old Key West Resort",
  year: 2023,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(OKW_2023, [
    { sunThu: { deluxeStudio:9, oneBedroom:20, twoBedroom:27, threeBedroom:46 },
      friSat: { deluxeStudio:13, oneBedroom:25, twoBedroom:35, threeBedroom:56 } },
    { sunThu: { deluxeStudio:10, oneBedroom:23, twoBedroom:31, threeBedroom:50 },
      friSat: { deluxeStudio:14, oneBedroom:26, twoBedroom:35, threeBedroom:59 } },
    { sunThu: { deluxeStudio:10, oneBedroom:25, twoBedroom:34, threeBedroom:53 },
      friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:38, threeBedroom:64 } },
    { sunThu: { deluxeStudio:11, oneBedroom:26, twoBedroom:36, threeBedroom:56 },
      friSat: { deluxeStudio:16, oneBedroom:30, twoBedroom:41, threeBedroom:69 } },
    { sunThu: { deluxeStudio:13, oneBedroom:28, twoBedroom:39, threeBedroom:59 },
      friSat: { deluxeStudio:17, oneBedroom:34, twoBedroom:44, threeBedroom:71 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:42, threeBedroom:66 },
      friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:49, threeBedroom:79 } },
    { sunThu: { deluxeStudio:22, oneBedroom:40, twoBedroom:57, threeBedroom:82 },
      friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:65, threeBedroom:106 } },
  ]),
});

// === 2024 — 7 travel periods ===
const OKW_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-05-01", end: "2024-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-05-15", end: "2024-06-10" }, { start: "2024-12-01", end: "2024-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-02-01", end: "2024-02-15" }, { start: "2024-06-11", end: "2024-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2024-10-01", end: "2024-11-26" }, { start: "2024-11-30", end: "2024-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-02-16", end: "2024-02-29" }, { start: "2024-03-01", end: "2024-03-23" }, { start: "2024-04-01", end: "2024-04-30" }, { start: "2024-11-27", end: "2024-11-29" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-03-24", end: "2024-03-31" }, { start: "2024-12-24", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "oldKeyWest",
  name: "Disney's Old Key West Resort",
  year: 2024,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(OKW_2024, [
    { sunThu: { deluxeStudio:9, oneBedroom:20, twoBedroom:27, threeBedroom:46 },
      friSat: { deluxeStudio:13, oneBedroom:25, twoBedroom:35, threeBedroom:56 } },
    { sunThu: { deluxeStudio:10, oneBedroom:23, twoBedroom:31, threeBedroom:50 },
      friSat: { deluxeStudio:14, oneBedroom:26, twoBedroom:35, threeBedroom:59 } },
    { sunThu: { deluxeStudio:10, oneBedroom:25, twoBedroom:34, threeBedroom:53 },
      friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:38, threeBedroom:64 } },
    { sunThu: { deluxeStudio:11, oneBedroom:26, twoBedroom:36, threeBedroom:56 },
      friSat: { deluxeStudio:16, oneBedroom:30, twoBedroom:41, threeBedroom:69 } },
    { sunThu: { deluxeStudio:13, oneBedroom:28, twoBedroom:39, threeBedroom:59 },
      friSat: { deluxeStudio:17, oneBedroom:34, twoBedroom:44, threeBedroom:71 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:42, threeBedroom:66 },
      friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:49, threeBedroom:79 } },
    { sunThu: { deluxeStudio:22, oneBedroom:40, twoBedroom:57, threeBedroom:82 },
      friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:65, threeBedroom:106 } },
  ]),
});

// === 2025 — 7 travel periods ===
const OKW_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-05-01", end: "2025-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-05-15", end: "2025-06-10" }, { start: "2025-12-01", end: "2025-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-02-15" }, { start: "2025-06-11", end: "2025-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2025-10-01", end: "2025-11-25" }, { start: "2025-11-29", end: "2025-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-02-16", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }, { start: "2025-11-26", end: "2025-11-28" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-04-13", end: "2025-04-20" }, { start: "2025-12-24", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "oldKeyWest",
  name: "Disney's Old Key West Resort",
  year: 2025,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(OKW_2025, [
    { sunThu: { deluxeStudio:9, oneBedroom:20, twoBedroom:27, threeBedroom:46 },
      friSat: { deluxeStudio:13, oneBedroom:25, twoBedroom:35, threeBedroom:56 } },
    { sunThu: { deluxeStudio:10, oneBedroom:23, twoBedroom:31, threeBedroom:50 },
      friSat: { deluxeStudio:14, oneBedroom:26, twoBedroom:35, threeBedroom:59 } },
    { sunThu: { deluxeStudio:10, oneBedroom:25, twoBedroom:34, threeBedroom:53 },
      friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:38, threeBedroom:64 } },
    { sunThu: { deluxeStudio:11, oneBedroom:26, twoBedroom:36, threeBedroom:56 },
      friSat: { deluxeStudio:16, oneBedroom:30, twoBedroom:41, threeBedroom:69 } },
    { sunThu: { deluxeStudio:13, oneBedroom:28, twoBedroom:39, threeBedroom:59 },
      friSat: { deluxeStudio:17, oneBedroom:34, twoBedroom:44, threeBedroom:71 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:42, threeBedroom:66 },
      friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:49, threeBedroom:79 } },
    { sunThu: { deluxeStudio:22, oneBedroom:40, twoBedroom:57, threeBedroom:82 },
      friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:65, threeBedroom:106 } },
  ]),
});

// === 2026 — 7 travel periods ===
const OKW_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-12-24", end: "2026-12-31" }] },
];

RESORTS.push({
  id: "oldKeyWest",
  name: "Disney's Old Key West Resort",
  year: 2026,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(OKW_2026, [
    { sunThu: { deluxeStudio:9, oneBedroom:20, twoBedroom:27, threeBedroom:46 },
      friSat: { deluxeStudio:13, oneBedroom:25, twoBedroom:35, threeBedroom:56 } },
    { sunThu: { deluxeStudio:10, oneBedroom:23, twoBedroom:31, threeBedroom:50 },
      friSat: { deluxeStudio:14, oneBedroom:26, twoBedroom:35, threeBedroom:59 } },
    { sunThu: { deluxeStudio:10, oneBedroom:25, twoBedroom:34, threeBedroom:53 },
      friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:38, threeBedroom:64 } },
    { sunThu: { deluxeStudio:11, oneBedroom:26, twoBedroom:36, threeBedroom:56 },
      friSat: { deluxeStudio:16, oneBedroom:30, twoBedroom:41, threeBedroom:69 } },
    { sunThu: { deluxeStudio:13, oneBedroom:28, twoBedroom:39, threeBedroom:59 },
      friSat: { deluxeStudio:17, oneBedroom:34, twoBedroom:44, threeBedroom:71 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:42, threeBedroom:66 },
      friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:49, threeBedroom:79 } },
    { sunThu: { deluxeStudio:22, oneBedroom:40, twoBedroom:57, threeBedroom:82 },
      friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:65, threeBedroom:106 } },
  ]),
});

// === 2027 — 7 travel periods ===
const OKW_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
  id: "oldKeyWest",
  name: "Disney's Old Key West Resort",
  year: 2027,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(OKW_2027, [
    { sunThu: { deluxeStudio:9, oneBedroom:20, twoBedroom:27, threeBedroom:46 },
      friSat: { deluxeStudio:13, oneBedroom:25, twoBedroom:35, threeBedroom:56 } },
    { sunThu: { deluxeStudio:10, oneBedroom:23, twoBedroom:31, threeBedroom:50 },
      friSat: { deluxeStudio:14, oneBedroom:26, twoBedroom:35, threeBedroom:59 } },
    { sunThu: { deluxeStudio:10, oneBedroom:25, twoBedroom:34, threeBedroom:53 },
      friSat: { deluxeStudio:15, oneBedroom:28, twoBedroom:38, threeBedroom:64 } },
    { sunThu: { deluxeStudio:11, oneBedroom:26, twoBedroom:36, threeBedroom:56 },
      friSat: { deluxeStudio:16, oneBedroom:30, twoBedroom:41, threeBedroom:69 } },
    { sunThu: { deluxeStudio:13, oneBedroom:28, twoBedroom:39, threeBedroom:59 },
      friSat: { deluxeStudio:17, oneBedroom:34, twoBedroom:44, threeBedroom:71 } },
    { sunThu: { deluxeStudio:15, oneBedroom:31, twoBedroom:42, threeBedroom:66 },
      friSat: { deluxeStudio:19, oneBedroom:36, twoBedroom:49, threeBedroom:79 } },
    { sunThu: { deluxeStudio:22, oneBedroom:40, twoBedroom:57, threeBedroom:82 },
      friSat: { deluxeStudio:26, oneBedroom:50, twoBedroom:65, threeBedroom:106 } },
  ]),
});

// ======================================================================
// Disney's Polynesian Villas & Bungalows
// ======================================================================

// === 2017 — 5 travel periods ===
const PVB_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-01-01", end: "2017-01-31" }, { start: "2017-09-01", end: "2017-09-30" }, { start: "2017-12-01", end: "2017-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-10-01", end: "2017-11-21" }, { start: "2017-11-25", end: "2017-11-30" }, { start: "2017-12-15", end: "2017-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2017-02-01", end: "2017-02-15" }, { start: "2017-05-01", end: "2017-06-10" }, { start: "2017-08-16", end: "2017-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-02-16", end: "2017-04-08" }, { start: "2017-04-23", end: "2017-04-30" }, { start: "2017-06-11", end: "2017-08-15" }, { start: "2017-11-22", end: "2017-11-24" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-04-09", end: "2017-04-22" }, { start: "2017-12-24", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "polynesianVillas",
  name: "Disney's Polynesian Villas & Bungalows",
  year: 2017,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "twoBedBungalow", name: "Two-Bedroom Bungalow", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(PVB_2017, [
    { sunThu: { dsR:16, dsP:20, twoBedBungalow:115 },
      friSat: { dsR:19, dsP:24, twoBedBungalow:133 } },
    { sunThu: { dsR:18, dsP:21, twoBedBungalow:120 },
      friSat: { dsR:20, dsP:24, twoBedBungalow:137 } },
    { sunThu: { dsR:21, dsP:25, twoBedBungalow:135 },
      friSat: { dsR:24, dsP:29, twoBedBungalow:159 } },
    { sunThu: { dsR:23, dsP:27, twoBedBungalow:160 },
      friSat: { dsR:27, dsP:32, twoBedBungalow:187 } },
    { sunThu: { dsR:31, dsP:37, twoBedBungalow:197 },
      friSat: { dsR:36, dsP:42, twoBedBungalow:227 } },
  ]),
});

// === 2018 — 5 travel periods ===
const PVB_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-01-01", end: "2018-01-31" }, { start: "2018-09-01", end: "2018-09-30" }, { start: "2018-12-01", end: "2018-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-10-01", end: "2018-11-20" }, { start: "2018-11-24", end: "2018-11-30" }, { start: "2018-12-15", end: "2018-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2018-02-01", end: "2018-02-15" }, { start: "2018-05-01", end: "2018-06-10" }, { start: "2018-08-16", end: "2018-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2018-02-16", end: "2018-03-24" }, { start: "2018-04-08", end: "2018-04-30" }, { start: "2018-06-11", end: "2018-08-15" }, { start: "2018-11-21", end: "2018-11-23" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-03-25", end: "2018-04-07" }, { start: "2018-12-24", end: "2018-12-31" }] },
];

RESORTS.push({
  id: "polynesianVillas",
  name: "Disney's Polynesian Villas & Bungalows",
  year: 2018,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "twoBedBungalow", name: "Two-Bedroom Bungalow", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(PVB_2018, [
    { sunThu: { dsR:16, dsP:20, twoBedBungalow:115 },
      friSat: { dsR:19, dsP:24, twoBedBungalow:133 } },
    { sunThu: { dsR:18, dsP:21, twoBedBungalow:120 },
      friSat: { dsR:20, dsP:24, twoBedBungalow:137 } },
    { sunThu: { dsR:21, dsP:25, twoBedBungalow:135 },
      friSat: { dsR:24, dsP:29, twoBedBungalow:159 } },
    { sunThu: { dsR:23, dsP:27, twoBedBungalow:160 },
      friSat: { dsR:27, dsP:32, twoBedBungalow:187 } },
    { sunThu: { dsR:31, dsP:37, twoBedBungalow:197 },
      friSat: { dsR:36, dsP:42, twoBedBungalow:227 } },
  ]),
});

// === 2019 — 5 travel periods ===
const PVB_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-01", end: "2019-01-31" }, { start: "2019-09-01", end: "2019-09-30" }, { start: "2019-12-01", end: "2019-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-10-01", end: "2019-11-26" }, { start: "2019-11-30", end: "2019-11-30" }, { start: "2019-12-15", end: "2019-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2019-02-01", end: "2019-02-15" }, { start: "2019-05-01", end: "2019-06-10" }, { start: "2019-08-16", end: "2019-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-16", end: "2019-04-13" }, { start: "2019-04-28", end: "2019-04-30" }, { start: "2019-06-11", end: "2019-08-15" }, { start: "2019-11-27", end: "2019-11-29" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-04-14", end: "2019-04-27" }, { start: "2019-12-24", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "polynesianVillas",
  name: "Disney's Polynesian Villas & Bungalows",
  year: 2019,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "twoBedBungalow", name: "Two-Bedroom Bungalow", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(PVB_2019, [
    { sunThu: { dsR:16, dsP:20, twoBedBungalow:115 },
      friSat: { dsR:19, dsP:24, twoBedBungalow:133 } },
    { sunThu: { dsR:18, dsP:21, twoBedBungalow:120 },
      friSat: { dsR:20, dsP:24, twoBedBungalow:137 } },
    { sunThu: { dsR:21, dsP:25, twoBedBungalow:135 },
      friSat: { dsR:24, dsP:29, twoBedBungalow:159 } },
    { sunThu: { dsR:23, dsP:27, twoBedBungalow:160 },
      friSat: { dsR:27, dsP:32, twoBedBungalow:187 } },
    { sunThu: { dsR:31, dsP:37, twoBedBungalow:197 },
      friSat: { dsR:36, dsP:42, twoBedBungalow:227 } },
  ]),
});

// === 2020 — 5 travel periods ===
const PVB_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-09-01", end: "2020-09-30" }, { start: "2020-12-01", end: "2020-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-10-01", end: "2020-11-24" }, { start: "2020-11-28", end: "2020-11-30" }, { start: "2020-12-15", end: "2020-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-02-01", end: "2020-02-15" }, { start: "2020-05-01", end: "2020-06-10" }, { start: "2020-08-16", end: "2020-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-16", end: "2020-04-04" }, { start: "2020-04-19", end: "2020-04-30" }, { start: "2020-06-11", end: "2020-08-15" }, { start: "2020-11-25", end: "2020-11-27" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-04-05", end: "2020-04-18" }, { start: "2020-12-24", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "polynesianVillas",
  name: "Disney's Polynesian Villas & Bungalows",
  year: 2020,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "twoBedBungalow", name: "Two-Bedroom Bungalow", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(PVB_2020, [
    { sunThu: { dsR:16, dsP:20, twoBedBungalow:115 },
      friSat: { dsR:19, dsP:24, twoBedBungalow:133 } },
    { sunThu: { dsR:18, dsP:21, twoBedBungalow:120 },
      friSat: { dsR:20, dsP:24, twoBedBungalow:137 } },
    { sunThu: { dsR:21, dsP:25, twoBedBungalow:135 },
      friSat: { dsR:24, dsP:29, twoBedBungalow:159 } },
    { sunThu: { dsR:23, dsP:27, twoBedBungalow:160 },
      friSat: { dsR:27, dsP:32, twoBedBungalow:187 } },
    { sunThu: { dsR:31, dsP:37, twoBedBungalow:197 },
      friSat: { dsR:36, dsP:42, twoBedBungalow:227 } },
  ]),
});

// === 2021 — 6 travel periods ===
const PVB_2021 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2021-09-01", end: "2021-09-19" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-09-20", end: "2021-09-30" }, { start: "2021-12-01", end: "2021-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2021-05-01", end: "2021-06-10" }, { start: "2021-10-01", end: "2021-11-23" }, { start: "2021-11-27", end: "2021-11-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2021-02-01", end: "2021-02-15" }, { start: "2021-08-16", end: "2021-08-31" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2021-04-11", end: "2021-04-30" }, { start: "2021-06-11", end: "2021-08-15" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2021-02-16", end: "2021-02-28" }, { start: "2021-03-01", end: "2021-03-27" }, { start: "2021-04-05", end: "2021-04-10" }, { start: "2021-11-24", end: "2021-11-26" }] },
];

RESORTS.push({
  id: "polynesianVillas",
  name: "Disney's Polynesian Villas & Bungalows",
  year: 2021,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "twoBedBungalow", name: "Two-Bedroom Bungalow", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(PVB_2021, [
    { sunThu: { dsR:15, dsP:19, twoBedBungalow:115 },
      friSat: { dsR:18, dsP:24, twoBedBungalow:133 } },
    { sunThu: { dsR:17, dsP:21, twoBedBungalow:120 },
      friSat: { dsR:20, dsP:24, twoBedBungalow:137 } },
    { sunThu: { dsR:19, dsP:23, twoBedBungalow:130 },
      friSat: { dsR:22, dsP:26, twoBedBungalow:149 } },
    { sunThu: { dsR:21, dsP:25, twoBedBungalow:136 },
      friSat: { dsR:24, dsP:29, twoBedBungalow:160 } },
    { sunThu: { dsR:23, dsP:26, twoBedBungalow:154 },
      friSat: { dsR:26, dsP:32, twoBedBungalow:176 } },
    { sunThu: { dsR:24, dsP:28, twoBedBungalow:162 },
      friSat: { dsR:27, dsP:32, twoBedBungalow:187 } },
  ]),
});

// === 2022 — 6 travel periods ===
const PVB_2022 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2022-09-01", end: "2022-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-12-01", end: "2022-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2022-05-01", end: "2022-06-10" }, { start: "2022-12-15", end: "2022-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2022-02-01", end: "2022-02-15" }, { start: "2022-06-11", end: "2022-08-31" }, { start: "2022-10-01", end: "2022-11-22" }, { start: "2022-11-26", end: "2022-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2022-04-24", end: "2022-04-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2022-02-16", end: "2022-02-28" }, { start: "2022-03-01", end: "2022-04-09" }, { start: "2022-04-18", end: "2022-04-23" }, { start: "2022-11-23", end: "2022-11-25" }] },
];

RESORTS.push({
  id: "polynesianVillas",
  name: "Disney's Polynesian Villas & Bungalows",
  year: 2022,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "twoBedBungalow", name: "Two-Bedroom Bungalow", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(PVB_2022, [
    { sunThu: { dsR:14, dsP:19, twoBedBungalow:113 },
      friSat: { dsR:17, dsP:24, twoBedBungalow:132 } },
    { sunThu: { dsR:17, dsP:22, twoBedBungalow:120 },
      friSat: { dsR:20, dsP:24, twoBedBungalow:138 } },
    { sunThu: { dsR:18, dsP:22, twoBedBungalow:130 },
      friSat: { dsR:22, dsP:26, twoBedBungalow:149 } },
    { sunThu: { dsR:21, dsP:25, twoBedBungalow:140 },
      friSat: { dsR:24, dsP:28, twoBedBungalow:161 } },
    { sunThu: { dsR:23, dsP:26, twoBedBungalow:154 },
      friSat: { dsR:26, dsP:32, twoBedBungalow:176 } },
    { sunThu: { dsR:25, dsP:28, twoBedBungalow:164 },
      friSat: { dsR:28, dsP:32, twoBedBungalow:187 } },
  ]),
});

// === 2023 — 7 travel periods ===
const PVB_2023 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2023-09-01", end: "2023-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-05-01", end: "2023-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2023-05-15", end: "2023-06-10" }, { start: "2023-12-01", end: "2023-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2023-02-01", end: "2023-02-15" }, { start: "2023-06-11", end: "2023-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2023-10-01", end: "2023-11-21" }, { start: "2023-11-25", end: "2023-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2023-02-16", end: "2023-02-28" }, { start: "2023-03-01", end: "2023-04-01" }, { start: "2023-04-10", end: "2023-04-30" }, { start: "2023-11-22", end: "2023-11-24" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2023-04-02", end: "2023-04-09" }, { start: "2023-12-24", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "polynesianVillas",
  name: "Disney's Polynesian Villas & Bungalows",
  year: 2023,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "twoBedBungalow", name: "Two-Bedroom Bungalow", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(PVB_2023, [
    { sunThu: { dsR:14, dsP:19, twoBedBungalow:112 },
      friSat: { dsR:17, dsP:24, twoBedBungalow:132 } },
    { sunThu: { dsR:17, dsP:22, twoBedBungalow:120 },
      friSat: { dsR:20, dsP:24, twoBedBungalow:138 } },
    { sunThu: { dsR:19, dsP:22, twoBedBungalow:128 },
      friSat: { dsR:22, dsP:26, twoBedBungalow:147 } },
    { sunThu: { dsR:20, dsP:24, twoBedBungalow:136 },
      friSat: { dsR:23, dsP:27, twoBedBungalow:157 } },
    { sunThu: { dsR:22, dsP:25, twoBedBungalow:150 },
      friSat: { dsR:25, dsP:30, twoBedBungalow:172 } },
    { sunThu: { dsR:25, dsP:28, twoBedBungalow:162 },
      friSat: { dsR:28, dsP:32, twoBedBungalow:185 } },
    { sunThu: { dsR:34, dsP:41, twoBedBungalow:199 },
      friSat: { dsR:36, dsP:43, twoBedBungalow:226 } },
  ]),
});

// === 2024 — 7 travel periods ===
const PVB_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-05-01", end: "2024-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-05-15", end: "2024-06-10" }, { start: "2024-12-01", end: "2024-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-02-01", end: "2024-02-15" }, { start: "2024-06-11", end: "2024-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2024-10-01", end: "2024-11-26" }, { start: "2024-11-30", end: "2024-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-02-16", end: "2024-02-29" }, { start: "2024-03-01", end: "2024-03-23" }, { start: "2024-04-01", end: "2024-04-30" }, { start: "2024-11-27", end: "2024-11-29" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-03-24", end: "2024-03-31" }, { start: "2024-12-24", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "polynesianVillas",
  name: "Disney's Polynesian Villas & Bungalows",
  year: 2024,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "twoBedBungalow", name: "Two-Bedroom Bungalow", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(PVB_2024, [
    { sunThu: { dsR:14, dsP:19, twoBedBungalow:112 },
      friSat: { dsR:17, dsP:24, twoBedBungalow:132 } },
    { sunThu: { dsR:17, dsP:22, twoBedBungalow:120 },
      friSat: { dsR:20, dsP:24, twoBedBungalow:138 } },
    { sunThu: { dsR:19, dsP:22, twoBedBungalow:128 },
      friSat: { dsR:22, dsP:26, twoBedBungalow:147 } },
    { sunThu: { dsR:20, dsP:24, twoBedBungalow:136 },
      friSat: { dsR:23, dsP:27, twoBedBungalow:157 } },
    { sunThu: { dsR:22, dsP:25, twoBedBungalow:150 },
      friSat: { dsR:25, dsP:30, twoBedBungalow:172 } },
    { sunThu: { dsR:25, dsP:28, twoBedBungalow:162 },
      friSat: { dsR:28, dsP:32, twoBedBungalow:185 } },
    { sunThu: { dsR:34, dsP:41, twoBedBungalow:199 },
      friSat: { dsR:36, dsP:43, twoBedBungalow:226 } },
  ]),
});

// === 2025 — 7 travel periods ===
const PVB_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-05-01", end: "2025-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-05-15", end: "2025-06-10" }, { start: "2025-12-01", end: "2025-12-23" }, { start: "2025-12-17", end: "2025-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-02-15" }, { start: "2025-06-11", end: "2025-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2025-10-01", end: "2025-11-25" }, { start: "2025-11-29", end: "2025-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-02-16", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }, { start: "2025-11-26", end: "2025-11-28" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-04-13", end: "2025-04-20" }, { start: "2025-12-24", end: "2025-12-31" }, { start: "2025-12-24", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "polynesianVillas",
  name: "Disney's Polynesian Villas & Bungalows",
  year: 2025,
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
  travelPeriods: buildPeriods(PVB_2025, [
    { sunThu: { dsR:14, dsP:19, twoBedBungalow:112, duoR:12, duoP:16, duoPM:19, dsTP:24, oneR:28, oneP:38, oneTP:42, twoR:44, twoP:54, twoTP:68, penthouseP:86, penthouseTP:108 },
      friSat: { dsR:17, dsP:24, twoBedBungalow:132, duoR:14, duoP:19, duoPM:23, dsTP:29, oneR:34, oneP:46, oneTP:51, twoR:53, twoP:65, twoTP:79, penthouseP:104, penthouseTP:128 } },
    { sunThu: { dsR:17, dsP:22, twoBedBungalow:120, duoR:14, duoP:18, duoPM:21, dsTP:26, oneR:34, oneP:42, oneTP:47, twoR:48, twoP:60, twoTP:71, penthouseP:95, penthouseTP:117 },
      friSat: { dsR:20, dsP:24, twoBedBungalow:138, duoR:16, duoP:20, duoPM:24, dsTP:30, oneR:40, oneP:48, oneTP:54, twoR:56, twoP:68, twoTP:84, penthouseP:112, penthouseTP:135 } },
    { sunThu: { dsR:19, dsP:22, twoBedBungalow:128, duoR:16, duoP:19, duoPM:22, dsTP:27, oneR:38, oneP:47, oneTP:53, twoR:54, twoP:62, twoTP:76, penthouseP:102, penthouseTP:122 },
      friSat: { dsR:22, dsP:26, twoBedBungalow:147, duoR:18, duoP:21, duoPM:26, dsTP:32, oneR:44, oneP:52, oneTP:61, twoR:62, twoP:73, twoTP:90, penthouseP:119, penthouseTP:144 } },
    { sunThu: { dsR:20, dsP:24, twoBedBungalow:136, duoR:17, duoP:20, duoPM:24, dsTP:29, oneR:40, oneP:48, oneTP:54, twoR:56, twoP:68, twoTP:82, penthouseP:108, penthouseTP:128 },
      friSat: { dsR:23, dsP:27, twoBedBungalow:157, duoR:19, duoP:22, duoPM:27, dsTP:33, oneR:46, oneP:54, oneTP:63, twoR:65, twoP:79, twoTP:96, penthouseP:122, penthouseTP:152 } },
    { sunThu: { dsR:22, dsP:25, twoBedBungalow:150, duoR:18, duoP:21, duoPM:26, dsTP:31, oneR:44, oneP:53, oneTP:58, twoR:62, twoP:73, twoTP:90, penthouseP:115, penthouseTP:140 },
      friSat: { dsR:25, dsP:30, twoBedBungalow:172, duoR:20, duoP:24, duoPM:29, dsTP:36, oneR:50, oneP:60, oneTP:67, twoR:70, twoP:84, twoTP:101, penthouseP:132, penthouseTP:162 } },
    { sunThu: { dsR:25, dsP:28, twoBedBungalow:162, duoR:20, duoP:23, duoPM:28, dsTP:34, oneR:48, oneP:54, oneTP:65, twoR:68, twoP:79, twoTP:96, penthouseP:126, penthouseTP:153 },
      friSat: { dsR:28, dsP:32, twoBedBungalow:185, duoR:23, duoP:26, duoPM:32, dsTP:39, oneR:56, oneP:64, oneTP:75, twoR:79, twoP:90, twoTP:110, penthouseP:144, penthouseTP:179 } },
    { sunThu: { dsR:34, dsP:41, twoBedBungalow:199, duoR:27, duoP:32, duoPM:39, dsTP:48, oneR:68, oneP:78, oneTP:89, twoR:92, twoP:109, twoTP:128, penthouseP:178, penthouseTP:197 },
      friSat: { dsR:36, dsP:43, twoBedBungalow:226, duoR:30, duoP:36, duoPM:43, dsTP:53, oneR:78, oneP:86, oneTP:98, twoR:105, twoP:125, twoTP:149, penthouseP:198, penthouseTP:226 } },
  ]),
});

// === 2026 — 7 travel periods ===
const PVB_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-12-24", end: "2026-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(PVB_2026, [
    { sunThu: { dsR:14, dsP:19, twoBedBungalow:112, duoR:12, duoP:16, duoPM:19, dsTP:24, oneR:28, oneP:38, oneTP:42, twoR:44, twoP:54, twoTP:68, penthouseP:86, penthouseTP:108 },
      friSat: { dsR:17, dsP:24, twoBedBungalow:132, duoR:14, duoP:19, duoPM:23, dsTP:29, oneR:34, oneP:46, oneTP:51, twoR:53, twoP:65, twoTP:79, penthouseP:104, penthouseTP:128 } },
    { sunThu: { dsR:17, dsP:22, twoBedBungalow:120, duoR:14, duoP:18, duoPM:21, dsTP:26, oneR:34, oneP:42, oneTP:47, twoR:48, twoP:60, twoTP:71, penthouseP:95, penthouseTP:117 },
      friSat: { dsR:20, dsP:24, twoBedBungalow:138, duoR:16, duoP:20, duoPM:24, dsTP:30, oneR:40, oneP:48, oneTP:54, twoR:56, twoP:68, twoTP:84, penthouseP:112, penthouseTP:135 } },
    { sunThu: { dsR:19, dsP:22, twoBedBungalow:128, duoR:16, duoP:19, duoPM:22, dsTP:27, oneR:38, oneP:47, oneTP:53, twoR:54, twoP:62, twoTP:76, penthouseP:102, penthouseTP:122 },
      friSat: { dsR:22, dsP:26, twoBedBungalow:147, duoR:18, duoP:21, duoPM:26, dsTP:32, oneR:44, oneP:52, oneTP:61, twoR:62, twoP:73, twoTP:90, penthouseP:119, penthouseTP:144 } },
    { sunThu: { dsR:20, dsP:24, twoBedBungalow:136, duoR:17, duoP:20, duoPM:24, dsTP:29, oneR:40, oneP:48, oneTP:54, twoR:56, twoP:68, twoTP:82, penthouseP:108, penthouseTP:128 },
      friSat: { dsR:23, dsP:27, twoBedBungalow:157, duoR:19, duoP:22, duoPM:27, dsTP:33, oneR:46, oneP:54, oneTP:63, twoR:65, twoP:79, twoTP:96, penthouseP:122, penthouseTP:152 } },
    { sunThu: { dsR:22, dsP:25, twoBedBungalow:150, duoR:18, duoP:21, duoPM:26, dsTP:31, oneR:44, oneP:53, oneTP:58, twoR:62, twoP:73, twoTP:90, penthouseP:115, penthouseTP:140 },
      friSat: { dsR:25, dsP:30, twoBedBungalow:172, duoR:20, duoP:24, duoPM:29, dsTP:36, oneR:50, oneP:60, oneTP:67, twoR:70, twoP:84, twoTP:101, penthouseP:132, penthouseTP:162 } },
    { sunThu: { dsR:25, dsP:28, twoBedBungalow:162, duoR:20, duoP:23, duoPM:28, dsTP:34, oneR:48, oneP:54, oneTP:65, twoR:68, twoP:79, twoTP:96, penthouseP:126, penthouseTP:153 },
      friSat: { dsR:28, dsP:32, twoBedBungalow:185, duoR:23, duoP:26, duoPM:32, dsTP:39, oneR:56, oneP:64, oneTP:75, twoR:79, twoP:90, twoTP:110, penthouseP:144, penthouseTP:179 } },
    { sunThu: { dsR:34, dsP:41, twoBedBungalow:199, duoR:27, duoP:32, duoPM:39, dsTP:48, oneR:68, oneP:78, oneTP:89, twoR:92, twoP:109, twoTP:128, penthouseP:178, penthouseTP:197 },
      friSat: { dsR:36, dsP:43, twoBedBungalow:226, duoR:30, duoP:36, duoPM:43, dsTP:53, oneR:78, oneP:86, oneTP:98, twoR:105, twoP:125, twoTP:149, penthouseP:198, penthouseTP:226 } },
  ]),
});

// === 2027 — 7 travel periods ===
const PVB_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
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
    { id: "oneR", name: "One-Bedroom Villa - Resort View (Tower)", sleeps: 5 },
    { id: "oneP", name: "One-Bedroom Villa - Preferred View (Tower)", sleeps: 5 },
    { id: "oneTP", name: "One-Bedroom Villa - Theme Park View (Tower)", sleeps: 5 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View (Tower)", sleeps: 9 },
    { id: "twoP", name: "Two-Bedroom Villa - Preferred View (Tower)", sleeps: 9 },
    { id: "twoTP", name: "Two-Bedroom Villa - Theme Park View (Tower)", sleeps: 9 },
    { id: "penthouseP", name: "Two-Bedroom Penthouse - Preferred (Tower)", sleeps: 8 },
    { id: "penthouseTP", name: "Two-Bedroom Penthouse - Theme Park (Tower)", sleeps: 8 },
  ],
  travelPeriods: buildPeriods(PVB_2027, [
    { sunThu: { dsR:15, dsP:20, twoBedBungalow:114, duoR:13, duoP:17, duoPM:20, dsTP:25, oneR:30, oneP:39, oneTP:44, twoR:46, twoP:56, twoTP:70, penthouseP:88, penthouseTP:110 },
      friSat: { dsR:18, dsP:24, twoBedBungalow:134, duoR:15, duoP:20, duoPM:24, dsTP:30, oneR:36, oneP:47, oneTP:53, twoR:55, twoP:67, twoTP:81, penthouseP:105, penthouseTP:129 } },
    { sunThu: { dsR:17, dsP:22, twoBedBungalow:122, duoR:14, duoP:18, duoPM:21, dsTP:26, oneR:34, oneP:42, oneTP:47, twoR:49, twoP:61, twoTP:72, penthouseP:96, penthouseTP:118 },
      friSat: { dsR:20, dsP:24, twoBedBungalow:140, duoR:16, duoP:20, duoPM:24, dsTP:30, oneR:40, oneP:48, oneTP:54, twoR:57, twoP:69, twoTP:85, penthouseP:113, penthouseTP:136 } },
    { sunThu: { dsR:19, dsP:22, twoBedBungalow:128, duoR:16, duoP:19, duoPM:22, dsTP:27, oneR:38, oneP:47, oneTP:53, twoR:54, twoP:62, twoTP:76, penthouseP:102, penthouseTP:122 },
      friSat: { dsR:22, dsP:26, twoBedBungalow:147, duoR:18, duoP:21, duoPM:26, dsTP:32, oneR:44, oneP:52, oneTP:61, twoR:62, twoP:73, twoTP:90, penthouseP:119, penthouseTP:144 } },
    { sunThu: { dsR:20, dsP:24, twoBedBungalow:136, duoR:17, duoP:20, duoPM:24, dsTP:29, oneR:40, oneP:48, oneTP:54, twoR:56, twoP:68, twoTP:82, penthouseP:108, penthouseTP:128 },
      friSat: { dsR:23, dsP:27, twoBedBungalow:157, duoR:19, duoP:22, duoPM:27, dsTP:33, oneR:46, oneP:54, oneTP:63, twoR:65, twoP:79, twoTP:96, penthouseP:122, penthouseTP:152 } },
    { sunThu: { dsR:22, dsP:25, twoBedBungalow:150, duoR:18, duoP:21, duoPM:26, dsTP:31, oneR:44, oneP:53, oneTP:58, twoR:62, twoP:73, twoTP:90, penthouseP:115, penthouseTP:140 },
      friSat: { dsR:25, dsP:30, twoBedBungalow:172, duoR:20, duoP:24, duoPM:29, dsTP:36, oneR:50, oneP:60, oneTP:67, twoR:70, twoP:84, twoTP:101, penthouseP:132, penthouseTP:162 } },
    { sunThu: { dsR:25, dsP:28, twoBedBungalow:162, duoR:20, duoP:23, duoPM:28, dsTP:34, oneR:48, oneP:54, oneTP:65, twoR:68, twoP:79, twoTP:96, penthouseP:126, penthouseTP:153 },
      friSat: { dsR:28, dsP:32, twoBedBungalow:185, duoR:23, duoP:26, duoPM:32, dsTP:39, oneR:56, oneP:64, oneTP:75, twoR:79, twoP:90, twoTP:110, penthouseP:144, penthouseTP:179 } },
    { sunThu: { dsR:34, dsP:41, twoBedBungalow:199, duoR:27, duoP:32, duoPM:39, dsTP:48, oneR:68, oneP:78, oneTP:89, twoR:92, twoP:109, twoTP:128, penthouseP:178, penthouseTP:197 },
      friSat: { dsR:36, dsP:43, twoBedBungalow:226, duoR:30, duoP:36, duoPM:43, dsTP:53, oneR:78, oneP:86, oneTP:98, twoR:105, twoP:125, twoTP:149, penthouseP:198, penthouseTP:226 } },
  ]),
});

// ======================================================================
// Disney's Riviera Resort
// ======================================================================

// === 2020 — 5 travel periods ===
const RIV_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-09-01", end: "2020-09-30" }, { start: "2020-12-01", end: "2020-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-10-01", end: "2020-11-24" }, { start: "2020-11-28", end: "2020-11-30" }, { start: "2020-12-15", end: "2020-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-02-01", end: "2020-02-15" }, { start: "2020-05-01", end: "2020-06-10" }, { start: "2020-08-16", end: "2020-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-16", end: "2020-04-04" }, { start: "2020-04-19", end: "2020-04-30" }, { start: "2020-06-11", end: "2020-08-15" }, { start: "2020-11-25", end: "2020-11-27" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-04-05", end: "2020-04-18" }, { start: "2020-12-24", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "rivieraResort",
  name: "Disney's Riviera Resort",
  year: 2020,
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
  travelPeriods: buildPeriods(RIV_2020, [
    { sunThu: { towerStudio:11, dsR:15, dsP:18, oneR:31, oneP:38, twoR:40, twoP:49, threeBedroom:104 },
      friSat: { towerStudio:13, dsR:17, dsP:22, oneR:36, oneP:47, twoR:48, twoP:58, threeBedroom:122 } },
    { sunThu: { towerStudio:12, dsR:16, dsP:20, oneR:33, oneP:41, twoR:43, twoP:52, threeBedroom:108 },
      friSat: { towerStudio:15, dsR:19, dsP:24, oneR:41, oneP:50, twoR:50, twoP:60, threeBedroom:128 } },
    { sunThu: { towerStudio:15, dsR:18, dsP:22, oneR:38, oneP:49, twoR:50, twoP:59, threeBedroom:120 },
      friSat: { towerStudio:17, dsR:20, dsP:26, oneR:48, oneP:58, twoR:59, twoP:70, threeBedroom:140 } },
    { sunThu: { towerStudio:18, dsR:22, dsP:26, oneR:43, oneP:53, twoR:56, twoP:70, threeBedroom:140 },
      friSat: { towerStudio:21, dsR:25, dsP:30, oneR:53, oneP:63, twoR:65, twoP:79, threeBedroom:165 } },
    { sunThu: { towerStudio:22, dsR:28, dsP:33, oneR:57, oneP:67, twoR:75, twoP:85, threeBedroom:170 },
      friSat: { towerStudio:26, dsR:32, dsP:39, oneR:68, oneP:80, twoR:88, twoP:100, threeBedroom:205 } },
  ]),
});

// === 2021 — 7 travel periods ===
const RIV_2021 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2021-09-01", end: "2021-09-19" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-09-20", end: "2021-09-30" }, { start: "2021-12-01", end: "2021-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2021-05-01", end: "2021-06-10" }, { start: "2021-10-01", end: "2021-11-23" }, { start: "2021-11-27", end: "2021-11-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2021-02-01", end: "2021-02-15" }, { start: "2021-08-16", end: "2021-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2021-04-11", end: "2021-04-30" }, { start: "2021-06-11", end: "2021-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2021-02-16", end: "2021-02-28" }, { start: "2021-03-01", end: "2021-03-27" }, { start: "2021-04-05", end: "2021-04-10" }, { start: "2021-11-24", end: "2021-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2021-03-28", end: "2021-04-04" }, { start: "2021-12-24", end: "2021-12-31" }] },
];

RESORTS.push({
  id: "rivieraResort",
  name: "Disney's Riviera Resort",
  year: 2021,
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
  travelPeriods: buildPeriods(RIV_2021, [
    { sunThu: { towerStudio:9, dsR:14, dsP:17, oneR:30, oneP:37, twoR:39, twoP:48, threeBedroom:103 },
      friSat: { towerStudio:13, dsR:17, dsP:22, oneR:35, oneP:47, twoR:48, twoP:58, threeBedroom:120 } },
    { sunThu: { towerStudio:12, dsR:16, dsP:19, oneR:33, oneP:41, twoR:43, twoP:51, threeBedroom:108 },
      friSat: { towerStudio:14, dsR:18, dsP:24, oneR:39, oneP:50, twoR:49, twoP:61, threeBedroom:127 } },
    { sunThu: { towerStudio:13, dsR:17, dsP:21, oneR:34, oneP:45, twoR:47, twoP:56, threeBedroom:117 },
      friSat: { towerStudio:17, dsR:19, dsP:25, oneR:45, oneP:54, twoR:55, twoP:66, threeBedroom:136 } },
    { sunThu: { towerStudio:15, dsR:18, dsP:22, oneR:38, oneP:49, twoR:50, twoP:60, threeBedroom:120 },
      friSat: { towerStudio:17, dsR:21, dsP:26, oneR:48, oneP:58, twoR:60, twoP:70, threeBedroom:140 } },
    { sunThu: { towerStudio:17, dsR:20, dsP:25, oneR:40, oneP:50, twoR:54, twoP:68, threeBedroom:135 },
      friSat: { towerStudio:19, dsR:23, dsP:29, oneR:50, oneP:60, twoR:64, twoP:77, threeBedroom:160 } },
    { sunThu: { towerStudio:18, dsR:22, dsP:26, oneR:43, oneP:53, twoR:56, twoP:70, threeBedroom:140 },
      friSat: { towerStudio:21, dsR:25, dsP:31, oneR:53, oneP:63, twoR:65, twoP:80, threeBedroom:165 } },
    { sunThu: { towerStudio:23, dsR:29, dsP:35, oneR:58, oneP:68, twoR:77, twoP:88, threeBedroom:172 },
      friSat: { towerStudio:27, dsR:33, dsP:40, oneR:69, oneP:81, twoR:90, twoP:103, threeBedroom:205 } },
  ]),
});

// === 2022 — 7 travel periods ===
const RIV_2022 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2022-09-01", end: "2022-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-12-01", end: "2022-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2022-05-01", end: "2022-06-10" }, { start: "2022-12-15", end: "2022-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2022-02-01", end: "2022-02-15" }, { start: "2022-06-11", end: "2022-08-31" }, { start: "2022-10-01", end: "2022-11-22" }, { start: "2022-11-26", end: "2022-11-30" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2022-04-24", end: "2022-04-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2022-02-16", end: "2022-02-28" }, { start: "2022-03-01", end: "2022-04-09" }, { start: "2022-04-18", end: "2022-04-23" }, { start: "2022-11-23", end: "2022-11-25" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2022-04-10", end: "2022-04-17" }, { start: "2022-12-24", end: "2022-12-31" }] },
];

RESORTS.push({
  id: "rivieraResort",
  name: "Disney's Riviera Resort",
  year: 2022,
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
  travelPeriods: buildPeriods(RIV_2022, [
    { sunThu: { towerStudio:10, dsR:14, dsP:17, oneR:29, oneP:36, twoR:38, twoP:47, threeBedroom:103 },
      friSat: { towerStudio:13, dsR:17, dsP:22, oneR:34, oneP:46, twoR:47, twoP:58, threeBedroom:120 } },
    { sunThu: { towerStudio:12, dsR:16, dsP:19, oneR:34, oneP:41, twoR:44, twoP:52, threeBedroom:108 },
      friSat: { towerStudio:14, dsR:18, dsP:24, oneR:39, oneP:50, twoR:49, twoP:61, threeBedroom:127 } },
    { sunThu: { towerStudio:13, dsR:17, dsP:20, oneR:35, oneP:44, twoR:47, twoP:55, threeBedroom:118 },
      friSat: { towerStudio:15, dsR:19, dsP:26, oneR:42, oneP:54, twoR:53, twoP:67, threeBedroom:137 } },
    { sunThu: { towerStudio:14, dsR:18, dsP:22, oneR:37, oneP:49, twoR:51, twoP:61, threeBedroom:123 },
      friSat: { towerStudio:18, dsR:20, dsP:27, oneR:49, oneP:59, twoR:60, twoP:72, threeBedroom:144 } },
    { sunThu: { towerStudio:18, dsR:20, dsP:25, oneR:40, oneP:50, twoR:54, twoP:68, threeBedroom:135 },
      friSat: { towerStudio:19, dsR:23, dsP:29, oneR:50, oneP:60, twoR:64, twoP:77, threeBedroom:160 } },
    { sunThu: { towerStudio:18, dsR:21, dsP:27, oneR:43, oneP:53, twoR:56, twoP:71, threeBedroom:141 },
      friSat: { towerStudio:20, dsR:25, dsP:31, oneR:53, oneP:63, twoR:65, twoP:80, threeBedroom:166 } },
    { sunThu: { towerStudio:24, dsR:29, dsP:35, oneR:58, oneP:68, twoR:77, twoP:88, threeBedroom:172 },
      friSat: { towerStudio:28, dsR:32, dsP:40, oneR:69, oneP:81, twoR:90, twoP:103, threeBedroom:205 } },
  ]),
});

// === 2023 — 7 travel periods ===
const RIV_2023 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2023-09-01", end: "2023-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-05-01", end: "2023-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2023-05-15", end: "2023-06-10" }, { start: "2023-12-01", end: "2023-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2023-02-01", end: "2023-02-15" }, { start: "2023-06-11", end: "2023-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2023-10-01", end: "2023-11-21" }, { start: "2023-11-25", end: "2023-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2023-02-16", end: "2023-02-28" }, { start: "2023-03-01", end: "2023-04-01" }, { start: "2023-04-10", end: "2023-04-30" }, { start: "2023-11-22", end: "2023-11-24" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2023-04-02", end: "2023-04-09" }, { start: "2023-12-24", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "rivieraResort",
  name: "Disney's Riviera Resort",
  year: 2023,
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
  travelPeriods: buildPeriods(RIV_2023, [
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
});

// === 2024 — 7 travel periods ===
const RIV_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-05-01", end: "2024-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-05-15", end: "2024-06-10" }, { start: "2024-12-01", end: "2024-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-02-01", end: "2024-02-15" }, { start: "2024-06-11", end: "2024-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2024-10-01", end: "2024-11-26" }, { start: "2024-11-30", end: "2024-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-02-16", end: "2024-02-29" }, { start: "2024-03-01", end: "2024-03-23" }, { start: "2024-04-01", end: "2024-04-30" }, { start: "2024-11-27", end: "2024-11-29" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-03-24", end: "2024-03-31" }, { start: "2024-12-24", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "rivieraResort",
  name: "Disney's Riviera Resort",
  year: 2024,
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
  travelPeriods: buildPeriods(RIV_2024, [
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
});

// === 2025 — 7 travel periods ===
const RIV_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-05-01", end: "2025-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-05-15", end: "2025-06-10" }, { start: "2025-12-01", end: "2025-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-02-15" }, { start: "2025-06-11", end: "2025-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2025-10-01", end: "2025-11-25" }, { start: "2025-11-29", end: "2025-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-02-16", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }, { start: "2025-11-26", end: "2025-11-28" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-04-13", end: "2025-04-20" }, { start: "2025-12-24", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "rivieraResort",
  name: "Disney's Riviera Resort",
  year: 2025,
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
  travelPeriods: buildPeriods(RIV_2025, [
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
});

// === 2026 — 7 travel periods ===
const RIV_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-12-24", end: "2026-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(RIV_2026, [
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
});

// === 2027 — 7 travel periods ===
const RIV_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(RIV_2027, [
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
});

// ======================================================================
// Disney's Saratoga Springs Resort & Spa
// ======================================================================

// === 2016 — 5 travel periods ===
const SSR_2016 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2016-01-01", end: "2016-01-31" }, { start: "2016-09-01", end: "2016-09-30" }, { start: "2016-12-01", end: "2016-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2016-10-01", end: "2016-11-22" }, { start: "2016-11-26", end: "2016-11-30" }, { start: "2016-12-15", end: "2016-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2016-02-01", end: "2016-02-15" }, { start: "2016-05-01", end: "2016-06-10" }, { start: "2016-08-16", end: "2016-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2016-02-16", end: "2016-03-19" }, { start: "2016-04-03", end: "2016-04-30" }, { start: "2016-06-11", end: "2016-08-15" }, { start: "2016-11-23", end: "2016-11-25" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2016-03-20", end: "2016-04-02" }, { start: "2016-12-24", end: "2016-12-31" }] },
];

RESORTS.push({
  id: "saratogaSprings",
  name: "Disney's Saratoga Springs Resort & Spa",
  year: 2016,
  roomTypes: [
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "treehouse", name: "Three-Bedroom Treehouse Villa", sleeps: 9 },
    { id: "threeBedroom", name: "Three-Bedroom Grand Villa", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(SSR_2016, [
    { sunThu: { deluxeStudio:12, oneBedroom:24, twoBedroom:33, treehouse:39, threeBedroom:67 },
      friSat: { deluxeStudio:15, oneBedroom:29, twoBedroom:37, treehouse:43, threeBedroom:75 } },
    { sunThu: { deluxeStudio:14, oneBedroom:28, twoBedroom:36, treehouse:41, threeBedroom:71 },
      friSat: { deluxeStudio:17, oneBedroom:33, twoBedroom:41, treehouse:45, threeBedroom:81 } },
    { sunThu: { deluxeStudio:14, oneBedroom:31, twoBedroom:37, treehouse:45, threeBedroom:79 },
      friSat: { deluxeStudio:18, oneBedroom:36, twoBedroom:42, treehouse:52, threeBedroom:90 } },
    { sunThu: { deluxeStudio:16, oneBedroom:33, twoBedroom:43, treehouse:50, threeBedroom:97 },
      friSat: { deluxeStudio:20, oneBedroom:38, twoBedroom:50, treehouse:58, threeBedroom:112 } },
    { sunThu: { deluxeStudio:21, oneBedroom:44, twoBedroom:57, treehouse:65, threeBedroom:115 },
      friSat: { deluxeStudio:27, oneBedroom:49, twoBedroom:66, treehouse:76, threeBedroom:130 } },
  ]),
});

// === 2017 — 5 travel periods ===
const SSR_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-01-01", end: "2017-01-31" }, { start: "2017-09-01", end: "2017-09-30" }, { start: "2017-12-01", end: "2017-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-10-01", end: "2017-11-21" }, { start: "2017-11-25", end: "2017-11-30" }, { start: "2017-12-15", end: "2017-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2017-02-01", end: "2017-02-15" }, { start: "2017-05-01", end: "2017-06-10" }, { start: "2017-08-16", end: "2017-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-02-16", end: "2017-04-08" }, { start: "2017-04-23", end: "2017-04-30" }, { start: "2017-06-11", end: "2017-08-15" }, { start: "2017-11-22", end: "2017-11-24" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-04-09", end: "2017-04-22" }, { start: "2017-12-24", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "saratogaSprings",
  name: "Disney's Saratoga Springs Resort & Spa",
  year: 2017,
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
  travelPeriods: buildPeriods(SSR_2017, [
    { sunThu: { dsS:11, dsP:13, oneS:22, oneP:26, twoS:30, twoP:37, threeS:64, threeP:75, treehouse:39 },
      friSat: { dsS:14, dsP:16, oneS:27, oneP:31, twoS:34, twoP:41, threeS:72, threeP:84, treehouse:43 } },
    { sunThu: { dsS:12, dsP:15, oneS:26, oneP:30, twoS:33, twoP:40, threeS:68, threeP:77, treehouse:41 },
      friSat: { dsS:16, dsP:18, oneS:31, oneP:36, twoS:38, twoP:45, threeS:79, threeP:89, treehouse:45 } },
    { sunThu: { dsS:13, dsP:15, oneS:29, oneP:32, twoS:34, twoP:41, threeS:76, threeP:87, treehouse:45 },
      friSat: { dsS:17, dsP:19, oneS:34, oneP:38, twoS:39, twoP:49, threeS:87, threeP:99, treehouse:52 } },
    { sunThu: { dsS:14, dsP:17, oneS:31, oneP:36, twoS:40, twoP:46, threeS:94, threeP:110, treehouse:50 },
      friSat: { dsS:18, dsP:21, oneS:36, oneP:41, twoS:47, twoP:57, threeS:109, threeP:125, treehouse:58 } },
    { sunThu: { dsS:20, dsP:22, oneS:42, oneP:48, twoS:54, twoP:65, threeS:112, threeP:131, treehouse:65 },
      friSat: { dsS:25, dsP:28, oneS:47, oneP:53, twoS:63, twoP:75, threeS:126, threeP:139, treehouse:76 } },
  ]),
});

// === 2018 — 5 travel periods ===
const SSR_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-01-01", end: "2018-01-31" }, { start: "2018-09-01", end: "2018-09-30" }, { start: "2018-12-01", end: "2018-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-10-01", end: "2018-11-20" }, { start: "2018-11-24", end: "2018-11-30" }, { start: "2018-12-15", end: "2018-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2018-02-01", end: "2018-02-15" }, { start: "2018-05-01", end: "2018-06-10" }, { start: "2018-08-16", end: "2018-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2018-02-16", end: "2018-03-24" }, { start: "2018-04-08", end: "2018-04-30" }, { start: "2018-06-11", end: "2018-08-15" }, { start: "2018-11-21", end: "2018-11-23" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-03-25", end: "2018-04-07" }, { start: "2018-12-24", end: "2018-12-31" }] },
];

RESORTS.push({
  id: "saratogaSprings",
  name: "Disney's Saratoga Springs Resort & Spa",
  year: 2018,
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
  travelPeriods: buildPeriods(SSR_2018, [
    { sunThu: { dsS:11, dsP:13, oneS:22, oneP:26, twoS:30, twoP:37, threeS:64, threeP:75, treehouse:39 },
      friSat: { dsS:14, dsP:16, oneS:27, oneP:31, twoS:34, twoP:41, threeS:72, threeP:84, treehouse:43 } },
    { sunThu: { dsS:12, dsP:15, oneS:26, oneP:30, twoS:33, twoP:40, threeS:68, threeP:77, treehouse:41 },
      friSat: { dsS:16, dsP:18, oneS:31, oneP:36, twoS:38, twoP:45, threeS:79, threeP:89, treehouse:45 } },
    { sunThu: { dsS:13, dsP:15, oneS:29, oneP:32, twoS:34, twoP:41, threeS:76, threeP:87, treehouse:45 },
      friSat: { dsS:17, dsP:19, oneS:34, oneP:38, twoS:39, twoP:49, threeS:87, threeP:99, treehouse:52 } },
    { sunThu: { dsS:14, dsP:17, oneS:31, oneP:36, twoS:40, twoP:46, threeS:94, threeP:110, treehouse:50 },
      friSat: { dsS:18, dsP:21, oneS:36, oneP:41, twoS:47, twoP:57, threeS:109, threeP:125, treehouse:58 } },
    { sunThu: { dsS:20, dsP:22, oneS:42, oneP:48, twoS:54, twoP:65, threeS:112, threeP:131, treehouse:65 },
      friSat: { dsS:25, dsP:28, oneS:47, oneP:53, twoS:63, twoP:75, threeS:126, threeP:139, treehouse:76 } },
  ]),
});

// === 2019 — 5 travel periods ===
const SSR_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-01", end: "2019-01-31" }, { start: "2019-09-01", end: "2019-09-30" }, { start: "2019-12-01", end: "2019-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-10-01", end: "2019-11-26" }, { start: "2019-11-30", end: "2019-11-30" }, { start: "2019-12-15", end: "2019-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2019-02-01", end: "2019-02-15" }, { start: "2019-05-01", end: "2019-06-10" }, { start: "2019-08-16", end: "2019-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-16", end: "2019-04-13" }, { start: "2019-04-28", end: "2019-04-30" }, { start: "2019-06-11", end: "2019-08-15" }, { start: "2019-11-27", end: "2019-11-29" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-04-14", end: "2019-04-27" }, { start: "2019-12-24", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "saratogaSprings",
  name: "Disney's Saratoga Springs Resort & Spa",
  year: 2019,
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
  travelPeriods: buildPeriods(SSR_2019, [
    { sunThu: { dsS:11, dsP:13, oneS:22, oneP:26, twoS:30, twoP:37, threeS:64, threeP:75, treehouse:39 },
      friSat: { dsS:14, dsP:16, oneS:27, oneP:31, twoS:34, twoP:41, threeS:72, threeP:84, treehouse:43 } },
    { sunThu: { dsS:12, dsP:15, oneS:26, oneP:30, twoS:33, twoP:40, threeS:68, threeP:77, treehouse:41 },
      friSat: { dsS:16, dsP:18, oneS:31, oneP:36, twoS:38, twoP:45, threeS:79, threeP:89, treehouse:45 } },
    { sunThu: { dsS:13, dsP:15, oneS:29, oneP:32, twoS:34, twoP:41, threeS:76, threeP:87, treehouse:45 },
      friSat: { dsS:17, dsP:19, oneS:34, oneP:38, twoS:39, twoP:49, threeS:87, threeP:99, treehouse:52 } },
    { sunThu: { dsS:14, dsP:17, oneS:31, oneP:36, twoS:40, twoP:46, threeS:94, threeP:110, treehouse:50 },
      friSat: { dsS:18, dsP:21, oneS:36, oneP:41, twoS:47, twoP:57, threeS:109, threeP:125, treehouse:58 } },
    { sunThu: { dsS:20, dsP:22, oneS:42, oneP:48, twoS:54, twoP:65, threeS:112, threeP:131, treehouse:65 },
      friSat: { dsS:25, dsP:28, oneS:47, oneP:53, twoS:63, twoP:75, threeS:126, threeP:139, treehouse:76 } },
  ]),
});

// === 2020 — 5 travel periods ===
const SSR_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-09-01", end: "2020-09-30" }, { start: "2020-12-01", end: "2020-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-10-01", end: "2020-11-24" }, { start: "2020-11-28", end: "2020-11-30" }, { start: "2020-12-15", end: "2020-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-02-01", end: "2020-02-15" }, { start: "2020-05-01", end: "2020-06-10" }, { start: "2020-08-16", end: "2020-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-16", end: "2020-04-04" }, { start: "2020-04-19", end: "2020-04-30" }, { start: "2020-06-11", end: "2020-08-15" }, { start: "2020-11-25", end: "2020-11-27" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-04-05", end: "2020-04-18" }, { start: "2020-12-24", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "saratogaSprings",
  name: "Disney's Saratoga Springs Resort & Spa",
  year: 2020,
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
  travelPeriods: buildPeriods(SSR_2020, [
    { sunThu: { dsS:11, dsP:13, oneS:22, oneP:26, twoS:30, twoP:37, threeS:64, threeP:75, treehouse:39 },
      friSat: { dsS:14, dsP:16, oneS:27, oneP:31, twoS:34, twoP:41, threeS:72, threeP:84, treehouse:43 } },
    { sunThu: { dsS:12, dsP:15, oneS:26, oneP:30, twoS:33, twoP:40, threeS:68, threeP:77, treehouse:41 },
      friSat: { dsS:16, dsP:18, oneS:31, oneP:36, twoS:38, twoP:45, threeS:79, threeP:89, treehouse:45 } },
    { sunThu: { dsS:13, dsP:15, oneS:29, oneP:32, twoS:34, twoP:41, threeS:76, threeP:87, treehouse:45 },
      friSat: { dsS:17, dsP:19, oneS:34, oneP:38, twoS:39, twoP:49, threeS:87, threeP:99, treehouse:52 } },
    { sunThu: { dsS:14, dsP:17, oneS:31, oneP:36, twoS:40, twoP:46, threeS:94, threeP:110, treehouse:50 },
      friSat: { dsS:18, dsP:21, oneS:36, oneP:41, twoS:47, twoP:57, threeS:109, threeP:125, treehouse:58 } },
    { sunThu: { dsS:20, dsP:22, oneS:42, oneP:48, twoS:54, twoP:65, threeS:112, threeP:131, treehouse:65 },
      friSat: { dsS:25, dsP:28, oneS:47, oneP:53, twoS:63, twoP:75, threeS:126, threeP:139, treehouse:76 } },
  ]),
});

// === 2021 — 7 travel periods ===
const SSR_2021 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2021-09-01", end: "2021-09-19" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-09-20", end: "2021-09-30" }, { start: "2021-12-01", end: "2021-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2021-05-01", end: "2021-06-10" }, { start: "2021-10-01", end: "2021-11-23" }, { start: "2021-11-27", end: "2021-11-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2021-02-01", end: "2021-02-15" }, { start: "2021-08-16", end: "2021-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2021-04-11", end: "2021-04-30" }, { start: "2021-06-11", end: "2021-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2021-02-16", end: "2021-02-28" }, { start: "2021-03-01", end: "2021-03-27" }, { start: "2021-04-05", end: "2021-04-10" }, { start: "2021-11-24", end: "2021-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2021-03-28", end: "2021-04-04" }, { start: "2021-12-24", end: "2021-12-31" }] },
];

RESORTS.push({
  id: "saratogaSprings",
  name: "Disney's Saratoga Springs Resort & Spa",
  year: 2021,
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
  travelPeriods: buildPeriods(SSR_2021, [
    { sunThu: { dsS:10, dsP:12, oneS:21, oneP:25, twoS:29, twoP:36, threeS:63, threeP:74, treehouse:38 },
      friSat: { dsS:14, dsP:16, oneS:27, oneP:31, twoS:34, twoP:41, threeS:72, threeP:84, treehouse:43 } },
    { sunThu: { dsS:12, dsP:14, oneS:24, oneP:28, twoS:32, twoP:37, threeS:68, threeP:77, treehouse:41 },
      friSat: { dsS:15, dsP:17, oneS:29, oneP:34, twoS:36, twoP:42, threeS:78, threeP:89, treehouse:45 } },
    { sunThu: { dsS:13, dsP:15, oneS:27, oneP:31, twoS:34, twoP:41, threeS:74, threeP:84, treehouse:43 },
      friSat: { dsS:15, dsP:19, oneS:32, oneP:36, twoS:39, twoP:48, threeS:83, threeP:94, treehouse:49 } },
    { sunThu: { dsS:14, dsP:15, oneS:30, oneP:33, twoS:36, twoP:42, threeS:77, threeP:88, treehouse:45 },
      friSat: { dsS:17, dsP:19, oneS:34, oneP:38, twoS:39, twoP:49, threeS:87, threeP:99, treehouse:52 } },
    { sunThu: { dsS:14, dsP:16, oneS:31, oneP:35, twoS:38, twoP:46, threeS:88, threeP:101, treehouse:48 },
      friSat: { dsS:18, dsP:20, oneS:35, oneP:40, twoS:45, twoP:55, threeS:99, threeP:115, treehouse:55 } },
    { sunThu: { dsS:15, dsP:18, oneS:32, oneP:37, twoS:42, twoP:48, threeS:96, threeP:110, treehouse:51 },
      friSat: { dsS:18, dsP:21, oneS:36, oneP:42, twoS:47, twoP:58, threeS:109, threeP:125, treehouse:58 } },
    { sunThu: { dsS:21, dsP:23, oneS:43, oneP:49, twoS:56, twoP:67, threeS:113, threeP:132, treehouse:66 },
      friSat: { dsS:25, dsP:28, oneS:47, oneP:53, twoS:63, twoP:75, threeS:126, threeP:139, treehouse:76 } },
  ]),
});

// === 2022 — 7 travel periods ===
const SSR_2022 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2022-09-01", end: "2022-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-12-01", end: "2022-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2022-05-01", end: "2022-06-10" }, { start: "2022-12-15", end: "2022-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2022-02-01", end: "2022-02-15" }, { start: "2022-06-11", end: "2022-08-31" }, { start: "2022-10-01", end: "2022-11-22" }, { start: "2022-11-26", end: "2022-11-30" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2022-04-24", end: "2022-04-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2022-02-16", end: "2022-02-28" }, { start: "2022-03-01", end: "2022-04-09" }, { start: "2022-04-18", end: "2022-04-23" }, { start: "2022-11-23", end: "2022-11-25" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2022-04-10", end: "2022-04-17" }, { start: "2022-12-24", end: "2022-12-31" }] },
];

RESORTS.push({
  id: "saratogaSprings",
  name: "Disney's Saratoga Springs Resort & Spa",
  year: 2022,
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
  travelPeriods: buildPeriods(SSR_2022, [
    { sunThu: { dsS:10, dsP:12, oneS:20, oneP:24, twoS:27, twoP:35, threeS:63, threeP:74, treehouse:38 },
      friSat: { dsS:14, dsP:16, oneS:27, oneP:30, twoS:34, twoP:40, threeS:72, threeP:84, treehouse:43 } },
    { sunThu: { dsS:12, dsP:14, oneS:24, oneP:28, twoS:32, twoP:38, threeS:68, threeP:77, treehouse:41 },
      friSat: { dsS:15, dsP:17, oneS:29, oneP:34, twoS:36, twoP:42, threeS:78, threeP:89, treehouse:45 } },
    { sunThu: { dsS:13, dsP:15, oneS:26, oneP:30, twoS:35, twoP:40, threeS:74, threeP:83, treehouse:43 },
      friSat: { dsS:15, dsP:18, oneS:31, oneP:35, twoS:39, twoP:45, threeS:83, threeP:94, treehouse:48 } },
    { sunThu: { dsS:14, dsP:15, oneS:29, oneP:33, twoS:37, twoP:43, threeS:80, threeP:91, treehouse:45 },
      friSat: { dsS:16, dsP:19, oneS:34, oneP:38, twoS:40, twoP:51, threeS:88, threeP:101, treehouse:52 } },
    { sunThu: { dsS:14, dsP:16, oneS:31, oneP:35, twoS:38, twoP:47, threeS:88, threeP:101, treehouse:48 },
      friSat: { dsS:18, dsP:20, oneS:35, oneP:40, twoS:45, twoP:55, threeS:99, threeP:115, treehouse:54 } },
    { sunThu: { dsS:15, dsP:17, oneS:31, oneP:38, twoS:41, twoP:49, threeS:96, threeP:109, treehouse:51 },
      friSat: { dsS:18, dsP:21, oneS:36, oneP:42, twoS:47, twoP:59, threeS:108, threeP:125, treehouse:58 } },
    { sunThu: { dsS:21, dsP:23, oneS:43, oneP:49, twoS:56, twoP:67, threeS:113, threeP:132, treehouse:66 },
      friSat: { dsS:25, dsP:28, oneS:47, oneP:53, twoS:63, twoP:75, threeS:126, threeP:139, treehouse:76 } },
  ]),
});

// === 2023 — 7 travel periods ===
const SSR_2023 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2023-09-01", end: "2023-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-05-01", end: "2023-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2023-05-15", end: "2023-06-10" }, { start: "2023-12-01", end: "2023-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2023-02-01", end: "2023-02-15" }, { start: "2023-06-11", end: "2023-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2023-10-01", end: "2023-11-21" }, { start: "2023-11-25", end: "2023-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2023-02-16", end: "2023-02-28" }, { start: "2023-03-01", end: "2023-04-01" }, { start: "2023-04-10", end: "2023-04-30" }, { start: "2023-11-22", end: "2023-11-24" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2023-04-02", end: "2023-04-09" }, { start: "2023-12-24", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "saratogaSprings",
  name: "Disney's Saratoga Springs Resort & Spa",
  year: 2023,
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
  travelPeriods: buildPeriods(SSR_2023, [
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
});

// === 2024 — 7 travel periods ===
const SSR_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-05-01", end: "2024-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-05-15", end: "2024-06-10" }, { start: "2024-12-01", end: "2024-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-02-01", end: "2024-02-15" }, { start: "2024-06-11", end: "2024-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2024-10-01", end: "2024-11-26" }, { start: "2024-11-30", end: "2024-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-02-16", end: "2024-02-29" }, { start: "2024-03-01", end: "2024-03-23" }, { start: "2024-04-01", end: "2024-04-30" }, { start: "2024-11-27", end: "2024-11-29" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-03-24", end: "2024-03-31" }, { start: "2024-12-24", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "saratogaSprings",
  name: "Disney's Saratoga Springs Resort & Spa",
  year: 2024,
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
  travelPeriods: buildPeriods(SSR_2024, [
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
});

// === 2025 — 7 travel periods ===
const SSR_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-05-01", end: "2025-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-05-15", end: "2025-06-10" }, { start: "2025-12-01", end: "2025-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-02-15" }, { start: "2025-06-11", end: "2025-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2025-10-01", end: "2025-11-25" }, { start: "2025-11-29", end: "2025-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-02-16", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }, { start: "2025-11-26", end: "2025-11-28" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-04-13", end: "2025-04-20" }, { start: "2025-12-24", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "saratogaSprings",
  name: "Disney's Saratoga Springs Resort & Spa",
  year: 2025,
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
  travelPeriods: buildPeriods(SSR_2025, [
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
});

// === 2026 — 7 travel periods ===
const SSR_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-12-24", end: "2026-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(SSR_2026, [
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
});

// === 2027 — 7 travel periods ===
const SSR_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(SSR_2027, [
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
});

// ======================================================================
// Disney's Vero Beach Resort
// ======================================================================

// === 2016 — 5 travel periods ===
const VBR_2016 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2016-09-01", end: "2016-11-22" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2016-05-01", end: "2016-05-31" }, { start: "2016-11-26", end: "2016-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2016-01-01", end: "2016-01-31" }, { start: "2016-06-01", end: "2016-08-31" }, { start: "2016-11-23", end: "2016-11-25" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2016-02-01", end: "2016-02-13" }, { start: "2016-04-03", end: "2016-04-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2016-02-14", end: "2016-04-02" }, { start: "2016-12-24", end: "2016-12-31" }] },
];

RESORTS.push({
  id: "veroBeach",
  name: "Disney's Vero Beach Resort",
  year: 2016,
  roomTypes: [
    { id: "innStandard", name: "Deluxe Inn Room - Standard View", sleeps: 4 },
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "innOcean", name: "Deluxe Inn Room - Ocean View", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "beachCottage", name: "Three-Bedroom Beach Cottage", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VBR_2016, [
    { sunThu: { innStandard:10, deluxeStudio:13, innOcean:13, oneBedroom:21, twoBedroom:32, beachCottage:59 },
      friSat: { innStandard:16, deluxeStudio:17, innOcean:17, oneBedroom:29, twoBedroom:39, beachCottage:72 } },
    { sunThu: { innStandard:10, deluxeStudio:14, innOcean:14, oneBedroom:24, twoBedroom:35, beachCottage:61 },
      friSat: { innStandard:17, deluxeStudio:18, innOcean:18, oneBedroom:31, twoBedroom:43, beachCottage:74 } },
    { sunThu: { innStandard:15, deluxeStudio:16, innOcean:16, oneBedroom:29, twoBedroom:38, beachCottage:73 },
      friSat: { innStandard:17, deluxeStudio:20, innOcean:20, oneBedroom:37, twoBedroom:47, beachCottage:87 } },
    { sunThu: { innStandard:15, deluxeStudio:17, innOcean:17, oneBedroom:31, twoBedroom:44, beachCottage:81 },
      friSat: { innStandard:20, deluxeStudio:22, innOcean:22, oneBedroom:40, twoBedroom:52, beachCottage:98 } },
    { sunThu: { innStandard:20, deluxeStudio:24, innOcean:24, oneBedroom:43, twoBedroom:61, beachCottage:105 },
      friSat: { innStandard:27, deluxeStudio:29, innOcean:29, oneBedroom:53, twoBedroom:72, beachCottage:126 } },
  ]),
});

// === 2017 — 5 travel periods ===
const VBR_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-09-01", end: "2017-11-21" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-05-01", end: "2017-05-31" }, { start: "2017-11-25", end: "2017-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2017-01-01", end: "2017-01-31" }, { start: "2017-06-01", end: "2017-08-31" }, { start: "2017-11-22", end: "2017-11-24" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-02-01", end: "2017-03-04" }, { start: "2017-04-23", end: "2017-04-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-03-05", end: "2017-04-22" }, { start: "2017-12-24", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "veroBeach",
  name: "Disney's Vero Beach Resort",
  year: 2017,
  roomTypes: [
    { id: "innStandard", name: "Deluxe Inn Room - Standard View", sleeps: 4 },
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "innOcean", name: "Deluxe Inn Room - Ocean View", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "beachCottage", name: "Three-Bedroom Beach Cottage", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VBR_2017, [
    { sunThu: { innStandard:10, deluxeStudio:13, innOcean:13, oneBedroom:21, twoBedroom:32, beachCottage:59 },
      friSat: { innStandard:16, deluxeStudio:17, innOcean:17, oneBedroom:29, twoBedroom:39, beachCottage:72 } },
    { sunThu: { innStandard:10, deluxeStudio:14, innOcean:14, oneBedroom:24, twoBedroom:35, beachCottage:61 },
      friSat: { innStandard:17, deluxeStudio:18, innOcean:18, oneBedroom:31, twoBedroom:43, beachCottage:74 } },
    { sunThu: { innStandard:15, deluxeStudio:16, innOcean:16, oneBedroom:29, twoBedroom:38, beachCottage:73 },
      friSat: { innStandard:17, deluxeStudio:20, innOcean:20, oneBedroom:37, twoBedroom:47, beachCottage:87 } },
    { sunThu: { innStandard:15, deluxeStudio:17, innOcean:17, oneBedroom:31, twoBedroom:44, beachCottage:81 },
      friSat: { innStandard:20, deluxeStudio:22, innOcean:22, oneBedroom:40, twoBedroom:52, beachCottage:98 } },
    { sunThu: { innStandard:20, deluxeStudio:24, innOcean:24, oneBedroom:43, twoBedroom:61, beachCottage:105 },
      friSat: { innStandard:27, deluxeStudio:29, innOcean:29, oneBedroom:53, twoBedroom:72, beachCottage:126 } },
  ]),
});

// === 2018 — 5 travel periods ===
const VBR_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-09-01", end: "2018-11-20" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-05-01", end: "2018-05-31" }, { start: "2018-11-24", end: "2018-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2018-01-01", end: "2018-01-31" }, { start: "2018-06-01", end: "2018-08-31" }, { start: "2018-11-21", end: "2018-11-23" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2018-02-01", end: "2018-02-17" }, { start: "2018-04-08", end: "2018-04-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-02-18", end: "2018-04-07" }, { start: "2018-12-24", end: "2018-12-31" }] },
];

RESORTS.push({
  id: "veroBeach",
  name: "Disney's Vero Beach Resort",
  year: 2018,
  roomTypes: [
    { id: "innStandard", name: "Deluxe Inn Room - Standard View", sleeps: 4 },
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "innOcean", name: "Deluxe Inn Room - Ocean View", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "beachCottage", name: "Three-Bedroom Beach Cottage", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VBR_2018, [
    { sunThu: { innStandard:10, deluxeStudio:13, innOcean:13, oneBedroom:21, twoBedroom:32, beachCottage:59 },
      friSat: { innStandard:16, deluxeStudio:17, innOcean:17, oneBedroom:29, twoBedroom:39, beachCottage:72 } },
    { sunThu: { innStandard:10, deluxeStudio:14, innOcean:14, oneBedroom:24, twoBedroom:35, beachCottage:61 },
      friSat: { innStandard:17, deluxeStudio:18, innOcean:18, oneBedroom:31, twoBedroom:43, beachCottage:74 } },
    { sunThu: { innStandard:15, deluxeStudio:16, innOcean:16, oneBedroom:29, twoBedroom:38, beachCottage:73 },
      friSat: { innStandard:17, deluxeStudio:20, innOcean:20, oneBedroom:37, twoBedroom:47, beachCottage:87 } },
    { sunThu: { innStandard:15, deluxeStudio:17, innOcean:17, oneBedroom:31, twoBedroom:44, beachCottage:81 },
      friSat: { innStandard:20, deluxeStudio:22, innOcean:22, oneBedroom:40, twoBedroom:52, beachCottage:98 } },
    { sunThu: { innStandard:20, deluxeStudio:24, innOcean:24, oneBedroom:43, twoBedroom:61, beachCottage:105 },
      friSat: { innStandard:27, deluxeStudio:29, innOcean:29, oneBedroom:53, twoBedroom:72, beachCottage:126 } },
  ]),
});

// === 2019 — 5 travel periods ===
const VBR_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-09-01", end: "2019-11-26" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-05-01", end: "2019-05-31" }, { start: "2019-11-30", end: "2019-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2019-01-01", end: "2019-01-31" }, { start: "2019-06-01", end: "2019-08-31" }, { start: "2019-11-27", end: "2019-11-29" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-01", end: "2019-03-09" }, { start: "2019-04-28", end: "2019-04-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-03-10", end: "2019-04-27" }, { start: "2019-12-24", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "veroBeach",
  name: "Disney's Vero Beach Resort",
  year: 2019,
  roomTypes: [
    { id: "innStandard", name: "Deluxe Inn Room - Standard View", sleeps: 4 },
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "innOcean", name: "Deluxe Inn Room - Ocean View", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "beachCottage", name: "Three-Bedroom Beach Cottage", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VBR_2019, [
    { sunThu: { innStandard:10, deluxeStudio:12, innOcean:14, oneBedroom:21, twoBedroom:30, beachCottage:59 },
      friSat: { innStandard:16, deluxeStudio:17, innOcean:18, oneBedroom:29, twoBedroom:39, beachCottage:72 } },
    { sunThu: { innStandard:10, deluxeStudio:13, innOcean:15, oneBedroom:24, twoBedroom:33, beachCottage:61 },
      friSat: { innStandard:17, deluxeStudio:18, innOcean:19, oneBedroom:31, twoBedroom:42, beachCottage:74 } },
    { sunThu: { innStandard:15, deluxeStudio:16, innOcean:17, oneBedroom:29, twoBedroom:36, beachCottage:73 },
      friSat: { innStandard:17, deluxeStudio:19, innOcean:21, oneBedroom:37, twoBedroom:47, beachCottage:87 } },
    { sunThu: { innStandard:15, deluxeStudio:17, innOcean:19, oneBedroom:31, twoBedroom:44, beachCottage:81 },
      friSat: { innStandard:20, deluxeStudio:21, innOcean:23, oneBedroom:40, twoBedroom:52, beachCottage:98 } },
    { sunThu: { innStandard:20, deluxeStudio:23, innOcean:26, oneBedroom:43, twoBedroom:61, beachCottage:105 },
      friSat: { innStandard:27, deluxeStudio:29, innOcean:31, oneBedroom:53, twoBedroom:72, beachCottage:126 } },
  ]),
});

// === 2020 — 5 travel periods ===
const VBR_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-09-01", end: "2020-11-24" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-05-01", end: "2020-05-31" }, { start: "2020-11-28", end: "2020-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-06-01", end: "2020-08-31" }, { start: "2020-11-25", end: "2020-11-27" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-01", end: "2020-02-29" }, { start: "2020-04-19", end: "2020-04-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-03-01", end: "2020-04-18" }, { start: "2020-12-24", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "veroBeach",
  name: "Disney's Vero Beach Resort",
  year: 2020,
  roomTypes: [
    { id: "innStandard", name: "Deluxe Inn Room - Standard View", sleeps: 4 },
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "innOcean", name: "Deluxe Inn Room - Ocean View", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "beachCottage", name: "Three-Bedroom Beach Cottage", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VBR_2020, [
    { sunThu: { innStandard:10, deluxeStudio:12, innOcean:14, oneBedroom:21, twoBedroom:30, beachCottage:59 },
      friSat: { innStandard:16, deluxeStudio:17, innOcean:18, oneBedroom:29, twoBedroom:39, beachCottage:72 } },
    { sunThu: { innStandard:10, deluxeStudio:13, innOcean:15, oneBedroom:24, twoBedroom:33, beachCottage:61 },
      friSat: { innStandard:17, deluxeStudio:18, innOcean:19, oneBedroom:31, twoBedroom:42, beachCottage:74 } },
    { sunThu: { innStandard:15, deluxeStudio:16, innOcean:17, oneBedroom:29, twoBedroom:36, beachCottage:73 },
      friSat: { innStandard:17, deluxeStudio:19, innOcean:21, oneBedroom:37, twoBedroom:47, beachCottage:87 } },
    { sunThu: { innStandard:15, deluxeStudio:17, innOcean:19, oneBedroom:31, twoBedroom:44, beachCottage:81 },
      friSat: { innStandard:20, deluxeStudio:21, innOcean:23, oneBedroom:40, twoBedroom:52, beachCottage:98 } },
    { sunThu: { innStandard:20, deluxeStudio:23, innOcean:26, oneBedroom:43, twoBedroom:61, beachCottage:105 },
      friSat: { innStandard:27, deluxeStudio:29, innOcean:31, oneBedroom:53, twoBedroom:72, beachCottage:126 } },
  ]),
});

// === 2021 — 5 travel periods ===
const VBR_2021 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2021-09-01", end: "2021-09-30" }, { start: "2021-10-01", end: "2021-11-23" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2021-05-01", end: "2021-05-31" }, { start: "2021-11-27", end: "2021-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-06-01", end: "2021-08-31" }, { start: "2021-11-24", end: "2021-11-26" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2021-02-01", end: "2021-02-20" }, { start: "2021-04-11", end: "2021-04-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2021-02-21", end: "2021-04-10" }, { start: "2021-12-24", end: "2021-12-31" }] },
];

RESORTS.push({
  id: "veroBeach",
  name: "Disney's Vero Beach Resort",
  year: 2021,
  roomTypes: [
    { id: "innStandard", name: "Deluxe Inn Room - Standard View", sleeps: 4 },
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "innOcean", name: "Deluxe Inn Room - Ocean View", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "beachCottage", name: "Three-Bedroom Beach Cottage", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VBR_2021, [
    { sunThu: { innStandard:10, deluxeStudio:14, innOcean:12, oneBedroom:21, twoBedroom:30, beachCottage:59 },
      friSat: { innStandard:16, deluxeStudio:17, innOcean:17, oneBedroom:29, twoBedroom:39, beachCottage:72 } },
    { sunThu: { innStandard:10, deluxeStudio:15, innOcean:13, oneBedroom:24, twoBedroom:33, beachCottage:61 },
      friSat: { innStandard:17, deluxeStudio:19, innOcean:18, oneBedroom:31, twoBedroom:42, beachCottage:74 } },
    { sunThu: { innStandard:14, deluxeStudio:18, innOcean:16, oneBedroom:29, twoBedroom:36, beachCottage:73 },
      friSat: { innStandard:17, deluxeStudio:21, innOcean:19, oneBedroom:37, twoBedroom:47, beachCottage:87 } },
    { sunThu: { innStandard:15, deluxeStudio:19, innOcean:17, oneBedroom:31, twoBedroom:44, beachCottage:81 },
      friSat: { innStandard:20, deluxeStudio:23, innOcean:21, oneBedroom:40, twoBedroom:52, beachCottage:98 } },
    { sunThu: { innStandard:21, deluxeStudio:26, innOcean:23, oneBedroom:43, twoBedroom:61, beachCottage:105 },
      friSat: { innStandard:27, deluxeStudio:31, innOcean:29, oneBedroom:53, twoBedroom:72, beachCottage:126 } },
  ]),
});

// === 2022 — 5 travel periods ===
const VBR_2022 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2022-09-01", end: "2022-09-30" }, { start: "2022-10-01", end: "2022-11-22" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2022-05-01", end: "2022-05-31" }, { start: "2022-11-26", end: "2022-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-06-01", end: "2022-08-31" }, { start: "2022-11-23", end: "2022-11-25" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2022-02-01", end: "2022-03-05" }, { start: "2022-04-24", end: "2022-04-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2022-03-06", end: "2022-04-23" }, { start: "2022-12-24", end: "2022-12-31" }] },
];

RESORTS.push({
  id: "veroBeach",
  name: "Disney's Vero Beach Resort",
  year: 2022,
  roomTypes: [
    { id: "innStandard", name: "Deluxe Inn Room - Standard View", sleeps: 4 },
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "innOcean", name: "Deluxe Inn Room - Ocean View", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "beachCottage", name: "Three-Bedroom Beach Cottage", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VBR_2022, [
    { sunThu: { innStandard:10, deluxeStudio:12, innOcean:14, oneBedroom:21, twoBedroom:30, beachCottage:60 },
      friSat: { innStandard:16, deluxeStudio:17, innOcean:17, oneBedroom:29, twoBedroom:39, beachCottage:72 } },
    { sunThu: { innStandard:10, deluxeStudio:13, innOcean:15, oneBedroom:24, twoBedroom:33, beachCottage:61 },
      friSat: { innStandard:17, deluxeStudio:18, innOcean:19, oneBedroom:31, twoBedroom:42, beachCottage:74 } },
    { sunThu: { innStandard:14, deluxeStudio:16, innOcean:18, oneBedroom:29, twoBedroom:36, beachCottage:73 },
      friSat: { innStandard:17, deluxeStudio:19, innOcean:21, oneBedroom:37, twoBedroom:47, beachCottage:88 } },
    { sunThu: { innStandard:15, deluxeStudio:17, innOcean:19, oneBedroom:31, twoBedroom:44, beachCottage:81 },
      friSat: { innStandard:20, deluxeStudio:21, innOcean:23, oneBedroom:40, twoBedroom:52, beachCottage:99 } },
    { sunThu: { innStandard:21, deluxeStudio:23, innOcean:26, oneBedroom:43, twoBedroom:61, beachCottage:105 },
      friSat: { innStandard:27, deluxeStudio:29, innOcean:31, oneBedroom:53, twoBedroom:72, beachCottage:126 } },
  ]),
});

// === 2023 — 5 travel periods ===
const VBR_2023 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2023-09-01", end: "2023-09-30" }, { start: "2023-10-01", end: "2023-11-21" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2023-05-01", end: "2023-05-31" }, { start: "2023-11-25", end: "2023-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-06-01", end: "2023-08-31" }, { start: "2023-11-22", end: "2023-11-24" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2023-02-01", end: "2023-02-25" }, { start: "2023-04-16", end: "2023-04-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2023-02-26", end: "2023-04-15" }, { start: "2023-12-24", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "veroBeach",
  name: "Disney's Vero Beach Resort",
  year: 2023,
  roomTypes: [
    { id: "innStandard", name: "Deluxe Inn Room - Standard View", sleeps: 4 },
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "innOcean", name: "Deluxe Inn Room - Ocean View", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "beachCottage", name: "Three-Bedroom Beach Cottage", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VBR_2023, [
    { sunThu: { innStandard:10, deluxeStudio:12, innOcean:14, oneBedroom:21, twoBedroom:30, beachCottage:60 },
      friSat: { innStandard:16, deluxeStudio:17, innOcean:17, oneBedroom:29, twoBedroom:39, beachCottage:72 } },
    { sunThu: { innStandard:10, deluxeStudio:13, innOcean:15, oneBedroom:24, twoBedroom:33, beachCottage:61 },
      friSat: { innStandard:17, deluxeStudio:18, innOcean:19, oneBedroom:31, twoBedroom:42, beachCottage:74 } },
    { sunThu: { innStandard:14, deluxeStudio:16, innOcean:18, oneBedroom:29, twoBedroom:36, beachCottage:73 },
      friSat: { innStandard:17, deluxeStudio:19, innOcean:21, oneBedroom:37, twoBedroom:47, beachCottage:88 } },
    { sunThu: { innStandard:15, deluxeStudio:17, innOcean:19, oneBedroom:31, twoBedroom:44, beachCottage:81 },
      friSat: { innStandard:20, deluxeStudio:21, innOcean:23, oneBedroom:40, twoBedroom:52, beachCottage:99 } },
    { sunThu: { innStandard:21, deluxeStudio:23, innOcean:26, oneBedroom:43, twoBedroom:61, beachCottage:105 },
      friSat: { innStandard:27, deluxeStudio:29, innOcean:31, oneBedroom:53, twoBedroom:72, beachCottage:126 } },
  ]),
});

// === 2024 — 5 travel periods ===
const VBR_2024 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }, { start: "2024-10-01", end: "2024-11-26" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2024-05-01", end: "2024-05-31" }, { start: "2024-11-30", end: "2024-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-06-01", end: "2024-08-31" }, { start: "2024-11-27", end: "2024-11-29" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2024-02-01", end: "2024-02-17" }, { start: "2024-04-07", end: "2024-04-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2024-02-18", end: "2024-04-06" }, { start: "2024-12-24", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "veroBeach",
  name: "Disney's Vero Beach Resort",
  year: 2024,
  roomTypes: [
    { id: "innStandard", name: "Deluxe Inn Room - Standard View", sleeps: 4 },
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "innOcean", name: "Deluxe Inn Room - Ocean View", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "beachCottage", name: "Three-Bedroom Beach Cottage", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VBR_2024, [
    { sunThu: { innStandard:10, deluxeStudio:12, innOcean:14, oneBedroom:21, twoBedroom:30, beachCottage:60 },
      friSat: { innStandard:16, deluxeStudio:17, innOcean:17, oneBedroom:29, twoBedroom:39, beachCottage:72 } },
    { sunThu: { innStandard:10, deluxeStudio:13, innOcean:15, oneBedroom:24, twoBedroom:33, beachCottage:61 },
      friSat: { innStandard:17, deluxeStudio:18, innOcean:19, oneBedroom:31, twoBedroom:42, beachCottage:74 } },
    { sunThu: { innStandard:14, deluxeStudio:16, innOcean:18, oneBedroom:29, twoBedroom:36, beachCottage:73 },
      friSat: { innStandard:17, deluxeStudio:19, innOcean:21, oneBedroom:37, twoBedroom:47, beachCottage:88 } },
    { sunThu: { innStandard:15, deluxeStudio:17, innOcean:19, oneBedroom:31, twoBedroom:44, beachCottage:81 },
      friSat: { innStandard:20, deluxeStudio:21, innOcean:23, oneBedroom:40, twoBedroom:52, beachCottage:99 } },
    { sunThu: { innStandard:21, deluxeStudio:23, innOcean:26, oneBedroom:43, twoBedroom:61, beachCottage:105 },
      friSat: { innStandard:27, deluxeStudio:29, innOcean:31, oneBedroom:53, twoBedroom:72, beachCottage:126 } },
  ]),
});

// === 2025 — 5 travel periods ===
const VBR_2025 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-11-25" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2025-05-01", end: "2025-05-31" }, { start: "2025-11-29", end: "2025-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-06-01", end: "2025-08-31" }, { start: "2025-11-26", end: "2025-11-28" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-03-08" }, { start: "2025-04-27", end: "2025-04-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2025-03-09", end: "2025-04-26" }, { start: "2025-12-24", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "veroBeach",
  name: "Disney's Vero Beach Resort",
  year: 2025,
  roomTypes: [
    { id: "innStandard", name: "Deluxe Inn Room - Standard View", sleeps: 4 },
    { id: "deluxeStudio", name: "Deluxe Studio", sleeps: 4 },
    { id: "innOcean", name: "Deluxe Inn Room - Ocean View", sleeps: 4 },
    { id: "oneBedroom", name: "One-Bedroom Villa", sleeps: 5 },
    { id: "twoBedroom", name: "Two-Bedroom Villa", sleeps: 9 },
    { id: "beachCottage", name: "Three-Bedroom Beach Cottage", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VBR_2025, [
    { sunThu: { innStandard:10, deluxeStudio:12, innOcean:14, oneBedroom:21, twoBedroom:30, beachCottage:60 },
      friSat: { innStandard:16, deluxeStudio:17, innOcean:17, oneBedroom:29, twoBedroom:39, beachCottage:72 } },
    { sunThu: { innStandard:10, deluxeStudio:13, innOcean:15, oneBedroom:24, twoBedroom:33, beachCottage:61 },
      friSat: { innStandard:17, deluxeStudio:18, innOcean:19, oneBedroom:31, twoBedroom:42, beachCottage:74 } },
    { sunThu: { innStandard:14, deluxeStudio:16, innOcean:18, oneBedroom:29, twoBedroom:36, beachCottage:73 },
      friSat: { innStandard:17, deluxeStudio:19, innOcean:21, oneBedroom:37, twoBedroom:47, beachCottage:88 } },
    { sunThu: { innStandard:15, deluxeStudio:17, innOcean:19, oneBedroom:31, twoBedroom:44, beachCottage:81 },
      friSat: { innStandard:20, deluxeStudio:21, innOcean:23, oneBedroom:40, twoBedroom:52, beachCottage:99 } },
    { sunThu: { innStandard:21, deluxeStudio:23, innOcean:26, oneBedroom:43, twoBedroom:61, beachCottage:105 },
      friSat: { innStandard:27, deluxeStudio:29, innOcean:31, oneBedroom:53, twoBedroom:72, beachCottage:126 } },
  ]),
});

// === 2026 — 5 travel periods ===
const VBR_2026 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-11-24" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2026-05-01", end: "2026-05-31" }, { start: "2026-11-28", end: "2026-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-06-01", end: "2026-08-31" }, { start: "2026-11-25", end: "2026-11-27" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-21" }, { start: "2026-04-12", end: "2026-04-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2026-02-22", end: "2026-04-11" }, { start: "2026-12-24", end: "2026-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(VBR_2026, [
    { sunThu: { innStandard:10, deluxeStudio:12, innOcean:14, oneBedroom:21, twoBedroom:30, beachCottage:60 },
      friSat: { innStandard:16, deluxeStudio:17, innOcean:17, oneBedroom:29, twoBedroom:39, beachCottage:72 } },
    { sunThu: { innStandard:10, deluxeStudio:13, innOcean:15, oneBedroom:24, twoBedroom:33, beachCottage:61 },
      friSat: { innStandard:17, deluxeStudio:18, innOcean:19, oneBedroom:31, twoBedroom:42, beachCottage:74 } },
    { sunThu: { innStandard:14, deluxeStudio:16, innOcean:18, oneBedroom:29, twoBedroom:36, beachCottage:73 },
      friSat: { innStandard:17, deluxeStudio:19, innOcean:21, oneBedroom:37, twoBedroom:47, beachCottage:88 } },
    { sunThu: { innStandard:15, deluxeStudio:17, innOcean:19, oneBedroom:31, twoBedroom:44, beachCottage:81 },
      friSat: { innStandard:20, deluxeStudio:21, innOcean:23, oneBedroom:40, twoBedroom:52, beachCottage:99 } },
    { sunThu: { innStandard:21, deluxeStudio:23, innOcean:26, oneBedroom:43, twoBedroom:61, beachCottage:105 },
      friSat: { innStandard:27, deluxeStudio:29, innOcean:31, oneBedroom:53, twoBedroom:72, beachCottage:126 } },
  ]),
});

// === 2027 — 5 travel periods ===
const VBR_2027 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-11-23" }] },
  { name: "Regular", color: "#2196F3", dateRanges: [{ start: "2027-05-01", end: "2027-05-31" }, { start: "2027-11-27", end: "2027-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-06-01", end: "2027-08-31" }, { start: "2027-11-24", end: "2027-11-26" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-13" }, { start: "2027-04-04", end: "2027-04-30" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2027-02-14", end: "2027-04-03" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(VBR_2027, [
    { sunThu: { innStandard:10, deluxeStudio:12, innOcean:14, oneBedroom:21, twoBedroom:30, beachCottage:60 },
      friSat: { innStandard:16, deluxeStudio:17, innOcean:17, oneBedroom:29, twoBedroom:39, beachCottage:72 } },
    { sunThu: { innStandard:10, deluxeStudio:13, innOcean:15, oneBedroom:24, twoBedroom:33, beachCottage:61 },
      friSat: { innStandard:17, deluxeStudio:18, innOcean:19, oneBedroom:31, twoBedroom:42, beachCottage:74 } },
    { sunThu: { innStandard:14, deluxeStudio:16, innOcean:18, oneBedroom:29, twoBedroom:36, beachCottage:73 },
      friSat: { innStandard:17, deluxeStudio:19, innOcean:21, oneBedroom:37, twoBedroom:47, beachCottage:88 } },
    { sunThu: { innStandard:15, deluxeStudio:17, innOcean:19, oneBedroom:31, twoBedroom:44, beachCottage:81 },
      friSat: { innStandard:20, deluxeStudio:21, innOcean:23, oneBedroom:40, twoBedroom:52, beachCottage:99 } },
    { sunThu: { innStandard:21, deluxeStudio:23, innOcean:26, oneBedroom:43, twoBedroom:61, beachCottage:105 },
      friSat: { innStandard:27, deluxeStudio:29, innOcean:31, oneBedroom:53, twoBedroom:72, beachCottage:126 } },
  ]),
});

// ======================================================================
// The Villas at Disneyland Hotel
// ======================================================================

// === 2023 — 3 travel periods ===
const VDH_2023 = [
  { name: "Value", color: "#4CAF50", dateRanges: [{ start: "2023-09-28", end: "2023-09-30" }] },
  { name: "Peak", color: "#FF9800", dateRanges: [{ start: "2023-10-01", end: "2023-11-20" }, { start: "2023-11-25", end: "2023-12-17" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2023-11-21", end: "2023-11-24" }, { start: "2023-12-18", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "disneylandHotel",
  name: "The Villas at Disneyland Hotel",
  year: 2023,
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
  travelPeriods: buildPeriods(VDH_2023, [
    { sunThu: { duoS:13, duoP:14, dsS:17, dsP:20, oneP:36, twoP:52, threeP:120, gardenDuo:16, gardenDS:24 },
      friSat: { duoS:15, duoP:17, dsS:20, dsP:24, oneP:42, twoP:61, threeP:142, gardenDuo:19, gardenDS:28 } },
    { sunThu: { duoS:14, duoP:15, dsS:20, dsP:23, oneP:40, twoP:60, threeP:127, gardenDuo:17, gardenDS:28 },
      friSat: { duoS:16, duoP:17, dsS:23, dsP:26, oneP:46, twoP:69, threeP:150, gardenDuo:20, gardenDS:32 } },
    { sunThu: { duoS:22, duoP:24, dsS:28, dsP:31, oneP:54, twoP:82, threeP:170, gardenDuo:26, gardenDS:37 },
      friSat: { duoS:25, duoP:27, dsS:31, dsP:34, oneP:62, twoP:92, threeP:200, gardenDuo:30, gardenDS:41 } },
  ]),
});

// === 2024 — 7 travel periods ===
const VDH_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-05-01", end: "2024-05-22" }, { start: "2024-08-16", end: "2024-09-15" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-02-01", end: "2024-03-14" }, { start: "2024-09-16", end: "2024-09-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-05-23", end: "2024-05-31" }, { start: "2024-10-01", end: "2024-11-25" }, { start: "2024-11-30", end: "2024-12-17" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2024-06-01", end: "2024-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-03-15", end: "2024-03-23" }, { start: "2024-04-01", end: "2024-04-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-03-24", end: "2024-03-31" }, { start: "2024-11-26", end: "2024-11-29" }, { start: "2024-12-18", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "disneylandHotel",
  name: "The Villas at Disneyland Hotel",
  year: 2024,
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
  travelPeriods: buildPeriods(VDH_2024, [
    { sunThu: { duoS:10, duoP:11, dsS:13, dsP:15, oneP:30, twoP:43, threeP:94, gardenDuo:12, gardenDS:19 },
      friSat: { duoS:13, duoP:14, dsS:16, dsP:19, oneP:37, twoP:53, threeP:116, gardenDuo:15, gardenDS:23 } },
    { sunThu: { duoS:12, duoP:13, dsS:15, dsP:18, oneP:33, twoP:49, threeP:104, gardenDuo:14, gardenDS:21 },
      friSat: { duoS:14, duoP:15, dsS:18, dsP:22, oneP:40, twoP:59, threeP:126, gardenDuo:17, gardenDS:25 } },
    { sunThu: { duoS:13, duoP:14, dsS:17, dsP:20, oneP:36, twoP:52, threeP:120, gardenDuo:16, gardenDS:24 },
      friSat: { duoS:15, duoP:17, dsS:20, dsP:24, oneP:42, twoP:61, threeP:142, gardenDuo:19, gardenDS:28 } },
    { sunThu: { duoS:14, duoP:15, dsS:20, dsP:23, oneP:40, twoP:60, threeP:127, gardenDuo:17, gardenDS:28 },
      friSat: { duoS:16, duoP:17, dsS:23, dsP:26, oneP:46, twoP:69, threeP:150, gardenDuo:20, gardenDS:32 } },
    { sunThu: { duoS:16, duoP:18, dsS:23, dsP:26, oneP:42, twoP:65, threeP:145, gardenDuo:21, gardenDS:31 },
      friSat: { duoS:18, duoP:20, dsS:26, dsP:29, oneP:48, twoP:73, threeP:165, gardenDuo:23, gardenDS:34 } },
    { sunThu: { duoS:16, duoP:18, dsS:24, dsP:27, oneP:42, twoP:65, threeP:145, gardenDuo:21, gardenDS:31 },
      friSat: { duoS:19, duoP:21, dsS:27, dsP:30, oneP:50, twoP:75, threeP:170, gardenDuo:24, gardenDS:35 } },
    { sunThu: { duoS:22, duoP:24, dsS:28, dsP:31, oneP:54, twoP:82, threeP:170, gardenDuo:26, gardenDS:37 },
      friSat: { duoS:25, duoP:27, dsS:31, dsP:34, oneP:62, twoP:92, threeP:200, gardenDuo:30, gardenDS:41 } },
  ]),
});

// === 2025 — 7 travel periods ===
const VDH_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-05-01", end: "2025-05-22" }, { start: "2025-08-16", end: "2025-09-15" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-02-01", end: "2025-03-14" }, { start: "2025-09-16", end: "2025-09-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-05-23", end: "2025-05-31" }, { start: "2025-10-01", end: "2025-11-24" }, { start: "2025-11-29", end: "2025-12-17" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2025-06-01", end: "2025-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-03-15", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-04-13", end: "2025-04-20" }, { start: "2025-11-25", end: "2025-11-28" }, { start: "2025-12-18", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "disneylandHotel",
  name: "The Villas at Disneyland Hotel",
  year: 2025,
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
  travelPeriods: buildPeriods(VDH_2025, [
    { sunThu: { duoS:10, duoP:11, dsS:13, dsP:15, oneP:30, twoP:43, threeP:94, gardenDuo:12, gardenDS:19 },
      friSat: { duoS:13, duoP:14, dsS:16, dsP:19, oneP:37, twoP:53, threeP:116, gardenDuo:15, gardenDS:23 } },
    { sunThu: { duoS:12, duoP:13, dsS:15, dsP:18, oneP:33, twoP:49, threeP:104, gardenDuo:14, gardenDS:21 },
      friSat: { duoS:14, duoP:15, dsS:18, dsP:22, oneP:40, twoP:59, threeP:126, gardenDuo:17, gardenDS:25 } },
    { sunThu: { duoS:13, duoP:14, dsS:17, dsP:20, oneP:36, twoP:52, threeP:120, gardenDuo:16, gardenDS:24 },
      friSat: { duoS:15, duoP:17, dsS:20, dsP:24, oneP:42, twoP:61, threeP:142, gardenDuo:19, gardenDS:28 } },
    { sunThu: { duoS:14, duoP:15, dsS:20, dsP:23, oneP:40, twoP:60, threeP:127, gardenDuo:17, gardenDS:28 },
      friSat: { duoS:16, duoP:17, dsS:23, dsP:26, oneP:46, twoP:69, threeP:150, gardenDuo:20, gardenDS:32 } },
    { sunThu: { duoS:16, duoP:18, dsS:23, dsP:26, oneP:42, twoP:65, threeP:145, gardenDuo:21, gardenDS:31 },
      friSat: { duoS:18, duoP:20, dsS:26, dsP:29, oneP:48, twoP:73, threeP:165, gardenDuo:23, gardenDS:34 } },
    { sunThu: { duoS:16, duoP:18, dsS:24, dsP:27, oneP:42, twoP:65, threeP:145, gardenDuo:21, gardenDS:31 },
      friSat: { duoS:19, duoP:21, dsS:27, dsP:30, oneP:50, twoP:75, threeP:170, gardenDuo:24, gardenDS:35 } },
    { sunThu: { duoS:22, duoP:24, dsS:28, dsP:31, oneP:54, twoP:82, threeP:170, gardenDuo:26, gardenDS:37 },
      friSat: { duoS:25, duoP:27, dsS:31, dsP:34, oneP:62, twoP:92, threeP:200, gardenDuo:30, gardenDS:41 } },
  ]),
});

// === 2026 — 7 travel periods ===
const VDH_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-05-01", end: "2026-05-22" }, { start: "2026-08-16", end: "2026-09-15" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-02-01", end: "2026-03-14" }, { start: "2026-09-16", end: "2026-09-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-05-23", end: "2026-05-31" }, { start: "2026-10-01", end: "2026-11-23" }, { start: "2026-11-28", end: "2026-12-17" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-06-01", end: "2026-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-03-15", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-11-24", end: "2026-11-27" }, { start: "2026-12-18", end: "2026-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(VDH_2026, [
    { sunThu: { duoS:10, duoP:11, dsS:13, dsP:15, oneP:30, twoP:43, threeP:96, gardenDuo:12, gardenDS:19 },
      friSat: { duoS:13, duoP:14, dsS:16, dsP:19, oneP:37, twoP:53, threeP:118, gardenDuo:15, gardenDS:23 } },
    { sunThu: { duoS:12, duoP:13, dsS:15, dsP:18, oneP:33, twoP:49, threeP:106, gardenDuo:14, gardenDS:21 },
      friSat: { duoS:14, duoP:15, dsS:18, dsP:22, oneP:40, twoP:59, threeP:128, gardenDuo:17, gardenDS:25 } },
    { sunThu: { duoS:13, duoP:14, dsS:17, dsP:20, oneP:36, twoP:52, threeP:122, gardenDuo:16, gardenDS:24 },
      friSat: { duoS:15, duoP:17, dsS:20, dsP:24, oneP:42, twoP:61, threeP:146, gardenDuo:19, gardenDS:28 } },
    { sunThu: { duoS:14, duoP:15, dsS:20, dsP:23, oneP:40, twoP:60, threeP:129, gardenDuo:17, gardenDS:28 },
      friSat: { duoS:16, duoP:17, dsS:23, dsP:26, oneP:46, twoP:69, threeP:152, gardenDuo:20, gardenDS:32 } },
    { sunThu: { duoS:16, duoP:18, dsS:23, dsP:26, oneP:42, twoP:65, threeP:149, gardenDuo:21, gardenDS:31 },
      friSat: { duoS:18, duoP:20, dsS:26, dsP:29, oneP:48, twoP:73, threeP:169, gardenDuo:23, gardenDS:34 } },
    { sunThu: { duoS:16, duoP:18, dsS:24, dsP:27, oneP:42, twoP:65, threeP:149, gardenDuo:21, gardenDS:31 },
      friSat: { duoS:19, duoP:21, dsS:27, dsP:30, oneP:50, twoP:75, threeP:174, gardenDuo:24, gardenDS:35 } },
    { sunThu: { duoS:22, duoP:24, dsS:28, dsP:31, oneP:54, twoP:82, threeP:174, gardenDuo:26, gardenDS:37 },
      friSat: { duoS:25, duoP:27, dsS:31, dsP:34, oneP:62, twoP:92, threeP:204, gardenDuo:30, gardenDS:41 } },
  ]),
});

// === 2027 — 7 travel periods ===
const VDH_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-05-01", end: "2027-05-22" }, { start: "2027-08-16", end: "2027-09-15" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-02-01", end: "2027-03-14" }, { start: "2027-09-16", end: "2027-09-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-05-23", end: "2027-05-31" }, { start: "2027-10-01", end: "2027-11-22" }, { start: "2027-11-27", end: "2027-12-17" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-06-01", end: "2027-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-03-15", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-11-23", end: "2027-11-26" }, { start: "2027-12-18", end: "2027-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(VDH_2027, [
    { sunThu: { duoS:10, duoP:11, dsS:13, dsP:15, oneP:30, twoP:43, threeP:96, gardenDuo:12, gardenDS:19 },
      friSat: { duoS:13, duoP:14, dsS:16, dsP:19, oneP:37, twoP:53, threeP:118, gardenDuo:15, gardenDS:23 } },
    { sunThu: { duoS:12, duoP:13, dsS:15, dsP:18, oneP:33, twoP:49, threeP:106, gardenDuo:14, gardenDS:21 },
      friSat: { duoS:14, duoP:15, dsS:18, dsP:22, oneP:40, twoP:59, threeP:128, gardenDuo:17, gardenDS:25 } },
    { sunThu: { duoS:13, duoP:14, dsS:17, dsP:20, oneP:36, twoP:52, threeP:122, gardenDuo:16, gardenDS:24 },
      friSat: { duoS:15, duoP:17, dsS:20, dsP:24, oneP:42, twoP:61, threeP:146, gardenDuo:19, gardenDS:28 } },
    { sunThu: { duoS:14, duoP:15, dsS:20, dsP:23, oneP:40, twoP:60, threeP:129, gardenDuo:17, gardenDS:28 },
      friSat: { duoS:16, duoP:17, dsS:23, dsP:26, oneP:46, twoP:69, threeP:152, gardenDuo:20, gardenDS:32 } },
    { sunThu: { duoS:16, duoP:18, dsS:23, dsP:26, oneP:42, twoP:65, threeP:149, gardenDuo:21, gardenDS:31 },
      friSat: { duoS:18, duoP:20, dsS:26, dsP:29, oneP:48, twoP:73, threeP:169, gardenDuo:23, gardenDS:34 } },
    { sunThu: { duoS:16, duoP:18, dsS:24, dsP:27, oneP:42, twoP:65, threeP:149, gardenDuo:21, gardenDS:31 },
      friSat: { duoS:19, duoP:21, dsS:27, dsP:30, oneP:50, twoP:75, threeP:174, gardenDuo:24, gardenDS:35 } },
    { sunThu: { duoS:22, duoP:24, dsS:28, dsP:31, oneP:54, twoP:82, threeP:174, gardenDuo:26, gardenDS:37 },
      friSat: { duoS:25, duoP:27, dsS:31, dsP:34, oneP:62, twoP:92, threeP:204, gardenDuo:30, gardenDS:41 } },
  ]),
});

// ======================================================================
// The Villas at Disney's Grand Floridian Resort & Spa
// ======================================================================

// === 2016 — 5 travel periods ===
const VGF_2016 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2016-01-01", end: "2016-01-31" }, { start: "2016-09-01", end: "2016-09-30" }, { start: "2016-12-01", end: "2016-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2016-10-01", end: "2016-11-22" }, { start: "2016-11-26", end: "2016-11-30" }, { start: "2016-12-15", end: "2016-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2016-02-01", end: "2016-02-15" }, { start: "2016-05-01", end: "2016-06-10" }, { start: "2016-08-16", end: "2016-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2016-02-16", end: "2016-03-19" }, { start: "2016-04-03", end: "2016-04-30" }, { start: "2016-06-11", end: "2016-08-15" }, { start: "2016-11-23", end: "2016-11-25" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2016-03-20", end: "2016-04-02" }, { start: "2016-12-24", end: "2016-12-31" }] },
];

RESORTS.push({
  id: "grandFloridian",
  name: "The Villas at Disney's Grand Floridian Resort & Spa",
  year: 2016,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
    { id: "oneP", name: "One-Bedroom Villa - Preferred View", sleeps: 5 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoP", name: "Two-Bedroom Villa - Preferred View", sleeps: 9 },
    { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VGF_2016, [
    { sunThu: { dsR:17, dsP:20, oneR:33, oneP:40, twoR:46, twoP:55, threeP:112 },
      friSat: { dsR:20, dsP:24, oneR:41, oneP:48, twoR:55, twoP:66, threeP:132 } },
    { sunThu: { dsR:17, dsP:21, oneR:36, oneP:43, twoR:49, twoP:59, threeP:118 },
      friSat: { dsR:20, dsP:24, oneR:44, oneP:53, twoR:57, twoP:69, threeP:138 } },
    { sunThu: { dsR:21, dsP:25, oneR:42, oneP:50, twoR:56, twoP:66, threeP:135 },
      friSat: { dsR:24, dsP:29, oneR:49, oneP:58, twoR:66, twoP:78, threeP:159 } },
    { sunThu: { dsR:23, dsP:27, oneR:46, oneP:55, twoR:64, twoP:75, threeP:160 },
      friSat: { dsR:27, dsP:32, oneR:55, oneP:66, twoR:74, twoP:88, threeP:187 } },
    { sunThu: { dsR:31, dsP:37, oneR:63, oneP:75, twoR:86, twoP:102, threeP:193 },
      friSat: { dsR:36, dsP:43, oneR:74, oneP:88, twoR:101, twoP:121, threeP:227 } },
  ]),
});

// === 2017 — 5 travel periods ===
const VGF_2017 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2017-01-01", end: "2017-01-31" }, { start: "2017-09-01", end: "2017-09-30" }, { start: "2017-12-01", end: "2017-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2017-10-01", end: "2017-11-21" }, { start: "2017-11-25", end: "2017-11-30" }, { start: "2017-12-15", end: "2017-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2017-02-01", end: "2017-02-15" }, { start: "2017-05-01", end: "2017-06-10" }, { start: "2017-08-16", end: "2017-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2017-02-16", end: "2017-04-08" }, { start: "2017-04-23", end: "2017-04-30" }, { start: "2017-06-11", end: "2017-08-15" }, { start: "2017-11-22", end: "2017-11-24" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2017-04-09", end: "2017-04-22" }, { start: "2017-12-24", end: "2017-12-31" }] },
];

RESORTS.push({
  id: "grandFloridian",
  name: "The Villas at Disney's Grand Floridian Resort & Spa",
  year: 2017,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
    { id: "oneP", name: "One-Bedroom Villa - Preferred View", sleeps: 5 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoP", name: "Two-Bedroom Villa - Preferred View", sleeps: 9 },
    { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VGF_2017, [
    { sunThu: { dsR:17, dsP:20, oneR:33, oneP:40, twoR:46, twoP:55, threeP:112 },
      friSat: { dsR:20, dsP:24, oneR:41, oneP:48, twoR:55, twoP:66, threeP:132 } },
    { sunThu: { dsR:17, dsP:21, oneR:36, oneP:43, twoR:49, twoP:59, threeP:118 },
      friSat: { dsR:20, dsP:24, oneR:44, oneP:53, twoR:57, twoP:69, threeP:138 } },
    { sunThu: { dsR:21, dsP:25, oneR:42, oneP:50, twoR:56, twoP:66, threeP:135 },
      friSat: { dsR:24, dsP:29, oneR:49, oneP:58, twoR:66, twoP:78, threeP:159 } },
    { sunThu: { dsR:23, dsP:27, oneR:46, oneP:55, twoR:64, twoP:75, threeP:160 },
      friSat: { dsR:27, dsP:32, oneR:55, oneP:66, twoR:74, twoP:88, threeP:187 } },
    { sunThu: { dsR:31, dsP:37, oneR:63, oneP:75, twoR:86, twoP:102, threeP:193 },
      friSat: { dsR:36, dsP:43, oneR:74, oneP:88, twoR:101, twoP:121, threeP:227 } },
  ]),
});

// === 2018 — 5 travel periods ===
const VGF_2018 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2018-01-01", end: "2018-01-31" }, { start: "2018-09-01", end: "2018-09-30" }, { start: "2018-12-01", end: "2018-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2018-10-01", end: "2018-11-20" }, { start: "2018-11-24", end: "2018-11-30" }, { start: "2018-12-15", end: "2018-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2018-02-01", end: "2018-02-15" }, { start: "2018-05-01", end: "2018-06-10" }, { start: "2018-08-16", end: "2018-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2018-02-16", end: "2018-03-24" }, { start: "2018-04-08", end: "2018-04-30" }, { start: "2018-06-11", end: "2018-08-15" }, { start: "2018-11-21", end: "2018-11-23" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2018-03-25", end: "2018-04-07" }, { start: "2018-12-24", end: "2018-12-31" }] },
];

RESORTS.push({
  id: "grandFloridian",
  name: "The Villas at Disney's Grand Floridian Resort & Spa",
  year: 2018,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
    { id: "oneP", name: "One-Bedroom Villa - Preferred View", sleeps: 5 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoP", name: "Two-Bedroom Villa - Preferred View", sleeps: 9 },
    { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VGF_2018, [
    { sunThu: { dsR:17, dsP:20, oneR:33, oneP:40, twoR:46, twoP:55, threeP:112 },
      friSat: { dsR:20, dsP:24, oneR:41, oneP:48, twoR:55, twoP:66, threeP:132 } },
    { sunThu: { dsR:17, dsP:21, oneR:36, oneP:43, twoR:49, twoP:59, threeP:118 },
      friSat: { dsR:20, dsP:24, oneR:44, oneP:53, twoR:57, twoP:69, threeP:138 } },
    { sunThu: { dsR:21, dsP:25, oneR:42, oneP:50, twoR:56, twoP:66, threeP:135 },
      friSat: { dsR:24, dsP:29, oneR:49, oneP:58, twoR:66, twoP:78, threeP:159 } },
    { sunThu: { dsR:23, dsP:27, oneR:46, oneP:55, twoR:64, twoP:75, threeP:160 },
      friSat: { dsR:27, dsP:32, oneR:55, oneP:66, twoR:74, twoP:88, threeP:187 } },
    { sunThu: { dsR:31, dsP:37, oneR:63, oneP:75, twoR:86, twoP:102, threeP:193 },
      friSat: { dsR:36, dsP:43, oneR:74, oneP:88, twoR:101, twoP:121, threeP:227 } },
  ]),
});

// === 2019 — 5 travel periods ===
const VGF_2019 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2019-01-01", end: "2019-01-31" }, { start: "2019-09-01", end: "2019-09-30" }, { start: "2019-12-01", end: "2019-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2019-10-01", end: "2019-11-26" }, { start: "2019-11-30", end: "2019-11-30" }, { start: "2019-12-15", end: "2019-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2019-02-01", end: "2019-02-15" }, { start: "2019-05-01", end: "2019-06-10" }, { start: "2019-08-16", end: "2019-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2019-02-16", end: "2019-04-13" }, { start: "2019-04-28", end: "2019-04-30" }, { start: "2019-06-11", end: "2019-08-15" }, { start: "2019-11-27", end: "2019-11-29" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2019-04-14", end: "2019-04-27" }, { start: "2019-12-24", end: "2019-12-31" }] },
];

RESORTS.push({
  id: "grandFloridian",
  name: "The Villas at Disney's Grand Floridian Resort & Spa",
  year: 2019,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
    { id: "oneP", name: "One-Bedroom Villa - Preferred View", sleeps: 5 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoP", name: "Two-Bedroom Villa - Preferred View", sleeps: 9 },
    { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VGF_2019, [
    { sunThu: { dsR:17, dsP:20, oneR:33, oneP:40, twoR:46, twoP:55, threeP:112 },
      friSat: { dsR:20, dsP:24, oneR:41, oneP:48, twoR:55, twoP:66, threeP:132 } },
    { sunThu: { dsR:17, dsP:21, oneR:36, oneP:43, twoR:49, twoP:59, threeP:118 },
      friSat: { dsR:20, dsP:24, oneR:44, oneP:53, twoR:57, twoP:69, threeP:138 } },
    { sunThu: { dsR:21, dsP:25, oneR:42, oneP:50, twoR:56, twoP:66, threeP:135 },
      friSat: { dsR:24, dsP:29, oneR:49, oneP:58, twoR:66, twoP:78, threeP:159 } },
    { sunThu: { dsR:23, dsP:27, oneR:46, oneP:55, twoR:64, twoP:75, threeP:160 },
      friSat: { dsR:27, dsP:32, oneR:55, oneP:66, twoR:74, twoP:88, threeP:187 } },
    { sunThu: { dsR:31, dsP:37, oneR:63, oneP:75, twoR:86, twoP:102, threeP:193 },
      friSat: { dsR:36, dsP:43, oneR:74, oneP:88, twoR:101, twoP:121, threeP:227 } },
  ]),
});

// === 2020 — 5 travel periods ===
const VGF_2020 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2020-01-01", end: "2020-01-31" }, { start: "2020-09-01", end: "2020-09-30" }, { start: "2020-12-01", end: "2020-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2020-10-01", end: "2020-11-24" }, { start: "2020-11-28", end: "2020-11-30" }, { start: "2020-12-15", end: "2020-12-23" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2020-02-01", end: "2020-02-15" }, { start: "2020-05-01", end: "2020-06-10" }, { start: "2020-08-16", end: "2020-08-31" }] },
  { name: "Magic", color: "#FF9800", dateRanges: [{ start: "2020-02-16", end: "2020-04-04" }, { start: "2020-04-19", end: "2020-04-30" }, { start: "2020-06-11", end: "2020-08-15" }, { start: "2020-11-25", end: "2020-11-27" }] },
  { name: "Premier", color: "#F44336", dateRanges: [{ start: "2020-04-05", end: "2020-04-18" }, { start: "2020-12-24", end: "2020-12-31" }] },
];

RESORTS.push({
  id: "grandFloridian",
  name: "The Villas at Disney's Grand Floridian Resort & Spa",
  year: 2020,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
    { id: "oneP", name: "One-Bedroom Villa - Preferred View", sleeps: 5 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoP", name: "Two-Bedroom Villa - Preferred View", sleeps: 9 },
    { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VGF_2020, [
    { sunThu: { dsR:17, dsP:20, oneR:33, oneP:40, twoR:46, twoP:55, threeP:112 },
      friSat: { dsR:20, dsP:24, oneR:41, oneP:48, twoR:55, twoP:66, threeP:132 } },
    { sunThu: { dsR:17, dsP:21, oneR:36, oneP:43, twoR:49, twoP:59, threeP:118 },
      friSat: { dsR:20, dsP:24, oneR:44, oneP:53, twoR:57, twoP:69, threeP:138 } },
    { sunThu: { dsR:21, dsP:25, oneR:42, oneP:50, twoR:56, twoP:66, threeP:135 },
      friSat: { dsR:24, dsP:29, oneR:49, oneP:58, twoR:66, twoP:78, threeP:159 } },
    { sunThu: { dsR:23, dsP:27, oneR:46, oneP:55, twoR:64, twoP:75, threeP:160 },
      friSat: { dsR:27, dsP:32, oneR:55, oneP:66, twoR:74, twoP:88, threeP:187 } },
    { sunThu: { dsR:31, dsP:37, oneR:63, oneP:75, twoR:86, twoP:102, threeP:193 },
      friSat: { dsR:36, dsP:43, oneR:74, oneP:88, twoR:101, twoP:121, threeP:227 } },
  ]),
});

// === 2021 — 7 travel periods ===
const VGF_2021 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2021-09-01", end: "2021-09-19" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2021-01-01", end: "2021-01-31" }, { start: "2021-09-20", end: "2021-09-30" }, { start: "2021-12-01", end: "2021-12-23" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2021-05-01", end: "2021-06-10" }, { start: "2021-10-01", end: "2021-11-23" }, { start: "2021-11-27", end: "2021-11-30" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2021-02-01", end: "2021-02-15" }, { start: "2021-08-16", end: "2021-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2021-04-11", end: "2021-04-30" }, { start: "2021-06-11", end: "2021-08-15" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2021-02-16", end: "2021-02-28" }, { start: "2021-03-01", end: "2021-03-27" }, { start: "2021-04-05", end: "2021-04-10" }, { start: "2021-11-24", end: "2021-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2021-03-28", end: "2021-04-04" }, { start: "2021-12-24", end: "2021-12-31" }] },
];

RESORTS.push({
  id: "grandFloridian",
  name: "The Villas at Disney's Grand Floridian Resort & Spa",
  year: 2021,
  roomTypes: [
    { id: "dsR", name: "Deluxe Studio - Resort View", sleeps: 5 },
    { id: "dsP", name: "Deluxe Studio - Preferred View", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Resort View", sleeps: 5 },
    { id: "oneP", name: "One-Bedroom Villa - Preferred View", sleeps: 5 },
    { id: "twoR", name: "Two-Bedroom Villa - Resort View", sleeps: 9 },
    { id: "twoP", name: "Two-Bedroom Villa - Preferred View", sleeps: 9 },
    { id: "threeP", name: "Three-Bedroom Grand Villa - Preferred View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(VGF_2021, [
    { sunThu: { dsR:16, dsP:19, oneR:32, oneP:39, twoR:45, twoP:54, threeP:111 },
      friSat: { dsR:20, dsP:24, oneR:41, oneP:48, twoR:55, twoP:65, threeP:132 } },
    { sunThu: { dsR:17, dsP:21, oneR:36, oneP:43, twoR:49, twoP:59, threeP:118 },
      friSat: { dsR:20, dsP:24, oneR:44, oneP:52, twoR:57, twoP:69, threeP:138 } },
    { sunThu: { dsR:18, dsP:22, oneR:39, oneP:47, twoR:54, twoP:63, threeP:127 },
      friSat: { dsR:21, dsP:26, oneR:47, oneP:55, twoR:62, twoP:75, threeP:149 } },
    { sunThu: { dsR:21, dsP:25, oneR:42, oneP:50, twoR:56, twoP:66, threeP:135 },
      friSat: { dsR:24, dsP:29, oneR:49, oneP:58, twoR:66, twoP:78, threeP:159 } },
    { sunThu: { dsR:23, dsP:26, oneR:43, oneP:54, twoR:62, twoP:74, threeP:149 },
      friSat: { dsR:26, dsP:31, oneR:52, oneP:62, twoR:72, twoP:84, threeP:173 } },
    { sunThu: { dsR:25, dsP:27, oneR:46, oneP:55, twoR:65, twoP:75, threeP:160 },
      friSat: { dsR:27, dsP:32, oneR:55, oneP:66, twoR:74, twoP:88, threeP:187 } },
    { sunThu: { dsR:32, dsP:38, oneR:64, oneP:76, twoR:87, twoP:103, threeP:195 },
      friSat: { dsR:37, dsP:44, oneR:74, oneP:89, twoR:102, twoP:122, threeP:228 } },
  ]),
});

// === 2022 — 7 travel periods ===
const VGF_2022 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2022-09-01", end: "2022-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2022-01-01", end: "2022-01-31" }, { start: "2022-12-01", end: "2022-12-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2022-05-01", end: "2022-06-10" }, { start: "2022-12-15", end: "2022-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2022-02-01", end: "2022-02-15" }, { start: "2022-06-11", end: "2022-08-31" }, { start: "2022-10-01", end: "2022-11-22" }, { start: "2022-11-26", end: "2022-11-30" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2022-04-24", end: "2022-04-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2022-02-16", end: "2022-02-28" }, { start: "2022-03-01", end: "2022-04-09" }, { start: "2022-04-18", end: "2022-04-23" }, { start: "2022-11-23", end: "2022-11-25" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2022-04-10", end: "2022-04-17" }, { start: "2022-12-24", end: "2022-12-31" }] },
];

RESORTS.push({
  id: "grandFloridian",
  name: "The Villas at Disney's Grand Floridian Resort & Spa",
  year: 2022,
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
  travelPeriods: buildPeriods(VGF_2022, [
    { sunThu: { rsR:16, rsP:19, rsTP:24, dsR:16, dsP:19, oneR:31, oneP:39, twoR:44, twoP:54, threeP:111 },
      friSat: { rsR:20, rsP:24, rsTP:28, dsR:20, dsP:24, oneR:41, oneP:48, twoR:55, twoP:65, threeP:131 } },
    { sunThu: { rsR:17, rsP:21, rsTP:25, dsR:17, dsP:21, oneR:36, oneP:43, twoR:49, twoP:59, threeP:118 },
      friSat: { rsR:21, rsP:24, rsTP:30, dsR:21, dsP:24, oneR:44, oneP:52, twoR:58, twoP:69, threeP:138 } },
    { sunThu: { rsR:18, rsP:22, rsTP:28, dsR:18, dsP:22, oneR:38, oneP:46, twoR:53, twoP:63, threeP:127 },
      friSat: { rsR:21, rsP:26, rsTP:33, dsR:21, dsP:26, oneR:46, oneP:55, twoR:61, twoP:74, threeP:149 } },
    { sunThu: { rsR:19, rsP:23, rsTP:30, dsR:19, dsP:23, oneR:42, oneP:50, twoR:58, twoP:68, threeP:136 },
      friSat: { rsR:22, rsP:28, rsTP:34, dsR:22, dsP:28, oneR:49, oneP:58, twoR:67, twoP:80, threeP:160 } },
    { sunThu: { rsR:23, rsP:27, rsTP:34, dsR:23, dsP:27, oneR:44, oneP:54, twoR:63, twoP:75, threeP:148 },
      friSat: { rsR:25, rsP:31, rsTP:38, dsR:25, dsP:31, oneR:52, oneP:62, twoR:71, twoP:84, threeP:173 } },
    { sunThu: { rsR:24, rsP:27, rsTP:35, dsR:24, dsP:27, oneR:46, oneP:55, twoR:65, twoP:75, threeP:161 },
      friSat: { rsR:27, rsP:32, rsTP:42, dsR:27, dsP:32, oneR:55, oneP:66, twoR:74, twoP:88, threeP:187 } },
    { sunThu: { rsR:32, rsP:38, rsTP:48, dsR:32, dsP:38, oneR:64, oneP:76, twoR:87, twoP:103, threeP:195 },
      friSat: { rsR:37, rsP:44, rsTP:55, dsR:37, dsP:44, oneR:74, oneP:89, twoR:102, twoP:122, threeP:228 } },
  ]),
});

// === 2023 — 7 travel periods ===
const VGF_2023 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2023-09-01", end: "2023-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2023-01-01", end: "2023-01-31" }, { start: "2023-05-01", end: "2023-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2023-05-15", end: "2023-06-10" }, { start: "2023-12-01", end: "2023-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2023-02-01", end: "2023-02-15" }, { start: "2023-06-11", end: "2023-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2023-10-01", end: "2023-11-21" }, { start: "2023-11-25", end: "2023-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2023-02-16", end: "2023-02-28" }, { start: "2023-03-01", end: "2023-04-01" }, { start: "2023-04-10", end: "2023-04-30" }, { start: "2023-11-22", end: "2023-11-24" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2023-04-02", end: "2023-04-09" }, { start: "2023-12-24", end: "2023-12-31" }] },
];

RESORTS.push({
  id: "grandFloridian",
  name: "The Villas at Disney's Grand Floridian Resort & Spa",
  year: 2023,
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
  travelPeriods: buildPeriods(VGF_2023, [
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
});

// === 2024 — 7 travel periods ===
const VGF_2024 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2024-09-01", end: "2024-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2024-01-01", end: "2024-01-31" }, { start: "2024-05-01", end: "2024-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2024-05-15", end: "2024-06-10" }, { start: "2024-12-01", end: "2024-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2024-02-01", end: "2024-02-15" }, { start: "2024-06-11", end: "2024-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2024-10-01", end: "2024-11-26" }, { start: "2024-11-30", end: "2024-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2024-02-16", end: "2024-02-29" }, { start: "2024-03-01", end: "2024-03-23" }, { start: "2024-04-01", end: "2024-04-30" }, { start: "2024-11-27", end: "2024-11-29" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2024-03-24", end: "2024-03-31" }, { start: "2024-12-24", end: "2024-12-31" }] },
];

RESORTS.push({
  id: "grandFloridian",
  name: "The Villas at Disney's Grand Floridian Resort & Spa",
  year: 2024,
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
  travelPeriods: buildPeriods(VGF_2024, [
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
});

// === 2025 — 7 travel periods ===
const VGF_2025 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2025-09-01", end: "2025-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2025-01-01", end: "2025-01-31" }, { start: "2025-05-01", end: "2025-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2025-05-15", end: "2025-06-10" }, { start: "2025-12-01", end: "2025-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2025-02-01", end: "2025-02-15" }, { start: "2025-06-11", end: "2025-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2025-10-01", end: "2025-11-25" }, { start: "2025-11-29", end: "2025-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2025-02-16", end: "2025-04-12" }, { start: "2025-04-21", end: "2025-04-30" }, { start: "2025-11-26", end: "2025-11-28" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2025-04-13", end: "2025-04-20" }, { start: "2025-12-24", end: "2025-12-31" }] },
];

RESORTS.push({
  id: "grandFloridian",
  name: "The Villas at Disney's Grand Floridian Resort & Spa",
  year: 2025,
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
  travelPeriods: buildPeriods(VGF_2025, [
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
});

// === 2026 — 7 travel periods ===
const VGF_2026 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2026-09-01", end: "2026-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2026-01-01", end: "2026-01-31" }, { start: "2026-05-01", end: "2026-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2026-05-15", end: "2026-06-10" }, { start: "2026-12-01", end: "2026-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2026-02-01", end: "2026-02-15" }, { start: "2026-06-11", end: "2026-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2026-10-01", end: "2026-11-24" }, { start: "2026-11-28", end: "2026-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2026-02-16", end: "2026-03-28" }, { start: "2026-04-06", end: "2026-04-30" }, { start: "2026-11-25", end: "2026-11-27" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2026-03-29", end: "2026-04-05" }, { start: "2026-12-24", end: "2026-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(VGF_2026, [
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
});

// === 2027 — 7 travel periods ===
const VGF_2027 = [
  { name: "Adventure", color: "#4CAF50", dateRanges: [{ start: "2027-09-01", end: "2027-09-30" }] },
  { name: "Dream", color: "#2196F3", dateRanges: [{ start: "2027-01-01", end: "2027-01-31" }, { start: "2027-05-01", end: "2027-05-14" }] },
  { name: "Choice", color: "#9C27B0", dateRanges: [{ start: "2027-05-15", end: "2027-06-10" }, { start: "2027-12-01", end: "2027-12-23" }] },
  { name: "Select", color: "#FF9800", dateRanges: [{ start: "2027-02-01", end: "2027-02-15" }, { start: "2027-06-11", end: "2027-08-31" }] },
  { name: "Preferred", color: "#00BCD4", dateRanges: [{ start: "2027-10-01", end: "2027-11-23" }, { start: "2027-11-27", end: "2027-11-30" }] },
  { name: "Premier", color: "#E91E63", dateRanges: [{ start: "2027-02-16", end: "2027-03-20" }, { start: "2027-03-29", end: "2027-04-30" }, { start: "2027-11-24", end: "2027-11-26" }] },
  { name: "Holiday", color: "#F44336", dateRanges: [{ start: "2027-03-21", end: "2027-03-28" }, { start: "2027-12-24", end: "2027-12-31" }] },
];

RESORTS.push({
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
  travelPeriods: buildPeriods(VGF_2027, [
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
});

// ======================================================================
// Deduplicate
// ======================================================================

// data.js already defines 2026/2027 entries, and those carry cash rates that
// the PDF archive has no source for. This file re-emits the same years, so keep
// the first entry for each (id, year) pair — data.js loads first, so it wins,
// and the resort dropdowns stop listing every resort twice.
(function dedupeResorts() {
  const seen = new Set();
  const unique = RESORTS.filter((r) => {
    const key = r.id + "|" + r.year;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  RESORTS.length = 0;
  RESORTS.push(...unique);
})();
