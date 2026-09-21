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
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".site-nav");
  const toggle = nav?.querySelector(".site-nav-toggle");
  if (!nav || !toggle) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close after tapping a link so the menu doesn't stay open into the next
  // page load -- state doesn't actually persist across navigation, but
  // without this the menu can flash open for a moment first.
  nav.querySelectorAll(".site-nav-links a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
});
