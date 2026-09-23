// Daily-cron-triggered Edge Function: for every owner who opted into
// banking reminders, checks each active contract's CURRENT use-year
// balance against that cycle's banking deadline and, inside the owner's
// lead window, sends one of two emails:
//   - "bank": the owner recorded a positive current balance. Says
//     "banking deadline", the recorded amount, the cutoff date, that Disney
//     confirms eligibility and does the banking, and -- separately -- that
//     unbanked points stay usable until the use year ends (they are NOT
//     forfeited at the banking cutoff; borrowing isn't tied to this date).
//   - "check": no confirmed balance for that cycle. Asks the owner to
//     check Disney's site, with no numbers or eligibility claims.
// A confirmed zero sends nothing, and a failed balance read logs an error
// and sends nothing -- never a guessed reminder.
//
// The loop lives in ../_shared/banking-reminder-run.js and the rules/copy in
// ../_shared/banking-reminder.js, both exercised end to end by
// tests/banking-reminder.test.js (which also checks the deadline table
// against dvc-dates.js). This file only wires secrets, Supabase and Resend.
//
// Deduplication: reminder_log's unique (contract_id, deadline_date,
// reminder_type); each email type goes out at most once per contract per
// deadline, and a row claimed before sending blocks a concurrent duplicate
// run. Owners reminded under the legacy "banking_borrowing_deadline" type
// aren't reminded again for that deadline.
//
// The same nightly run also sends the opt-in use-year expiration and
// Holding reminders (Prompt 3, ../_shared/point-reminder-run.js), each with
// its own profile setting, lead time, reminder_log type and unsubscribe
// link. They run separately, so a failure there (e.g. migration 026 not
// applied yet) is recorded in the heartbeat without stopping banking emails.
// A third loop sends owner-set waitlist review reminders (Prompt 5,
// ../_shared/waitlist-reminder-run.js, migration 027).
//
// Deployment: see docs/phase5_deployment.md. Needs SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY and RESEND_API_KEY secrets and the daily
// pg_cron job. Call with ?dry_run=1 (or set the DRY_RUN=true secret) to
// compute every decision without sending mail, claiming reminder_log rows,
// or writing the reminder_run_log heartbeat.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeBaseUrl } from "../_shared/base_url.ts";
import { todayInEastern } from "../_shared/banking-reminder.js";
import { runBankingReminders } from "../_shared/banking-reminder-run.js";
import { runPointReminders } from "../_shared/point-reminder-run.js";
import { runWaitlistReminders } from "../_shared/waitlist-reminder-run.js";

// "saratogaSprings" -> "Saratoga Springs": the resort data files aren't
// available to the function, and a waitlist email needs a readable name.
const resortLabel = (id: string) => id.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

// Mirrors auth.js: set false to email every opted-in owner regardless of
// membership. past_due still counts (Stripe is retrying the card).
const MEMBERSHIP_GATE_ENABLED = false;
const MEMBER_STATUSES = ["active", "trialing", "past_due"];

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL") ?? "DVC Companion <onboarding@resend.dev>";
  const dryRun = Deno.env.get("DRY_RUN") === "true" || new URL(req.url).searchParams.get("dry_run") === "1";

  if (!supabaseUrl || !serviceKey || (!resendKey && !dryRun)) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or RESEND_API_KEY secret" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  let result = { sent: 0, skipped: 0, errors: [] as string[], planned: [] as unknown[] };
  try {
    let memberIds: Set<string> | null = null;
    if (MEMBERSHIP_GATE_ENABLED) {
      const { data: subs, error: subError } = await supabase.from("subscriptions").select("user_id").in("status", MEMBER_STATUSES);
      if (subError) throw new Error(`subscriptions query failed: ${subError.message}`);
      memberIds = new Set((subs ?? []).map((s) => s.user_id));
    }
    const options = {
      supabase,
      today: todayInEastern(),
      appBaseUrl: normalizeBaseUrl(Deno.env.get("APP_BASE_URL")),
      unsubscribeBaseUrl: Deno.env.get("UNSUBSCRIBE_FUNCTION_URL"), // https://<ref>.supabase.co/functions/v1/unsubscribe-reminders
      memberIds,
      dryRun,
      resortLabel,
      send: async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: fromEmail, to, subject, html }),
        });
        return resp.ok ? { ok: true } : { ok: false, error: await resp.text() };
      },
    };
    for (const [name, run] of [["banking", runBankingReminders], ["expiration/holding", runPointReminders], ["waitlist", runWaitlistReminders]] as const) {
      try {
        const r = await run(options);
        result.sent += r.sent;
        result.skipped += r.skipped;
        result.errors.push(...r.errors);
        result.planned.push(...r.planned);
      } catch (err) {
        // A crash still reaches the heartbeat below, so the watchdog can tell
        // a broken run from a cron job that stopped firing.
        result.errors.push(`unhandled ${name} error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    result.errors.push(`unhandled error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Heartbeat row (db/migrations/017). Skipped on dry runs so a test call
  // can't pass for a real nightly run.
  if (!dryRun) {
    const loggedErrors = result.errors.map((e) => (e.length > 300 ? e.slice(0, 300) + "…" : e));
    const { error: runLogError } = await supabase.from("reminder_run_log").insert({
      sent: result.sent,
      skipped: result.skipped,
      error_count: result.errors.length,
      errors: loggedErrors,
    });
    if (runLogError) result.errors.push(`reminder_run_log insert failed: ${runLogError.message}`);
  }

  return new Response(JSON.stringify({ dryRun, ...result }), { headers: { "Content-Type": "application/json" } });
});
