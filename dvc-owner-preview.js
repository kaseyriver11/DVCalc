// A small, clearly labeled example of the owner dashboard, shown to people
// who can't see their own yet: signed-out Home and the Active Member gate
// (Home and My Contracts, via DVCAuth.renderMembershipGate's `preview`
// option). One renderer so the two stay identical.
//
// Everything in it is synthetic and fixed. It's static markup only -- no
// links, buttons or inputs, and `inert` keeps it out of the tab order -- so
// nothing looks like it operates on the example, and it never reads or
// writes owner data. Dates are relative ("in 24 days") so the sample never
// goes stale. Self-injects its CSS (dvcop- prefix, like dvc-pickers.js),
// since Home doesn't load tokens.css.
(function () {
  const EXAMPLE = {
    total: 412,
    contracts: [
      { name: "Saratoga Springs", detail: "150 pts a year · Dec use year", points: 262 },
      { name: "Riviera", detail: "100 pts a year · Jun use year", points: 150 },
    ],
    next: { title: "Bank or use 120 current points", detail: "Saratoga Springs · banking deadline in 24 days" },
    checked: "Owner confirmed these balances with Disney 6 days ago",
  };

  const CSS = `
.dvcop { margin: 16px auto 4px; max-width: 420px; text-align: left; border: 1px dashed #b9a6d3; border-radius: 12px; background: #fff; padding: 12px 14px 10px; color: #1d1b2e; }
.dvcop-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
.dvcop-badge { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #4a148c; background: #ece1f7; border-radius: 999px; padding: 2px 10px; }
.dvcop-sample { font-size: 0.75rem; color: #5b5670; }
.dvcop-mock { pointer-events: none; user-select: none; }
.dvcop-next { border-left: 4px solid #e65100; background: #fff7ef; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; }
.dvcop-eyebrow { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #5b5670; }
.dvcop-next-title { font-size: 0.9rem; font-weight: 700; margin-top: 1px; }
.dvcop-next-detail { font-size: 0.8rem; color: #3d3a4d; overflow-wrap: anywhere; }
.dvcop-total { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 8px; }
.dvcop-total strong { font-size: 1.4rem; font-weight: 800; line-height: 1.1; }
.dvcop-total span { font-size: 0.82rem; color: #3d3a4d; }
.dvcop-checked { font-size: 0.76rem; color: #2e7d32; margin: 2px 0 6px; }
.dvcop-rows { list-style: none; margin: 0; padding: 0; }
.dvcop-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 7px 0; border-top: 1px solid #eee; }
.dvcop-row-body { min-width: 0; }
.dvcop-row-name { display: block; font-size: 0.86rem; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dvcop-row-detail { display: block; font-size: 0.76rem; color: #5b5670; }
.dvcop-row-pts { flex-shrink: 0; font-size: 0.84rem; font-weight: 700; }
.dvcop-caption { font-size: 0.78rem; line-height: 1.45; color: #3d3a4d; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; }
`;

  // The example, as markup. Pure (no DOM), so tests can check it.
  // caption: false drops the "doesn't connect to Disney" line, for a page
  // that already says it right next to its own call to action.
  function html({ caption = true } = {}) {
    const e = EXAMPLE;
    return `
    <figure class="dvcop" aria-label="Example owner dashboard with sample data, not your account">
      <div class="dvcop-head"><span class="dvcop-badge">Example</span><span class="dvcop-sample">Sample data, not your account</span></div>
      <div class="dvcop-mock" inert>
        <div class="dvcop-next">
          <div class="dvcop-eyebrow">Next up</div>
          <div class="dvcop-next-title">${e.next.title}</div>
          <div class="dvcop-next-detail">${e.next.detail}</div>
        </div>
        <div class="dvcop-total"><strong>${e.total.toLocaleString("en-US")}</strong><span>Recorded points left across ${e.contracts.length} contracts</span></div>
        <div class="dvcop-checked">${e.checked}</div>
        <ul class="dvcop-rows">
          ${e.contracts.map(c => `<li class="dvcop-row"><span class="dvcop-row-body"><span class="dvcop-row-name">${c.name}</span><span class="dvcop-row-detail">${c.detail}</span></span><span class="dvcop-row-pts">${c.points} pts</span></li>`).join("")}
        </ul>
      </div>
      ${caption ? `<figcaption class="dvcop-caption">You enter your contracts and the balances Disney shows you, then check them against Disney. DVC Companion doesn't connect to your Disney account.</figcaption>` : ""}
    </figure>`;
  }

  let injected = false;
  function injectStyles() {
    if (injected || typeof document === "undefined") return;
    injected = true;
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // Markup with its styles guaranteed to be on the page.
  function render(options) {
    injectStyles();
    return html(options);
  }

  const api = { html, render, EXAMPLE };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCOwnerPreview = api;
})();
