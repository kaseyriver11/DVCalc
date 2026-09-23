// Daily-cron-triggered Edge Function: finds every signed-in user who's
// opted into banking/borrowing deadline reminders, checks each of their
// active contracts against that use year's recurring deadline, and sends
// an email via Resend for any contract entering its reminder window for
// the first time -- reminder_log's unique (contract_id, deadline_date,
// reminder_type) constraint is the actual double-send guard; this
// function just checks it before sending rather than relying on that
// constraint to reject a duplicate insert (checking first means "already
// sent" is a normal skip, not a caught error on every subsequent day).
//
// Deployment: see docs/phase5_deployment.md. This function needs
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and RESEND_API_KEY set as
// secrets, and a daily pg_cron job (also in that doc) to actually invoke
// it -- Edge Functions don't run themselves on a schedule.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Deadline = 8 months after the use year's start, same calendar date
// every year. {month, day} is 1-indexed and IS the deadline itself (not
// the use-year start), so finding the *next* occurrence is just "next
// time this month/day occurs on or after today" -- one rule handles both
// same-year deadlines (Feb/Mar/Apr) and next-year ones (Jun/Aug/Sep/Oct/Dec)
// without hardcoding which roll over. Mirrors account.html's copy of this
// table exactly -- keep both in sync if this ever changes.
// Mirrors auth.js: set false to email every opted-in owner regardless of
// membership. past_due still counts (Stripe is retrying the card).
const MEMBERSHIP_GATE_ENABLED = false;
const MEMBER_STATUSES = ["active", "trialing", "past_due"];

const DEADLINE_BY_USE_YEAR: Record<string, { month: number; day: number }> = {
  Feb: { month: 9, day: 30 },  // Sep 30
  Mar: { month: 10, day: 31 }, // Oct 31
  Apr: { month: 11, day: 30 }, // Nov 30
  Jun: { month: 1, day: 31 },  // Jan 31 (next year)
  Aug: { month: 3, day: 31 },  // Mar 31 (next year)
  Sep: { month: 4, day: 30 },  // Apr 30 (next year)
  Oct: { month: 5, day: 31 },  // May 31 (next year)
  Dec: { month: 7, day: 31 },  // Jul 31 (next year)
};

interface EasternDate {
  year: number;
  month: number; // 1-indexed
  day: number;
}

// "Today" as a calendar date in Eastern time, independent of the server's
// own clock -- Deno Deploy runs in UTC, and DVC's own deadlines are an
// Eastern-time business, so this keeps the boundary consistent regardless
// of when in the UTC day the cron happens to fire.
function todayInEastern(): EasternDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return { year: Number(map.year), month: Number(map.month), day: Number(map.day) };
}

function dateOnlyUTC(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day);
}

function nextDeadline(useYear: string, today: EasternDate): { ms: number; daysUntil: number } {
  const { month, day } = DEADLINE_BY_USE_YEAR[useYear];
  const todayMs = dateOnlyUTC(today.year, today.month, today.day);
  let candidateMs = dateOnlyUTC(today.year, month, day);
  if (candidateMs < todayMs) candidateMs = dateOnlyUTC(today.year + 1, month, day);
  return { ms: candidateMs, daysUntil: Math.round((candidateMs - todayMs) / 86400000) };
}

function formatDeadlineDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL") ?? "DVC Companion <onboarding@resend.dev>";
  const unsubscribeBaseUrl = Deno.env.get("UNSUBSCRIBE_FUNCTION_URL"); // e.g. https://<ref>.supabase.co/functions/v1/unsubscribe-reminders
  const appBaseUrl = Deno.env.get("APP_BASE_URL") ?? "https://your-dvcalc-domain.example.com"; // set this once you know where DVC Companion is actually hosted

  if (!supabaseUrl || !serviceKey || !resendKey) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or RESEND_API_KEY secret" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const today = todayInEastern();

  let sent = 0;
  let skipped = 0;
  // Error strings are logged into the public-readable reminder_run_log
  // below, so they're written by id, never by email address -- keep it
  // that way if you touch this loop (see db/migrations/017_add_reminder_run_log.sql).
  const errors: string[] = [];

  try {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, reminder_opt_in, reminder_lead_days, reminder_unsubscribe_token")
      .eq("reminder_opt_in", true);

    if (profileError) throw new Error(`profiles query failed: ${profileError.message}`);

    // Reminders are an Active Member feature -- keep in sync with auth.js's
    // MEMBERSHIP_GATE_ENABLED / MEMBER_STATUSES.
    let memberIds: Set<string> | null = null;
    if (MEMBERSHIP_GATE_ENABLED) {
      const { data: subs, error: subError } = await supabase
        .from("subscriptions")
        .select("user_id")
        .in("status", MEMBER_STATUSES);
      if (subError) throw new Error(`subscriptions query failed: ${subError.message}`);
      memberIds = new Set((subs ?? []).map((s) => s.user_id));
    }

    for (const profile of profiles ?? []) {
      if (memberIds && !memberIds.has(profile.id)) {
        skipped++;
        continue;
      }
      const { data: contracts, error: contractError } = await supabase
        .from("contracts")
        .select("id, home_resort_id, use_year, nickname")
        .eq("user_id", profile.id)
        .eq("is_active", true);

      if (contractError) {
        errors.push(`contracts query failed for profile ${profile.id}: ${contractError.message}`);
        continue;
      }

      for (const contract of contracts ?? []) {
        const deadline = nextDeadline(contract.use_year, today);
        if (deadline.daysUntil < 0 || deadline.daysUntil > profile.reminder_lead_days) {
          skipped++;
          continue;
        }

        const deadlineDateStr = formatDeadlineDate(deadline.ms);

        const { data: existingLog } = await supabase
          .from("reminder_log")
          .select("id")
          .eq("contract_id", contract.id)
          .eq("deadline_date", deadlineDateStr)
          .eq("reminder_type", "banking_borrowing_deadline")
          .maybeSingle();

        if (existingLog) {
          skipped++;
          continue;
        }

        const { data: userResp, error: userError } = await supabase.auth.admin.getUserById(profile.id);
        const email = userResp?.user?.email;
        if (userError || !email) {
          errors.push(`no email for profile ${profile.id}: ${userError?.message ?? "unknown"}`);
          continue;
        }

        const contractLabel = contract.nickname || contract.home_resort_id;
        const dayWord = deadline.daysUntil === 1 ? "day" : "days";
        const subject = `DVC banking/borrowing deadline in ${deadline.daysUntil} ${dayWord}`;
        const unsubscribeLink = unsubscribeBaseUrl
          ? `${unsubscribeBaseUrl}?token=${profile.reminder_unsubscribe_token}`
          : null;

        const html = `
          <p>Hi${profile.display_name ? " " + profile.display_name : ""},</p>
          <p>Your <strong>${contractLabel}</strong> contract (${contract.use_year} use year) has a banking/borrowing
          deadline on <strong>${deadlineDateStr}</strong> &mdash; that's ${deadline.daysUntil} ${dayWord} away.</p>
          <p>Points not banked or borrowed by then are forfeited for this use year. Log in to
          <a href="${appBaseUrl}/account.html">DVC Companion</a> or check Disney's member site to confirm
          your points are handled the way you want.</p>
          <p style="font-size:12px;color:#888;">You're getting this because you opted in to deadline reminders for
          this contract in DVC Companion.
          ${unsubscribeLink ? `<a href="${unsubscribeLink}">Unsubscribe from these emails</a>` : "Manage this in My Contracts."}</p>
        `;

        const emailResp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from: fromEmail, to: email, subject, html }),
        });

        if (!emailResp.ok) {
          errors.push(`Resend send failed for profile ${profile.id} (contract ${contract.id}): ${await emailResp.text()}`);
          continue;
        }

        const { error: logError } = await supabase.from("reminder_log").insert({
          user_id: profile.id,
          contract_id: contract.id,
          deadline_date: deadlineDateStr,
          reminder_type: "banking_borrowing_deadline",
        });
        if (logError) errors.push(`reminder_log insert failed for contract ${contract.id}: ${logError.message}`);

        sent++;
      }
    }
  } catch (err) {
    // A crash partway through still needs to reach reminder_run_log below
    // -- otherwise the one night this function actually breaks is exactly
    // the night nightly_watchdog.py's "no recent run" check can't tell
    // apart from a cron job that stopped firing entirely.
    errors.push(`unhandled error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Heartbeat row -- see db/migrations/017_add_reminder_run_log.sql. Best
  // effort: a failure here shouldn't hide the real sent/skipped/errors
  // result from a manual curl test, so it's appended to errors rather
  // than thrown.
  const loggedErrors = errors.map((e) => (e.length > 300 ? e.slice(0, 300) + "…" : e));
  const { error: runLogError } = await supabase.from("reminder_run_log").insert({
    sent,
    skipped,
    error_count: errors.length,
    errors: loggedErrors,
  });
  if (runLogError) errors.push(`reminder_run_log insert failed: ${runLogError.message}`);

  return new Response(JSON.stringify({ sent, skipped, errors }), {
    headers: { "Content-Type": "application/json" },
  });
});
