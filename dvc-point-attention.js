// Current-cycle actions shared by Home and My Contracts. Compare real dates
// across all buckets; an open banking window must not hide earlier expiry.
(function () {
  function eventsForContract(contract, rows, today) {
    const dates = window.DVCDates;
    const year = dates.currentUYYear(contract.use_year, today);
    const row = (rows[contract.id] || []).find(r => r.use_year_label === year);
    if (!row?.balance_confirmed_at) return [{kind:'unconfirmed', contract, year, buckets:'Balance not confirmed'}];
    const remaining = Math.max(0, Number(row.points_remaining) || 0);
    const banked = Math.max(0, Number(row.points_banked) || 0);
    const borrowed = Math.max(0, Number(row.points_borrowed) || 0);
    const holding = Math.max(0, Number(row.points_holding) || 0);
    const now = dates.dateOnlyUTC(today.year, today.month, today.day);
    const expiresMs = dates.useYearExpiration(contract.use_year, year);
    const open = dates.isBankingWindowOpen(contract.use_year, year, today);
    const events = [];
    if (remaining > 0 && open) {
      const ms = dates.deadlineForCycle(contract.use_year, year);
      events.push({ kind: 'bankable', contract, year, points: remaining, buckets: `${remaining} current`, deadline: { ms, daysUntil: Math.round((ms - now) / 86400000) } });
    }
    const points = banked + borrowed + holding + (open ? 0 : remaining);
    if (points > 0) {
      const buckets = [[banked,'banked'],[borrowed,'borrowed'],[holding,'holding'],[open ? 0 : remaining,'current']].filter(([n]) => n > 0).map(([n,label]) => `${n} ${label}`).join(', ');
      events.push({ kind: 'use-by', contract, year, points, holding, buckets, expiresMs, daysUntil: Math.round((expiresMs - now) / 86400000) });
    }
    return events.sort((a,b) => deadline(a) - deadline(b));
  }
  function deadline(event) { if (event.kind === 'unconfirmed') return Infinity; return event.kind === 'bankable' ? event.deadline.ms : event.expiresMs; }
  function evaluate(contract, rows, today) { return eventsForContract(contract, rows, today)[0] || { kind: 'accounted', contract }; }
  function earliest(contracts, rows, today) {
    const active = contracts.filter(c => c.is_active);
    if (!active.length) return null;
    return active.flatMap(c => eventsForContract(c, rows, today)).sort((a,b) => deadline(a)-deadline(b))[0] || { kind:'accounted' };
  }
  function label(contract, fallback) {
    return String(contract.nickname || fallback).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  }
  window.DVCPointAttention = { eventsForContract, evaluate, earliest, label };
})();
