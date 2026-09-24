// The one $/point value editor. Every page that turns points into a dollar
// estimate -- Calendar, Resort Comparison, Contract Value, Membership
// Value -- renders this same control with the same default, range and
// presets, so a point is worth the same thing everywhere unless the owner
// changes it. Plain <script>, exposes window.DVCPointValue; its CSS injects
// itself (dvcpv- classes) since two of those pages don't load tokens.css.
//
// Markup only: each page keeps its own state and decides what an edit
// changes. attach() reports input while dragging (final = false) and on
// release or a preset tap (final = true), so a page that re-renders the
// editor itself can wait for final and not break the drag.
(function () {
  const DEFAULT = 30;
  const MIN = 15;
  const MAX = 50;
  const STEP = 1;
  const PRESETS = [
    { value: 21, sub: "Point rental" },
    { value: 30, sub: "Typical" },
    { value: 35, sub: "Deluxe rack" },
  ];

  function clamp(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return DEFAULT;
    return Math.min(MAX, Math.max(MIN, Math.round(n / STEP) * STEP));
  }

  const format = v => `$${clamp(v)}/pt`;

  const CSS = `
.dvcpv { display: flex; flex-direction: column; gap: 6px; text-align: left; }
.dvcpv-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.dvcpv-label { font-size: 0.82rem; font-weight: 600; color: var(--color-text, #333); }
.dvcpv-out { font-size: 0.95rem; font-weight: 700; color: var(--color-primary, #4a148c); font-variant-numeric: tabular-nums; white-space: nowrap; }
.dvcpv-hint { font-size: 0.72rem; line-height: 1.35; color: var(--color-text-muted, #777); margin: 0; }
.dvcpv-chips { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.dvcpv-chip { font: inherit; display: flex; flex-direction: column; align-items: center; gap: 1px; min-height: 40px; padding: 5px 4px; border: 1px solid #ddd; border-radius: 8px; background: #fff; color: #555; cursor: pointer; }
.dvcpv-chip-main { font-size: 0.8rem; font-weight: 700; line-height: 1.15; }
.dvcpv-chip-sub { font-size: 0.64rem; color: #999; line-height: 1.15; white-space: nowrap; }
.dvcpv-chip:hover { border-color: var(--color-primary, #4a148c); color: var(--color-primary, #4a148c); }
.dvcpv-chip.active { border-color: var(--color-primary, #4a148c); background: #f3e8fd; color: var(--color-primary, #4a148c); }
.dvcpv-chip.active .dvcpv-chip-sub, .dvcpv-chip:hover .dvcpv-chip-sub { color: var(--color-primary, #4a148c); }
.dvcpv-slider { width: 100%; margin: 4px 0 0; accent-color: var(--color-primary, #4a148c); cursor: pointer; }
.dvcpv-range { display: flex; justify-content: space-between; font-size: 0.66rem; color: #aaa; }
`;
  function injectCSS() {
    if (typeof document === "undefined" || document.getElementById("dvcpv-css")) return;
    const style = document.createElement("style");
    style.id = "dvcpv-css";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // id: unique per page (the slider's element id). hint: one short line on
  // what this page uses the value for.
  function html({ id, value, label = "Value per point", hint = "" }) {
    injectCSS();
    const v = clamp(value);
    return `
      <div class="dvcpv" data-dvcpv="${id}">
        <div class="dvcpv-head">
          <label class="dvcpv-label" for="${id}">${label}</label>
          <span class="dvcpv-out" data-dvcpv-out>${format(v)}</span>
        </div>
        ${hint ? `<p class="dvcpv-hint">${hint}</p>` : ""}
        <div class="dvcpv-chips">
          ${PRESETS.map(p => `<button type="button" class="dvcpv-chip${p.value === v ? " active" : ""}" data-dvcpv-value="${p.value}"><span class="dvcpv-chip-main">$${p.value}</span><span class="dvcpv-chip-sub">${p.sub}</span></button>`).join("")}
        </div>
        <input type="range" class="dvcpv-slider" id="${id}" min="${MIN}" max="${MAX}" step="${STEP}" value="${v}">
        <div class="dvcpv-range" aria-hidden="true"><span>$${MIN}</span><span>$${MAX}</span></div>
      </div>`;
  }

  // Wires the editor rendered by html({ id }) inside `scope` (default
  // document). onChange(value, final).
  function attach(id, onChange, scope) {
    const root = (scope || document).querySelector(`[data-dvcpv="${id}"]`);
    if (!root || root.dataset.dvcpvWired) return;
    root.dataset.dvcpvWired = "1";
    const slider = root.querySelector(".dvcpv-slider");
    const out = root.querySelector("[data-dvcpv-out]");
    const show = v => {
      out.textContent = format(v);
      root.querySelectorAll(".dvcpv-chip").forEach(c => c.classList.toggle("active", Number(c.dataset.dvcpvValue) === v));
    };
    slider.addEventListener("input", () => { const v = clamp(slider.value); show(v); onChange(v, false); });
    slider.addEventListener("change", () => { const v = clamp(slider.value); show(v); onChange(v, true); });
    root.querySelectorAll(".dvcpv-chip").forEach(chip => chip.addEventListener("click", () => {
      const v = clamp(chip.dataset.dvcpvValue);
      slider.value = v; show(v); onChange(v, true);
    }));
  }

  const api = { DEFAULT, MIN, MAX, STEP, PRESETS, clamp, format, html, attach };
  if (typeof window !== "undefined") window.DVCPointValue = api;
  if (typeof module !== "undefined") module.exports = api;
})();
