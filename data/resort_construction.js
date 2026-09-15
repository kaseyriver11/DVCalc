// Disney Hotel Construction & Refurbishment Tracker
// Source: Disney Food Blog's "DFB Disney World Calendar" (v26.10)
// https://www.disneyfoodblog.com/wdwcalendar
// Transcribed from the PDF's "Disney Hotel Construction" section 2026-09-13.
//
// Each entry: resortIds (DVCalc resort id(s) affected), location (building/area
// within the resort, if the whole resort isn't affected), startDate/endDate
// (ISO "YYYY-MM-DD", or null for "Ongoing"/open-ended — ongoing work with no
// known start is treated as already active, and an open end date is treated
// as still active until DFB reports a close), dateRangeLabel (the original
// human-readable range, since several of these are quarter/season-level
// estimates that don't reduce cleanly to exact days), and description.
//
// Only entries for DVC resorts are included (DVCalc doesn't track non-DVC
// hotels like All-Star Movies or Port Orleans). Some construction affects a
// shared building that houses both a non-DVC resort and its DVC villas (e.g.
// BoardWalk Inn / BoardWalk Villas) — those are kept since they affect DVC
// guests too.
const RESORT_CONSTRUCTION = [
  {
    resortIds: ["animalKingdomVillas"],
    location: "Jambo House",
    startDate: "2026-05-01",
    endDate: "2027-01-31",
    dateRangeLabel: "May '26 → Jan '27",
    description: "Room refurbishment.",
  },
  {
    resortIds: ["animalKingdomVillas"],
    location: "Kidani Village",
    startDate: "2026-08-17",
    endDate: "2026-10-09",
    dateRangeLabel: "Aug 17 '26 → Oct 9 '26",
    description: "Main lobby and primary entrance closed. Check-in will be at Palace Library.",
  },
  {
    resortIds: ["animalKingdomVillas"],
    location: "Kidani Village",
    startDate: "2026-08-17",
    endDate: null,
    dateRangeLabel: "Aug 17 '26 → still ongoing as of latest updates (original end date Aug 28 '26)",
    description: "Johari Treasures shop closed.",
  },
  {
    resortIds: ["animalKingdomVillas"],
    location: "Kidani Village",
    startDate: "2026-09-28",
    endDate: "2026-10-09",
    dateRangeLabel: "Sept 28 '26 → Oct 9 '26",
    description: "North side lobby corridor closed. North side lobby elevators (2nd floor) and outdoor terrace observation deck unavailable.",
  },
  {
    resortIds: ["animalKingdomVillas"],
    location: "Kidani Village",
    startDate: "2026-10-26",
    endDate: "2026-11-06",
    dateRangeLabel: "Oct 26 '26 → Nov 6 '26",
    description: "South side lobby corridor closed. Community Hall, Safari So Good Arcade, laundry room, Palace Library, lobby restrooms, and outdoor terrace observation deck unavailable.",
  },
  {
    resortIds: ["beachClubVillas"],
    location: "Beach Club Resort",
    startDate: null,
    endDate: "2027-12-31",
    dateRangeLabel: "Ongoing → Late '27",
    description: "Broader exterior maintenance across the Beach Club/Beach Club Villas complex.",
  },
  {
    resortIds: ["beachClubVillas"],
    location: "Beach Club Villas",
    startDate: "2026-08-03",
    endDate: "2026-09-15",
    dateRangeLabel: "Aug 3 '26 → mid-Sept '26",
    description: "Lobby undergoing maintenance in phases.",
  },
  {
    resortIds: ["boardwalkVillas"],
    location: "BoardWalk Inn",
    startDate: "2025-11-25",
    endDate: "2026-12-31",
    dateRangeLabel: "Late Nov '25 → Late '26",
    description: "Refurbishment work in select areas of the BoardWalk Inn/BoardWalk Villas complex.",
  },
  {
    resortIds: ["boardwalkVillas"],
    location: "BoardWalk Inn",
    startDate: "2027-01-11",
    endDate: "2027-04-30",
    dateRangeLabel: "Jan 11 '27 → April '27",
    description: "Luna Park Pool, Luna Park Crazy Play Area, and Leaping Horse Libations closed for routine maintenance.",
  },
  {
    resortIds: ["boardwalkVillas"],
    location: "Disney's BoardWalk",
    startDate: null,
    endDate: "2026-12-31",
    dateRangeLabel: "Ongoing construction → openings starting late '26 (exact dates TBD)",
    description: "New experiences coming to the BoardWalk: a lounge called Hurly-Burly (opened Oct 1, 2026), a new Basin on the BoardWalk store, and a new quick-service restaurant.",
  },
  {
    resortIds: ["bayLakeTower"],
    location: "Contemporary Resort & Bay Lake Tower",
    startDate: null,
    endDate: "2027-12-31",
    dateRangeLabel: "Ongoing → Late '27",
    description: "Refurbishments in select areas, including Bay Lake Tower and the Main Tower atrium.",
  },
  {
    resortIds: ["grandFloridian"],
    location: "Grand Floridian Resort",
    startDate: null,
    endDate: "2027-03-31",
    dateRangeLabel: "Ongoing → Early '27",
    description: "Renovations in select areas of the Grand Floridian Resort/Villas complex.",
  },
  {
    resortIds: ["grandFloridian"],
    location: "Grand Floridian Cafe",
    startDate: "2026-07-15",
    endDate: "2026-11-01",
    dateRangeLabel: "Mid-July '26 → dinner returns Nov 2 '26",
    description: "Grand Floridian Cafe closed for a refresh; brunch temporarily moved to Citricos.",
  },
  {
    resortIds: ["oldKeyWest"],
    location: "Hospitality House",
    startDate: "2026-03-16",
    endDate: "2026-09-15",
    dateRangeLabel: "Mar 16 '26 → mid-Sept '26",
    description: "Hospitality House undergoing exterior maintenance work.",
  },
  {
    resortIds: ["polynesianVillas"],
    location: "Grand Ceremonial House",
    startDate: "2026-04-15",
    endDate: "2026-10-31",
    dateRangeLabel: "Mid-April '26 → late Oct '26",
    description: "Trader Sam's Tiki Terrace temporarily closed due to refurbishment work at the Grand Ceremonial House.",
  },
  {
    resortIds: ["polynesianVillas"],
    location: "Disney's Polynesian Villas & Bungalows",
    startDate: "2025-05-01",
    endDate: "2026-12-31",
    dateRangeLabel: "May '25 → through '26",
    description: "Some areas of the Resort, Villas, & Bungalows are being refurbished.",
  },
  {
    resortIds: ["polynesianVillas"],
    location: "'Ohana",
    startDate: "2026-01-15",
    endDate: "2026-12-31",
    dateRangeLabel: "Jan 15 '26 → through '26",
    description: "Due to exterior maintenance, views of the Seven Seas Lagoon from 'Ohana may be partially or completely obstructed.",
  },
  {
    resortIds: ["saratogaSprings"],
    location: "Disney's Saratoga Springs Resort",
    startDate: null,
    endDate: "2026-11-30",
    dateRangeLabel: "Ongoing → Fall '26",
    description: "Refurbishment work in phases, including the Treehouse Villas and Porte Cochere.",
  },
  {
    resortIds: ["saratogaSprings"],
    location: "Turf Club",
    startDate: "2026-08-31",
    endDate: "2026-09-29",
    dateRangeLabel: "Aug 31 '26 → Sept 29 '26 (reopening Sept 30)",
    description: "The Turf Club Bar & Grill closed, but the Turf Club Lounge remains open.",
  },
  {
    resortIds: ["saratogaSprings"],
    location: "Tennis Courts",
    startDate: "2026-08-25",
    endDate: "2026-11-30",
    dateRangeLabel: "Late Aug '26 → through Nov '26",
    description: "Tennis courts closed.",
  },
  {
    resortIds: ["boulderRidge", "copperCreek"],
    location: "Disney's Wilderness Lodge & Copper Creek Villas & Cabins",
    startDate: null,
    endDate: "2026-12-31",
    dateRangeLabel: "Ongoing → Late '26",
    description: "Broader exterior maintenance.",
  },
  {
    resortIds: ["boulderRidge", "copperCreek"],
    location: "Disney's Wilderness Lodge",
    startDate: "2026-03-25",
    endDate: "2026-10-15",
    dateRangeLabel: "Late Mar '26 → mid-Oct '26",
    description: "As part of the broader exterior refurbishment, the security kiosk will be expanded. The entrance stays open, but late closures may occur at times.",
  },
  {
    resortIds: ["fortWildernessCabins"],
    location: "The Cabins",
    startDate: null,
    endDate: "2026-10-15",
    dateRangeLabel: "Ongoing → mid-Oct '26",
    description: "Soil erosion prevention work along the sidewalk on Big Pine Trail. Alternate paths of travel may be in place at times.",
  },
  {
    resortIds: ["rivieraResort"],
    location: "Disney Skyliner",
    startDate: "2027-01-24",
    endDate: "2027-01-30",
    dateRangeLabel: "Jan 24 '27 → Jan 30 '27",
    description: "Disney Skyliner closed for refurbishment (affects Riviera Resort and other Skyliner-served resorts).",
  },
  {
    resortIds: ["rivieraResort"],
    location: "Disney Skyliner",
    startDate: "2028-01-24",
    endDate: "2028-02-02",
    dateRangeLabel: "Jan 24 '28 → Feb 2 '28",
    description: "Disney Skyliner closed for refurbishment (affects Riviera Resort and other Skyliner-served resorts).",
  },
];

// Returns construction/refurbishment entries for a DVCalc resort id that
// overlap the given [rangeStart, rangeEnd) window -- callers pass either the
// selected stay dates or the currently-viewed calendar month, so an entry
// only shows up when it's actually relevant to what's on screen.
function getResortConstruction(resortId, rangeStart, rangeEnd) {
  return RESORT_CONSTRUCTION
    .filter((entry) => entry.resortIds.includes(resortId))
    .filter((entry) => dateRangesOverlap(entry.startDate, entry.endDate, rangeStart, rangeEnd));
}

// Null start/end are treated as open-ended (-Infinity / +Infinity).
function dateRangesOverlap(aStart, aEnd, bStart, bEnd) {
  const s1 = aStart || "0000-01-01";
  const e1 = aEnd || "9999-12-31";
  const s2 = bStart || "0000-01-01";
  const e2 = bEnd || "9999-12-31";
  return s1 <= e2 && s2 <= e1;
}
