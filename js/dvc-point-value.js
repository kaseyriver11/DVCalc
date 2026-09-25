// The $/point editors. Two different numbers, never mixed up:
//   value  ($30) -- what the owner values their points at: roughly what a
//                   point saves against Disney's cash price for a room. Prices owned points and stays
//                   (Contract Value's Cash Ratio, Membership Value).
//   rental ($20) -- what a point rents for between owners. Prices "rent
//                   points instead" (the calendar's rental tile, Resort
//                   Comparison's Rental Cost, Contract Value's breakeven
//                   vs renting, and what an owner gets renting points out).
// Every page renders the same control per kind with the same default,
// range and presets. Plain <script>, exposes window.DVCPointValue; its CSS
// injects itself (dvcpv- classes) since two of those pages don't load
// tokens.css.
//
// Markup only: each page keeps its own state and decides what an edit
// changes. attach() reports input while dragging (final = false) and on
// release or a preset tap (final = true), so a page that re-renders the
// editor itself can wait for final and not break the drag.
(function () {
  const KINDS = {
    value: {
      DEFAULT: 30, MIN: 15, MAX: 50, STEP: 1, label: "What you value your points at",
      PRESETS: [
        { value: 26, sub: "AP / promo" },
        { value: 30, sub: "Typical" },
        { value: 35, sub: "Deluxe rack" },
      ],
    },
    rental: {
      DEFAULT: 20, MIN: 15, MAX: 25, STEP: 1, label: "Rental price per point",
      PRESETS: [
        { value: 17, sub: "Low" },
        { value: 20, sub: "Typical" },
        { value: 23, sub: "High" },
      ],
    },
  };
  const kindOf = kind => KINDS[kind] || KINDS.value;
  const { DEFAULT, MIN, MAX, STEP, PRESETS } = KINDS.value;
  const RENTAL_DEFAULT = KINDS.rental.DEFAULT;

  function clamp(v, kind) {
    const k = kindOf(kind);
    const n = Number(v);
    if (!Number.isFinite(n)) return k.DEFAULT;
    return Math.min(k.MAX, Math.max(k.MIN, Math.round(n / k.STEP) * k.STEP));
  }

  const format = (v, kind) => `$${clamp(v, kind)}/pt`;

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

  // id: unique per page (the slider's element id). kind: "value" (default)
  // or "rental". hint: one short line on what this page uses the value for.
  function html({ id, value, kind = "value", label, hint = "" }) {
    injectCSS();
    const k = kindOf(kind);
    const v = clamp(value, kind);
    return `
      <div class="dvcpv" data-dvcpv="${id}" data-dvcpv-kind="${kind}">
        <div class="dvcpv-head">
          <label class="dvcpv-label" for="${id}">${label || k.label}</label>
          <span class="dvcpv-out" data-dvcpv-out>${format(v, kind)}</span>
        </div>
        ${hint ? `<p class="dvcpv-hint">${hint}</p>` : ""}
        <div class="dvcpv-chips">
          ${k.PRESETS.map(p => `<button type="button" class="dvcpv-chip${p.value === v ? " active" : ""}" data-dvcpv-value="${p.value}"><span class="dvcpv-chip-main">$${p.value}</span><span class="dvcpv-chip-sub">${p.sub}</span></button>`).join("")}
        </div>
        <input type="range" class="dvcpv-slider" id="${id}" min="${k.MIN}" max="${k.MAX}" step="${k.STEP}" value="${v}">
        <div class="dvcpv-range" aria-hidden="true"><span>$${k.MIN}</span><span>$${k.MAX}</span></div>
      </div>`;
  }

  // Wires the editor rendered by html({ id }) inside `scope` (default
  // document). onChange(value, final).
  function attach(id, onChange, scope) {
    const root = (scope || document).querySelector(`[data-dvcpv="${id}"]`);
    if (!root || root.dataset.dvcpvWired) return;
    root.dataset.dvcpvWired = "1";
    const kind = root.dataset.dvcpvKind;
    const slider = root.querySelector(".dvcpv-slider");
    const out = root.querySelector("[data-dvcpv-out]");
    const show = v => {
      out.textContent = format(v, kind);
      root.querySelectorAll(".dvcpv-chip").forEach(c => c.classList.toggle("active", Number(c.dataset.dvcpvValue) === v));
    };
    slider.addEventListener("input", () => { const v = clamp(slider.value, kind); show(v); onChange(v, false); });
    slider.addEventListener("change", () => { const v = clamp(slider.value, kind); show(v); onChange(v, true); });
    root.querySelectorAll(".dvcpv-chip").forEach(chip => chip.addEventListener("click", () => {
      const v = clamp(chip.dataset.dvcpvValue, kind);
      slider.value = v; show(v); onChange(v, true);
    }));
  }

  const api = { DEFAULT, MIN, MAX, STEP, PRESETS, RENTAL_DEFAULT, KINDS, clamp, format, html, attach };
  if (typeof window !== "undefined") window.DVCPointValue = api;
  if (typeof module !== "undefined") module.exports = api;
})();
