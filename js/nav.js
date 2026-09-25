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
/* Group labels are purple so a section heading never reads as a link.
   Every page's copied nav CSS sets them grey; this wins on specificity. */
.site-nav .site-nav-group-label { color: var(--color-primary, #4a148c); }

/* Each group's links sit in a .site-nav-menu wrapper (added below). It's
   invisible to layout unless the desktop bar is in dropdown mode. */
.site-nav-menu { display: contents; }
.site-nav-group-toggle { display: none; }

/* Signed out, the bar shows one "Sign in" button; its panel holds the
   Google and email options (auth.js renderAccountControl()). */
#account-control { position: relative; }
.account-signin-panel { position: absolute; right: 0; top: calc(100% + 8px); z-index: 1100; padding: 16px; background: #fff; border: 1px solid #e6e0ee; border-radius: 12px; box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14); }
.account-signin-panel[hidden] { display: none; }

@media (min-width: 801px) {
  /* Dropdown mode: set by fitNav() only when the full row doesn't fit, so
     wide screens keep every link visible. */
  .site-nav.compact .site-nav-links { flex-wrap: nowrap; gap: 4px; }
  .site-nav.compact .site-nav-divider,
  .site-nav.compact .site-nav-group-label { display: none; }
  .site-nav.compact .site-nav-group { position: relative; }
  .site-nav.compact .site-nav-group-toggle { display: inline-flex; align-items: center; gap: 5px; font: inherit; font-size: 0.85rem; font-weight: 600; color: #555; background: none; border: 0; padding: 8px 10px; border-radius: 8px; cursor: pointer; white-space: nowrap; }
  .site-nav.compact .site-nav-group-toggle::after { content: ""; border: 4px solid transparent; border-top-color: currentColor; margin-top: 4px; }
  .site-nav.compact .site-nav-group.has-active .site-nav-group-toggle { color: var(--color-primary, #4a148c); }
  .site-nav.compact .site-nav-group-toggle:hover,
  .site-nav.compact .site-nav-group.menu-open .site-nav-group-toggle { background: #f3e8fd; color: var(--color-primary, #4a148c); }
  .site-nav.compact .site-nav-group-toggle:focus-visible { outline: 3px solid var(--color-primary, #4a148c); outline-offset: 2px; }
  .site-nav.compact .site-nav-menu { display: none; position: absolute; top: 100%; left: 0; z-index: 1100; min-width: 210px; flex-direction: column; gap: 2px; padding: 6px; margin-top: 4px; background: #fff; border: 1px solid #e6e0ee; border-radius: 10px; box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14); }
  .site-nav.compact .site-nav-group.menu-open .site-nav-menu { display: flex; }
  .site-nav.compact .site-nav-menu a { padding: 9px 12px; border-radius: 6px; border-bottom: none; white-space: nowrap; }
  .site-nav.compact .site-nav-menu a:hover { background: #f7f5fa; }
  .site-nav.compact .site-nav-menu a.active { background: #f3e8fd; }
}
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
  /* Full-width rows at the 44px minimum tap height, and the current page
     marked with a tinted row instead of the desktop underline, which is
     easy to miss in a stacked list. */
  .site-nav .site-nav-group { align-items: stretch; align-self: stretch; gap: 2px; }
  /* On the stacked menu each label also gets a rule under it, so the
     group reads as a heading over its links. */
  .site-nav .site-nav-group-label {
    font-size: 0.72rem;
    letter-spacing: 0.8px;
    padding: 12px 12px 6px;
    margin-bottom: 4px;
    border-bottom: 2px solid #e6d6f5;
  }
  .site-nav .site-nav-group:first-child .site-nav-group-label { padding-top: 0; }
  .site-nav .site-nav-links a {
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 0 12px;
    border-bottom: none;
    border-radius: 8px;
    font-size: 0.95rem;
  }
  .site-nav .site-nav-links a.active { background: #f3e8fd; color: #4a148c; }
  .site-nav.open #account-control { display: flex; flex-direction: column; align-items: center; }
  /* Signed out: Sign in leads the open menu, above the links. */
  .site-nav.signed-out #account-control { order: 1; margin: 8px 0 2px; }
  .site-nav.signed-out .site-nav-links { order: 2; border-top: 0; margin-top: 0; }
  /* In the full-screen menu the sign-in options open in place. */
  .account-signin-panel { position: static; margin-top: 10px; box-shadow: none; }
  body.site-nav-locked { overflow: hidden; }
}
.site-footer { text-align: center; font-size: 0.72rem; color: #777; padding: 28px 16px 20px; }
.site-footer a { color: #6a1b9a; font-weight: 600; text-decoration: none; }
.site-footer a:hover { text-decoration: underline; }`;

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".site-nav");
  const toggle = nav?.querySelector(".site-nav-toggle");
  if (!nav || !toggle) return;

  const style = document.createElement("style");
  style.textContent = NAV_OVERLAY_CSS;
  document.head.appendChild(style);

  // Site footer: privacy.html and terms.html were only linked from each
  // other, and the "not affiliated with Disney" line only lived there.
  if (!document.querySelector(".site-footer")) {
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `<a href="privacy.html">Privacy</a> &middot; <a href="terms.html">Terms</a> &middot; <span>Not affiliated with Disney or Disney Vacation Club</span>`;
    document.body.appendChild(footer);
  }

  function setOpen(isOpen) {
    nav.classList.toggle("open", isOpen);
    document.body.classList.toggle("site-nav-locked", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Menu");
  }

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));

  // ---- Desktop dropdown mode ----
  // Wrap each group's links in a .site-nav-menu and give the group a
  // toggle button. Neither shows unless fitNav() finds the full row
  // doesn't fit (a laptop-width window); then each group collapses to
  // "My Membership ▾" and so on. The markup in each page stays the same.
  const groups = [...nav.querySelectorAll(".site-nav-group")];
  const closeMenus = except => groups.forEach(g => {
    if (g === except) return;
    g.classList.remove("menu-open");
    g.querySelector(".site-nav-group-toggle")?.setAttribute("aria-expanded", "false");
  });
  groups.forEach((group, i) => {
    const label = group.querySelector(".site-nav-group-label");
    const menu = document.createElement("span");
    menu.className = "site-nav-menu";
    menu.id = `site-nav-menu-${i}`;
    group.querySelectorAll("a").forEach(a => menu.appendChild(a));
    group.appendChild(menu);
    if (menu.querySelector("a.active")) group.classList.add("has-active");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "site-nav-group-toggle";
    button.textContent = label ? label.textContent : "Menu";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", menu.id);
    group.insertBefore(button, menu);
    button.addEventListener("click", () => {
      const open = !group.classList.contains("menu-open");
      closeMenus(group);
      group.classList.toggle("menu-open", open);
      button.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", e => { if (!e.target.closest(".site-nav-group")) closeMenus(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenus(); });

  const desktop = window.matchMedia("(min-width: 801px)");
  const links = nav.querySelector(".site-nav-links");
  const account = document.getElementById("account-control");
  // The full row fits when every group, and the account control, sits on
  // the brand's line.
  function fitNav() {
    nav.classList.remove("compact");
    if (!desktop.matches || !groups.length) return;
    const top = el => el.getBoundingClientRect().top;
    const rowTop = top(groups[0]);
    const wraps = groups.some(g => top(g) > rowTop + 4)
      || links.scrollWidth > links.clientWidth + 1
      || (account && account.offsetHeight && top(account) > rowTop + 24);
    if (wraps) nav.classList.add("compact");
    else closeMenus();
  }
  let fitFrame = 0;
  const scheduleFit = () => { cancelAnimationFrame(fitFrame); fitFrame = requestAnimationFrame(fitNav); };
  window.addEventListener("resize", scheduleFit);
  // The account control fills in after auth loads, and fonts can change widths.
  if (account) new MutationObserver(scheduleFit).observe(account, { childList: true });
  document.fonts?.ready.then(scheduleFit);
  fitNav();

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
