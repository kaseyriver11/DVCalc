// "Download my data" (My Contracts): turns the owner's own rows into a
// spreadsheet (sheets(), the main download) or one JSON file (the full
// technical copy). Pure -- auth.js readOwnerExport() does the reads (as the
// signed-in user, under row-level security) and hands the results in, so
// this runs under node --test (window.DVCDataExport in the browser).
//
// All or nothing: if a required read failed, build() returns an error and
// no file is made -- a partial export would look like missing records.
// Tables added by later migrations are optional: a database that doesn't
// have one yet exports that collection as null with status "unavailable",
// never as an empty list.
(function () {
  const SCHEMA_VERSION = 1;

  // collection name in the file -> table read by auth.js. Order is the
  // file's order.
  const COLLECTIONS = [
    { key: "contracts", table: "contracts", required: true },
    { key: "useYearBalances", table: "contract_year_points", required: true },
    { key: "pointMovements", table: "point_movements", required: false, about: "Banking and borrowing you recorded" },
    { key: "reconciliations", table: "point_reconciliations", required: false, about: "Checks of your balances against Disney" },
    { key: "bookingDeductions", table: "trip_deductions", required: false, about: "Points each recorded booking took from your balances" },
    { key: "bookings", table: "trips", required: true },
    { key: "bookingCancellations", table: "booking_cancellations", required: false, about: "Bookings you recorded as canceled with Disney" },
    { key: "itineraries", table: "itineraries", required: true },
  ];

  // Profile columns safe to include: preferences only. Never the reminder
  // unsubscribe token, push subscription, or anything billing-related.
  const SAFE_PROFILE_FIELDS = [
    "display_name",
    "reminder_opt_in", "reminder_lead_days",
    "expiration_reminder_opt_in", "expiration_reminder_lead_days",
    "holding_reminder_opt_in", "holding_reminder_lead_days",
    "in_app_notifications_enabled",
    "point_value_baseline", "dues_growth_rate", "value_growth_rate", "opportunity_cost_rate",
  ];

  // Defense in depth for the row data: no key that looks like a credential
  // survives, at any depth (jsonb columns included).
  const SECRET_KEY = /token|secret|password|push_subscription|stripe|api_key/i;
  function scrub(value) {
    if (Array.isArray(value)) return value.map(scrub);
    if (value && typeof value === "object") {
      const out = {};
      for (const [k, v] of Object.entries(value)) {
        if (SECRET_KEY.test(k)) continue;
        out[k] = scrub(v);
      }
      return out;
    }
    return value;
  }
  // user_id is the same on every row and adds nothing to the owner's copy.
  const cleanRow = row => { const { user_id, ...rest } = scrub(row) || {}; return rest; };

  function profilePreferences(profile) {
    if (!profile) return null;
    const out = {};
    for (const k of SAFE_PROFILE_FIELDS) if (k in profile) out[k] = profile[k];
    return out;
  }

  // reads: { [table]: { rows, missing, error } } plus reads.profile:
  // { row, error }. now: a Date. Returns { data } or { error, failed }.
  function build(reads, now) {
    const failed = [];
    if (!reads.profile || reads.profile.error) failed.push("profiles");
    for (const c of COLLECTIONS) {
      const r = reads[c.table];
      if (!r || r.error || (r.missing && c.required)) failed.push(c.table);
    }
    if (failed.length) {
      return { error: "Couldn't read all of your records, so no file was made. Nothing has changed. Try again.", failed };
    }
    const data = {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: now.toISOString(),
      app: "DVC Companion",
      notice: "Your personal contract and stay details as you recorded them in DVC Companion. Disney's records are the authority for your actual balances and reservations.",
      profilePreferences: profilePreferences(reads.profile.row),
    };
    const collections = {};
    for (const c of COLLECTIONS) {
      const r = reads[c.table];
      if (r.missing) {
        data[c.key] = null;
        collections[c.key] = { status: "unavailable", note: "Not set up on this DVC Companion database yet, so there's nothing to export." };
      } else {
        data[c.key] = (r.rows || []).map(cleanRow);
        collections[c.key] = { status: "included", count: data[c.key].length };
      }
      if (c.about) collections[c.key].about = c.about;
    }
    data.metadata = { collections };
    return { data };
  }

  // "dvc-companion-export-2026-09-24.json", in the owner's own local date.
  function fileName(now, ext = "json") {
    const pad = n => String(n).padStart(2, "0");
    return `dvc-companion-export-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.${ext}`;
  }

  // ---- Spreadsheet (the main download) ----
  // build()'s data -> [{ name, rows }], rows[0] the header. One sheet per
  // collection, plain column names, resort/room/contract names instead of
  // ids. A collection the database doesn't have yet gets no sheet. Dates
  // are ISO text (2026-09-24) so they sort; timestamps become the owner's
  // local date. names: { resort(id), room(resortId, roomTypeId) }.
  const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
  function day(value) {
    if (!value) return "";
    if (DATE_ONLY.test(value)) return value;
    const d = new Date(value);
    if (isNaN(d)) return String(value);
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  const num = v => (v === null || v === undefined || v === "" ? "" : Number(v));
  const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
  const nightsBetween = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);
  const byDate = key => (a, b) => String(a[key] || "").localeCompare(String(b[key] || ""));
  const OUTCOMES = { restore: "Points returned", holding: "Points to Holding", forfeit: "Points forfeited", none: "Balances left alone" };
  const REASONS = { booking: "Booking", banking: "Banking", borrowing: "Borrowing", transfer: "Transfer", cancellation: "Cancellation", other: "Other" };

  function sheets(data, names) {
    const resort = id => (id ? names.resort(id) : "");
    const room = (r, t) => (t ? names.room(r, t) : "");
    const contracts = data.contracts || [];
    const contractName = id => {
      const c = contracts.find(x => x.id === id);
      return c ? (c.nickname || resort(c.home_resort_id)) : "";
    };
    const out = [{
      name: "About",
      rows: [
        ["DVC Companion export"],
        ["Downloaded", day(data.exportedAt)],
        [data.notice],
        ["Each tab is one kind of record. Dates are year-month-day so they sort."],
      ],
    }];
    const add = (name, key, header, toRows) => {
      if (data[key] === null || data[key] === undefined) return;
      out.push({ name, rows: [header, ...toRows(data[key])] });
    };

    add("Contracts", "contracts",
      ["Contract", "Home resort", "Use year", "Points per year", "Purchase type", "Purchase price", "Purchase date", "Financing interest paid", "Status", "Ended on", "Sale proceeds", "Added on"],
      rows => rows.map(c => [contractName(c.id), resort(c.home_resort_id), c.use_year, num(c.points_per_year), cap(c.purchase_type), num(c.purchase_price), day(c.purchase_date), num(c.financing_interest_paid), c.is_active === false ? "Inactive" : "Active", day(c.ended_on), num(c.sale_proceeds), day(c.created_at)]));

    add("Balances", "useYearBalances",
      ["Contract", "Use year", "Current", "Banked", "Borrowed", "Holding", "Balance confirmed on", "Last checked against Disney"],
      rows => rows.slice().sort((a, b) => contractName(a.contract_id).localeCompare(contractName(b.contract_id)) || a.use_year_label - b.use_year_label)
        .map(r => [contractName(r.contract_id), num(r.use_year_label), num(r.points_remaining), num(r.points_banked), num(r.points_borrowed), num(r.points_holding), day(r.balance_confirmed_at), day(r.last_checked_against_disney_at)]));

    add("Bookings", "bookings",
      ["Resort", "Room type", "Check-in", "Check-out", "Nights", "Points", "Contract", "Disney confirmation #", "Notes", "Recorded on"],
      rows => rows.slice().sort(byDate("check_in"))
        .map(t => [resort(t.resort_id), room(t.resort_id, t.room_type_id), t.check_in, t.check_out, nightsBetween(t.check_in, t.check_out), num(t.points_used), contractName(t.contract_id), t.disney_confirmation_number || "", t.notes || "", day(t.created_at)]));

    add("Point activity", "pointMovements",
      ["Date", "Contract", "Action", "Points", "From use year", "To use year"],
      rows => rows.slice().sort(byDate("created_at"))
        .map(m => [day(m.created_at), contractName(m.contract_id), m.kind === "bank" ? "Banked" : "Borrowed", num(m.points), num(m.from_year), num(m.to_year)]));

    add("Disney checks", "reconciliations",
      ["Date", "Contract", "Use year", "Result", "Reason", "Notes", "Disney current", "Disney banked", "Disney borrowed", "Disney holding"],
      rows => rows.slice().sort(byDate("created_at")).map(r => {
        const a = r.after || {};
        return [day(r.created_at), contractName(r.contract_id), num(r.use_year_label), r.matched ? "Matched" : "Updated", REASONS[r.reason] || "", r.notes || "", num(a.points_remaining), num(a.points_banked), num(a.points_borrowed), num(a.points_holding)];
      }));

    const trips = data.bookings || [];
    add("Points taken", "bookingDeductions",
      ["Booking", "Check-in", "Contract", "Use year", "Holding", "Banked", "Borrowed", "Current", "Put back on"],
      rows => rows.slice().sort(byDate("created_at")).map(d => {
        const t = trips.find(x => x.id === d.trip_id);
        return [t ? resort(t.resort_id) : "", t ? t.check_in : "", contractName(d.contract_id), num(d.use_year_label), num(d.points_holding), num(d.points_banked), num(d.points_borrowed), num(d.points_remaining), day(d.reversed_at)];
      }));

    add("Cancellations", "bookingCancellations",
      ["Canceled on", "Resort", "Room type", "Check-in", "Check-out", "Points", "Days before check-in", "What happened to the points", "Disney confirmation #"],
      rows => rows.slice().sort(byDate("canceled_on"))
        .map(c => [c.canceled_on, resort(c.resort_id), room(c.resort_id, c.room_type_id), c.check_in, c.check_out, num(c.points_used), num(c.days_before_check_in), OUTCOMES[c.outcome] || c.outcome, c.disney_confirmation_number || ""]));

    add("Itineraries", "itineraries",
      ["Itinerary", "Year", "Stay", "Resort", "Room type", "Check-in", "Check-out", "Saved on"],
      rows => rows.slice().sort(byDate("created_at")).flatMap(it => {
        const segs = Array.isArray(it.segments) && it.segments.length ? it.segments : [{}];
        return segs.map((s, i) => [it.name, num(it.year), i + 1, resort(s.resortId), room(s.resortId, s.roomTypeId), s.checkIn || "", s.checkOut || "", day(it.created_at)]);
      }));

    return out;
  }

  const api = { SCHEMA_VERSION, COLLECTIONS, SAFE_PROFILE_FIELDS, build, fileName, scrub, sheets };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCDataExport = api;
})();
