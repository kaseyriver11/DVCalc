// "Use these points" (Prompt 4): start from one contract's recorded balance
// for one use year and find practical ways to use it. Pure -- the page
// supplies charts, access, prices, availability and the funding allocator --
// so it runs in the browser (window.DVCUsePoints) and under node --test.
//
// Reuses rather than re-derives: stay search is dvc-leftover-points.js's
// findStays() (per-night chart prices, per-resort booking-window caps,
// Field Guide odds), multi-contract funding is dvc-plan-funding.js's
// allocate(), and booking windows come from dvc-dates.js. Nothing here
// books, holds or deducts points; results are possibilities to check with
// Disney.
(function () {
  const DAY = 86400000;
  const iso = ms => new Date(ms).toISOString().slice(0, 10);
  const parse = s => Date.parse(s + "T00:00:00Z");
  const n = v => Math.max(0, Number(v) || 0);
  const HOLDING_DAYS = 60;
  const NON_WDW = new Set(["aulani", "hiltonHead", "veroBeach", "disneylandHotel", "grandCalifornian"]);

  const SIZES = [["studio", "Studio"], ["1br", "1 Bedroom"], ["2br", "2 Bedroom"], ["3br", "3 Bedroom+"]];
  function roomSize(name) {
    const s = String(name).toLowerCase();
    if (/three-bedroom|grand villa/.test(s)) return "3br";
    if (/two-bedroom/.test(s)) return "2br";
    if (/one-bedroom|cabin/.test(s)) return "1br";
    return "studio";
  }

  // One contract/use-year balance as the flow's budget. state: "unknown"
  // (no balance recorded -- never the annual allotment), "zero" (a saved
  // zero), or "ok". flexible = current + banked + borrowed; Holding is kept
  // apart because it only books stays checking in within 60 days.
  function budget({ contract, row, year, today, dates }) {
    const startMs = dates.dateOnlyUTC(year, dates.USE_YEAR_START_MONTH[contract.use_year], 1);
    const endMs = dates.useYearExpiration(contract.use_year, year);
    const todayMs = dates.dateOnlyUTC(today.year, today.month, today.day);
    const base = { contract, year, startMs, endMs, expired: endMs < todayMs, daysLeft: Math.round((endMs - todayMs) / DAY) };
    if (!row?.balance_confirmed_at) return { ...base, state: "unknown" };
    const buckets = { current: n(row.points_remaining), banked: n(row.points_banked), borrowed: n(row.points_borrowed), holding: n(row.points_holding) };
    const flexible = buckets.current + buckets.banked + buckets.borrowed;
    const deadlineMs = dates.deadlineForCycle(contract.use_year, year);
    return { ...base, state: flexible + buckets.holding > 0 ? "ok" : "zero", buckets, flexible, holding: buckets.holding, total: flexible + buckets.holding,
      bankingOpen: todayMs <= deadlineMs && todayMs >= startMs, bankingDeadlineMs: deadlineMs,
      freshness: { checkedAt: row.last_checked_against_disney_at || null, recordedAt: row.updated_at || row.balance_confirmed_at } };
  }

  // Months ("YYYY-MM") a stay could start in: tomorrow (or the use year's
  // first day) through the use year's last day.
  function months(b, today, dates) {
    const from = Math.max(b.startMs, dates.dateOnlyUTC(today.year, today.month, today.day) + DAY);
    const out = [];
    for (let d = new Date(from); d.getTime() <= b.endMs; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))) out.push(iso(d.getTime()).slice(0, 7));
    return out;
  }

  // Resorts and rooms this contract can book right now, narrowed by the
  // owner's answers. access: getUserResortAccess([contract]) result.
  // caps: { 11: "YYYY-MM-DD", 7: "YYYY-MM-DD" } -- the latest check-in each
  // window allows today. charts: [{ id, name, roomTypes:[{id,name,sleeps}] }].
  function eligibleResorts({ charts, access, caps, partySize = 0, size = null, resortId = null, wdwOnly = false }) {
    return charts.map(chart => {
      const win = access.homeResortIds.has(chart.id) ? 11 : access.sevenMoResortIds.has(chart.id) ? 7 : null;
      if (!win || (resortId && chart.id !== resortId) || (wdwOnly && NON_WDW.has(chart.id))) return null;
      const roomTypeIds = chart.roomTypes.filter(rt => rt.sleeps >= partySize && (!size || roomSize(rt.name) === size)).map(rt => rt.id);
      return roomTypeIds.length ? { resortId: chart.id, maxCheckIn: caps[win], roomTypeIds, window: win } : null;
    }).filter(Boolean);
  }

  // Outlook wording from Field Guide history at the booking window nearest
  // the check-in's lead time. Never an availability claim.
  function outlook(availability, nights) {
    if (availability == null) return "unknown";
    const ratio = availability / nights;
    return ratio >= 1 ? "excellent" : ratio >= 0.75 ? "good" : "limited";
  }
  const OUTLOOK_RANK = { excellent: 3, good: 2, limited: 1, unknown: 0 };

  // Ranked stay ideas for a budget. findStays: DVCLeftoverPoints.findStays.
  // month: optional "YYYY-MM" for check-in. worstAvailability(stay) -> the
  // stay's lowest per-night Field Guide score, for stays found without the
  // odds filter. Holding points only join searches whose check-ins fall
  // within 60 days. One idea per resort; WDW first, then outlook, then how
  // much of the balance it uses, then sooner.
  function suggest({ b, today, dates, resorts, pointsFor, availabilityFor, worstAvailability, findStays, month = null, limit = 5 }) {
    if (b.state !== "ok" || b.expired) return [];
    const todayMs = dates.dateOnlyUTC(today.year, today.month, today.day);
    let from = Math.max(b.startMs, todayMs + DAY), last = b.endMs, monthEnd = null;
    if (month) {
      const [y, m] = month.split("-").map(Number);
      from = Math.max(from, Date.UTC(y, m - 1, 1));
      monthEnd = iso(Date.UTC(y, m, 0));
    }
    if (from > last) return [];
    const holdingCap = iso(todayMs + HOLDING_DAYS * DAY);
    const capped = (cap) => resorts.map(r => ({ ...r, maxCheckIn: [r.maxCheckIn, cap, monthEnd].filter(Boolean).sort()[0] }));
    const searches = [{ points: b.flexible, resorts: capped(null) }];
    if (b.holding > 0) searches.push({ points: b.flexible + b.holding, resorts: capped(holdingCap), usesHolding: true });
    const found = new Map();
    for (const s of searches) {
      if (!(s.points > 0)) continue;
      const args = { points: s.points, fromDate: iso(from), lastNightDate: iso(last), resorts: s.resorts, pointsFor, limit: Infinity };
      const likely = findStays({ ...args, availabilityFor });
      const any = likely.length >= limit ? [] : findStays(args);
      for (const stay of [...likely, ...any]) {
        const availability = stay.availability ?? worstAvailability(stay);
        const idea = { ...stay, availability, outlook: outlook(availability, stay.nights), usesHolding: !!s.usesHolding && stay.pointsUsed > b.flexible };
        const prev = found.get(stay.resortId);
        if (!prev || compare(idea, prev) < 0) found.set(stay.resortId, idea);
      }
    }
    return [...found.values()].sort(compare).slice(0, limit);
  }
  function compare(a, b) {
    return (NON_WDW.has(a.resortId) - NON_WDW.has(b.resortId))
      || (OUTLOOK_RANK[b.outlook] - OUTLOOK_RANK[a.outlook])
      || (b.pointsUsed - a.pointsUsed)
      || a.checkIn.localeCompare(b.checkIn);
  }

  // Per-night chart prices for a stay, or null when any night has no chart.
  function nightly({ resortId, roomTypeId, checkIn, nights, pointsFor }) {
    const out = [];
    for (let i = 0; i < nights; i++) {
      const date = iso(parse(checkIn) + i * DAY);
      const points = pointsFor(resortId, roomTypeId, date);
      if (!(points > 0)) return null;
      out.push({ date, points });
    }
    return out;
  }

  // How a stay would be paid for from recorded balances, this contract's
  // first. primary: { contract, year, b }. others: [{ contract, rowFor(date)
  // -> { year, row } }] -- may include the primary contract itself, for
  // nights past its use-year end. accessFor(contract) -> getUserResortAccess result.
  // opensOn(checkIn, months) -> "YYYY-MM-DD". Booking windows follow DVC:
  // at 11 months only contracts whose home resort this is can book; other
  // eligible contracts join at 7 months. A contract with no recorded balance
  // for the needed use year is listed, never counted. Returns
  // { total, primary, others, shortfall, unknown, blocked, outsideYear }.
  function fund({ nights, resortId, checkIn, primary, others = [], accessFor, opensOn, todayStr, allocate, dates }) {
    const total = nights.reduce((s, x) => s + x.points, 0);
    const holdingOk = parse(checkIn) - parse(todayStr) <= HOLDING_DAYS * DAY;
    const windowFor = contract => { const a = accessFor(contract); return a.homeResortIds.has(resortId) ? 11 : a.sevenMoResortIds.has(resortId) ? 7 : null; };
    const yearOf = (contract, date) => dates.currentUYYear(contract.use_year, { year: +date.slice(0, 4), month: +date.slice(5, 7), day: +date.slice(8, 10) });
    const demands = nights.map(x => ({ ...x }));
    const pWindow = windowFor(primary.contract);
    const pb = primary.b;
    const pSupply = { points: pWindow && pb.state !== "unknown" ? pb.flexible + (holdingOk ? pb.holding : 0) : 0 };
    const outsideYear = nights.filter(x => yearOf(primary.contract, x.date) !== primary.year).length;
    const first = allocate(demands, [pSupply], (s, d) => yearOf(primary.contract, d.date) === primary.year);
    const primaryOpens = pWindow ? opensOn(checkIn, pWindow) : null;
    const result = { total, outsideYear, holdingExcluded: !holdingOk && pb.holding > 0,
      primary: { points: first.funded, window: pWindow, opens: primaryOpens, openNow: !!primaryOpens && primaryOpens <= todayStr },
      others: [], unknown: [], blocked: [], shortfall: first.shortfall };
    if (!first.shortfall) return result;
    const residual = first.unmet.map(u => ({ ...demands[u.demand], points: u.points }));
    const supplies = [];
    for (const o of others) {
      const w = windowFor(o.contract);
      if (!w) { if (o.contract.id !== primary.contract.id) result.blocked.push(o.contract); continue; }
      const years = new Map();
      for (const d of residual) {
        const { year, row } = o.rowFor(d.date);
        // The primary contract may appear here for its OTHER use years (a
        // stay crossing its use-year end); its own year was already used.
        if (years.has(year) || (o.contract.id === primary.contract.id && year === primary.year)) continue;
        years.set(year, true);
        if (!row?.balance_confirmed_at) { result.unknown.push({ contract: o.contract, year }); continue; }
        supplies.push({ contract: o.contract, year, window: w, opens: opensOn(checkIn, w), points: n(row.points_remaining) + n(row.points_banked) + n(row.points_borrowed) + (holdingOk ? n(row.points_holding) : 0) });
      }
    }
    const second = allocate(residual, supplies, (s, d) => yearOf(s.contract, d.date) === s.year);
    const by = new Map();
    for (const a of second.allocations) {
      const s = supplies[a.supply];
      const key = s.contract.id + ":" + s.year;
      if (!by.has(key)) by.set(key, { contract: s.contract, year: s.year, window: s.window, opens: s.opens, openNow: s.opens <= todayStr, points: 0 });
      by.get(key).points += a.points;
    }
    result.others = [...by.values()];
    result.shortfall = second.shortfall;
    return result;
  }

  const api = { SIZES, HOLDING_DAYS, roomSize, budget, months, eligibleResorts, outlook, suggest, nightly, fund };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCUsePoints = api;
})();
