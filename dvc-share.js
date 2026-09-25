// Share links (window.DVCShare): a calendar stay, a saved itinerary, or a
// Suggest a Stay search as a URL that reopens the same selection for
// anyone -- no account, and nothing private in it (resort, room, dates and
// search filters only; never a contract, balance or itinerary id).
//
// Stays travel as repeated s= params, one per segment in order:
//   index.html?s=riviera~deluxeStudio~2026-10-01~2026-10-04&s=...
// DVCCompareHandoff.applyShared() validates them against the charts. The
// encoders/decoders are pure (node --test); share() is the browser part:
// the phone's share sheet when there is one, otherwise copy the link.
(function () {
  const STAY_SEP = "~";

  function stayParams(stays) {
    const params = new URLSearchParams();
    for (const s of stays) params.append("s", [s.resortId, s.roomTypeId, s.checkIn, s.checkOut].join(STAY_SEP));
    return params;
  }
  // null when there are no s= params; otherwise every one must parse.
  function readStays(params) {
    const raw = params.getAll("s");
    if (!raw.length) return null;
    return raw.map(v => {
      const [resortId, roomTypeId, checkIn, checkOut] = String(v).split(STAY_SEP);
      return { resortId, roomTypeId, checkIn, checkOut };
    });
  }

  // Suggest a Stay. Scope ("resorts I can book") is left out on purpose:
  // it means the sender's contracts, which the recipient doesn't have.
  const SUGGEST_KEYS = { points: "points", year: "year", minNights: "min", maxNights: "max", partySize: "party" };
  function suggestParams(wizardData, sort) {
    const params = new URLSearchParams();
    for (const [key, name] of Object.entries(SUGGEST_KEYS)) {
      if (wizardData[key]) params.set(name, String(wizardData[key]));
    }
    if (!wizardData.maxNights) params.set("max", "any"); // no upper limit
    if (wizardData.months && wizardData.months.length) params.set("months", wizardData.months.join(","));
    if (wizardData.category && wizardData.category !== "any") params.set("room", wizardData.category);
    if (sort && sort.key) params.set("sort", `${sort.key}${sort.dir === "desc" ? "-desc" : ""}`);
    return params;
  }
  // null unless there's at least a points budget. Only what the link
  // carries is returned, so the page's defaults fill the rest; the page
  // still checks year, room and sort against its own options.
  function readSuggest(params) {
    const points = Number(params.get("points"));
    if (!Number.isInteger(points) || points <= 0 || points > 100000) return null;
    const int = name => { const n = Number(params.get(name)); return Number.isInteger(n) && n > 0 && n <= 1000 ? n : null; };
    const wizardData = { points };
    const year = Number(params.get("year"));
    if (Number.isInteger(year) && year >= 2000 && year <= 2100) wizardData.year = year;
    if (params.has("months")) {
      const months = params.get("months").split(",").filter(Boolean).map(Number).filter(m => Number.isInteger(m) && m >= 0 && m <= 11);
      wizardData.months = [...new Set(months)].sort((a, b) => a - b);
    }
    if (params.has("room")) wizardData.category = params.get("room");
    if (int("party")) wizardData.partySize = int("party");
    if (int("min")) wizardData.minNights = int("min");
    if (params.get("max") === "any") wizardData.maxNights = null;
    else if (int("max")) wizardData.maxNights = int("max");
    if (wizardData.minNights && wizardData.maxNights && wizardData.maxNights < wizardData.minNights) delete wizardData.maxNights;
    const sortRaw = params.get("sort") || "";
    return {
      wizardData,
      sort: sortRaw ? { key: sortRaw.replace(/-desc$/, ""), dir: sortRaw.endsWith("-desc") ? "desc" : "asc" } : null,
    };
  }

  // A relative page + params -> the absolute link to send.
  function link(page, params, base) {
    const q = params.toString();
    return new URL(page + (q ? "?" + q : ""), base).href;
  }

  // ---- Browser: share sheet or copy ----
  function toast(message) {
    if (typeof document === "undefined") return;
    let el = document.getElementById("dvc-share-toast");
    if (!el) {
      const style = document.createElement("style");
      style.textContent = "#dvc-share-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);max-width:calc(100vw - 32px);padding:10px 16px;border-radius:10px;background:#2b1d4a;color:#fff;font:600 .88rem/1.3 system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:10000;opacity:0;transition:opacity .2s;pointer-events:none;text-align:center}#dvc-share-toast.show{opacity:1}";
      document.head.appendChild(style);
      el = document.createElement("div");
      el.id = "dvc-share-toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 2500);
  }

  async function share({ title, text, url }) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return "shared";
      } catch (e) {
        if (e && e.name === "AbortError") return "canceled";
        // Otherwise fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
      return "copied";
    } catch (_) {
      // Last resort: let them copy it by hand.
      window.prompt("Copy this link:", url);
      return "shown";
    }
  }

  // The share icon used on every Share button (currentColor).
  const ICON = '<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';

  const api = { stayParams, readStays, suggestParams, readSuggest, link, share, toast, ICON };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCShare = api;
})();
