// Authenticated Edge Function: creates (or reuses) a Stripe Customer for
// the signed-in user and returns a Checkout Session URL for the "Active
// Member" annual membership -- see docs/subscriptions_plan.md Phase 3.
// The frontend (account.html, via auth.js's subscribeToMembership())
// just redirects window.location to the returned url; Stripe hosts the
// entire payment form.
//
// Deployment: default JWT verification (NOT --no-verify-jwt, unlike
// unsubscribe-reminders) -- the gateway rejects unauthenticated calls
// before this code even runs, and getUser() below reads the caller's own
// identity from that same JWT. Needs SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_PRICE_ID secrets.
// (APP_BASE_URL already exists from Phase 5.)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17?target=deno";
import { corsHeaders } from "../_shared/cors.ts";
import { normalizeBaseUrl } from "../_shared/base_url.ts";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });
}

Deno.serve(async (req) => {
  // Browser preflight -- supabase.functions.invoke() triggers this before
  // the real POST since the call carries an Authorization header. Must be
  // answered before any other check or the real request never gets sent.
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Any uncaught throw below (a malformed Stripe key, a bad price id, a
  // Postgres error) would otherwise skip the json() helper entirely and
  // return Deno's own error page with no CORS headers on it -- which the
  // browser reports as a generic failed fetch, not a readable error. This
  // catch-all is what turns that into an actual {error} the frontend (and
  // whoever's debugging it) can read.
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const priceId = Deno.env.get("STRIPE_PRICE_ID");
    const appBaseUrl = normalizeBaseUrl(Deno.env.get("APP_BASE_URL"));

    if (!supabaseUrl || !serviceKey || !stripeKey || !priceId) {
      return json({ error: "Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, or STRIPE_PRICE_ID secret" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not signed in" }, 401);

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !user || !user.email) return json({ error: "Not signed in" }, 401);

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20", httpClient: Stripe.createFetchHttpClient() });

    // Reuse an existing Stripe Customer if this user already has one on file
    // (e.g. a prior canceled membership) -- keeps their invoice history under
    // one Customer instead of fragmenting across resubscribes.
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existing?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      // Row the webhook will fill in fully once checkout.session.completed
      // fires -- recorded now so a Customer never exists in Stripe without a
      // corresponding row here to attach it back to this user.
      await supabase.from("subscriptions").upsert(
        { user_id: user.id, stripe_customer_id: customerId, status: "incomplete" },
        { onConflict: "user_id" },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: `${appBaseUrl}/account.html?checkout=success`,
      cancel_url: `${appBaseUrl}/account.html?checkout=cancelled`,
      metadata: { supabase_user_id: user.id },
      // Stripe enables Managed Payments by default on new accounts, which
      // requires every line item's underlying Product to carry an eligible
      // digital-goods tax code (set in the Stripe Dashboard or via the
      // Products API) -- without one, session creation fails with "Invalid
      // line_items[0]: the product tax code is missing." STRIPE_PRICE_ID's
      // Product has no tax code set, so this opts this session out of
      // Managed Payments entirely (Stripe's own documented escape hatch)
      // rather than requiring a Dashboard change before checkout works at
      // all. If a tax code is later set on the Product (this membership is
      // plausibly SaaS, txcd_10103001/10103000), this line can come out to
      // let Stripe act as merchant of record again.
      managed_payments: { enabled: false },
    });

    return json({ url: session.url });
  } catch (err) {
    // Logged here (Supabase's function logs), not returned to the caller --
    // the raw exception text can be an internal Stripe/Postgres error (e.g.
    // a misconfigured Price's missing tax code, complete with a Dashboard
    // URL for this exact account) that has no business being rendered
    // straight into the page for whoever clicked "Upgrade."
    console.error("create-checkout-session failed:", err);
    return json({ error: "Something went wrong starting checkout. Please try again in a moment." }, 500);
  }
});
