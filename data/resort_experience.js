// Subjective/logistics resort attributes for compare.html's "Vibe &
// Logistics" view -- transportation, walkability, pool tier, dining
// density, and typical room square footage by room category.
//
// Unlike data/dues_historical.js or data/resort_investment.js, this is NOT
// built from a single verified source document -- it's authored from
// well-established, widely-published DVC resort facts (which transportation
// a resort uses, which pool it has, roughly how many dining options are on
// site). Transportation and headline pool identity are about as settled as
// DVC facts get and unlikely to be wrong in a way that matters. Square
// footage figures are the least certain part here: they're typical/
// representative numbers for the STANDARD room in each category (studio/
// one/two/three-bedroom), not pulled from Disney's own published
// architectural specs, and real units can vary a bit by specific room
// category (view type doesn't change square footage, but "Deluxe Studio"
// vs a resort's unique unit types sometimes do). Treat sqftByCategory as
// "roughly this size," not an exact number to build a real financial
// decision on without double-checking Disney's own resort pages.
//
// poolTier: "signature" (a genuine destination pool -- Stormalong Bay,
// Aulani's lagoon) | "themed" (well-themed, a real draw, but not quite
// that top tier) | "standard" (a normal, functional resort pool).
// diningDensity: "high" | "moderate" | "low" -- roughly how many
// table-service/notable dining options sit on property.
const RESORT_EXPERIENCE = {
  animalKingdomVillas: {
    transportation: ["Bus"],
    walkability: "Not walkable to any park -- bus to all four theme parks.",
    poolTier: "themed",
    poolNote: "Uzima Springs (Jambo House) / Samawati Springs (Kidani Village) -- themed, not the resort's headline draw.",
    diningDensity: "high",
    diningNote: "Jiko, Sanaa, and Boma all on site.",
    sqftByCategory: { studio: 340, one: 780, two: 1320, three: 2200 },
  },
  aulani: {
    transportation: ["Shuttle/Bus"],
    walkability: "Walkable within the Ko Olina resort area; not near any Walt Disney World or Disneyland park.",
    poolTier: "signature",
    poolNote: "Multiple pools, a lazy river, and a snorkeling lagoon -- one of DVC's most elaborate water features.",
    diningDensity: "moderate",
    diningNote: "'Ama'Ama and Makahiki plus quick-service on site.",
    sqftByCategory: { studio: 331, one: 727, two: 1076, three: 1877 },
  },
  bayLakeTower: {
    transportation: ["Monorail", "Walking"],
    walkability: "Walkway + monorail to Magic Kingdom.",
    poolTier: "standard",
    poolNote: "Nice standard pool; shares the Contemporary's dining rather than having its own signature water feature.",
    diningDensity: "high",
    diningNote: "California Grill plus the rest of the Contemporary's dining lineup next door.",
    sqftByCategory: { studio: 365, one: 710, two: 1370, three: 2044 },
  },
  beachClubVillas: {
    transportation: ["Walking", "Boat"],
    walkability: "Walk to Epcot's International Gateway; boat or walk to Hollywood Studios.",
    poolTier: "signature",
    poolNote: "Stormalong Bay -- widely considered the best pool on Disney property.",
    diningDensity: "high",
    diningNote: "Beaches & Cream plus easy walking access to Boardwalk/Epcot dining.",
    sqftByCategory: { studio: 356, one: 726, two: 1136 },
  },
  boardwalkVillas: {
    transportation: ["Walking", "Boat"],
    walkability: "Walk to Epcot's International Gateway and Hollywood Studios.",
    poolTier: "themed",
    poolNote: "Luna Park Pool -- carnival-themed with the Keister Coaster slide.",
    diningDensity: "high",
    diningNote: "Flying Fish, plus the whole Boardwalk promenade's dining on your doorstep.",
    sqftByCategory: { studio: 359, one: 712, two: 1071, three: 2142 },
  },
  boulderRidge: {
    transportation: ["Boat", "Bus"],
    walkability: "Boat to Magic Kingdom; bus to the other parks.",
    poolTier: "standard",
    poolNote: "Boulder Ridge Cove Pool, plus access to Copper Creek Springs Pool next door.",
    diningDensity: "moderate",
    diningNote: "Whispering Canyon Cafe and Geyser Point Bar & Grill on site.",
    sqftByCategory: { studio: 340, one: 727, two: 1080 },
  },
  copperCreek: {
    transportation: ["Boat", "Bus"],
    walkability: "Boat to Magic Kingdom; bus to the other parks.",
    poolTier: "standard",
    poolNote: "Copper Creek Springs Pool.",
    diningDensity: "moderate",
    diningNote: "Geyser Point Bar & Grill, Whispering Canyon Cafe, Roaring Fork.",
    sqftByCategory: { studio: 340, one: 727, two: 1080 },
  },
  disneylandHotel: {
    transportation: ["Walking"],
    walkability: "Walk directly into Disneyland and Disney California Adventure.",
    poolTier: "standard",
    poolNote: "Three themed pools (including a Fantasy Tower slide) -- fun, but not quite signature tier.",
    diningDensity: "high",
    diningNote: "On the Downtown Disney District's doorstep.",
    sqftByCategory: { studio: 281, one: 532 },
  },
  fortWildernessCabins: {
    transportation: ["Boat", "Bus"],
    walkability: "Not walkable to any park -- a campground-style setting, boat/bus to Magic Kingdom and Disney Springs.",
    poolTier: "standard",
    poolNote: "Shares Fort Wilderness's Meadow and Settlement pools, not a villa-exclusive pool.",
    diningDensity: "low",
    diningNote: "Trail's End Restaurant and the Hoop-Dee-Doo Musical Revue.",
    sqftByCategory: { studio: 500 },
  },
  grandCalifornian: {
    transportation: ["Walking"],
    walkability: "Private entrance directly into Disney California Adventure.",
    poolTier: "themed",
    poolNote: "Redwood Pool -- themed and well-regarded, just under Stormalong Bay's tier.",
    diningDensity: "high",
    diningNote: "Napa Rose, Storytellers Cafe, and Downtown Disney next door.",
    sqftByCategory: { studio: 319, one: 709, two: 1109 },
  },
  grandFloridian: {
    transportation: ["Monorail", "Boat"],
    walkability: "Monorail or boat to Magic Kingdom.",
    poolTier: "themed",
    poolNote: "Courtyard Pool plus a dedicated beach pool at Disney's flagship resort.",
    diningDensity: "high",
    diningNote: "Victoria & Albert's, Citricos, and the rest of the Grand Floridian's dining lineup.",
    sqftByCategory: { studio: 380, one: 830, two: 1770 },
  },
  hiltonHead: {
    transportation: [],
    walkability: "Not near any Disney theme park -- a standalone South Carolina beach destination.",
    poolTier: "standard",
    poolNote: "Leisure-focused resort pools, not theme-park-adjacent.",
    diningDensity: "low",
    diningNote: "A couple of on-site dining options.",
    sqftByCategory: { studio: 372, one: 815, two: 1500, three: 2000 },
  },
  oldKeyWest: {
    transportation: ["Bus", "Boat"],
    walkability: "Bus to the parks; boat to Disney Springs.",
    poolTier: "standard",
    poolNote: "A main pool plus three quiet pools, spread across DVC's most spread-out resort footprint.",
    diningDensity: "moderate",
    diningNote: "Olivia's Cafe and the Gurgling Suitcase.",
    sqftByCategory: { studio: 390, one: 942, two: 1333, three: 2374 },
  },
  polynesianVillas: {
    transportation: ["Monorail", "Boat"],
    walkability: "Monorail or boat to Magic Kingdom.",
    poolTier: "themed",
    poolNote: "The Lava Pool -- a volcano-themed pool with a popular slide.",
    diningDensity: "high",
    diningNote: "'Ohana and Kona Cafe on site.",
    sqftByCategory: { studio: 356, two: 1326 },
  },
  rivieraResort: {
    transportation: ["Skyliner", "Bus"],
    walkability: "Skyliner to Epcot and Hollywood Studios; bus to Magic Kingdom and Animal Kingdom.",
    poolTier: "standard",
    poolNote: "Beau Soleil Pool -- a nice rooftop-style pool, not a signature water feature.",
    diningDensity: "moderate",
    diningNote: "Topolino's Terrace signature dining on site.",
    sqftByCategory: { studio: 366, one: 672, two: 1346, three: 2075 },
  },
  saratogaSprings: {
    transportation: ["Bus", "Boat", "Walking"],
    walkability: "Some sections are walkable to Disney Springs; boat also available. Bus to the parks.",
    poolTier: "standard",
    poolNote: "High Rock Spring Pool plus three quiet pools, across a large, spread-out resort.",
    diningDensity: "moderate",
    diningNote: "The Turf Club Bar & Grill on site; boat to Disney Springs dining.",
    sqftByCategory: { studio: 355, one: 714, two: 1075, three: 2113 },
  },
  veroBeach: {
    transportation: [],
    walkability: "Not near any Disney theme park -- a standalone Florida beach destination.",
    poolTier: "standard",
    poolNote: "Leisure-focused resort pools, not theme-park-adjacent.",
    diningDensity: "low",
    diningNote: "A couple of on-site dining options.",
    sqftByCategory: { studio: 340, one: 805, two: 1400, three: 2100 },
  },
};
