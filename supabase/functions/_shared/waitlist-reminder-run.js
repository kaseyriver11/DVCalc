// The nightly waitlist review-reminder loop (Prompt 5), same shape as the
// other reminder runs: client and sender passed in, so
// tests/waitlists.test.js runs it against a fake Supabase. Dedup lives on
// the waitlist row itself (review_reminded_at, cleared when the owner edits
// the request): the row is claimed with a conditional update before
// sending, and released if the send fails.
import { waitlistReminderDecision, waitlistReminderEmail } from "./waitlist-reminders.js";

export async function runWaitlistReminders({ supabase, send, today, appBaseUrl, unsubscribeBaseUrl, memberIds = null, dryRun = false, resortLabel = (id) => id }) {
  let sent = 0, skipped = 0;
  const errors = [], planned = [];
  const { data: rows, error } = await supabase
    .from("waitlists")
    .select("id, user_id, resort_id, room_type_id, check_in, check_out, status, remind_days_before, review_reminded_at, backup_trip_id")
    .eq("status", "pending");
  if (error) throw new Error(`waitlists query failed: ${error.message}`);

  const profiles = new Map(), emails = new Map();
  for (const w of rows ?? []) {
    const decision = waitlistReminderDecision(w, today);
    if (!decision.send) { skipped++; continue; }
    if (memberIds && !memberIds.has(w.user_id)) { skipped++; continue; }
    if (dryRun) { planned.push({ waitlist: w.id, action: "waitlist_review", checkIn: w.check_in }); continue; }

    if (!profiles.has(w.user_id)) {
      const { data: p } = await supabase.from("profiles").select("id, display_name, reminder_unsubscribe_token").eq("id", w.user_id).maybeSingle();
      profiles.set(w.user_id, p ?? null);
      const { data: userResp, error: userError } = await supabase.auth.admin.getUserById(w.user_id);
      emails.set(w.user_id, userError ? null : userResp?.user?.email ?? null);
    }
    const email = emails.get(w.user_id), profile = profiles.get(w.user_id);
    if (!email) { errors.push(`no email for profile ${w.user_id}`); continue; }

    // Claim: only one run can flip review_reminded_at from null.
    const claimedAt = new Date().toISOString();
    const { data: claimed, error: claimError } = await supabase.from("waitlists")
      .update({ review_reminded_at: claimedAt }).eq("id", w.id).is("review_reminded_at", null).select("id");
    if (claimError) { errors.push(`waitlist claim failed for ${w.id}: ${claimError.message}`); continue; }
    if (!claimed?.length) { skipped++; continue; }

    let backupLabel = null;
    if (w.backup_trip_id) {
      const { data: t } = await supabase.from("trips").select("resort_id, check_in").eq("id", w.backup_trip_id).maybeSingle();
      if (t) backupLabel = `${resortLabel(t.resort_id)}, checking in ${t.check_in}`;
    }
    const { subject, html } = waitlistReminderEmail(w, decision, {
      name: profile?.display_name, resortLabel: resortLabel(w.resort_id), backupLabel,
      links: { bookings: `${appBaseUrl}/bookings.html#waitlists`, unsubscribe: unsubscribeBaseUrl && profile ? `${unsubscribeBaseUrl}?token=${profile.reminder_unsubscribe_token}&type=waitlist` : null },
    });
    const result = await send({ to: email, subject, html });
    if (!result.ok) {
      await supabase.from("waitlists").update({ review_reminded_at: null }).eq("id", w.id).eq("review_reminded_at", claimedAt);
      errors.push(`email send failed for waitlist ${w.id}: ${String(result.error ?? "").slice(0, 200)}`);
      continue;
    }
    sent++;
  }
  return { sent, skipped, errors, planned };
}
