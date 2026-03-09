// DVC Points Data — Animal Kingdom Villas (2016-2027)
// Auto-extracted from official DVC PDFs via scripts/extract_historical.py
// Source: https://dvcfieldguide.com/point-archive
//
// This file pushes AKV resort entries onto the RESORTS array.
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

// === 2016 — 5 travel periods ===
const WDW_2016 = [
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
    { id: "dsR", name: "Deluxe Studio - Standard View", sleeps: 4 },
    { id: "dsSV", name: "Deluxe Studio - Savanna View", sleeps: 4 },
    { id: "dsC", name: "Deluxe Studio - Club Concierge", sleeps: 4 },
    { id: "oneV", name: "One-Bedroom Villa - Value", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Standard View", sleeps: 5 },
    { id: "oneSV", name: "One-Bedroom Villa - Savanna View", sleeps: 5 },
    { id: "oneC", name: "One-Bedroom Villa - Club Concierge", sleeps: 5 },
    { id: "twoV", name: "Two-Bedroom Villa - Value", sleeps: 9 },
    { id: "twoR", name: "Two-Bedroom Villa - Standard View", sleeps: 9 },
    { id: "twoSV", name: "Two-Bedroom Villa - Savanna View", sleeps: 9 },
    { id: "twoC", name: "Two-Bedroom Villa - Club Concierge", sleeps: 9 },
    { id: "threeR", name: "Three-Bedroom Grand Villa - Standard View", sleeps: 12 },
    { id: "threeSV", name: "Three-Bedroom Grand Villa - Savanna View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(WDW_2016, [
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
const WDW_2017 = [
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
    { id: "dsR", name: "Deluxe Studio - Standard View", sleeps: 4 },
    { id: "dsSV", name: "Deluxe Studio - Savanna View", sleeps: 4 },
    { id: "dsC", name: "Deluxe Studio - Club Concierge", sleeps: 4 },
    { id: "oneV", name: "One-Bedroom Villa - Value", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Standard View", sleeps: 5 },
    { id: "oneSV", name: "One-Bedroom Villa - Savanna View", sleeps: 5 },
    { id: "oneC", name: "One-Bedroom Villa - Club Concierge", sleeps: 5 },
    { id: "twoV", name: "Two-Bedroom Villa - Value", sleeps: 9 },
    { id: "twoR", name: "Two-Bedroom Villa - Standard View", sleeps: 9 },
    { id: "twoSV", name: "Two-Bedroom Villa - Savanna View", sleeps: 9 },
    { id: "twoC", name: "Two-Bedroom Villa - Club Concierge", sleeps: 9 },
    { id: "threeR", name: "Three-Bedroom Grand Villa - Standard View", sleeps: 12 },
    { id: "threeSV", name: "Three-Bedroom Grand Villa - Savanna View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(WDW_2017, [
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
const WDW_2018 = [
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
    { id: "dsR", name: "Deluxe Studio - Standard View", sleeps: 4 },
    { id: "dsSV", name: "Deluxe Studio - Savanna View", sleeps: 4 },
    { id: "dsC", name: "Deluxe Studio - Club Concierge", sleeps: 4 },
    { id: "oneV", name: "One-Bedroom Villa - Value", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Standard View", sleeps: 5 },
    { id: "oneSV", name: "One-Bedroom Villa - Savanna View", sleeps: 5 },
    { id: "oneC", name: "One-Bedroom Villa - Club Concierge", sleeps: 5 },
    { id: "twoV", name: "Two-Bedroom Villa - Value", sleeps: 9 },
    { id: "twoR", name: "Two-Bedroom Villa - Standard View", sleeps: 9 },
    { id: "twoSV", name: "Two-Bedroom Villa - Savanna View", sleeps: 9 },
    { id: "twoC", name: "Two-Bedroom Villa - Club Concierge", sleeps: 9 },
    { id: "threeR", name: "Three-Bedroom Grand Villa - Standard View", sleeps: 12 },
    { id: "threeSV", name: "Three-Bedroom Grand Villa - Savanna View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(WDW_2018, [
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
const WDW_2019 = [
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
    { id: "dsR", name: "Deluxe Studio - Standard View", sleeps: 4 },
    { id: "dsSV", name: "Deluxe Studio - Savanna View", sleeps: 4 },
    { id: "dsC", name: "Deluxe Studio - Club Concierge", sleeps: 4 },
    { id: "oneV", name: "One-Bedroom Villa - Value", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Standard View", sleeps: 5 },
    { id: "oneSV", name: "One-Bedroom Villa - Savanna View", sleeps: 5 },
    { id: "oneC", name: "One-Bedroom Villa - Club Concierge", sleeps: 5 },
    { id: "twoV", name: "Two-Bedroom Villa - Value", sleeps: 9 },
    { id: "twoR", name: "Two-Bedroom Villa - Standard View", sleeps: 9 },
    { id: "twoSV", name: "Two-Bedroom Villa - Savanna View", sleeps: 9 },
    { id: "twoC", name: "Two-Bedroom Villa - Club Concierge", sleeps: 9 },
    { id: "threeR", name: "Three-Bedroom Grand Villa - Standard View", sleeps: 12 },
    { id: "threeSV", name: "Three-Bedroom Grand Villa - Savanna View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(WDW_2019, [
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
const WDW_2020 = [
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
    { id: "dsR", name: "Deluxe Studio - Standard View", sleeps: 4 },
    { id: "dsSV", name: "Deluxe Studio - Savanna View", sleeps: 4 },
    { id: "dsC", name: "Deluxe Studio - Club Concierge", sleeps: 4 },
    { id: "oneV", name: "One-Bedroom Villa - Value", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Standard View", sleeps: 5 },
    { id: "oneSV", name: "One-Bedroom Villa - Savanna View", sleeps: 5 },
    { id: "oneC", name: "One-Bedroom Villa - Club Concierge", sleeps: 5 },
    { id: "twoV", name: "Two-Bedroom Villa - Value", sleeps: 9 },
    { id: "twoR", name: "Two-Bedroom Villa - Standard View", sleeps: 9 },
    { id: "twoSV", name: "Two-Bedroom Villa - Savanna View", sleeps: 9 },
    { id: "twoC", name: "Two-Bedroom Villa - Club Concierge", sleeps: 9 },
    { id: "threeR", name: "Three-Bedroom Grand Villa - Standard View", sleeps: 12 },
    { id: "threeSV", name: "Three-Bedroom Grand Villa - Savanna View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(WDW_2020, [
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
const WDW_2021 = [
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
    { id: "dsR", name: "Deluxe Studio - Standard View", sleeps: 4 },
    { id: "dsSV", name: "Deluxe Studio - Savanna View", sleeps: 4 },
    { id: "dsC", name: "Deluxe Studio - Club Concierge", sleeps: 4 },
    { id: "oneV", name: "One-Bedroom Villa - Value", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Standard View", sleeps: 5 },
    { id: "oneSV", name: "One-Bedroom Villa - Savanna View", sleeps: 5 },
    { id: "oneC", name: "One-Bedroom Villa - Club Concierge", sleeps: 5 },
    { id: "twoV", name: "Two-Bedroom Villa - Value", sleeps: 9 },
    { id: "twoR", name: "Two-Bedroom Villa - Standard View", sleeps: 9 },
    { id: "twoSV", name: "Two-Bedroom Villa - Savanna View", sleeps: 9 },
    { id: "twoC", name: "Two-Bedroom Villa - Club Concierge", sleeps: 9 },
    { id: "threeR", name: "Three-Bedroom Grand Villa - Standard View", sleeps: 12 },
    { id: "threeSV", name: "Three-Bedroom Grand Villa - Savanna View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(WDW_2021, [
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
const WDW_2022 = [
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
    { id: "dsR", name: "Deluxe Studio - Standard View", sleeps: 4 },
    { id: "dsSV", name: "Deluxe Studio - Savanna View", sleeps: 4 },
    { id: "dsC", name: "Deluxe Studio - Club Concierge", sleeps: 4 },
    { id: "oneV", name: "One-Bedroom Villa - Value", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Standard View", sleeps: 5 },
    { id: "oneSV", name: "One-Bedroom Villa - Savanna View", sleeps: 5 },
    { id: "oneC", name: "One-Bedroom Villa - Club Concierge", sleeps: 5 },
    { id: "twoV", name: "Two-Bedroom Villa - Value", sleeps: 9 },
    { id: "twoR", name: "Two-Bedroom Villa - Standard View", sleeps: 9 },
    { id: "twoSV", name: "Two-Bedroom Villa - Savanna View", sleeps: 9 },
    { id: "twoC", name: "Two-Bedroom Villa - Club Concierge", sleeps: 9 },
    { id: "threeR", name: "Three-Bedroom Grand Villa - Standard View", sleeps: 12 },
    { id: "threeSV", name: "Three-Bedroom Grand Villa - Savanna View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(WDW_2022, [
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
const WDW_2023 = [
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
    { id: "dsR", name: "Deluxe Studio - Standard View", sleeps: 4 },
    { id: "dsSV", name: "Deluxe Studio - Savanna View", sleeps: 4 },
    { id: "dsC", name: "Deluxe Studio - Club Concierge", sleeps: 4 },
    { id: "oneV", name: "One-Bedroom Villa - Value", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Standard View", sleeps: 5 },
    { id: "oneSV", name: "One-Bedroom Villa - Savanna View", sleeps: 5 },
    { id: "oneC", name: "One-Bedroom Villa - Club Concierge", sleeps: 5 },
    { id: "twoV", name: "Two-Bedroom Villa - Value", sleeps: 9 },
    { id: "twoR", name: "Two-Bedroom Villa - Standard View", sleeps: 9 },
    { id: "twoSV", name: "Two-Bedroom Villa - Savanna View", sleeps: 9 },
    { id: "twoC", name: "Two-Bedroom Villa - Club Concierge", sleeps: 9 },
    { id: "threeR", name: "Three-Bedroom Grand Villa - Standard View", sleeps: 12 },
    { id: "threeSV", name: "Three-Bedroom Grand Villa - Savanna View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(WDW_2023, [
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
const WDW_2024 = [
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
    { id: "dsR", name: "Deluxe Studio - Standard View", sleeps: 4 },
    { id: "dsSV", name: "Deluxe Studio - Savanna View", sleeps: 4 },
    { id: "dsC", name: "Deluxe Studio - Club Concierge", sleeps: 4 },
    { id: "oneV", name: "One-Bedroom Villa - Value", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Standard View", sleeps: 5 },
    { id: "oneSV", name: "One-Bedroom Villa - Savanna View", sleeps: 5 },
    { id: "oneC", name: "One-Bedroom Villa - Club Concierge", sleeps: 5 },
    { id: "twoV", name: "Two-Bedroom Villa - Value", sleeps: 9 },
    { id: "twoR", name: "Two-Bedroom Villa - Standard View", sleeps: 9 },
    { id: "twoSV", name: "Two-Bedroom Villa - Savanna View", sleeps: 9 },
    { id: "twoC", name: "Two-Bedroom Villa - Club Concierge", sleeps: 9 },
    { id: "threeR", name: "Three-Bedroom Grand Villa - Standard View", sleeps: 12 },
    { id: "threeSV", name: "Three-Bedroom Grand Villa - Savanna View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(WDW_2024, [
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
const WDW_2025 = [
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
    { id: "dsR", name: "Deluxe Studio - Standard View", sleeps: 4 },
    { id: "dsSV", name: "Deluxe Studio - Savanna View", sleeps: 4 },
    { id: "dsC", name: "Deluxe Studio - Club Concierge", sleeps: 4 },
    { id: "oneV", name: "One-Bedroom Villa - Value", sleeps: 5 },
    { id: "oneR", name: "One-Bedroom Villa - Standard View", sleeps: 5 },
    { id: "oneSV", name: "One-Bedroom Villa - Savanna View", sleeps: 5 },
    { id: "oneC", name: "One-Bedroom Villa - Club Concierge", sleeps: 5 },
    { id: "twoV", name: "Two-Bedroom Villa - Value", sleeps: 9 },
    { id: "twoR", name: "Two-Bedroom Villa - Standard View", sleeps: 9 },
    { id: "twoSV", name: "Two-Bedroom Villa - Savanna View", sleeps: 9 },
    { id: "twoC", name: "Two-Bedroom Villa - Club Concierge", sleeps: 9 },
    { id: "threeR", name: "Three-Bedroom Grand Villa - Standard View", sleeps: 12 },
    { id: "threeSV", name: "Three-Bedroom Grand Villa - Savanna View", sleeps: 12 },
  ],
  travelPeriods: buildPeriods(WDW_2025, [
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
const WDW_2026 = [
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
  travelPeriods: buildPeriods(WDW_2026, [
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
    { sunThu: { dsV:592, dsR:660, dsSV:863, dsC:965, oneV:876, oneR:1005, oneSV:1185, oneC:1369, twoR:1618, twoSV:1834, threeR:3214, threeSV:3337 },
      friSat: { dsV:668, dsR:667, dsSV:908, dsC:1092, oneV:992, oneR:1134, oneSV:1338, oneC:1550, twoR:1704, twoSV:1926, threeR:3394, threeSV:3503 } },
    { sunThu: { dsV:541, dsR:576, dsSV:825, dsC:944, oneV:883, oneR:986, oneSV:1215, oneC:1386, twoR:1479, twoSV:1676, threeR:3098, threeSV:3226 },
      friSat: { dsV:576, dsR:623, dsSV:828, dsC:1008, oneV:937, oneR:1048, oneSV:1295, oneC:1475, twoR:1580, twoSV:1739, threeR:3193, threeSV:3355 } },
    { sunThu: { dsV:532, dsR:563, dsSV:782, dsC:906, oneV:826, oneR:946, oneSV:1134, oneC:1298, twoR:1428, twoSV:1615, threeR:2990, threeSV:3112 },
      friSat: { dsV:551, dsR:590, dsSV:800, dsC:941, oneV:855, oneR:979, oneSV:1190, oneC:1346, twoR:1496, twoSV:1666, threeR:3072, threeSV:3214 } },
    { sunThu: { dsV:522, dsR:550, dsSV:738, dsC:868, oneV:768, oneR:906, oneSV:1052, oneC:1210, twoR:1378, twoSV:1554, threeR:2881, threeSV:2999 },
      friSat: { dsV:526, dsR:558, dsSV:772, dsC:874, oneV:773, oneR:910, oneSV:1086, oneC:1216, twoR:1413, twoSV:1592, threeR:2950, threeSV:3074 } },
    { sunThu: { dsV:573, dsR:584, dsSV:843, dsC:1011, oneV:970, oneR:1050, oneSV:1272, oneC:1488, twoR:1667, twoSV:1865, threeR:3236, threeSV:3348 },
      friSat: { dsV:659, dsR:672, dsSV:952, dsC:1156, oneV:1091, oneR:1197, oneSV:1450, oneC:1695, twoR:1910, twoSV:2130, threeR:3730, threeSV:3835 } },
    { sunThu: { dsV:670, dsR:683, dsSV:938, dsC:1132, oneV:1081, oneR:1199, oneSV:1472, oneC:1693, twoR:2013, twoSV:2413, threeR:3781, threeSV:3898 },
      friSat: { dsV:738, dsR:752, dsSV:1044, dsC:1270, oneV:1210, oneR:1346, oneSV:1653, oneC:1907, twoR:2257, twoSV:2697, threeR:4226, threeSV:4360 } },
    { sunThu: { dsV:808, dsR:820, dsSV:1159, dsC:1422, oneV:1236, oneR:1459, oneSV:1622, oneC:1884, twoR:2412, twoSV:2880, threeR:4486, threeSV:4628 },
      friSat: { dsV:808, dsR:820, dsSV:1159, dsC:1422, oneV:1236, oneR:1459, oneSV:1622, oneC:1884, twoR:2412, twoSV:2880, threeR:4486, threeSV:4628 } },
  ]),
});

// === 2027 — 7 travel periods ===
const WDW_2027 = [
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
  travelPeriods: buildPeriods(WDW_2027, [
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

