// The nightly banking-reminder loop, with the database client and the email
// sender passed in -- index.ts supplies the real Supabase service client and
// Resend; tests/banking-reminder.test.js supplies fakes, so the whole path
// (opt-in, windows, ledger reads, dedup, failures) runs without real mail.
import { bankingReminderDecision, bankingReminderEmail, REMINDER_TYPES } from "./banking-reminder.js";

const isoDate = (ms) => new Date(ms).toISOString().slice(0, 10);

// supabase: a supabase-js client (service role). send({ to, subject, html })
// -> { ok, error? }. Returns { sent, skipped, errors, planned }.
// Error strings name ids, never email addresses (they're stored in the
// reminder_run_log heartbeat; see db/migrations/017).
export async function runBankingReminders({ supabase, send, today, appBaseUrl, unsubscribeBaseUrl, memberIds = null, dryRun = false }) {
  let sent = 0, skipped = 0;
  const errors = [], planned = [];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, reminder_opt_in, reminder_lead_days, reminder_unsubscribe_token")
    .eq("reminder_opt_in", true);
  if (profileError) throw new Error(`profiles query failed: ${profileError.message}`);

  for (const profile of profiles ?? []) {
    if (memberIds && !memberIds.has(profile.id)) { skipped++; continue; }
    const { data: contracts, error: contractError } = await supabase
      .from("contracts")
      .select("id, home_resort_id, use_year, nickname")
      .eq("user_id", profile.id)
      .eq("is_active", true);
    if (contractError) { errors.push(`contracts query failed for profile ${profile.id}: ${contractError.message}`); continue; }

    let email = null;
    for (const contract of contracts ?? []) {
      // Window check first, so the ledger is only read when an email could go out.
      const window = bankingReminderDecision({ useYear: contract.use_year, today, leadDays: profile.reminder_lead_days, row: null });
      if (window.action === "none") { skipped++; continue; }

      const { data: row, error: rowError } = await supabase
        .from("contract_year_points")
        .select("points_remaining, balance_confirmed_at")
        .eq("contract_id", contract.id)
        .eq("use_year_label", window.label)
        .maybeSingle();
      const decision = bankingReminderDecision({ useYear: contract.use_year, today, leadDays: profile.reminder_lead_days, row, rowError: !!rowError });
      if (decision.action === "error") { errors.push(`balance read failed for contract ${contract.id}: ${rowError?.message ?? "unknown"}`); continue; }
      if (decision.action === "none") { skipped++; continue; }

      const deadlineDate = isoDate(decision.deadlineMs);
      const type = decision.action === "bank" ? REMINDER_TYPES.banking : REMINDER_TYPES.check;
      const { data: prior, error: priorError } = await supabase
        .from("reminder_log")
        .select("reminder_type")
        .eq("contract_id", contract.id)
        .eq("deadline_date", deadlineDate)
        .in("reminder_type", [type, REMINDER_TYPES.legacy]);
      if (priorError) { errors.push(`reminder_log read failed for contract ${contract.id}: ${priorError.message}`); continue; }
      if ((prior ?? []).length) { skipped++; continue; }

      if (dryRun) { planned.push({ contract: contract.id, action: decision.action, deadline: deadlineDate }); continue; }

      if (!email) {
        const { data: userResp, error: userError } = await supabase.auth.admin.getUserById(profile.id);
        email = userResp?.user?.email ?? null;
        if (userError || !email) { errors.push(`no email for profile ${profile.id}: ${userError?.message ?? "unknown"}`); break; }
      }

      const { subject, html } = bankingReminderEmail(decision, {
        name: profile.display_name,
        contractLabel: contract.nickname || contract.home_resort_id,
        useYear: contract.use_year,
        appBaseUrl,
        unsubscribeLink: unsubscribeBaseUrl ? `${unsubscribeBaseUrl}?token=${profile.reminder_unsubscribe_token}` : null,
      });

      // Claim the log row BEFORE sending: with two cron invocations running
      // at once, the unique (contract_id, deadline_date, reminder_type)
      // constraint lets only one claim succeed, so the other can't send a
      // duplicate. A failed send releases the claim for tomorrow's retry.
      const { error: claimError } = await supabase.from("reminder_log").insert({
        user_id: profile.id, contract_id: contract.id, deadline_date: deadlineDate, reminder_type: type,
      });
      if (claimError) {
        if (claimError.code === "23505") skipped++;
        else errors.push(`reminder_log insert failed for contract ${contract.id}: ${claimError.message}`);
        continue;
      }
      const result = await send({ to: email, subject, html });
      if (!result.ok) {
        await supabase.from("reminder_log").delete().eq("contract_id", contract.id).eq("deadline_date", deadlineDate).eq("reminder_type", type);
        errors.push(`email send failed for profile ${profile.id} (contract ${contract.id}): ${String(result.error ?? "").slice(0, 200)}`);
        continue;
      }
      sent++;
    }
  }
  return { sent, skipped, errors, planned };
}
