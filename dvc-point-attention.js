// Current-cycle point actions shared by Home and My Contracts (and mirrored
// by the reminder sender, supabase/functions/_shared/point-reminders.js --
// tests/point-attention.test.js checks the two agree). Compare real dates
// across all buckets; an open banking window must not hide earlier expiry.
//
// One event per at-risk bucket group, and each recorded point is counted in
// exactly one event:
//   unconfirmed  no balance recorded for the cycle -- never assume points
//   bankable     CURRENT points while banking is open (bank or use by the
//                banking deadline; they stay usable after it)
//   use-by       points that can only be used now: banked + borrowed, plus
//                current once the banking deadline has passed -- never a
//                banking suggestion
//   holding      Holding points: use by the use-year end, booking no more
//                than 60 days before check-in (an advance-booking limit, not
//                a clock from when they entered Holding); never bankable
(function () {
  const n = v => Math.max(0, Number(v) || 0);

  // How fresh the recorded numbers are (Prompt 2): last Disney check, else
  // when the balance was last recorded here.
  function freshness(row) {
    return { checkedAt: row.last_checked_against_disney_at || null, recordedAt: row.updated_at || row.balance_confirmed_at || null };
  }

  function eventsForContract(contract, rows, today) {
    const dates = window.DVCDates;
    const year = dates.currentUYYear(contract.use_year, today);
    const row = (rows[contract.id] || []).find(r => Number(r.use_year_label) === year);
    const now = dates.dateOnlyUTC(today.year, today.month, today.day);
    const expiresMs = dates.useYearExpiration(contract.use_year, year);
    const daysUntil = Math.round((expiresMs - now) / 86400000);
    if (!row?.balance_confirmed_at) return [{ kind: 'unconfirmed', contract, year, expiresMs, daysUntil, buckets: 'Balance not confirmed' }];
    const remaining = n(row.points_remaining), banked = n(row.points_banked), borrowed = n(row.points_borrowed), holding = n(row.points_holding);
    const open = dates.isBankingWindowOpen(contract.use_year, year, today);
    const base = { contract, year, expiresMs, daysUntil, freshness: freshness(row) };
    const events = [];
    if (remaining > 0 && open) {
      const ms = dates.deadlineForCycle(contract.use_year, year);
      events.push({ ...base, kind: 'bankable', points: remaining, parts: { current: remaining }, buckets: `${remaining} current`, deadline: { ms, daysUntil: Math.round((ms - now) / 86400000) } });
    }
    const parts = { current: open ? 0 : remaining, banked, borrowed };
    const points = parts.current + banked + borrowed;
    if (points > 0) {
      const buckets = [[parts.current, 'current'], [banked, 'banked'], [borrowed, 'borrowed']].filter(([v]) => v > 0).map(([v, label]) => `${v} ${label}`).join(', ');
      events.push({ ...base, kind: 'use-by', points, parts, buckets, bankingClosed: !open });
    }
    if (holding > 0) events.push({ ...base, kind: 'holding', points: holding, parts: { holding }, buckets: `${holding} holding` });
    return events.sort((a, b) => deadline(a) - deadline(b));
  }
  // Unknown balances sort after every known date; among same-day events,
  // banking (a choice that closes) before use-by before Holding.
  const ORDER = { bankable: 0, 'use-by': 1, holding: 2 };
  function deadline(event) { if (event.kind === 'unconfirmed') return Infinity; return (event.kind === 'bankable' ? event.deadline.ms : event.expiresMs) + (ORDER[event.kind] || 0); }
  function evaluate(contract, rows, today) { return eventsForContract(contract, rows, today)[0] || { kind: 'accounted', contract }; }
  function earliest(contracts, rows, today) {
    const active = contracts.filter(c => c.is_active);
    if (!active.length) return null;
    return timeline(active, rows, today)[0] || { kind: 'accounted' };
  }
  // Every current-cycle event across all active contracts, soonest first.
  function timeline(contracts, rows, today) {
    return contracts.filter(c => c.is_active).flatMap(c => eventsForContract(c, rows, today)).sort((a, b) => deadline(a) - deadline(b));
  }
  // My Contracts' action center: events grouped by contract, contracts in
  // order of their most urgent event; contracts with nothing to do last,
  // listed so the owner can see they were checked.
  function groups(contracts, rows, today) {
    const list = contracts.filter(c => c.is_active).map(contract => ({ contract, events: eventsForContract(contract, rows, today) }));
    const rank = g => !g.events.length ? [2, 0] : g.events[0].kind === 'unconfirmed' ? [1, 0] : [0, deadline(g.events[0])];
    return list.sort((a, b) => { const x = rank(a), y = rank(b); return x[0] - y[0] || x[1] - y[1]; });
  }
  // Points usable right now on one contract (its current cycle's confirmed
  // total), or null when that balance hasn't been confirmed.
  function availableNow(contract, rows, today) {
    const year = window.DVCDates.currentUYYear(contract.use_year, today);
    const row = (rows[contract.id] || []).find(r => Number(r.use_year_label) === year);
    if (!row?.balance_confirmed_at) return null;
    return ['points_remaining', 'points_banked', 'points_borrowed', 'points_holding'].reduce((sum, k) => sum + n(row[k]), 0);
  }
  function label(contract, fallback) {
    return String(contract.nickname || fallback).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  // Owner-facing copy for one event, shared by Home and My Contracts.
  // formatDate: ms -> text. Returns { title, why, date: {ms, daysUntil} }.
  // Nothing here says the app banks, books or transfers points.
  function describe(event, formatDate) {
    const pts = v => v.toLocaleString();
    const end = formatDate(event.expiresMs);
    if (event.kind === 'unconfirmed') {
      return { title: 'Check your Disney balance', date: null,
        why: `No balance is recorded for the ${event.year} use year, so DVC Companion can't tell whether any points need action. Annual points aren't a balance.` };
    }
    if (event.kind === 'bankable') {
      return { title: `Bank or use ${pts(event.points)} current points by ${formatDate(event.deadline.ms)}`, date: event.deadline,
        why: `Current points can be banked into ${event.year + 1} with Disney until ${formatDate(event.deadline.ms)}. If you don't bank them, they stay usable until ${end}.` };
    }
    if (event.kind === 'use-by') {
      const reasons = [];
      if (event.parts.current) reasons.push(`the ${formatDate(window.DVCDates.deadlineForCycle(event.contract.use_year, event.year))} banking deadline has passed`);
      if (event.parts.banked || event.parts.borrowed) reasons.push(`${[event.parts.banked && 'banked', event.parts.borrowed && 'borrowed'].filter(Boolean).join(' and ')} points can't be banked again`);
      return { title: `Use ${pts(event.points)} points before ${end}`, date: { ms: event.expiresMs, daysUntil: event.daysUntil },
        why: `${event.buckets}. ${reasons.join('; ').replace(/^./, c => c.toUpperCase())}, so these can only be used for a stay. Points left when the use year ends expire.` };
    }
    return { title: `Use ${pts(event.points)} Holding points by ${end}`, date: { ms: event.expiresMs, daysUntil: event.daysUntil },
      why: `Holding points can't be banked and expire when this use year ends. Book no more than 60 days before check-in.` };
  }

  window.DVCPointAttention = { eventsForContract, evaluate, earliest, timeline, groups, availableNow, label, describe };
})();
