// Use-year expiration and Holding reminder rules (Prompt 3) -- pure, so
// node --test can check them against the app's own dvc-point-attention.js
// (tests/point-reminders.test.js): an email names exactly the points the
// app's "Point actions" list names, never more.
//
// Kept separate from the banking reminder (banking-reminder.js), which has
// its own opt-in, lead time and email: these are two more opt-in event
// types, each with its own setting, lead time, unsubscribe and
// reminder_log type.
//
//   expiration  points that can only be used now -- banked + borrowed, plus
//               current once the banking deadline has passed (while banking
//               is open, current points belong to the banking reminder, so
//               they're never counted twice) -- before the use year ends
//   holding     Holding points, which expire when the use year ends and can
//               only book stays no more than 60 days before check-in
//
// Never an exact-point email for an unknown balance or a failed read: an
// unknown balance gets one "check your Disney balance" expiration email
// with no numbers, and nothing for Holding (there's nothing to claim).
import { currentUseYearLabel, bankingDeadlineMs, useYearEndMs, USE_YEAR_START_MONTH } from "./banking-reminder.js";

export const POINT_REMINDER_TYPES = {
  expiration: "use_year_expiration",
  expirationCheck: "use_year_expiration_check",
  holding: "holding_expiration",
};

const dateOnlyUTC = (y, m, d) => Date.UTC(y, m - 1, d);
const n = (v) => Math.max(0, Number(v) || 0);

// prefs: { expiration: leadDays|null, holding: leadDays|null } -- null when
// that type isn't opted in. Returns a list of decisions, each
// { kind: "expiration"|"expirationCheck"|"holding"|"error", type, label,
//   endMs, daysUntil, points?, parts? }.
export function pointReminderDecisions({ useYear, today, prefs, row, rowError = false }) {
  if (!USE_YEAR_START_MONTH[useYear]) return [];
  const label = currentUseYearLabel(useYear, today);
  const todayMs = dateOnlyUTC(today.year, today.month, today.day);
  const endMs = useYearEndMs(useYear, label);
  const daysUntil = Math.round((endMs - todayMs) / 86400000);
  const base = { label, endMs, daysUntil };
  const inWindow = (lead) => lead != null && daysUntil >= 0 && daysUntil <= lead;
  const wantExpiration = inWindow(prefs.expiration), wantHolding = inWindow(prefs.holding);
  if (!wantExpiration && !wantHolding) return [];
  if (rowError) return [{ ...base, kind: "error" }];
  const out = [];
  if (!row || !row.balance_confirmed_at) {
    if (wantExpiration) out.push({ ...base, kind: "expirationCheck", type: POINT_REMINDER_TYPES.expirationCheck });
    return out;
  }
  const bankingOpen = todayMs <= bankingDeadlineMs(useYear, label);
  const parts = { current: bankingOpen ? 0 : n(row.points_remaining), banked: n(row.points_banked), borrowed: n(row.points_borrowed) };
  const points = parts.current + parts.banked + parts.borrowed;
  if (wantExpiration && points > 0) out.push({ ...base, kind: "expiration", type: POINT_REMINDER_TYPES.expiration, points, parts, bankingOpen });
  const holding = n(row.points_holding);
  if (wantHolding && holding > 0) out.push({ ...base, kind: "holding", type: POINT_REMINDER_TYPES.holding, points: holding });
  return out;
}

// Whether the window could open today for either type -- lets the loop skip
// the ledger read for contracts nowhere near their use-year end.
export function anyPointReminderWindow({ useYear, today, prefs }) {
  if (!USE_YEAR_START_MONTH[useYear]) return false;
  const endMs = useYearEndMs(useYear, currentUseYearLabel(useYear, today));
  const daysUntil = Math.round((endMs - dateOnlyUTC(today.year, today.month, today.day)) / 86400000);
  return [prefs.expiration, prefs.holding].some((lead) => lead != null && daysUntil >= 0 && daysUntil <= lead);
}

const fmtDate = (ms) => new Date(ms).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

// Subject and HTML for one decision. links: { balance, unsubscribe }.
export function pointReminderEmail(decision, { name, contractLabel, useYear, links }) {
  const days = `${decision.daysUntil} ${decision.daysUntil === 1 ? "day" : "days"}`;
  const end = fmtDate(decision.endMs);
  const label = esc(contractLabel);
  const what = decision.kind === "holding" ? "Holding point reminders" : "use-year expiration reminders";
  const footer = `<p style="font-size:12px;color:#888;">DVC Companion only knows what you've recorded; Disney's member site is the official balance, and booking happens there. You're getting this because you opted in to ${what}.
    ${links.unsubscribe ? `<a href="${esc(links.unsubscribe)}">Unsubscribe from ${what}</a>` : "Manage this in My Contracts."}</p>`;
  const hi = `<p>Hi${name ? " " + esc(name) : ""},</p>`;
  const cta = `<p><a href="${esc(links.balance)}">See these points in DVC Companion</a></p>`;
  if (decision.kind === "expirationCheck") {
    return {
      subject: `Check your ${contractLabel} points before the use year ends on ${end}`,
      html: `${hi}
        <p>The ${useYear} use year on your <strong>${label}</strong> contract ends on <strong>${end}</strong> &mdash; ${days} away. Points left after that expire.</p>
        <p>DVC Companion doesn't have a balance for this use year, so check your points on Disney's member site. Adding the balance in DVC Companion lets future reminders say how many points are involved.</p>
        <p><a href="${esc(links.balance)}">Add this contract's balance</a></p>
        ${footer}`,
    };
  }
  const pts = decision.points.toLocaleString("en-US");
  if (decision.kind === "holding") {
    return {
      subject: `${pts} Holding points on ${contractLabel} expire ${end}`,
      html: `${hi}
        <p>Your <strong>${label}</strong> contract (${useYear} use year) has <strong>${pts} points you recorded in Holding</strong>. They expire when this use year ends on <strong>${end}</strong> &mdash; ${days} away.</p>
        <p>Holding points can't be banked, and a stay booked with them must be booked no more than 60 days before check-in. To use them, book a stay with Disney; Disney's member site shows live availability.</p>
        ${cta}
        ${footer}`,
    };
  }
  const list = [["current", "current"], ["banked", "banked"], ["borrowed", "borrowed"]].filter(([k]) => decision.parts[k] > 0).map(([k, word]) => `${decision.parts[k].toLocaleString("en-US")} ${word}`).join(", ");
  const why = decision.parts.current ? "The banking deadline for this use year has passed, so these can't be moved to next use year." : "Banked and borrowed points can't be banked again.";
  return {
    subject: `Use ${pts} points on ${contractLabel} before ${end}`,
    html: `${hi}
      <p>Your <strong>${label}</strong> contract (${useYear} use year) has <strong>${pts} points you recorded</strong> (${list}) that expire when this use year ends on <strong>${end}</strong> &mdash; ${days} away.</p>
      <p>${why} To use them, book a stay with Disney; Disney's member site shows the official balance and live availability.</p>
      ${cta}
      ${footer}`,
  };
}
