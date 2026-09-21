// Lightweight, app-wide click/action tracker for the 5 event-count-driven
// Trophy Case badges (Resourceful Explorer, Just One More Night, The
// Re-Checker, Split-Stay Scientist, Night Owl -- dvc-badges.js's
// evaluateEventBadges()). Deliberately separate from dvc-badges.js: badge
// EVALUATION only needs to run on trips.html/badges.html, but event
// TRACKING has to happen on whichever page the action actually occurs on
// (the calendar, Saved Itineraries, Compare Itineraries, and any page with
// an external source link) -- so this is included wherever a trackable
// action lives, independent of whether the full badge system is loaded.
//
// Wrapped in an IIFE exposing window.DVCTrack, same convention as
// dvc-dates.js/dvc-ui.js/dvc-badges.js.
(function () {

// Local-time window used for the Night Owl badge -- deliberately generous
// (covers a normal "up too late planning a trip" stretch) rather than a
// strict midnight-only window.
const NIGHT_OWL_START_HOUR = 0;
const NIGHT_OWL_END_HOUR = 4;

function isNightOwlHour() {
  const h = new Date().getHours();
  return h >= NIGHT_OWL_START_HOUR && h < NIGHT_OWL_END_HOUR;
}

// Fire-and-forget: increments badgeId's event_count via the atomic
// increment_badge_event() RPC (db/migrations/010_add_increment_badge_event.sql).
// Silently no-ops if signed out/unconfigured (auth.js's own guard) or if
// auth.js hasn't loaded yet -- never blocks or throws into the caller.
function track(badgeId) {
  if (!window.DVCAuth || !window.DVCAuth.incrementBadgeEvent) return;
  window.DVCAuth.incrementBadgeEvent(badgeId).catch(() => {});
  if (isNightOwlHour()) window.DVCAuth.incrementBadgeEvent("night-owl").catch(() => {});
}

// Delegated so it covers every external source/marketplace/FAQ link on
// the page (points charts, crowd calendar, Disney Food Blog, resale
// marketplaces, Membership Extras FAQ, etc.) without needing a listener
// wired to each one individually.
function wireExternalLinkTracking() {
  document.addEventListener("click", (e) => {
    if (e.target.closest('a[target="_blank"]')) track("resourceful-explorer");
  });
}

window.DVCTrack = { track };
wireExternalLinkTracking();

})();
