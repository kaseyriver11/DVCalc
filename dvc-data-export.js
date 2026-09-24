// "Download my data" (My Contracts): turns the owner's own rows into one
// JSON file. Pure -- auth.js readOwnerExport() does the reads (as the
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
  function fileName(now) {
    const pad = n => String(n).padStart(2, "0");
    return `dvc-companion-export-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
  }

  const api = { SCHEMA_VERSION, COLLECTIONS, SAFE_PROFILE_FIELDS, build, fileName, scrub };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.DVCDataExport = api;
})();
