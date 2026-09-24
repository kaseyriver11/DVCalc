// PWA installability -- registers service-worker.js (see that file's own
// comment: still no caching/offline support, just a pass-through fetch
// handler) on every page that loads nav.js, unconditionally. Chrome/
// Android's "Add to Home Screen" install prompt needs a registered SW
// before it treats manifest.json as installable at all, and this can't
// wait on the visitor ever opting into Push Notifications the way
// account.html's own registration (enablePushNotifications()) does --
// registering the same script/scope twice is a harmless no-op, returning
// the existing registration.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}

// Shared mobile-nav hamburger toggle. The .site-nav markup (brand +
// .site-nav-toggle + .site-nav-links + #account-control) is identical on
// every page, so one generic script handles all of them -- nothing to wire
// up differently per page. No-op on desktop, where the toggle button itself
// is hidden via CSS and .site-nav-links is always visible.
//
// On a phone the open menu covers the whole screen (its own scroll, page
// scroll locked behind it) rather than pushing the page down and leaving a
// sliver of it showing underneath. The rules live here, not in each page's
// copied nav CSS, so every page gets them from one place; the 800px
// breakpoint matches every page's own nav collapse.
const NAV_OVERLAY_CSS = `
@media (max-width: 800px) {
  .site-nav.open {
    position: fixed;
    inset: 0;
    height: 100vh;
    height: 100dvh;
    align-content: flex-start;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
    z-index: 1000;
  }
  /* The desktop group dividers read as stray bars in the stacked list. */
  .site-nav-divider { display: none; }
  body.site-nav-locked { overflow: hidden; }
}`;

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".site-nav");
  const toggle = nav?.querySelector(".site-nav-toggle");
  if (!nav || !toggle) return;

  const style = document.createElement("style");
  style.textContent = NAV_OVERLAY_CSS;
  document.head.appendChild(style);

  function setOpen(isOpen) {
    nav.classList.toggle("open", isOpen);
    document.body.classList.toggle("site-nav-locked", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Menu");
  }

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));

  // Close after tapping a link so the menu doesn't stay open into the next
  // page load -- state doesn't actually persist across navigation, but
  // without this the menu can flash open for a moment first.
  nav.querySelectorAll(".site-nav-links a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); toggle.focus(); }
  });

  // Never leave the page scroll-locked if the viewport grows past the
  // phone layout (rotation, a resized window) while the menu is open.
  window.matchMedia("(min-width: 801px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
});

// index.html's mobile-only collapse for the Resort/Room Type/Booking As/Load
// Trip dropdowns (#controls-toggle/#controls-groups) now lives in app.js,
// not here -- the collapsed label shows a live Resort/Room/Booking-As
// summary (the "Active Context Summary Bar"), which needs real calendar
// state that this page-agnostic shared include has no business knowing
// about. See app.js's buildActiveContextSummary()/updateActiveContextBar().
