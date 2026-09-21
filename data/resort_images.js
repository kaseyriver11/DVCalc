// AI-generated hero art for resorts, keyed by resort id -- opt-in per
// resort (only add an entry once real art exists for it) rather than a
// placeholder for all 17, so a resort with no art yet just falls back to
// the plain look everywhere this is used (no broken image, no generic
// stock photo). All 17 resorts now have art (added 2026-09-20), one
// consistent ~1672x941 (16:9) illustrated sunset style. Tinify-compressed
// (palette/indexed PNG) from ~2.5-3MB originals down to ~700-840KB each
// (~13MB total) -- a real improvement, but still heavier than ideal for
// continuous-tone art like this; converting to WebP/JPEG would likely get
// each well under 300KB (PNG's palette quantization doesn't compress soft
// gradients as efficiently as JPEG's DCT-based approach does).
const RESORT_IMAGES = {
  copperCreek: "images/resorts/copperCreek.png",
  animalKingdomVillas: "images/resorts/animalKingdomVillas.png",
  aulani: "images/resorts/aulani.png",
  beachClubVillas: "images/resorts/beachClubVillas.png",
  oldKeyWest: "images/resorts/oldKeyWest.png",
  boulderRidge: "images/resorts/boulderRidge.png",
  fortWildernessCabins: "images/resorts/fortWildernessCabins.png",
  bayLakeTower: "images/resorts/bayLakeTower.png",
  rivieraResort: "images/resorts/rivieraResort.png",
  saratogaSprings: "images/resorts/saratogaSprings.png",
  polynesianVillas: "images/resorts/polynesianVillas.png",
  grandFloridian: "images/resorts/grandFloridian.png",
  grandCalifornian: "images/resorts/grandCalifornian.png",
  hiltonHead: "images/resorts/hiltonHead.png",
  veroBeach: "images/resorts/veroBeach.png",
  boardwalkVillas: "images/resorts/boardwalkVillas.png",
  disneylandHotel: "images/resorts/disneylandHotel.png",
};

function getResortImage(resortId) {
  return RESORT_IMAGES[resortId] || null;
}
