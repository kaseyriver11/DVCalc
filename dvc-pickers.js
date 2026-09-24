// Shared resort and room-type pickers (2026-09-23 visual alignment).
// The standard is the calendar's Resort sheet and Record a Booking's room
// tiles: a bottom sheet with the selected resort's photo, a search field,
// full-name rows with a color swatch and a clear selected state, and one
// close control; exact room types as icon tiles. Pages that already had
// their own copy of that design (index.html, bookings.html, itineraries.html)
// keep it; every other resort/room chooser uses this file. It injects its
// own CSS (dvcp-*), so it works on pages that don't load tokens.css.
//
// Needs RESORTS (data/data.js); uses getResortImage (data/resort_images.js)
// and shorthandResortName (data/resort_shorthand.js) when present.
(function () {
  const SWATCHES = ["#4a148c", "#1b5e3a", "#0d47a1", "#7a1734", "#8d5524", "#37474f"];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const image = id => (id && typeof getResortImage === "function" ? getResortImage(id) : null);
  const shortName = (id, name) => (typeof shorthandResortName === "function" ? shorthandResortName(id, name) : name);

  function swatch(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return SWATCHES[h % SWATCHES.length];
  }

  // Every resort once, by full name.
  function allResorts() {
    const seen = new Map();
    for (const r of RESORTS) if (!seen.has(r.id)) seen.set(r.id, { id: r.id, name: r.name });
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  // The newest chart's room types for a resort.
  function roomTypes(resortId) {
    const years = RESORTS.filter(r => r.id === resortId).map(r => r.year);
    const chart = RESORTS.find(r => r.id === resortId && r.year === Math.max(...years));
    return chart ? chart.roomTypes : [];
  }

  const CSS = `
.dvcp-trigger { min-width: 0; max-width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; min-height: 44px; padding: 6px 12px; border: 1px solid var(--color-border, #ddd); border-radius: var(--radius-sm, 8px); background: var(--color-bg-card, #fff); background-size: cover; background-position: center; color: var(--color-text, #222); font: inherit; font-size: .9rem; text-align: left; cursor: pointer; box-sizing: border-box; }
.dvcp-trigger:hover { border-color: #b39ddb; }
.dvcp-trigger.has-art { border-color: rgba(255,255,255,.6); }
.dvcp-trigger.has-art .dvcp-trigger-value { font-weight: 700; text-shadow: 0 1px 3px rgba(255,255,255,.75), 0 0 1px rgba(255,255,255,.75); }
.dvcp-trigger-value { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.dvcp-arrow { flex-shrink: 0; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #888; }
.dvcp-trigger:focus-visible, .dvcp-row:focus-visible, .dvcp-close:focus-visible, .dvcp-room:focus-visible { outline: 3px solid var(--color-primary, #4a148c); outline-offset: 2px; }
.dvcp-overlay { position: fixed; inset: 0; z-index: 1000; display: none; align-items: flex-end; justify-content: center; background: rgba(20, 12, 40, .45); }
.dvcp-overlay.open { display: flex; }
.dvcp-sheet { width: 100%; max-width: 560px; max-height: 85vh; max-height: 85dvh; display: flex; flex-direction: column; background: #fff; border-radius: 16px 16px 0 0; padding: 8px 16px calc(16px + env(safe-area-inset-bottom)); box-sizing: border-box; animation: dvcp-up .22s ease-out; }
@keyframes dvcp-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .dvcp-sheet { animation: none; } }
.dvcp-handle { width: 36px; height: 4px; background: var(--color-border, #ddd); border-radius: 999px; margin: 4px auto 12px; flex-shrink: 0; }
.dvcp-hero { height: 120px; border-radius: 12px; background-size: cover; background-position: center; margin-bottom: 10px; flex-shrink: 0; }
.dvcp-hero[hidden] { display: none; }
.dvcp-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; flex-shrink: 0; }
.dvcp-header h3 { margin: 0; font-size: 1.05rem; color: var(--color-secondary, #2a1a5e); }
.dvcp-close { width: 44px; height: 44px; margin: -8px -8px -8px 0; border: 0; background: none; font-size: 1.6rem; line-height: 1; color: #666; cursor: pointer; flex-shrink: 0; }
.dvcp-search { width: 100%; min-height: 44px; padding: 8px 12px; border: 1px solid var(--color-border, #ddd); border-radius: var(--radius-sm, 8px); font: inherit; font-size: 16px; margin-bottom: 10px; box-sizing: border-box; flex-shrink: 0; }
.dvcp-list { overflow-y: auto; -webkit-overflow-scrolling: touch; display: flex; flex-direction: column; gap: 8px; min-height: 0; }
.dvcp-row { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 44px; padding: 12px 10px; border: 1px solid var(--color-border-light, #eee); border-radius: var(--radius-sm, 8px); background: #fff; color: var(--color-text, #222); font: inherit; font-size: .88rem; text-align: left; cursor: pointer; box-sizing: border-box; }
.dvcp-row:hover, .dvcp-row:active { background: var(--color-primary-tint-bg, #f3edfb); }
.dvcp-row.selected { border-color: var(--color-primary, #4a148c); background: var(--color-primary-tint-bg, #f3edfb); font-weight: 700; }
.dvcp-row.selected::after { content: "\\2713"; margin-left: auto; color: var(--color-primary, #4a148c); }
.dvcp-row[disabled] { opacity: .45; cursor: not-allowed; }
.dvcp-swatch { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
.dvcp-empty { padding: 20px 4px; text-align: center; color: #888; font-size: .85rem; }
.dvcp-rooms { display: none; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 8px; }
.dvcp-rooms.open { display: grid; }
.dvcp-room { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px; border: 1.5px solid var(--color-border-light, #eee); border-radius: var(--radius-sm, 8px); background: #fff; color: var(--color-text, #222); font: inherit; cursor: pointer; text-align: center; min-width: 0; }
.dvcp-room:hover { border-color: #b39ddb; }
.dvcp-room.selected { border-color: var(--color-primary, #4a148c); background: var(--color-primary-tint-bg, #f3edfb); }
.dvcp-room-icon { font-size: 1.3rem; line-height: 1; }
.dvcp-room-name { font-size: .76rem; font-weight: 600; line-height: 1.25; overflow-wrap: anywhere; }
.dvcp-room-sleeps { font-size: .66rem; color: #777; }
`;
  function injectStyles() {
    if (document.getElementById("dvcp-styles")) return;
    const style = document.createElement("style");
    style.id = "dvcp-styles";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // A picker trigger's resort photo, washed so the label stays readable
  // (same treatment as the calendar's Resort trigger).
  function applyArt(el, resortId) {
    const img = image(resortId);
    el.style.backgroundImage = img ? `linear-gradient(rgba(236, 225, 247, 0.82), rgba(236, 225, 247, 0.82)), url('${img}')` : "";
    el.classList.toggle("has-art", !!img);
  }

  function triggerHTML({ id, label, value }) {
    return `<button type="button" class="dvcp-trigger" id="${id}" aria-haspopup="dialog" aria-label="${esc(label)}: ${esc(value)}"><span class="dvcp-trigger-value">${esc(value)}</span><span class="dvcp-arrow" aria-hidden="true"></span></button>`;
  }

  // Resort rows. resorts: [{id, name}]. anyLabel: an optional first row
  // with value "". disabled(id) -> true to grey a row out.
  function rowsHTML({ resorts, selected, query = "", anyLabel = null, disabled = null }) {
    const q = query.trim().toLowerCase();
    const matches = resorts.filter(r => !q || r.name.toLowerCase().includes(q) || shortName(r.id, r.name).toLowerCase().includes(q) || (r.search || "").includes(q));
    const any = anyLabel && !q ? `<button type="button" class="dvcp-row${!selected ? " selected" : ""}" data-dvcp-resort="" aria-pressed="${!selected}"><span class="dvcp-swatch" style="background:#bbb"></span><span>${esc(anyLabel)}</span></button>` : "";
    if (!matches.length) return any + `<div class="dvcp-empty" role="status">No resorts match your search.</div>`;
    return any + matches.map(r => {
      const off = disabled && disabled(r.id);
      return `<button type="button" class="dvcp-row${r.id === selected ? " selected" : ""}" data-dvcp-resort="${esc(r.id)}" aria-pressed="${r.id === selected}"${off ? " disabled" : ""}><span class="dvcp-swatch" style="background:${swatch(r.id)}"></span><span>${esc(r.name)}</span></button>`;
    }).join("");
  }

  // The bottom sheet, created once per page. opts: { title, resorts,
  // selected, anyLabel, disabled, onPick(id), returnFocus }.
  let current = null;
  function ensureSheet() {
    injectStyles();
    let overlay = document.getElementById("dvcp-resort-sheet");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "dvcp-overlay";
    overlay.id = "dvcp-resort-sheet";
    overlay.innerHTML = `<div class="dvcp-sheet" role="dialog" aria-modal="true" aria-labelledby="dvcp-resort-title">
        <div class="dvcp-handle"></div>
        <div class="dvcp-hero" id="dvcp-resort-hero" hidden></div>
        <div class="dvcp-header"><h3 id="dvcp-resort-title"></h3><button type="button" class="dvcp-close" aria-label="Close">&times;</button></div>
        <input type="search" class="dvcp-search" id="dvcp-resort-search" placeholder="Search resorts" aria-label="Search resorts" autocomplete="off">
        <div class="dvcp-list" id="dvcp-resort-list"></div>
      </div>`;
    document.body.appendChild(overlay);
    const search = overlay.querySelector(".dvcp-search");
    search.addEventListener("input", () => renderList());
    overlay.addEventListener("click", e => {
      if (e.target === overlay || e.target.closest(".dvcp-close")) return close();
      const row = e.target.closest("[data-dvcp-resort]");
      if (!row || row.disabled || !current) return;
      const pick = current.onPick;
      close();
      pick(row.dataset.dvcpResort);
    });
    overlay.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      if (e.key !== "Tab") return;
      const items = [...overlay.querySelectorAll("button, input")].filter(el => !el.disabled);
      if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus(); }
    });
    return overlay;
  }
  function renderList() {
    if (!current) return;
    document.getElementById("dvcp-resort-list").innerHTML = rowsHTML({ ...current, query: document.getElementById("dvcp-resort-search").value });
  }
  function open(opts) {
    const overlay = ensureSheet();
    current = { resorts: allResorts(), ...opts };
    document.getElementById("dvcp-resort-title").textContent = opts.title || "Choose a resort";
    const hero = document.getElementById("dvcp-resort-hero");
    const img = image(opts.selected);
    hero.hidden = !img;
    hero.style.backgroundImage = img ? `url('${img}')` : "";
    document.getElementById("dvcp-resort-search").value = "";
    renderList();
    overlay.classList.add("open");
    opts.returnFocus?.setAttribute("aria-expanded", "true");
    overlay.querySelector(".dvcp-close").focus();
  }
  function close() {
    const overlay = document.getElementById("dvcp-resort-sheet");
    overlay?.classList.remove("open");
    const back = current?.returnFocus;
    current = null;
    back?.setAttribute("aria-expanded", "false");
    back?.focus();
  }

  // Record a Booking's room tiles.
  function roomIcon(name) {
    const n = name.toLowerCase();
    if (n.includes("grand villa") || n.includes("treehouse")) return "\u{1F3E1}";
    if (n.includes("two-bedroom") || n.includes("three-bedroom")) return "\u{1F3E0}";
    if (n.includes("one-bedroom")) return "\u{1F6CB}\u{FE0F}";
    if (n.includes("cabin")) return "\u{1F3D5}\u{FE0F}";
    return "\u{1F6CF}\u{FE0F}";
  }
  function roomTilesHTML(rooms, selected) {
    return rooms.map(rt => `<button type="button" class="dvcp-room${rt.id === selected ? " selected" : ""}" data-dvcp-room="${esc(rt.id)}" aria-pressed="${rt.id === selected}"><span class="dvcp-room-icon" aria-hidden="true">${roomIcon(rt.name)}</span><span class="dvcp-room-name">${esc(rt.name)}</span>${rt.sleeps ? `<span class="dvcp-room-sleeps">Sleeps ${rt.sleeps}</span>` : ""}</button>`).join("");
  }

  // The rows are also used inline (Add Contract), so the styles go in as soon as the file loads.
  if (document.head) injectStyles();

  window.DVCPickers = { injectStyles, allResorts, roomTypes, swatch, applyArt, triggerHTML, rowsHTML, open, close, roomTilesHTML, roomIcon };
})();
