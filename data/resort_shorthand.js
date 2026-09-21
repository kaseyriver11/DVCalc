// Punchy shorthand for each of the 17 DVC resorts, trimmed of the
// "Disney's"/"The Villas at"/legal-suffix boilerplate in their full RESORTS
// names -- shared by app.js (default "Save Itinerary" name suggestions) and
// itinerarycompare.html (comparison table headers) so both stay in sync
// from one source instead of two copies drifting apart.
const RESORT_SHORTHAND = {
  animalKingdomVillas: "Animal Kingdom Villas",
  bayLakeTower: "Bay Lake Tower",
  beachClubVillas: "Beach Club Villas",
  boardwalkVillas: "BoardWalk Villas",
  boulderRidge: "Boulder Ridge",
  copperCreek: "Copper Creek",
  fortWildernessCabins: "Fort Wilderness Cabins",
  grandFloridian: "Grand Floridian",
  oldKeyWest: "Old Key West",
  polynesianVillas: "Polynesian Villas",
  rivieraResort: "Riviera",
  saratogaSprings: "Saratoga Springs",
  aulani: "Aulani",
  hiltonHead: "Hilton Head",
  veroBeach: "Vero Beach",
  disneylandHotel: "Disneyland Villas",
  grandCalifornian: "Grand Californian",
};

// fallbackName is whatever full name the caller already looked up (its own
// RESORTS lookup) -- this file only owns the shorthand mapping, not resort
// lookup logic, so it stays usable from any page's own data-access pattern.
function shorthandResortName(resortId, fallbackName) {
  return RESORT_SHORTHAND[resortId] || fallbackName;
}
