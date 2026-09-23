// Owner-set waitlist review reminders (Prompt 5, migration 027) -- pure, so
// node --test can check them (tests/waitlists.test.js). The owner chooses,
// per request, to be reminded N days before check-in while it's still
// pending. The email says only that: DVC Companion never sees Disney's
// waitlist or inventory, so it asks the owner to check Disney's member site.
import { todayInEastern } from "./banking-reminder.js";

export { todayInEastern };
const DAY = 86400000;
const parse = (s) => Date.parse(s + "T00:00:00Z");
const isoToday = (t) => `${t.year}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;

// w: a waitlists row. Returns { send, daysToCheckIn }.
export function waitlistReminderDecision(w, today) {
  const daysToCheckIn = Math.round((parse(w.check_in) - parse(isoToday(today))) / DAY);
  const send = w.status === "pending" && Number.isInteger(w.remind_days_before) && !w.review_reminded_at
    && daysToCheckIn >= 0 && daysToCheckIn <= w.remind_days_before;
  return { send, daysToCheckIn };
}

const fmtDate = (s) => new Date(s + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

export function waitlistReminderEmail(w, decision, { name, resortLabel, backupLabel, links }) {
  const days = `${decision.daysToCheckIn} ${decision.daysToCheckIn === 1 ? "day" : "days"}`;
  return {
    subject: `Review your ${resortLabel} waitlist request: check-in ${fmtDate(w.check_in)}`,
    html: `<p>Hi${name ? " " + esc(name) : ""},</p>
      <p>You asked to be reminded about your waitlist request for <strong>${esc(resortLabel)}</strong>, ${fmtDate(w.check_in)} to ${fmtDate(w.check_out)}. Check-in is ${days} away and it's still marked pending in DVC Companion.</p>
      <p>DVC Companion can't see Disney's waitlist, so check its status on Disney's member site. If Disney confirmed it, record the booking from Bookings &amp; Stays; if it was canceled, mark it canceled there.${backupLabel ? ` Your backup booking (${esc(backupLabel)}) is still recorded.` : ""}</p>
      <p><a href="${esc(links.bookings)}">Open Bookings &amp; Stays</a></p>
      <p style="font-size:12px;color:#888;">You're getting this because you turned on a review reminder for this request.
        ${links.unsubscribe ? `<a href="${esc(links.unsubscribe)}">Turn off waitlist reminders</a>` : "Turn it off by editing the request."}</p>`,
  };
}
