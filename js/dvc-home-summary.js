// Home's two owner summaries: the single "Next up" attention card and the
// compact points portfolio. Pure -- the caller hands in DVCPointAttention's
// own earliest() event and the dvc-dates.js helpers, so no deadline math is
// re-derived here -- which keeps it runnable under node --test
// (window.DVCHomeSummary in the browser).
(function () {
  const BUCKETS = ["points_remaining", "points_banked", "points_borrowed", "points_holding"];

  // A confirmed row's recorded points left (all four buckets), or null when
  // no balance has been added. A saved zero is 0, never null; an absent row
  // is never the annual allotment.
  function recordedTotal(row) {
    if (!row?.balance_confirmed_at) return null;
    return BUCKETS.reduce((sum, key) => sum + Math.max(0, Number(row[key]) || 0), 0);
  }

  const ledgerHref = (contract, year) => `account.html?contract=${encodeURIComponent(contract.id)}&year=${year}`;
  const DAY_MS = 86400000;
  // A Disney check older than this, or none at all, is worth redoing before
  // a deadline this close.
  const CHECK_WINDOW_DAYS = 30;

  // "Check balance with Disney" beside a deadline: only when the deadline
  // is within 30 days and that balance was never checked against Disney or
  // was last checked more than 30 days ago. todayMs: today (UTC midnight).
  // Returns { label, href, note } or null. The href opens that contract and
  // use year on My Contracts with its Reconcile control brought forward.
  function disneyCheck(event, { todayMs, formatDate }) {
    if (!event || !["bankable", "use-by", "holding"].includes(event.kind) || todayMs == null) return null;
    const days = event.kind === "bankable" ? event.deadline.daysUntil : event.daysUntil;
    if (!(days >= 0 && days <= CHECK_WINDOW_DAYS)) return null;
    const checkedAt = event.freshness?.checkedAt || null;
    const checkedMs = checkedAt ? Date.parse(checkedAt) : NaN;
    if (Number.isFinite(checkedMs) && todayMs - checkedMs <= CHECK_WINDOW_DAYS * DAY_MS) return null;
    return {
      label: "Check balance with Disney",
      href: `${ledgerHref(event.contract, event.year)}&check=disney`,
      note: Number.isFinite(checkedMs) ? `Last checked against Disney ${formatDate(checkedMs)}` : "Not checked against Disney yet",
    };
  }

  // event: DVCPointAttention.earliest() -- null when there are no active
  // contracts. name: the contract's display label (already HTML-escaped).
  // tiers: dvc-dates.js urgencyTier/expirationTier. formatDate: ms -> text.
  // describe: DVCPointAttention.describe, so Home and My Contracts word an
  // action identically. total: how many point actions exist in all.
  // Returns { tone, title, detail, note, action, more } or null. Home shows
  // only this one item; `more` links to the full list on My Contracts.
  // todayMs (optional): enables the secondary Disney-check link.
  function attentionCard(event, { name, tiers, formatDate, describe, total = 1, todayMs = null }) {
    if (!event) return null;
    if (event.kind === "accounted") {
      // Every active contract's current balance is recorded and nothing is
      // due. Only reachable when no balance is unknown, since an
      // unconfirmed contract is itself an event.
      return { tone: "calm", title: "Nothing needs attention", detail: "Every current balance is recorded.", note: null,
        action: { label: "View contracts", href: "account.html" }, more: null, check: null };
    }
    const copy = describe(event, formatDate);
    const tone = event.kind === "unconfirmed" ? "warning"
      : event.kind === "bankable" ? tiers.urgency(event.deadline.daysUntil)
      : tiers.expiration(event.daysUntil);
    // Points that can only be used now open "Use these points" (Prompt 4).
    const usable = event.kind === "use-by" || event.kind === "holding";
    const label = { unconfirmed: "Check balance", bankable: "Review banking" }[event.kind] || "Use these points";
    return { tone, title: copy.title, detail: `${name} &middot; ${event.year} use year`,
      note: event.kind === "holding" ? "Book no more than 60 days before check-in." : null,
      action: { label, href: usable ? `use-points.html?contract=${encodeURIComponent(event.contract.id)}&year=${event.year}` : ledgerHref(event.contract, event.year) },
      more: { label: total > 1 ? `View all ${total} point actions` : "View all point actions", href: "account.html#point-actions" },
      check: disneyCheck(event, { todayMs, formatDate }) };
  }

  // active: active contracts. rowsByContract: { contractId: ledger rows }.
  // currentYear(contract) -> that contract's current use-year label.
  // name(contract) -> display label. Returns the headline and up to `limit`
  // contract rows; every contract still counts toward the headline and the
  // missing-balance count, not just the ones previewed.
  function portfolioSummary(active, rowsByContract, { currentYear, name, limit = 3 }) {
    const lines = active.map(contract => {
      const year = currentYear(contract);
      const find = y => (rowsByContract[contract.id] || []).find(r => Number(r.use_year_label) === y);
      const nowRow = find(year);
      const now = { year, total: recordedTotal(nowRow), checkedAt: nowRow?.last_checked_against_disney_at || null };
      const next = { year: year + 1, total: recordedTotal(find(year + 1)) };
      // One tap target per contract: whichever year needs a balance first.
      const target = now.total == null ? now.year : next.total == null ? next.year : now.year;
      return { contract, name: name(contract), now, next, href: ledgerHref(contract, target) };
    });
    const known = lines.filter(l => l.now.total != null);
    return {
      total: known.reduce((sum, l) => sum + l.now.total, 0),
      missing: lines.length - known.length,
      allMissing: lines.length > 0 && known.length === 0,
      rows: lines.slice(0, limit),
      lines,
      hidden: Math.max(0, lines.length - limit),
      count: lines.length,
    };
  }

  // How recently the balances behind "Recorded points left" were checked
  // against Disney. Only counted balances (confirmed current use years)
  // matter; a missing balance isn't counted, so it says nothing here.
  // Never calls the total verified while any counted balance is unchecked.
  // summary: portfolioSummary()'s result. Returns { tone, text } or null.
  function freshnessLine(summary, { todayMs, formatDate }) {
    const counted = summary.lines.filter(l => l.now.total != null);
    if (!counted.length) return null;
    const unchecked = counted.filter(l => !Number.isFinite(Date.parse(l.now.checkedAt))).length;
    if (unchecked) {
      return { tone: "unchecked", text: unchecked === 1 ? "1 balance hasn't been checked against Disney" : `${unchecked} balances haven't been checked against Disney` };
    }
    const oldest = Math.min(...counted.map(l => Date.parse(l.now.checkedAt)));
    const stale = todayMs - oldest > CHECK_WINDOW_DAYS * DAY_MS;
    const date = formatDate(oldest);
    return { tone: stale ? "stale" : "checked", text: counted.length === 1 ? `Checked against Disney ${date}` : `Checked against Disney &middot; oldest check ${date}` };
  }

  const api = { recordedTotal, attentionCard, portfolioSummary, freshnessLine, disneyCheck };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCHomeSummary = api;
})();
