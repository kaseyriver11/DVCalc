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

  // event: DVCPointAttention.earliest() -- null when there are no active
  // contracts. name: the contract's display label (already HTML-escaped).
  // tiers: dvc-dates.js urgencyTier/expirationTier. formatDate: ms -> text.
  // Returns { tone, title, detail, note, action } or null.
  function attentionCard(event, { name, tiers, formatDate }) {
    if (!event) return null;
    if (event.kind === "unconfirmed") {
      return { tone: "warning", title: `Add a balance for ${name}`, detail: `${event.year} use year`, note: null,
        action: { label: "Add balance", href: ledgerHref(event.contract, event.year) } };
    }
    if (event.kind === "bankable") {
      return { tone: tiers.urgency(event.deadline.daysUntil), title: `Bank ${event.points.toLocaleString()} points by ${formatDate(event.deadline.ms)}`,
        detail: name, note: null, action: { label: "Review banking", href: ledgerHref(event.contract, event.year) } };
    }
    if (event.kind === "use-by") {
      return { tone: tiers.expiration(event.daysUntil), title: `Use ${event.points.toLocaleString()} points by ${formatDate(event.expiresMs)}`,
        detail: name,
        note: event.holding ? `Includes ${event.holding.toLocaleString()} holding points, which only book stays within 60 days of check-in.` : null,
        action: { label: "Review points", href: ledgerHref(event.contract, event.year) } };
    }
    // "accounted": every active contract's current balance is recorded and
    // nothing is due. Only reachable when no balance is unknown, since an
    // unconfirmed contract is itself an event.
    return { tone: "calm", title: "Nothing needs attention", detail: "Every current balance is recorded.", note: null,
      action: { label: "View contracts", href: "account.html" } };
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
      const now = { year, total: recordedTotal(find(year)) };
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
      hidden: Math.max(0, lines.length - limit),
      count: lines.length,
    };
  }

  const api = { recordedTotal, attentionCard, portfolioSummary };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCHomeSummary = api;
})();
