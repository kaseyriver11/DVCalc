// The nightly use-year-expiration and Holding reminder loop (Prompt 3),
// same shape as banking-reminder-run.js: the database client and the email
// sender are passed in, so tests/point-reminders.test.js runs the whole path
// (opt-ins, windows, ledger reads, dedup, failures) against a fake Supabase.
import { pointReminderDecisions, pointReminderEmail, anyPointReminderWindow } from "./point-reminders.js";
import { currentUseYearLabel } from "./banking-reminder.js";

const isoDate = (ms) => new Date(ms).toISOString().slice(0, 10);
const PROFILE_COLUMNS = "id, display_name, reminder_unsubscribe_token, expiration_reminder_opt_in, expiration_reminder_lead_days, holding_reminder_opt_in, holding_reminder_lead_days";
const UNSUBSCRIBE_TYPE = { expiration: "expiration", expirationCheck: "expiration", holding: "holding" };

// Returns { sent, skipped, errors, planned }. Error strings name ids, never
// email addresses (they land in the reminder_run_log heartbeat).
export async function runPointReminders({ supabase, send, today, appBaseUrl, unsubscribeBaseUrl, memberIds = null, dryRun = false }) {
  let sent = 0, skipped = 0;
  const errors = [], planned = [];

  // Two plain queries rather than an OR filter: either opt-in qualifies.
  const byId = new Map();
  for (const column of ["expiration_reminder_opt_in", "holding_reminder_opt_in"]) {
    const { data, error } = await supabase.from("profiles").select(PROFILE_COLUMNS).eq(column, true);
    if (error) throw new Error(`profiles query failed (${column}): ${error.message}`);
    for (const p of data ?? []) byId.set(p.id, p);
  }

  for (const profile of byId.values()) {
    if (memberIds && !memberIds.has(profile.id)) { skipped++; continue; }
    const prefs = {
      expiration: profile.expiration_reminder_opt_in ? profile.expiration_reminder_lead_days : null,
      holding: profile.holding_reminder_opt_in ? profile.holding_reminder_lead_days : null,
    };
    const { data: contracts, error: contractError } = await supabase
      .from("contracts")
      .select("id, home_resort_id, use_year, nickname")
      .eq("user_id", profile.id)
      .eq("is_active", true);
    if (contractError) { errors.push(`contracts query failed for profile ${profile.id}: ${contractError.message}`); continue; }

    let email = null;
    for (const contract of contracts ?? []) {
      // Window check first, so the ledger is only read when an email could go out.
      if (!anyPointReminderWindow({ useYear: contract.use_year, today, prefs })) { skipped++; continue; }
      const label = currentUseYearLabel(contract.use_year, today);
      const { data: row, error: rowError } = await supabase
        .from("contract_year_points")
        .select("points_remaining, points_banked, points_borrowed, points_holding, balance_confirmed_at")
        .eq("contract_id", contract.id)
        .eq("use_year_label", label)
        .maybeSingle();
      const decisions = pointReminderDecisions({ useYear: contract.use_year, today, prefs, row, rowError: !!rowError });
      if (decisions.some((d) => d.kind === "error")) { errors.push(`balance read failed for contract ${contract.id}: ${rowError?.message ?? "unknown"}`); continue; }
      if (!decisions.length) { skipped++; continue; }

      for (const decision of decisions) {
        const deadlineDate = isoDate(decision.endMs);
        const { data: prior, error: priorError } = await supabase
          .from("reminder_log")
          .select("reminder_type")
          .eq("contract_id", contract.id)
          .eq("deadline_date", deadlineDate)
          .eq("reminder_type", decision.type);
        if (priorError) { errors.push(`reminder_log read failed for contract ${contract.id}: ${priorError.message}`); continue; }
        if ((prior ?? []).length) { skipped++; continue; }

        if (dryRun) { planned.push({ contract: contract.id, action: decision.kind, deadline: deadlineDate }); continue; }

        if (!email) {
          const { data: userResp, error: userError } = await supabase.auth.admin.getUserById(profile.id);
          email = userResp?.user?.email ?? null;
          if (userError || !email) { errors.push(`no email for profile ${profile.id}: ${userError?.message ?? "unknown"}`); break; }
        }

        const { subject, html } = pointReminderEmail(decision, {
          name: profile.display_name,
          contractLabel: contract.nickname || contract.home_resort_id,
          useYear: contract.use_year,
          links: {
            balance: `${appBaseUrl}/account.html?contract=${encodeURIComponent(contract.id)}&year=${decision.label}`,
            unsubscribe: unsubscribeBaseUrl ? `${unsubscribeBaseUrl}?token=${profile.reminder_unsubscribe_token}&type=${UNSUBSCRIBE_TYPE[decision.kind]}` : null,
          },
        });

        // Claim before sending (unique contract_id/deadline_date/reminder_type),
        // so concurrent runs can't double-send; a failed send releases it.
        const { error: claimError } = await supabase.from("reminder_log").insert({
          user_id: profile.id, contract_id: contract.id, deadline_date: deadlineDate, reminder_type: decision.type,
        });
        if (claimError) {
          if (claimError.code === "23505") skipped++;
          else errors.push(`reminder_log insert failed for contract ${contract.id}: ${claimError.message}`);
          continue;
        }
        const result = await send({ to: email, subject, html });
        if (!result.ok) {
          await supabase.from("reminder_log").delete().eq("contract_id", contract.id).eq("deadline_date", deadlineDate).eq("reminder_type", decision.type);
          errors.push(`email send failed for profile ${profile.id} (contract ${contract.id}): ${String(result.error ?? "").slice(0, 200)}`);
          continue;
        }
        sent++;
      }
      if (!email && !dryRun && errors.at(-1)?.startsWith(`no email for profile ${profile.id}`)) break;
    }
  }
  return { sent, skipped, errors, planned };
}
