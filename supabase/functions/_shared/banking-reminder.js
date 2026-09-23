// Banking-reminder rules for send-banking-reminders -- pure, so node --test
// can check them (tests/banking-reminder.test.js), including against the
// app's own dvc-dates.js tables so the two can't silently diverge.
//
// DVC's rules (Disney's 2025 On-Line Booking T&C): current use-year points
// can be banked until the banking deadline, 8 months into the use year.
// Unbanked points are NOT forfeited then -- they stay usable until the use
// year ends. Borrowing isn't tied to this date. Only CURRENT points
// (points_remaining) can be banked; banked, borrowed and Holding points
// can't be banked again, so they never make someone "eligible" here.

// 1-indexed deposit month per use year, and each use year's banking
// deadline. Must match dvc-dates.js USE_YEAR_START_MONTH / DEADLINE_BY_USE_YEAR
// (asserted by the tests).
export const USE_YEAR_START_MONTH = { Feb: 2, Mar: 3, Apr: 4, Jun: 6, Aug: 8, Sep: 9, Oct: 10, Dec: 12 };
export const DEADLINE_BY_USE_YEAR = {
  Feb: { month: 9, day: 30 },
  Mar: { month: 10, day: 31 },
  Apr: { month: 11, day: 30 },
  Jun: { month: 1, day: 31 },
  Aug: { month: 3, day: 31 },
  Sep: { month: 4, day: 30 },
  Oct: { month: 5, day: 31 },
  Dec: { month: 7, day: 31 },
};

// reminder_log types. The legacy type is still read for deduplication, so
// an owner reminded under the old wording isn't reminded again this cycle.
export const REMINDER_TYPES = { banking: "banking_deadline", check: "banking_balance_check", legacy: "banking_borrowing_deadline" };

const dateOnlyUTC = (y, m, d) => Date.UTC(y, m - 1, d);

// "Today" as an Eastern calendar date, whatever the server clock's zone.
export function todayInEastern(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return { year: Number(map.year), month: Number(map.month), day: Number(map.day) };
}

// Deposit-year label of the cycle active today (a Dec contract in Sep 2026
// is in its "2025" cycle) -- same as dvc-dates.js currentUYYear().
export function currentUseYearLabel(useYear, today) {
  return today.month >= USE_YEAR_START_MONTH[useYear] ? today.year : today.year - 1;
}

// One cycle's banking deadline -- same as dvc-dates.js deadlineForCycle().
export function bankingDeadlineMs(useYear, label) {
  const start = USE_YEAR_START_MONTH[useYear];
  const { month, day } = DEADLINE_BY_USE_YEAR[useYear];
  return dateOnlyUTC(month > start ? label : label + 1, month, day);
}

// The cycle's last usable day -- same as dvc-dates.js useYearExpiration().
export function useYearEndMs(useYear, label) {
  return dateOnlyUTC(label + 1, USE_YEAR_START_MONTH[useYear], 0);
}

// What (if anything) to send for one contract today.
//   row:      the contract_year_points row for the current cycle, or null
//   rowError: true when that read failed -- never guess then
// Returns { action, label, deadlineMs, daysUntil, endMs, points }, action one of:
//   "none"   outside the reminder window, or a confirmed balance with no
//            current points to bank (a saved zero is a real zero)
//   "bank"   confirmed positive current points inside the window
//   "check"  balance unknown/unconfirmed inside the window -- ask the owner
//            to check Disney, with no numbers or eligibility claims
//   "error"  the ledger read failed inside the window
export function bankingReminderDecision({ useYear, today, leadDays, row, rowError = false }) {
  if (!USE_YEAR_START_MONTH[useYear]) return { action: "none", reason: "unknown use year" };
  const label = currentUseYearLabel(useYear, today);
  const deadlineMs = bankingDeadlineMs(useYear, label);
  const daysUntil = Math.round((deadlineMs - dateOnlyUTC(today.year, today.month, today.day)) / 86400000);
  const base = { label, deadlineMs, daysUntil, endMs: useYearEndMs(useYear, label) };
  if (daysUntil < 0 || daysUntil > leadDays) return { ...base, action: "none" };
  if (rowError) return { ...base, action: "error" };
  if (!row || !row.balance_confirmed_at) return { ...base, action: "check" };
  const points = Math.max(0, Number(row.points_remaining) || 0);
  return points > 0 ? { ...base, action: "bank", points } : { ...base, action: "none", points: 0 };
}

const fmtDate = (ms) => new Date(ms).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

// Subject and HTML for a "bank" or "check" decision.
export function bankingReminderEmail(decision, { name, contractLabel, useYear, appBaseUrl, unsubscribeLink }) {
  const days = `${decision.daysUntil} ${decision.daysUntil === 1 ? "day" : "days"}`;
  const deadline = fmtDate(decision.deadlineMs);
  const end = fmtDate(decision.endMs);
  const label = esc(contractLabel);
  const footer = `<p style="font-size:12px;color:#888;">DVC Companion only knows what you've recorded; Disney's member site is the official balance. You're getting this because you opted in to banking reminders.
    ${unsubscribeLink ? `<a href="${esc(unsubscribeLink)}">Unsubscribe from these emails</a>` : "Manage this in My Contracts."}</p>`;
  const hi = `<p>Hi${name ? " " + esc(name) : ""},</p>`;
  if (decision.action === "bank") {
    const pts = decision.points.toLocaleString("en-US");
    return {
      subject: `Banking deadline in ${days}: ${pts} current points on ${contractLabel}`,
      html: `${hi}
        <p>Your <strong>${label}</strong> contract (${useYear} use year) has <strong>${pts} points you recorded as current</strong>. The banking deadline for them is <strong>${deadline}</strong> &mdash; ${days} away.</p>
        <p>To move them into next use year, bank them with Disney by then; Disney confirms what's eligible and does the banking. If you don't bank them, they aren't lost on that date &mdash; you can still use them for stays until this use year ends on <strong>${end}</strong>.</p>
        <p><a href="${appBaseUrl}/account.html">Review this contract in DVC Companion</a></p>
        ${footer}`,
    };
  }
  return {
    subject: `Check your ${contractLabel} points before the ${deadline} banking deadline`,
    html: `${hi}
      <p>The banking deadline for your <strong>${label}</strong> contract (${useYear} use year) is <strong>${deadline}</strong> &mdash; ${days} away.</p>
      <p>DVC Companion doesn't have a current balance for this use year, so check your points on Disney's member site to see whether anything is left to bank. Adding the balance in DVC Companion lets future reminders say how many points are involved.</p>
      <p><a href="${appBaseUrl}/account.html">Add this contract's balance</a></p>
      ${footer}`,
  };
}
