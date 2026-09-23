// Owner-led "Reconcile points" (Prompt 2): comparing a use year's recorded
// buckets with the amounts the owner reads on Disney's member site, and the
// per-use-year activity timeline. Pure -- window.DVCReconcile in the
// browser, require()-able for node --test.
(function () {
  const BUCKETS = [
    ["points_remaining", "Current"],
    ["points_banked", "Banked"],
    ["points_borrowed", "Borrowed"],
    ["points_holding", "Holding"],
  ];
  const REASONS = [
    ["booking", "Booking"],
    ["banking", "Banking"],
    ["borrowing", "Borrowing"],
    ["transfer", "Transfer"],
    ["cancellation", "Cancellation"],
    ["other", "Other"],
  ];

  // A row's recorded buckets, or null when no balance has been entered --
  // an unknown balance is never an allotment and never zero.
  function recordedBuckets(row) {
    if (!row?.balance_confirmed_at) return null;
    return Object.fromEntries(BUCKETS.map(([k]) => [k, Math.max(0, Number(row[k]) || 0)]));
  }

  // Raw input strings -> whole nonnegative numbers. Empty is an error, not 0.
  function parseEntry(values) {
    const out = {};
    for (const [k, label] of BUCKETS) {
      const raw = String(values[k] ?? "").trim();
      if (raw === "") return { error: `Enter the ${label.toLowerCase()} points you see in Disney (0 if none).` };
      const n = Number(raw);
      if (!Number.isSafeInteger(n) || n < 0) return { error: `${label} points must be a whole number, zero or more.` };
      out[k] = n;
    }
    return { values: out };
  }

  const total = b => b ? BUCKETS.reduce((s, [k]) => s + b[k], 0) : null;

  // Per-bucket and total difference between what's recorded and what Disney
  // shows. matched only when a balance was recorded and every bucket agrees.
  function difference(recorded, entered) {
    const rows = BUCKETS.map(([k, label]) => {
      const before = recorded ? recorded[k] : null;
      return { bucket: k, label, before, after: entered[k], delta: before == null ? null : entered[k] - before };
    });
    const matched = !!recorded && rows.every(r => r.delta === 0);
    return { rows, totalBefore: total(recorded), totalAfter: total(entered), totalDelta: recorded ? total(entered) - total(recorded) : null, matched, unknownBefore: !recorded };
  }

  // What Save needs: a reason unless the numbers match.
  function saveProblem(diff, reason) {
    if (!diff.matched && !REASONS.some(([k]) => k === reason)) return "Choose why the balance changed.";
    return null;
  }

  // One use year's activity, newest first, from records the app already
  // keeps. source "app" = an operation recorded through DVC Companion
  // (point moves, booking deductions); "owner" = an owner-entered check or
  // correction. Nothing here is fabricated for older edits: plain "Adjust
  // balance" saves and pre-receipt bookings were never logged, which the
  // UI states.
  //   movements: point_movements rows {kind, from_year, to_year, points, created_at}
  //   deductions: trip_deductions rows (including reversed) for this contract
  //   reconciliations: point_reconciliations rows for this contract
  function activity({ year, movements = [], deductions = [], reconciliations = [] }) {
    const events = [];
    for (const m of movements) {
      if (m.kind === "bank" && m.from_year === year) events.push({ at: m.created_at, source: "app", text: `Banked ${m.points} current points into ${m.to_year}`, delta: -m.points });
      if (m.kind === "bank" && m.to_year === year) events.push({ at: m.created_at, source: "app", text: `${m.points} points banked in from ${m.from_year}`, delta: m.points });
      if (m.kind === "borrow" && m.to_year === year) events.push({ at: m.created_at, source: "app", text: `Borrowed ${m.points} points from ${m.from_year}`, delta: m.points });
      if (m.kind === "borrow" && m.from_year === year) events.push({ at: m.created_at, source: "app", text: `${m.points} current points borrowed into ${m.to_year}`, delta: -m.points });
    }
    for (const d of deductions) {
      if (d.use_year_label !== year) continue;
      const pts = (d.points_holding || 0) + (d.points_banked || 0) + (d.points_borrowed || 0) + (d.points_remaining || 0);
      events.push({ at: d.created_at, source: "app", text: `A booking took ${pts} points`, delta: -pts });
      if (d.reversed_at) events.push({ at: d.reversed_at, source: "app", text: `${pts} points from a booking were put back or reassigned`, delta: null });
    }
    for (const r of reconciliations) {
      if (r.use_year_label !== year) continue;
      const after = total(r.after);
      const before = total(r.before);
      const why = REASONS.find(([k]) => k === r.reason)?.[1];
      events.push(r.matched
        ? { at: r.created_at, source: "owner", text: "Checked against Disney: matched", delta: 0 }
        : { at: r.created_at, source: "owner", notes: r.notes || null, delta: before == null ? null : after - before,
            text: (before == null ? `Balance set from Disney: ${after} points`
              : before === after ? `Corrected the bucket split to match Disney (${after} points)`
              : `Corrected to match Disney: ${before} → ${after} points`) + (why ? ` (${why})` : "") });
    }
    return events.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  }

  const api = { BUCKETS, REASONS, recordedBuckets, parseEntry, difference, saveProblem, activity, total };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCReconcile = api;
})();
