// Authenticated Edge Function: returns a Stripe Billing Portal URL for
// the signed-in user's existing Customer -- see
// docs/subscriptions_plan.md Phase 3. This one link is the entire
// cancel/update-card/view-invoices UI; nothing else to build for it.
//
// Deployment: default JWT verification, same as create-checkout-session.
// Needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY
// secrets. (APP_BASE_URL already exists from Phase 5.)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17?target=deno";
import { corsHeaders } from "../_shared/cors.ts";
import { normalizeBaseUrl } from "../_shared/base_url.ts";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });
}

Deno.serve(async (req) => {
  // Browser preflight -- see create-checkout-session's copy of this same
  // comment for why this has to come before every other check.
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // See create-checkout-session's copy of this comment -- an uncaught
  // throw here would otherwise skip the json() helper (and its CORS
  // headers) entirely, which the browser reports as a generic failed
  // fetch rather than a readable error.
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const appBaseUrl = normalizeBaseUrl(Deno.env.get("APP_BASE_URL"));

    if (!supabaseUrl || !serviceKey || !stripeKey) {
      return json({ error: "Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or STRIPE_SECRET_KEY secret" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not signed in" }, 401);

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !user) return json({ error: "Not signed in" }, 401);

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sub?.stripe_customer_id) return json({ error: "No membership on file yet -- upgrade first." }, 404);

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20", httpClient: Stripe.createFetchHttpClient() });
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appBaseUrl}/account.html`,
    });

    return json({ url: portalSession.url });
  } catch (err) {
    // Logged here (Supabase's function logs), not returned to the caller --
    // see create-checkout-session's copy of this comment for why raw
    // exception text shouldn't be rendered straight into the page.
    console.error("create-portal-session failed:", err);
    return json({ error: "Something went wrong opening the billing portal. Please try again in a moment." }, 500);
  }
});
