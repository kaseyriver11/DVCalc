// Shared DVC Badge System ("Trophy Case") logic -- used by trips.html
// (dashboard preview) and badges.html (the full Trophy Room). Wrapped in
// an IIFE exposing window.DVCBadges, same convention as dvc-dates.js/
// dvc-ui.js, so plain non-module <script> tags on both pages can share it
// without a bare top-level function name colliding with either page's own
// inline script.
//
// Depends on globals already loaded by both pages before this file:
// RESORTS, DUES_PER_POINT (data/data.js, data/dues_historical.js).
(function () {

function resortName(id) {
  const r = RESORTS.find(r => r.id === id);
  return r ? r.name : id;
}

// Falls back to the full name if data/resort_shorthand.js wasn't loaded on
// this page (trips.html loads dvc-badges.js but only ever calls
// computePointEfficiency(), never the badge-evaluation functions that need
// this -- same defensive-optional-dependency pattern as the `typeof
// DISNEY_EVENTS !== "undefined"` check in Holiday Chaser below).
function shorthand(resortId, fallbackName) {
  return typeof shorthandResortName === "function" ? shorthandResortName(resortId, fallbackName) : fallbackName;
}

// Same category-matching pattern duplicated across app.js/compare.html/
// suggest.html/contractvalue.html -- first room type whose name contains
// the category's keyword.
const CATEGORY_KEYWORDS = { studio: "studio", one: "one-bedroom", two: "two-bedroom", three: "three-bedroom" };
function getRoomTypesForCategory(resort, category) {
  const keyword = CATEGORY_KEYWORDS[category];
  return resort.roomTypes.filter(rt => rt.name.toLowerCase().includes(keyword));
}

// First year dues/allotment actually started counting for a contract --
// real purchase_date if known, else a 3-year-owned fallback. Same
// fallback trips.html/badges.html's own local copy of this function uses
// for their Cost of Ownership tables -- duplicated here (not shared) so
// computePointEfficiency() and the Lifer badge below don't need a value
// passed in from the caller.
function contractOwnershipStartYear(c) {
  const currentYear = new Date().getFullYear();
  return c.purchase_date ? parseInt(c.purchase_date.slice(0, 4), 10) : currentYear - 2;
}

// DVC Point Efficiency: how much of a member's total allotted points
// (across every year owned) have been accounted for -- either logged as
// used on a trip, or deliberately banked/held in the contract_year_points
// ledger. Banked and remaining-but-not-yet-used points are credited
// alongside used points (not treated as "wasted") since a member who
// banks points forward is making a smart, deliberate choice, not
// forfeiting value -- Points Steward originally only counted logged
// trips, which a DVC-literate reviewer flagged as punishing banking
// (2026-09-17). contractYearPoints is optional -- when it's not supplied
// (or a contract/year has no ledger row), this falls back to the
// trips-only count for that portion, same as the original formula.
function computePointEfficiency(contracts, trips, contractYearPoints) {
  if (contracts.length === 0) return null;
  const currentYear = new Date().getFullYear();
  const totalAllotted = contracts.reduce((sum, c) => {
    const years = currentYear - contractOwnershipStartYear(c) + 1;
    return sum + c.points_per_year * years;
  }, 0);
  if (totalAllotted <= 0) return null;
  const totalUsed = trips.reduce((sum, t) => sum + (window.DVCTripFunding?.summary(t, contracts).owned || 0), 0);
  // points_holding counts here too, same reasoning as banked/remaining --
  // holding points came from this same use year's own allotment (a stay
  // that already drew from one of the other buckets, then got parked by a
  // near-check-in cancellation), so crediting them isn't a double count,
  // and they're not forfeited/wasted either.
  const totalBankedOrHeld = (contractYearPoints || []).reduce(
    (sum, r) => sum + (r.balance_confirmed_at ? (r.points_banked || 0) + (r.points_remaining || 0) + (r.points_holding || 0) : 0), 0
  );
  // Capped at totalAllotted -- the trip log and the points ledger are two
  // independently hand-maintained records, so they can double-count the
  // same points (e.g. logging a trip AND still showing that year's
  // balance as "remaining"). Capping keeps the % honest at 100% max
  // rather than letting that inconsistency push it past that.
  const totalAccountedFor = Math.min(totalAllotted, totalUsed + totalBankedOrHeld);
  return Math.min(100, Math.round((totalAccountedFor / totalAllotted) * 100));
}

// Two-Bedroom-or-larger (the broad "spacious villa" signal) vs. a TRUE
// Grand Villa specifically -- these are genuinely different DVC room
// categories (a Grand Villa is the largest unit at a resort, usually
// 3BR+den, sleeps 9-12, and only a subset of resorts even have one), not
// just "the biggest of whatever this resort happens to offer." Originally
// this app's isGrandVillaTrip() called any 2BR+ a "Grand Villa," which a
// DVC-literate reviewer flagged as flat wrong -- data.js does have real,
// distinctly-named "...Grand Villa" room types (verified 2026-09-17), so
// there's no reason to conflate the two.
function isSpaciousVillaTrip(t) {
  const resort = RESORTS.find(r => r.id === t.resort_id);
  const roomType = resort?.roomTypes.find(rt => rt.id === t.room_type_id);
  if (!roomType) return false;
  const name = roomType.name.toLowerCase();
  return name.includes("two-bedroom") || name.includes("three-bedroom") || name.includes("grand villa");
}
// Treehouse Villas count here too (2026-09-22). data.js names the room
// "Three-Bedroom Treehouse Villa", so a plain "grand villa" substring
// missed it -- but it's Saratoga Springs' largest, rarest, sleeps-9 unit,
// which is exactly what this badge is for. There is no Grand Villa at
// Saratoga Springs for a Treehouse stay to be losing out to.
function isTrueGrandVillaTrip(t) {
  const resort = RESORTS.find(r => r.id === t.resort_id);
  const roomType = resort?.roomTypes.find(rt => rt.id === t.room_type_id);
  if (!roomType) return false;
  const name = roomType.name.toLowerCase();
  return name.includes("grand villa") || name.includes("treehouse");
}

// Median cash-$-per-point across a resort's studio nights -- same
// median-across-periods technique contractvalue.html's medianRoomPoints()
// uses, just dividing cash by points instead of just reading points.
function medianCashPerPoint(resort, category) {
  const roomTypes = getRoomTypesForCategory(resort, category);
  if (roomTypes.length === 0) return null;
  const roomTypeId = roomTypes[0].id;
  const ratios = [];
  for (const period of resort.travelPeriods || []) {
    if (!period.cashRates) continue;
    for (const dayType of ["sunThu", "friSat"]) {
      const pts = period.rates?.[dayType]?.[roomTypeId];
      const cash = period.cashRates?.[dayType]?.[roomTypeId];
      if (typeof pts === "number" && pts > 0 && typeof cash === "number" && cash > 0) {
        ratios.push(cash / pts);
      }
    }
  }
  if (ratios.length === 0) return null;
  ratios.sort((a, b) => a - b);
  const mid = Math.floor(ratios.length / 2);
  return ratios.length % 2 !== 0 ? ratios[mid] : (ratios[mid - 1] + ratios[mid]) / 2;
}

// Resorts in the bottom 25% of dues-per-point ÷ cash-value-per-point,
// system-wide -- where a dollar of annual dues buys the most cash-
// equivalent vacation value. Recomputed each render (17 resorts, no
// network calls -- cheap).
function computeDuesEfficientResorts() {
  const allResortIds = [...new Set(RESORTS.map(r => r.id))];
  const ratios = [];
  for (const id of allResortIds) {
    const resort = RESORTS.find(r => r.id === id);
    if (!resort) continue;
    const duesPerPoint = DUES_PER_POINT[id] || 0;
    const cashPerPoint = medianCashPerPoint(resort, "studio");
    if (duesPerPoint > 0 && cashPerPoint) ratios.push({ id, ratio: duesPerPoint / cashPerPoint });
  }
  ratios.sort((a, b) => a.ratio - b.ratio);
  const cutoff = Math.max(1, Math.ceil(ratios.length * 0.25));
  return new Set(ratios.slice(0, cutoff).map(r => r.id));
}

// Builds one tiered badge's state from a numeric value and ascending
// tier thresholds. tiers: [{threshold, label}, ...], up to 4 (Bronze->
// Prismatic, matching the tier-bronze/silver/gold/prismatic enamel
// classes in tokens.css) -- a badge may define fewer than 4.
const TIER_CLASSES = ["tier-bronze", "tier-silver", "tier-gold", "tier-prismatic"];
function evaluateTieredBadge({ id, icon, name, category, value, tiers, valueLabel, detail }) {
  let achievedIdx = -1;
  for (let i = 0; i < tiers.length; i++) {
    if (value >= tiers[i].threshold) achievedIdx = i;
  }
  const unlocked = achievedIdx >= 0;
  const next = achievedIdx + 1 < tiers.length ? tiers[achievedIdx + 1] : null;
  return {
    id, icon, name, category, kind: "tiered", tiers, detail,
    unlocked,
    tierClass: unlocked ? TIER_CLASSES[achievedIdx] : "locked",
    tierLabel: unlocked ? tiers[achievedIdx].label : "Locked",
    tierNumber: unlocked ? achievedIdx + 1 : 0,
    value,
    valueLabel: valueLabel(value),
    // The formatter itself (not just the current value's label) so the
    // modal can describe what EVERY tier's threshold means in the same
    // words ("5 trips logged", "50% paid off"), not just the current one.
    formatValue: valueLabel,
    next,
  };
}

// hidden (default false) marks a "secret" badge -- see Leap Day Lounger
// below, the one current example. Callers (badges.html/badges_info.html)
// filter these out of the grid/reference list while locked and reveal them
// normally the moment they unlock; this function just carries the flag
// through untouched.
// `requirement` is a terse one-line restatement of the unlock condition,
// shown directly on a LOCKED tile (2026-09-22). Tiered badges already
// stated their criteria on the tile face via badgeProgressHTML()'s "N
// trips logged -> Tier 1: First Trip" line, but a locked special badge
// rendered as nothing but its name and the word "Locked" -- you had to
// open the modal to learn what it even wanted. `detail` is the long
// version and stays modal-only; this is the version that fits on a tile.
// Falls back to detail if a badge hasn't been given one.
function evaluateSpecialBadge({ id, icon, name, category, unlocked, detail, requirement, hidden = false }) {
  return {
    id, icon, name, category, kind: "special", hidden,
    unlocked, tierClass: unlocked ? "tier-gold" : "locked",
    tierLabel: unlocked ? "Unlocked" : "Locked", tierNumber: unlocked ? 1 : 0,
    detail, requirement: requirement || detail,
  };
}

// Room-tier rank for the per-resort "Resort Loyalty" badges further down:
// Studio(1) -> One-Bedroom(2) -> Two-Bedroom(3) -> Grand Villa/Three-Bedroom
// (4). Same keyword-substring approach as CATEGORY_KEYWORDS/
// isTrueGrandVillaTrip above, just collapsed into one ascending rank instead
// of a boolean-per-category, since each of those 16 badges IS a single "how
// spacious a room have you reached at this resort" metric.
function roomTierRank(name) {
  const n = name.toLowerCase();
  if (n.includes("three-bedroom") || n.includes("grand villa")) return 4;
  if (n.includes("two-bedroom")) return 3;
  if (n.includes("one-bedroom")) return 2;
  if (n.includes("studio")) return 1;
  return 0;
}
const ROOM_TIER_LABELS = { 1: "Studio", 2: "One-Bedroom", 3: "Two-Bedroom", 4: "Grand Villa" };

function roomTierRankForTrip(t) {
  const resort = RESORTS.find(r => r.id === t.resort_id);
  const roomType = resort?.roomTypes.find(rt => rt.id === t.room_type_id);
  return roomType ? roomTierRank(roomType.name) : 0;
}

// Falls back to null if data/resort_images.js wasn't loaded on this page --
// same optional-dependency pattern as shorthand() above (trips.html/
// badges.html both load it, but this file doesn't assume every consumer
// does).
function resortImage(resortId) {
  return typeof getResortImage === "function" ? getResortImage(resortId) : null;
}

// One badge per resort, tracking whether/how well you've stayed there --
// distinct from Unique Stays below, which counts variety across ALL
// resorts combined. Every resort gets one: 16 of the 17 are TIERED (the
// most spacious room-tier category logged at that resort specifically),
// built dynamically from each resort's own roomTypes -- most offer all 4
// (Studio/One-Bedroom/Two-Bedroom/Grand Villa), a few (Beach Club Villas,
// Boulder Ridge, Polynesian Villas) top out at Two-Bedroom since they have
// no true Grand Villa. Fort Wilderness Cabins is the one exception -- its
// single room type ("Cabin") isn't a rank on that ladder at all, so it
// gets a plain SPECIAL badge instead (unlocked by any logged stay there)
// rather than forcing a fake progression onto a resort that has none.
// Each badge carries its resort's art (data/resort_images.js) as `.image`
// for buildTrophyTileHTML() below to fade in behind the tile, when that
// resort has any yet.
function evaluateResortLoyaltyBadges(trips) {
  const allResortIds = [...new Set(RESORTS.map(r => r.id))];
  const badges = [];
  for (const resortId of allResortIds) {
    const resort = RESORTS.find(r => r.id === resortId);
    const name = shorthand(resortId, resortName(resortId));
    const image = resortImage(resortId);

    if (resortId === "fortWildernessCabins") {
      const badge = evaluateSpecialBadge({
        id: `resort-loyalty-${resortId}`, icon: "🔑", name, category: "resorts",
        unlocked: trips.some(t => t.resort_id === resortId),
        requirement: `Log a stay at ${name}`,
        detail: `Log a stay at ${name} -- its one room type (Cabin) doesn't fit the Studio-to-Grand-Villa ladder every other resort's Resort Loyalty badge tracks, so this one's a simple "have you stayed here" instead.`,
      });
      badge.image = image;
      badges.push(badge);
      continue;
    }

    const availableRanks = [1, 2, 3, 4].filter(rank => resort.roomTypes.some(rt => roomTierRank(rt.name) === rank));
    if (availableRanks.length === 0) continue;
    const tiers = availableRanks.map(rank => ({
      threshold: rank,
      label: ROOM_TIER_LABELS[rank],
      requirementLabel: `Stay in a ${ROOM_TIER_LABELS[rank]}`,
    }));
    const bestRank = Math.max(0, ...trips.filter(t => t.resort_id === resortId).map(roomTierRankForTrip));
    const badge = evaluateTieredBadge({
      id: `resort-loyalty-${resortId}`, icon: "🔑", name, category: "resorts",
      value: bestRank,
      tiers,
      valueLabel: v => (v > 0 ? `${ROOM_TIER_LABELS[v]} logged` : "No stay logged yet"),
      detail: `Tracks the most spacious room tier you've logged a stay in at ${name} -- ${tiers.map(t => t.label).join(" → ")}.`,
    });
    badge.image = image;
    badges.push(badge);
  }
  return badges;
}

// The Odyssey's resort groupings ("regions"). Animal Kingdom Villas and
// Fort Wilderness Cabins are grouped with the two Wilderness Lodge villas
// per this badge's own tier grouping -- not a strict geographic claim.
// Old Key West and Saratoga Springs belong to no region deliberately:
// they'd make a two-resort Disney Springs group that's far easier to
// finish than the three- and four-resort regions below, and TIER_CLASSES
// only has 4 rungs to spend. They still count toward Global Citizen.
const ODYSSEY_GROUPS = [
  { label: "The Monorail Loop", resorts: ["bayLakeTower", "grandFloridian", "polynesianVillas"] },
  { label: "The Epcot Crescent", resorts: ["beachClubVillas", "boardwalkVillas", "rivieraResort"] },
  { label: "The Wilderness", resorts: ["boulderRidge", "copperCreek", "animalKingdomVillas", "fortWildernessCabins"] },
];

function odysseyGroupProgress(visitedResortIds) {
  return ODYSSEY_GROUPS.map(g => {
    const missing = g.resorts.filter(id => !visitedResortIds.has(id));
    return {
      label: g.label,
      total: g.resorts.length,
      visitedCount: g.resorts.length - missing.length,
      missing,
      complete: missing.length === 0,
    };
  });
}

function joinResortNames(ids) {
  return ids.map(id => shorthand(id, resortName(id))).join(", ");
}

// Tiers are a COUNT of fully-finished regions, not a fixed ladder of
// specific ones -- a bespoke evaluator (not evaluateTieredBadge) that
// still returns the same shape the shared rendering functions expect,
// using customProgressPct/nextStepText where a plain numeric threshold
// wouldn't make sense.
//
// Two things this deliberately does NOT do, both fixing real bugs found
// 2026-09-22 against Gemini's Trophy Room checklist:
//  1. A region no longer counts as covered by visiting ONE resort in it
//     (the old `.some()`). It required `.every()` all along -- the old
//     tier requirementLabels already read "Stay at BLT, GF, Poly", i.e.
//     all three -- so the check and the copy disagreed.
//  2. Tier labels are no longer the region names themselves. Awarding
//     tier N by count while labelling it with ODYSSEY_GROUPS[N-1] meant a
//     member whose only stay was Riviera got "Tier 1: The Monorail Loop"
//     and a checkmark on a region they'd never set foot in. Counting
//     tiers need counting labels; WHICH regions are done is carried by
//     valueLabel/nextStepText instead, where it's always true. This also
//     keeps applyBadgePersistence()'s sticky-floor path honest, since it
//     rebuilds tierLabel from tiers[storedTier - 1].label.
function evaluateOdysseyBadge(visitedResortIds) {
  const allResortIds = [...new Set(RESORTS.map(r => r.id))];
  const groups = odysseyGroupProgress(visitedResortIds);
  const completeCount = groups.filter(g => g.complete).length;
  const allVisited = allResortIds.length > 0 && allResortIds.every(id => visitedResortIds.has(id));

  const tiers = [
    { label: "One Region", requirementLabel: "Finish any 1 region" },
    { label: "Two Regions", requirementLabel: "Finish any 2 regions" },
    { label: "Three Regions", requirementLabel: `Finish all ${ODYSSEY_GROUPS.length} regions` },
    { label: "Global Citizen", requirementLabel: `All ${allResortIds.length} DVC Companion resorts visited` },
  ];

  const tierNumber = allVisited ? 4 : Math.min(completeCount, 3);
  const unlocked = tierNumber > 0;

  // The region you're closest to finishing -- fewest resorts still
  // missing, ties broken by declaration order. That's the one worth
  // naming in the progress line and the next-step nudge, rather than
  // whichever region happens to sit at the next ladder position.
  const nextGroup = groups
    .filter(g => !g.complete)
    .sort((a, b) => a.missing.length - b.missing.length)[0] || null;
  const unvisited = allResortIds.filter(id => !visitedResortIds.has(id));

  let valueLabel, customProgressPct, nextStepText;
  if (tierNumber >= 4) {
    valueLabel = `All ${allResortIds.length} resorts visited`;
    customProgressPct = 100;
    nextStepText = null;
  } else if (nextGroup && tierNumber < 3) {
    valueLabel = `${nextGroup.visitedCount} of ${nextGroup.total} ${nextGroup.label} resorts visited`;
    customProgressPct = Math.round((nextGroup.visitedCount / nextGroup.total) * 100);
    nextStepText = `stay at ${joinResortNames(nextGroup.missing)} to finish ${nextGroup.label}`;
  } else {
    // Every region done -- the only thing left is Global Citizen.
    valueLabel = `${visitedResortIds.size} of ${allResortIds.length} resorts visited`;
    customProgressPct = Math.round((visitedResortIds.size / allResortIds.length) * 100);
    nextStepText = unvisited.length <= 4
      ? `stay at ${joinResortNames(unvisited)}`
      : `visit the ${unvisited.length} resorts you haven't stayed at yet`;
  }

  return {
    id: "odyssey", icon: "🗺️", name: "The Odyssey", category: "exploration", kind: "tiered", tiers,
    unlocked,
    tierClass: unlocked ? TIER_CLASSES[tierNumber - 1] : "locked",
    tierLabel: unlocked ? tiers[tierNumber - 1].label : "Locked",
    tierNumber,
    value: completeCount,
    valueLabel,
    next: tierNumber < 4 ? tiers[tierNumber] : null,
    customProgressPct,
    nextStepText,
    detail: `Finish whole regions of the property, then the whole system. ${ODYSSEY_GROUPS.map(g => `${g.label} (${joinResortNames(g.resorts)})`).join("; ")}. A region counts only once you've logged a trip at -- or saved an itinerary for -- every resort in it. Old Key West and Saratoga Springs sit outside the regions and count toward the final Global Citizen tier.`,
  };
}

// Badges that persist a high-water-mark tier to Supabase (user_badges,
// db/migrations/008_add_user_badges.sql) so the achievement survives even
// if the underlying data later regresses (e.g. deleting a logged trip
// shouldn't take back a Point Architect tier already reached) and so it
// carries across devices. Everything NOT in this set is "live" -- it
// always shows current standing, recomputed fresh, never written here.
// House Money and Points Steward are deliberately excluded: both are
// percentages that can legitimately move for normal reasons (a fresh
// contract dilutes Points Steward's %; growing dues shifts House Money's
// payback %), and making those sticky would let the badge face silently
// contradict the live numbers shown right next to it on the same page.
const STICKY_BADGE_IDS = new Set([
  "addonitis", "point-architect", "sniper", "savant", "villa-royalty", "grand-villa",
  "odyssey", "dues-optimizer", "waitlist-whisperer",
  "welcome-home", "lifer", "blue-card", "resale-ranger", "bank-shot", "time-traveler",
  "unique-stays", "holiday-chaser", "bicoastal", "leap-day-lounger", "point-purist", "coast-to-coast",
  "use-year-alchemist",
  // 2026-09-19 additions
  "festival-hopper", "marathon-stay", "beach-bum", "points-whale",
  // Every resort now has a Resort Loyalty badge (Fort Wilderness Cabins'
  // is a special/binary one instead of tiered -- see
  // evaluateResortLoyaltyBadges() above -- but it's still sticky the same
  // way: a logged stay there shouldn't un-earn itself if that trip is
  // later deleted).
  ...[...new Set(RESORTS.map(r => r.id))].map(id => `resort-loyalty-${id}`),
]);
// "homebody" is deliberately NOT sticky -- see its own comment above,
// it's meant to reflect current standing, not a permanent milestone.

// Applies the sticky floor and fires off (fire-and-forget) a persistence
// write whenever a sticky badge just reached a new high-water mark. Never
// awaited/blocking -- a failed write just means the same upsert is
// attempted again on the next render, which is harmless since it's
// idempotent (upsert on the same user_id+badge_id pair).
function applyBadgePersistence(badges, storedBadges) {
  const storedByBadgeId = new Map((storedBadges || []).map(r => [r.badge_id, r]));
  return badges.map(b => {
    if (!STICKY_BADGE_IDS.has(b.id)) return b;
    const storedTier = storedByBadgeId.get(b.id)?.tier || 0;
    const liveTier = b.tierNumber;

    if (liveTier > storedTier) {
      window.DVCAuth.upsertUserBadge({ badge_id: b.id, tier: liveTier }).catch(() => {});
      return b;
    }
    if (storedTier > liveTier) {
      // Live data no longer supports this tier, but it was earned before
      // -- keep showing it, and keep the ladder/progress bar internally
      // consistent with that (not just the face of the tile).
      if (b.kind === "special") {
        return { ...b, unlocked: true, tierClass: "tier-gold", tierLabel: "Unlocked", tierNumber: 1 };
      }
      const tierDef = b.tiers[storedTier - 1];
      return {
        ...b,
        unlocked: true,
        tierNumber: storedTier,
        tierClass: TIER_CLASSES[storedTier - 1],
        tierLabel: tierDef.label,
        next: storedTier < b.tiers.length ? b.tiers[storedTier] : null,
      };
    }
    return b;
  });
}

// Evaluates the full Trophy Case against a member's real data. Deliberate
// departures from a literal "any DVC-themed badge idea" spec, all because
// the data genuinely isn't available anywhere in this app's schema (not
// because they were skipped):
//  - "Zero-Loss Shield"/expiration-based badges would need a closed-out
//    history of past use-years -- contract_year_points only tracks the
//    CURRENT and upcoming balances, never a final record of what happened
//    to points once a cycle closes. Points Steward is tiered on the
//    closest honest proxy instead: % of allotted points accounted for
//    (used on a trip or deliberately banked forward).
//  - No "date unlocked" beyond what user_badges.unlocked_at now tracks
//    for sticky badges going forward (not backfilled for tiers reached
//    before that table existed).
function evaluateUserBadges(contracts, trips, itineraries, stats, pointEfficiency, contractYearPoints) {
  const activeContracts = contracts.filter(c => c.is_active);
  const contractById = new Map(contracts.map(c => [c.id, c]));
  const currentYear = new Date().getFullYear();

  const houseMoney = evaluateTieredBadge({
    id: "house-money", icon: "🏰", name: "House Money", category: "financial",
    value: stats.paybackPct,
    tiers: [
      { threshold: 25, label: "Deposit Paid" },
      { threshold: 50, label: "Halfway Home" },
      { threshold: 100, label: "Breaking Even" },
      { threshold: 200, label: "Pure Magic" },
    ],
    valueLabel: v => `${v}% paid off`,
    detail: "What % of your total buy-in + dues you've recouped in hotel value from logged trips.",
  });

  const addOnitis = evaluateTieredBadge({
    id: "addonitis", icon: "📜", name: "Add-on-itis", category: "ownership",
    value: activeContracts.length,
    tiers: [
      { threshold: 1, label: "Deed Holder" },
      { threshold: 2, label: "Dual Citizen" },
      { threshold: 3, label: "Serial Add-On" },
      { threshold: 5, label: "DVC Tycoon" },
    ],
    valueLabel: v => `${v} contract${v === 1 ? "" : "s"}`,
    detail: "Counts your active DVC contracts, from My Contracts.",
  });

  // Total points OWNED, not how many contracts it took to get there --
  // distinct from Add-on-itis above (2 huge contracts and 5 tiny ones can
  // both reach a high Points Whale tier at very different Add-on-itis tiers).
  const totalPointsOwned = activeContracts.reduce((sum, c) => sum + (c.points_per_year || 0), 0);
  const pointsWhale = evaluateTieredBadge({
    id: "points-whale", icon: "🐋", name: "Points Whale", category: "ownership",
    value: totalPointsOwned,
    // 100/200/500/1000, not the 250/400/600/1000 this shipped with --
    // a 250-point floor meant the single most common real contract size
    // (a 150-point direct minimum, or a small resale) unlocked nothing at
    // all, so the badge never fired for a large share of actual owners
    // (2026-09-22). Lowering thresholds is safe for a sticky badge: it can
    // only ever grant a tier, never take one back.
    tiers: [
      { threshold: 100, label: "Century Club" },
      { threshold: 200, label: "Deep Pockets" },
      { threshold: 500, label: "Big Fish" },
      { threshold: 1000, label: "Apex Predator" },
    ],
    valueLabel: v => `${v.toLocaleString()} pts/yr owned`,
    detail: "Total annual points across your active contracts, summed.",
  });

  // Renamed from "Point Architect" -- the blueprint theme implied
  // planning/drafting a trip, but the metric is actually trips already
  // taken and logged, which a DVC-literate reviewer flagged as a
  // name/metric mismatch (2026-09-17). Kept the same `id` (not just the
  // display name) so any tier already persisted to user_badges under
  // "point-architect" stays attached to this badge rather than orphaning.
  const pointArchitect = evaluateTieredBadge({
    id: "point-architect", icon: "🧳", name: "Road Warrior", category: "planning",
    value: trips.length,
    tiers: [
      { threshold: 1, label: "First Trip" },
      { threshold: 5, label: "Seasoned Traveler" },
      { threshold: 15, label: "Veteran Traveler" },
      { threshold: 30, label: "Grand Strategist" },
    ],
    valueLabel: v => `${v} trip${v === 1 ? "" : "s"} logged`,
    detail: "Counts every trip you've logged in Trip History -- click \"Log a Trip\" to add one.",
  });

  function nightsForTrip(t) {
    return Math.round((new Date(t.check_out + "T12:00:00") - new Date(t.check_in + "T12:00:00")) / 86400000);
  }
  const longestTripNights = trips.length ? Math.max(...trips.map(nightsForTrip)) : 0;
  const marathonStay = evaluateTieredBadge({
    id: "marathon-stay", icon: "🛏️", name: "Marathon Stay", category: "planning",
    value: longestTripNights,
    tiers: [
      { threshold: 7, label: "Week-Long Stay" },
      { threshold: 10, label: "Extended Vacation" },
      { threshold: 14, label: "Full Fortnight" },
    ],
    valueLabel: v => `${v} night${v === 1 ? "" : "s"} in one stay`,
    detail: "Your single longest logged trip, by night count.",
  });

  const pointsSteward = evaluateTieredBadge({
    id: "points-steward", icon: "🛡️", name: "Points Steward", category: "financial",
    value: pointEfficiency ?? 0,
    tiers: [
      { threshold: 25, label: "Clean Start" },
      { threshold: 50, label: "Iron Vault" },
      { threshold: 75, label: "Guardian" },
      { threshold: 95, label: "Flawless Run" },
    ],
    valueLabel: v => `${v}% estimated point coverage`,
    detail: "A badge estimate combining logged owned points and saved remaining, banked, and holding balances against estimated allotments. These records can overlap. This is not logged trip usage or proof that no points expired.",
  });

  // An away stay only counts when the funding contract can actually reach
  // that resort at 7 months -- a resale-restricted contract logged against a
  // resort it can't book is a data slip, not a 7-month booking.
  const sevenMonthReach = contract => {
    if (!window.DVCAuth?.getUserResortAccess) return true;
    return window.DVCAuth.getUserResortAccess([contract], [...new Set(RESORTS.map(r => r.id))]).sevenMoResortIds;
  };
  const crossResortStay = trips.some(t => {
    if (!window.DVCTripFunding.summary(t, contracts).valid) return false;
    return t.points_source_breakdown.allocations.some(a => {
      const contract = contractById.get(a.contract_id);
      if (!contract || t.resort_id === contract.home_resort_id) return false;
      const reach = sevenMonthReach(contract);
      return reach === true || reach.has(t.resort_id);
    });
  });
  const splitStaySavant = (itineraries || []).some(itin =>
    new Set((itin.segments || []).map(s => s.resortId)).size >= 2
  );

  const sniper = evaluateSpecialBadge({
    id: "sniper", icon: "🎯", name: "7-Month Sniper", category: "planning",
    unlocked: crossResortStay,
    requirement: "Log a stay your contract booked away from home",
    detail: "Log a stay (linked to a contract) at a resort that contract reaches at 7 months -- anywhere other than its home resort that it's allowed to book.",
  });
  const savant = evaluateSpecialBadge({
    id: "savant", icon: "🔀", name: "Split-Stay Savant", category: "planning",
    unlocked: splitStaySavant,
    requirement: "Save an itinerary with 2+ resorts",
    detail: "Save an itinerary with 2 or more different resorts in one trip.",
  });
  // Split into two accurate badges instead of one that called any 2BR a
  // "Grand Villa" -- see isSpaciousVillaTrip()/isTrueGrandVillaTrip() above.
  const villaRoyalty = evaluateSpecialBadge({
    id: "villa-royalty", icon: "👑", name: "Villa Royalty", category: "exploration",
    unlocked: trips.some(isSpaciousVillaTrip),
    requirement: "Log a 2-Bedroom or larger stay",
    detail: "Log a stay in a 2-Bedroom or larger villa.",
  });
  const grandVilla = evaluateSpecialBadge({
    id: "grand-villa", icon: "🏛️", name: "Grand Villa", category: "exploration",
    unlocked: trips.some(isTrueGrandVillaTrip),
    requirement: "Log a Grand Villa or Treehouse Villa stay",
    detail: "Log a stay in an actual Grand Villa (or a Saratoga Springs Treehouse Villa) -- the largest, rarest unit at a resort, not just any 2BR+.",
  });

  const visitedResortIds = new Set([
    ...trips.map(t => t.resort_id),
    ...(itineraries || []).flatMap(itin => (itin.segments || []).map(s => s.resortId)),
  ]);
  const odyssey = evaluateOdysseyBadge(visitedResortIds);

  const duesEfficientResorts = computeDuesEfficientResorts();
  const duesEfficientPoints = activeContracts
    .filter(c => duesEfficientResorts.has(c.home_resort_id))
    .reduce((sum, c) => sum + c.points_per_year, 0);
  const duesOptimizer = evaluateTieredBadge({
    id: "dues-optimizer", icon: "💰", name: "Dues Optimizer", category: "financial",
    value: duesEfficientPoints,
    tiers: [
      { threshold: 50, label: "Value Seeker" },
      { threshold: 150, label: "Efficiency Expert" },
      { threshold: 300, label: "Ratio Master" },
      { threshold: 600, label: "Dues Whisperer" },
    ],
    valueLabel: v => `${v} pt${v === 1 ? "" : "s"} in low-dues resorts`,
    detail: "Points per year, summed across your active contracts, at resorts where your annual dues buy the most vacation value.",
  });

  // "Tricky" = a split-stay (2+ resorts in one itinerary) or a segment at
  // a resort that doesn't match ANY of your contracts' home resorts --
  // itineraries don't record which contract they're for, so this is the
  // closest honest signal for "this genuinely needs 7-month luck," not a
  // hardcoded guess at which resorts are currently in high demand.
  const homeResortIds = new Set(contracts.map(c => c.home_resort_id));
  const trickyCount = (itineraries || []).filter(itin => {
    const resorts = (itin.segments || []).map(s => s.resortId);
    if (new Set(resorts).size >= 2) return true;
    return homeResortIds.size > 0 && resorts.some(r => !homeResortIds.has(r));
  }).length;
  const waitlistWhisperer = evaluateTieredBadge({
    id: "waitlist-whisperer", icon: "🕰️", name: "Waitlist Whisperer", category: "planning",
    value: trickyCount,
    tiers: [
      { threshold: 1, label: "Hopeful" },
      { threshold: 3, label: "Portal Watcher" },
      { threshold: 5, label: "Inside Track" },
    ],
    valueLabel: v => `${v} tricky itinerar${v === 1 ? "y" : "ies"} saved`,
    detail: "Counts saved itineraries that are a split-stay (2+ resorts) or include a resort outside all your contracts' home resorts -- either way, real 7-month-window luck required.",
  });

  // The inverse of 7-Month Sniper: every logged trip stayed at one of your
  // OWN home resorts, none away. Deliberately live/non-sticky (not in
  // STICKY_BADGE_IDS) -- unlike Sniper, which records a thing you DID once,
  // this describes a current stance ("I've never left home resort yet"),
  // so it correctly disappears the moment a single away-trip breaks the
  // streak. value is forced to 0 (locked) the instant the streak breaks,
  // even if home-resort trips still outnumber away ones -- this only
  // rewards an UNBROKEN streak, not a majority.
  const homeOnlyTripCount = trips.filter(t => homeResortIds.has(t.resort_id)).length;
  const isHomeLoyalist = trips.length > 0 && homeResortIds.size > 0 && homeOnlyTripCount === trips.length;
  const homebody = evaluateTieredBadge({
    id: "homebody", icon: "🏡", name: "Homebody", category: "planning",
    value: isHomeLoyalist ? homeOnlyTripCount : 0,
    tiers: [
      { threshold: 3, label: "Settled In" },
      { threshold: 7, label: "Devoted" },
      { threshold: 15, label: "Never Left" },
    ],
    // v===0 covers two different real states -- no trips logged at all, vs.
    // trips logged but the streak already broke by an away-stay -- and the
    // old single template ("0 trips logged, every one at your home resort")
    // read as nonsense in the second case, since it plainly isn't true.
    valueLabel: v => {
      if (v > 0) return `${v} trip${v === 1 ? "" : "s"} logged, every one at your home resort`;
      return trips.length > 0 ? "No unbroken home-resort streak -- yet" : "No trips logged yet";
    },
    detail: "Every trip you've logged has stayed at one of your own home resorts -- no away-stays yet, using nothing but your 11-month home resort priority. This tracks a live streak, not a permanent milestone: log a trip elsewhere and it resets (7-Month Sniper is right there waiting for you when you're ready to roam).",
  });

  // ---- Batch 2 (2026-09-17): 10 more ideas, inferred from name alone
  // (the original spec text wasn't retained across a context compaction --
  // disclosed to the user, who approved building from these inferred
  // definitions rather than re-pasting the source).
  const welcomeHome = evaluateSpecialBadge({
    id: "welcome-home", icon: "🏠", name: "Welcome Home", category: "ownership",
    unlocked: contracts.length >= 1,
    requirement: "Add your first contract",
    detail: "Add your first DVC contract in My Contracts.",
  });

  const longestOwnedYears = activeContracts.length
    ? Math.max(...activeContracts.map(c => currentYear - contractOwnershipStartYear(c) + 1))
    : 0;
  const lifer = evaluateTieredBadge({
    id: "lifer", icon: "⏳", name: "Lifer", category: "ownership",
    value: longestOwnedYears,
    tiers: [
      { threshold: 5, label: "Long-Timer" },
      { threshold: 10, label: "Decade Club" },
      { threshold: 15, label: "Old Guard" },
      // Not "Founding Family" -- actual DVC founders bought in 1991, which
      // this tier (20 years owned) doesn't necessarily mean, so that label
      // was factually off regardless of how long any one member's owned.
      { threshold: 20, label: "Living Legend" },
    ],
    valueLabel: v => `${v} year${v === 1 ? "" : "s"} owned`,
    detail: "Years owned on your longest-held active contract, based on its purchase date.",
  });

  const blueCard = evaluateSpecialBadge({
    id: "blue-card", icon: "💳", name: "Blue Card", category: "ownership",
    unlocked: activeContracts.some(c => c.purchase_type === "direct"),
    requirement: "Own a direct-purchase contract",
    detail: "Bought direct from Disney -- the one that comes with the blue membership card and the full perks.",
  });

  const resaleRanger = evaluateSpecialBadge({
    id: "resale-ranger", icon: "🏷️", name: "Resale Ranger", category: "ownership",
    unlocked: activeContracts.some(c => c.purchase_type === "resale"),
    requirement: "Own a resale contract",
    detail: "Bought resale -- same magic, smarter price.",
  });

  const bankingEvents = (contractYearPoints || []).filter(r => (r.points_banked || 0) > 0).length;
  const bankShot = evaluateTieredBadge({
    id: "bank-shot", icon: "🏦", name: "Bank Shot", category: "financial",
    value: bankingEvents,
    tiers: [
      { threshold: 1, label: "Opening Deposit" },
      { threshold: 3, label: "Regular Saver" },
      { threshold: 6, label: "Master Banker" },
    ],
    valueLabel: v => `${v} use-year${v === 1 ? "" : "s"} banked`,
    detail: "Counts use-year cycles in My Contracts' points ledger where you've recorded banking points forward.",
  });

  // Banking moves points forward into a future Use Year; borrowing pulls
  // them back from one -- Bank Shot (above) only ever tracked the forward
  // direction. points_borrowed has been in contract_year_points since
  // migration 007 but no badge read it until now.
  const hasBankedEver = (contractYearPoints || []).some(r => (r.points_banked || 0) > 0);
  const hasBorrowedEver = (contractYearPoints || []).some(r => (r.points_borrowed || 0) > 0);
  const useYearAlchemist = evaluateSpecialBadge({
    id: "use-year-alchemist", icon: "⚗️", name: "Use Year Alchemist", category: "financial",
    unlocked: hasBankedEver && hasBorrowedEver,
    requirement: "Record both a bank and a borrow in your ledger",
    detail: "Bank points forward AND borrow from a future Use Year -- full command of DVC's point-shifting in both directions.",
  });

  const timeTraveler = evaluateSpecialBadge({
    id: "time-traveler", icon: "🎆", name: "Time Traveler", category: "exploration",
    unlocked: trips.some(t => t.check_in.slice(0, 4) !== t.check_out.slice(0, 4)),
    requirement: "Log a trip that crosses New Year's",
    detail: "Log a trip whose stay crosses a calendar year.",
  });

  function roomCategoryForTrip(t) {
    const resort = RESORTS.find(r => r.id === t.resort_id);
    const roomType = resort?.roomTypes.find(rt => rt.id === t.room_type_id);
    if (!roomType) return null;
    const name = roomType.name.toLowerCase();
    if (name.includes("grand villa")) return "grand-villa";
    if (name.includes("three-bedroom")) return "three-bedroom";
    if (name.includes("two-bedroom")) return "two-bedroom";
    if (name.includes("one-bedroom")) return "one-bedroom";
    if (name.includes("cabin")) return "cabin";
    if (name.includes("studio")) return "studio";
    return "other";
  }
  const uniqueRoomCategories = new Set(trips.map(roomCategoryForTrip).filter(Boolean));
  const uniqueStays = evaluateTieredBadge({
    id: "unique-stays", icon: "🏘️", name: "Unique Stays", category: "exploration",
    value: uniqueRoomCategories.size,
    tiers: [
      { threshold: 2, label: "Branching Out" },
      { threshold: 3, label: "Variety Seeker" },
      { threshold: 4, label: "Room Connoisseur" },
    ],
    valueLabel: v => `${v} room type${v === 1 ? "" : "s"} logged`,
    detail: "Counts distinct room-type categories (Studio, 1BR, 2BR, 3BR, Grand Villa, Cabin) across your logged trips.",
  });

  // Interval overlap against data/disney_events.js's DISNEY_EVENTS --
  // deliberately not calling getEventsForDate() per-night (that needs a
  // full date-range enumeration this file doesn't otherwise build); a
  // trip's [check_in, check_out) range overlaps an event's
  // [startDate, endDate] range under the same half-open-interval logic.
  // Renamed from "Holiday Chaser" -- the name implied holiday-season trips
  // specifically, but the mechanic fires on ANY EPCOT festival, hard-ticket
  // party, or runDisney weekend, which a DVC-literate reviewer flagged as a
  // name/mechanic mismatch (2026-09-19). Kept the id unchanged so a tier
  // already persisted under "holiday-chaser" stays attached rather than
  // orphaning. Festival Hopper (below) covers "distinct EPCOT festivals"
  // specifically, so this one keeps the broad "any special event" mechanic.
  const holidayChaser = evaluateSpecialBadge({
    id: "holiday-chaser", icon: "🎪", name: "Main Event", category: "exploration",
    unlocked: typeof DISNEY_EVENTS !== "undefined" &&
      trips.some(t => DISNEY_EVENTS.some(e => t.check_in <= e.endDate && e.startDate < t.check_out)),
    requirement: "Log a trip overlapping a festival, party, or race",
    detail: "Log a trip that overlaps an EPCOT festival, hard-ticket party, or runDisney weekend (the same events shown as a 🎉 on the calendar).",
  });

  // Distinct EPCOT festivals specifically (Food & Wine, Arts, Flower &
  // Garden, Festival of the Holidays -- 4 total in data/disney_events.js),
  // where Main Event above rewards overlapping ANY special event at all.
  const distinctFestivalNames = new Set(
    typeof DISNEY_EVENTS === "undefined" ? [] : trips.flatMap(t =>
      DISNEY_EVENTS.filter(e => e.category === "festival" && t.check_in <= e.endDate && e.startDate < t.check_out).map(e => e.name)
    )
  );
  const festivalHopper = evaluateTieredBadge({
    id: "festival-hopper", icon: "🎨", name: "Festival Hopper", category: "exploration",
    value: distinctFestivalNames.size,
    tiers: [
      { threshold: 1, label: "First Taste" },
      { threshold: 2, label: "Regular Attendee" },
      { threshold: 3, label: "World Showcase Regular" },
      { threshold: 4, label: "Festival Completionist" },
    ],
    valueLabel: v => `${v} distinct festival${v === 1 ? "" : "s"} attended`,
    detail: "Counts distinct EPCOT festivals your logged trips have overlapped -- Food & Wine, Festival of the Arts, Flower & Garden, and Festival of the Holidays.",
  });

  // "Bicoastal" = specifically East (WDW, Florida) + West (California) --
  // not just "any non-WDW resort," which would also include Aulani
  // (Hawaii) and Hilton Head/Vero Beach (both still East Coast).
  const WEST_COAST_RESORT_IDS = new Set(["disneylandHotel", "grandCalifornian"]);
  const NON_WDW_RESORT_IDS_LOCAL = new Set(["aulani", "hiltonHead", "veroBeach", "disneylandHotel", "grandCalifornian"]);
  const bicoastal = evaluateSpecialBadge({
    id: "bicoastal", icon: "✈️", name: "Bicoastal", category: "exploration",
    unlocked: [...visitedResortIds].some(id => !NON_WDW_RESORT_IDS_LOCAL.has(id)) &&
      [...visitedResortIds].some(id => WEST_COAST_RESORT_IDS.has(id)),
    requirement: "Log stays at both a Florida and a California resort",
    detail: "Log or save a trip at both a Walt Disney World resort and a California resort (Disneyland Hotel or Villas at Disney's Grand Californian).",
  });

  const BEACH_RESORT_IDS = new Set(["aulani", "hiltonHead", "veroBeach"]);
  const beachResortsVisited = [...visitedResortIds].filter(id => BEACH_RESORT_IDS.has(id)).length;
  const beachBum = evaluateTieredBadge({
    id: "beach-bum", icon: "🏖️", name: "Beach Bum", category: "exploration",
    value: beachResortsVisited,
    tiers: [
      { threshold: 1, label: "Sun Seeker" },
      { threshold: 2, label: "Coastal Regular" },
      { threshold: 3, label: "Salt Life" },
    ],
    valueLabel: v => `${v} of 3 beach resorts visited`,
    detail: "Counts distinct beach resorts (Aulani, Hilton Head, Vero Beach) you've logged a trip at or saved in an itinerary.",
  });

  // Ownership, not travel -- Bicoastal (above) checks trips/itineraries;
  // this checks home_resort_id across active contracts instead, so it's
  // earned the moment you own both, no trip needed. Aulani (Hawaii) is
  // deliberately excluded from "East Coast" -- it's not on either
  // mainland coast, so an Aulani + Grand Californian owner shouldn't
  // qualify. Renamed from "Coast to Coast" -- members were confusing it
  // with Bicoastal (same name shape, different mechanic: travel vs.
  // ownership), a DVC-literate reviewer flagged the collision (2026-09-19).
  // Kept the id unchanged so a tier already persisted under
  // "coast-to-coast" stays attached rather than orphaning.
  const coastToCoast = evaluateSpecialBadge({
    id: "coast-to-coast", icon: "🌉", name: "Two-Coast Deeds", category: "ownership",
    unlocked: activeContracts.some(c => WEST_COAST_RESORT_IDS.has(c.home_resort_id)) &&
      activeContracts.some(c => c.home_resort_id !== "aulani" && !WEST_COAST_RESORT_IDS.has(c.home_resort_id)),
    requirement: "Own contracts on both coasts",
    detail: "Own an active contract at a California resort (Disneyland Hotel or Villas at Disney's Grand Californian) AND an active contract at an East Coast resort (any Walt Disney World resort, Hilton Head Island, or Vero Beach).",
  });

  function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  const leapDayLounger = evaluateSpecialBadge({
    id: "leap-day-lounger", icon: "🐸", name: "Leap Day Lounger", category: "exploration",
    // The one actual secret badge -- see the hidden filtering in
    // badges.html/badges_info.html (2026-09-19). It was rendering
    // everywhere, including the always-locked reference page, which
    // defeated the point of a secret; hidden badges are omitted from both
    // until earned.
    hidden: true,
    unlocked: trips.some(t => {
      const ciYear = parseInt(t.check_in.slice(0, 4), 10);
      const coYear = parseInt(t.check_out.slice(0, 4), 10);
      for (let y = ciYear; y <= coYear; y++) {
        if (isLeapYear(y) && t.check_in <= `${y}-02-29` && `${y}-02-29` < t.check_out) return true;
      }
      return false;
    }),
    requirement: "Log a trip that includes February 29",
    detail: "Log a trip that includes February 29th.",
  });

  // Only confirmed points from an owned contract count toward this badge.
  const pointPurist = evaluateSpecialBadge({
    id: "point-purist", icon: "💯", name: "Point Purist", category: "financial",
    unlocked: trips.some(t => {
      if (!window.DVCTripFunding.summary(t, contracts).valid) return false;
      return t.points_source_breakdown.allocations.some(a => a.points === contractById.get(a.contract_id)?.points_per_year);
    }),
    requirement: "Log a trip using a contract's full annual points",
    detail: "Log a trip with confirmed points from an owned contract equal to that contract's full annual allotment.",
  });

  return [
    houseMoney, addOnitis, pointsWhale, pointArchitect, marathonStay, pointsSteward, sniper, savant, villaRoyalty, grandVilla, odyssey, duesOptimizer, waitlistWhisperer, homebody,
    welcomeHome, lifer, blueCard, resaleRanger, bankShot, useYearAlchemist, timeTraveler, uniqueStays, holidayChaser, festivalHopper, bicoastal, beachBum, coastToCoast, leapDayLounger, pointPurist,
    ...evaluateResortLoyaltyBadges(trips),
  ];
}

// The 6 badges tracked purely server-side via incrementBadgeEvent()
// (dvc-track.js) rather than derived from contracts/trips/itineraries --
// their source of truth IS user_badges.event_count, so unlike every other
// badge above, these are built directly from storedBadges rather than
// live app data. Not sticky/persisted via applyBadgePersistence (they're
// not in STICKY_BADGE_IDS) because the server-side counter is already the
// permanent record -- there's no "live" value that could regress out from
// under them the way a locally-recomputed metric could.
function eventCountFor(storedBadges, badgeId) {
  const row = (storedBadges || []).find(r => r.badge_id === badgeId);
  return row ? row.event_count : 0;
}

function evaluateEventBadges(storedBadges) {
  const resourcefulExplorer = evaluateSpecialBadge({
    id: "resourceful-explorer", icon: "🔍", name: "Resourceful Explorer", category: "exploration",
    unlocked: eventCountFor(storedBadges, "resourceful-explorer") >= 1,
    requirement: "Click any external source link in the app",
    detail: "Click through to an external source link anywhere in DVC Companion (points charts, crowd calendar, Disney Food Blog, resale marketplaces).",
  });
  const justOneMoreNight = evaluateTieredBadge({
    id: "just-one-more-night", icon: "🌙", name: "Just One More Night", category: "planning",
    value: eventCountFor(storedBadges, "just-one-more-night"),
    tiers: [
      { threshold: 1, label: "One More" },
      { threshold: 5, label: "Extended Stay" },
      { threshold: 15, label: "Never Leaving" },
    ],
    valueLabel: v => `${v} night${v === 1 ? "" : "s"} added`,
    detail: "Extend a trip's dates on the calendar by clicking one of the dimmed context days just outside your stay.",
  });
  const reChecker = evaluateTieredBadge({
    id: "re-checker", icon: "🔄", name: "Re-Checker", category: "planning",
    value: eventCountFor(storedBadges, "re-checker"),
    tiers: [
      { threshold: 3, label: "Double Checker" },
      { threshold: 10, label: "Triple Checker" },
      { threshold: 25, label: "Serial Refresher" },
    ],
    valueLabel: v => `${v} time${v === 1 ? "" : "s"} reloaded`,
    detail: "Reload a saved itinerary from Saved Itineraries to check it again.",
  });
  const splitStayScientist = evaluateSpecialBadge({
    id: "split-stay-scientist", icon: "🧪", name: "Split-Stay Scientist", category: "planning",
    unlocked: eventCountFor(storedBadges, "split-stay-scientist") >= 1,
    requirement: "Compare 2+ saved itineraries side by side",
    detail: "Compare 2 or more saved itineraries side by side on Compare Itineraries.",
  });
  // The 11-month counterpart to 7-Month Sniper -- deliberately a PAIR,
  // not a name collision: 7 and 11 months are DVC's two real booking
  // windows, so an owner reading both badges together reads the actual
  // rule. (Contrast Bicoastal vs. the old "Coast to Coast", renamed
  // 2026-09-19 because those two shared a name shape with no
  // distinguishing principle behind it.)
  //
  // Gemini's original spec for this badge was "booked high-demand
  // inventory right as the home window opened," which isn't derivable --
  // `trips` records check-in/check-out but no BOOKING date, so there's no
  // way to know when a reservation was actually made. Tracking the
  // planning behavior instead is the honest version of the same idea: it
  // rewards being in the app looking at a stay during the one month its
  // 11-month window opens, which is the thing a sniper actually does.
  // See app.js's trackElevenMonthSniper() for the home-resort gate.
  const elevenMonthSniper = evaluateTieredBadge({
    id: "eleven-month-sniper", icon: "🔭", name: "11-Month Sniper", category: "planning",
    value: eventCountFor(storedBadges, "eleven-month-sniper"),
    tiers: [
      { threshold: 1, label: "Window Watcher" },
      { threshold: 5, label: "Sharpshooter" },
      { threshold: 15, label: "Dead Eye" },
    ],
    valueLabel: v => `${v} stay${v === 1 ? "" : "s"} planned at the 11-month mark`,
    detail: "Pick a stay on the calendar at one of your own home resorts with check-in 10 to 11 months out -- the stretch where your 11-month home resort priority opens, months before anyone else can book it at 7.",
  });
  const nightOwl = evaluateTieredBadge({
    id: "night-owl", icon: "🦉", name: "Night Owl", category: "exploration",
    value: eventCountFor(storedBadges, "night-owl"),
    tiers: [
      { threshold: 3, label: "Up Late" },
      { threshold: 10, label: "Midnight Planner" },
      { threshold: 25, label: "Never Sleeps" },
    ],
    valueLabel: v => `${v} late-night action${v === 1 ? "" : "s"}`,
    detail: "Planning actions logged between midnight and 4am -- clicking a source link, extending a trip, reloading an itinerary, or comparing itineraries.",
  });
  return [resourcefulExplorer, justOneMoreNight, reChecker, splitStayScientist, elevenMonthSniper, nightOwl];
}

function badgeTierText(b) {
  if (b.kind === "special") return b.unlocked ? "Unlocked" : "Locked";
  return b.unlocked ? `Tier ${b.tierNumber}: ${b.tierLabel}` : "Locked";
}

// Progress toward the NEXT tier, as a fraction of the gap between the
// tier just reached (or 0, if none yet) and the next threshold. Returns
// "" for special (non-tiered) badges and for a badge already at max tier.
// A badge can override the numeric-threshold math with customProgressPct
// (0-100, precomputed) for tiers that aren't a simple ascending number --
// The Odyssey's tiers are "which resort groups have you visited," not a
// single crossable threshold, so it supplies its own percentage.
function badgeProgressHTML(b) {
  if (b.kind !== "tiered" || !b.next) return "";
  let pct;
  if (b.customProgressPct != null) {
    pct = b.customProgressPct;
  } else {
    const prevThreshold = b.tierNumber > 0 ? b.tiers[b.tierNumber - 1].threshold : 0;
    const span = b.next.threshold - prevThreshold;
    pct = Math.max(0, Math.min(100, Math.round(((b.value - prevThreshold) / span) * 100)));
  }
  return `
    <div class="badge-progress-track"><div class="badge-progress-fill" style="width:${pct}%"></div></div>
    <div class="badge-progress-label">${b.valueLabel} &rarr; Tier ${b.tierNumber + 1}: ${b.next.label}</div>
  `;
}

// How close a LOCKED badge is to its first tier (0-100) -- used to sort
// "almost there" badges ahead of barely-started ones within the locked
// group. Unlocked badges are always 100; special badges with no partial
// progress concept sort alphabetically among themselves instead (handled
// by sortBadgesForDisplay, not here).
function badgeProximityPct(b) {
  if (b.unlocked) return 100;
  if (b.kind !== "tiered") return 0;
  if (b.customProgressPct != null) return b.customProgressPct;
  const firstThreshold = b.tiers[0]?.threshold || 1;
  return Math.max(0, Math.min(100, Math.round((b.value / firstThreshold) * 100)));
}

const TIER_WEIGHT = { "tier-prismatic": 4, "tier-gold": 3, "tier-silver": 2, "tier-bronze": 1 };

// Unlocked badges first (highest tier prestige first), then locked
// badges (closest to unlocking first, ties broken alphabetically).
function sortBadgesForDisplay(badges) {
  const unlocked = badges.filter(b => b.unlocked).sort((a, b) => {
    const w = (TIER_WEIGHT[b.tierClass] || 0) - (TIER_WEIGHT[a.tierClass] || 0);
    return w !== 0 ? w : a.name.localeCompare(b.name);
  });
  const locked = badges.filter(b => !b.unlocked).sort((a, b) => {
    const p = badgeProximityPct(b) - badgeProximityPct(a);
    return p !== 0 ? p : a.name.localeCompare(b.name);
  });
  return [...unlocked, ...locked];
}

// "financial" used to hold 12 of 30 badges while every other category held
// 5-9 -- split into "ownership" (owning contracts: how many, what kind, how
// long) and a narrower "financial" relabeled "Money & Value" (the
// percentage/efficiency metrics) at a DVC-literate reviewer's suggestion
// (2026-09-19). Kept the "financial" key itself unchanged so already-
// categorized badge objects didn't all need a second find-and-replace --
// only the ones that moved to "ownership" changed their category string.
const BADGE_CATEGORY_LABELS = {
  ownership: "Ownership",
  financial: "Money & Value",
  planning: "Planning & Travel",
  exploration: "Exploration & Easter Eggs",
  resorts: "Resort Loyalty",
};

function groupBadgesByCategory(badges) {
  const groups = { ownership: [], financial: [], planning: [], exploration: [], resorts: [] };
  for (const b of badges) (groups[b.category] || (groups[b.category] = [])).push(b);
  return groups;
}

// Tier-Weighted Mastery Score (2026-09-17): a plain "X of Y unlocked"
// count treats a badge sitting at Bronze the same as one maxed out at
// Prismatic. This weights EVERY badge's current tierNumber (0 for
// locked, 1 for a maxed-out special badge, 1-N for a tiered badge's own
// tiers.length) against the maximum EACH badge can actually reach, so
// depth of progress shows up, not just a binary unlocked/locked count.
// The denominator used to be a flat `badges.length * 4`, which assumed
// every badge climbs to Prismatic (tier 4) -- but special badges max out
// at tier 1 and several tiered badges (e.g. Beach Bum, Waitlist Whisperer)
// only define 3 tiers, so a fully maxed-out member could never reach 100%
// (a DVC-literate reviewer caught this -- 2026-09-19). Summing each
// badge's own real max fixes that.
// The set of unlocked badge ids in an already-evaluated badge list.
// Snapshotting this before and after a save is how trips.html detects
// what a newly-logged trip just unlocked (see its celebration banner) --
// diffing ids rather than re-deriving each badge's own condition, so a
// new badge is picked up by that celebration for free.
function unlockedBadgeIds(badges) {
  return new Set(badges.filter(b => b.unlocked).map(b => b.id));
}

function computeMasteryScore(badges) {
  const earned = badges.reduce((sum, b) => sum + (b.tierNumber || 0), 0);
  const max = badges.reduce((sum, b) => sum + (b.kind === "special" ? 1 : b.tiers.length), 0);
  const pct = max > 0 ? Math.round((earned / max) * 100) : 0;
  return { earned, max, pct };
}

// Merges a fetched { badge_id -> {unlockedCount, totalMembers} } rarity
// map onto each badge's own object as .rarityText, if the caller has
// rarity stats to give it -- optional so a page that hasn't fetched them
// (or the migration/RPC isn't deployed yet) just renders without a
// rarity line, never a fabricated one.
function applyRarityStats(badges, rarityByBadgeId) {
  if (!rarityByBadgeId) return badges;
  return badges.map(b => {
    const stat = rarityByBadgeId[b.id];
    if (!stat || stat.totalMembers < 5) return b; // too few members yet for a meaningful %
    const pct = Math.max(1, Math.round((stat.unlockedCount / stat.totalMembers) * 100));
    return { ...b, rarityText: `${pct}% of members have this` };
  });
}

// A plain key glyph, not the 🔑 emoji -- browsers render emoji as fixed
// multicolor glyphs that ignore CSS `color`/`fill`, so there's no way to
// tint 🔑 per tier. This SVG uses fill="currentColor" so .badge-icon-key's
// CSS (tokens.css) can color it per tier instead, while the circle behind
// it shows the resort's own photo (data/resort_images.js) -- 2026-09-20
// redesign, replacing an earlier version that put the photo behind the
// whole tile instead of in the icon circle.
const RESORT_KEY_SVG = `<svg class="badge-icon-key" viewBox="0 0 24 24" width="26" height="26"><path d="M7 14a4 4 0 1 1 3.86-5H21v4h-2v3h-3v-3H10.86A4 4 0 0 1 7 14zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>`;

// b.image (Resort Loyalty badges only -- see evaluateResortLoyaltyBadges()
// above): the icon-wrap circle shows the resort's real photo instead of
// the shared tier-color gradient every other badge's icon uses, with the
// key glyph itself (not the circle) recolored per tier via
// .badge-icon-key's CSS -- so "which resort" reads from the photo and
// "what tier" reads from the key's color, at a glance. The circle's
// existing tier-colored border (tokens.css's .tier-X .badge-icon-wrap
// rules) still applies underneath the photo for a bit of tier-tinted edge
// definition; a LOCKED resort badge's photo still shows (dimmed) because
// .badge-tile.locked's filter:grayscale/opacity already desaturates the
// whole tile, icon included, the same way it already does for every other
// badge's icon.
// A locked SPECIAL badge's unlock condition, for the tile face. Tiered
// badges don't need this -- badgeProgressHTML() already prints their
// criteria as a progress line -- and an unlocked badge doesn't need to be
// told how to unlock, so this is empty in both of those cases.
function badgeRequirementHTML(b) {
  if (b.kind !== "special" || b.unlocked || !b.requirement) return "";
  return `<div class="badge-requirement">${b.requirement}</div>`;
}

function buildTrophyTileHTML(b) {
  const iconInner = b.image ? RESORT_KEY_SVG : b.icon;
  const iconStyle = b.image ? ` style="background-image: url('${b.image}')"` : "";
  return `
    <div class="badge-tile ${b.tierClass}" data-badge-id="${b.id}">
      <div class="badge-icon-wrap${b.image ? " has-art" : ""}"${iconStyle}>${iconInner}</div>
      <div class="badge-title">${b.name}</div>
      <div class="badge-tier">${badgeTierText(b)}</div>
      ${badgeProgressHTML(b)}
      ${badgeRequirementHTML(b)}
    </div>
  `;
}

function buildTrophyCaseHTML(badges) {
  return badges.map(buildTrophyTileHTML).join("");
}

function openBadgeModal(badgeId, badges) {
  const b = badges.find(x => x.id === badgeId);
  if (!b) return;
  document.getElementById("badge-modal-title").textContent = b.name;
  const body = document.getElementById("badge-modal-body");

  const ladderHTML = b.kind === "tiered"
    ? `<div class="badge-modal-ladder">${b.tiers.map((t, i) => {
        const reached = b.tierNumber >= i + 1;
        const isNext = !reached && b.tierNumber === i;
        const requirement = t.requirementLabel != null ? t.requirementLabel : b.formatValue(t.threshold);
        return `
        <div class="badge-tier-row${reached ? " reached" : ""}${isNext ? " next" : ""}">
          <span>Tier ${i + 1}: ${t.label}</span>
          <span>${reached ? "&#10003; " : ""}${requirement}</span>
        </div>
      `;
      }).join("")}</div>`
    : "";

  const nextStepHTML = b.kind === "tiered" && b.next
    ? `<div class="badge-modal-next-step">To reach <strong>Tier ${b.tierNumber + 1}: ${b.next.label}</strong>, ${b.nextStepText || `get to ${b.formatValue(b.next.threshold)} (currently ${b.valueLabel})`}.</div>`
    : (b.kind === "tiered" ? `<div class="badge-modal-next-step maxed">Maxed out -- top tier reached.</div>` : "");

  const modalIconInner = b.image ? RESORT_KEY_SVG : b.icon;
  const modalIconStyle = b.image ? ` style="background-image: url('${b.image}')"` : "";
  body.innerHTML = `
    <div class="badge-modal-icon-wrap ${b.tierClass}"><div class="badge-icon-wrap${b.image ? " has-art" : ""}"${modalIconStyle}>${modalIconInner}</div></div>
    <div class="badge-modal-status">${badgeTierText(b)}</div>
    ${b.detail ? `<div class="badge-modal-detail">${b.detail}</div>` : ""}
    ${b.rarityText ? `<div class="badge-modal-rarity">${b.rarityText}</div>` : ""}
    ${b.kind === "tiered" ? badgeProgressHTML(b) : ""}
    ${nextStepHTML}
    ${ladderHTML}
  `;
  document.getElementById("badge-modal").classList.add("open");
}

function closeBadgeModal() {
  document.getElementById("badge-modal").classList.remove("open");
}

window.DVCBadges = {
  evaluateUserBadges,
  evaluateEventBadges,
  computePointEfficiency,
  applyBadgePersistence,
  applyRarityStats,
  sortBadgesForDisplay,
  groupBadgesByCategory,
  computeMasteryScore,
  BADGE_CATEGORY_LABELS,
  STICKY_BADGE_IDS,
  buildTrophyCaseHTML,
  buildTrophyTileHTML,
  badgeTierText,
  badgeProgressHTML,
  badgeRequirementHTML,
  unlockedBadgeIds,
  openBadgeModal,
  closeBadgeModal,
};

})();
