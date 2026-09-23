// Public, no-login unsubscribe endpoint for reminder emails -- a CAN-SPAM/
// GDPR expectation that the in-app toggle alone doesn't satisfy, since it
// requires being signed in. Deploy with --no-verify-jwt (see
// docs/phase5_deployment.md) so a reminder email's plain link works
// without an Authorization header.
//
// GET /unsubscribe-reminders?token=<profiles.reminder_unsubscribe_token>[&type=]
//   type=banking (or absent -- every link sent before Prompt 3): banking
//   deadline reminders; type=expiration / type=holding: those opt-in
//   reminders (migration 026); type=all: every reminder email.
const TYPES: Record<string, { columns: string[]; what: string }> = {
  banking: { columns: ["reminder_opt_in"], what: "banking deadline reminder emails" },
  expiration: { columns: ["expiration_reminder_opt_in"], what: "use-year expiration reminder emails" },
  holding: { columns: ["holding_reminder_opt_in"], what: "Holding point reminder emails" },
  all: { columns: ["reminder_opt_in", "expiration_reminder_opt_in", "holding_reminder_opt_in"], what: "all DVC Companion reminder emails" },
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function page(message: string): Response {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DVC Companion Reminders</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 60px auto; padding: 0 20px; text-align: center; color: #333;">
  <h2 style="color: #4a148c;">DVC Companion Reminders</h2>
  <p>${message}</p>
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) return page("Missing unsubscribe link parameter -- nothing to unsubscribe.");
  const type = TYPES[url.searchParams.get("type") ?? "banking"];
  if (!type) return page("That unsubscribe link isn't recognized -- nothing was changed.");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return page("Something's misconfigured on our end -- this link isn't working right now.");
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase
    .from("profiles")
    .update(Object.fromEntries(type.columns.map((c) => [c, false])))
    .eq("reminder_unsubscribe_token", token)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return page("We couldn't find that reminder subscription -- it may already be unsubscribed.");
  }

  return page(`You've been unsubscribed from ${type.what}. You can re-enable them anytime from My Contracts.`);
});
