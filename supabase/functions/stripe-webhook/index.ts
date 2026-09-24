// Public webhook receiver for Stripe subscription lifecycle events -- see
// docs/subscriptions_plan.md Phase 3. Deploy with --no-verify-jwt (like
// unsubscribe-reminders) since Stripe can't send a Supabase Authorization
// header; the Stripe-Signature check below is what actually authenticates
// the caller as Stripe (critical -- without it anyone could POST a fake
// "payment succeeded").
//
// Register this function's deployed URL in the Stripe Dashboard
// (Developers -> Webhooks -> Add endpoint), select at least the 4 events
// handled below, and copy the signing secret it gives you into
// STRIPE_WEBHOOK_SECRET. Also needs SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY.
//
// This is the ONLY writer of the subscriptions table (service role,
// bypasses RLS by design -- see db/schema.sql).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17?target=deno";

// deno-lint-ignore no-explicit-any
type SupabaseClient = any;

// Upserts the subscriptions row for a Stripe Subscription object. userId
// comes from Checkout Session metadata on first activation; every later
// event (renewal, cancellation, etc.) has no metadata of its own, so it's
// looked up by stripe_customer_id instead -- the row created at checkout
// time is what makes that lookup possible.
async function upsertFromSubscription(supabase: SupabaseClient, sub: Stripe.Subscription, fallbackUserId?: string) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const { data: row } = await supabase
    .from("subscriptions")
    .select("user_id, stripe_subscription_id, status")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  const userId = fallbackUserId ?? row?.user_id;
  if (!userId) return; // No known mapping yet -- nothing to attach this event to.
  // The row tracks one subscription. Events for a different one (e.g. an
  // older subscription winding down) can't overwrite a membership that's
  // still live; they only take over once the one on file has ended.
  if (row?.stripe_subscription_id && row.stripe_subscription_id !== sub.id && LIVE_STATUSES.has(row.status)) return;

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      price_id: sub.items?.data?.[0]?.price?.id ?? null,
      // current_period_end moved off the top-level Subscription object onto
      // each subscription item in recent Stripe API versions (there's one
      // membership item per subscription here, so [0] is always the right
      // one) -- sub.current_period_end is always undefined now, which
      // silently stored null and made the Membership card fall back to a
      // vaguer "trial in progress" message instead of a real renewal date.
      // The retrieve() below still uses this file's older pinned version,
      // where the date is top-level, so read both places.
      current_period_end: periodEnd(sub),
      cancel_at_period_end: Boolean(sub.cancel_at_period_end),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

const LIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

// Which subscription an invoice bills: top-level before 2025-03-31.basil,
// under parent.subscription_details after.
// deno-lint-ignore no-explicit-any
function invoiceSubscriptionId(invoice: any): string | null {
  const s = invoice.parent?.subscription_details?.subscription ?? invoice.subscription;
  return typeof s === "string" ? s : s?.id ?? null;
}

// deno-lint-ignore no-explicit-any
function periodEnd(sub: any): string | null {
  const seconds = sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end;
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!supabaseUrl || !serviceKey || !stripeKey || !webhookSecret) {
    return new Response("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, or STRIPE_WEBHOOK_SECRET secret", { status: 500 });
  }

  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();
  if (!signature) return new Response("Missing Stripe-Signature header", { status: 400 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20", httpClient: Stripe.createFetchHttpClient() });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, Stripe.createSubtleCryptoProvider());
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (session.subscription) {
        const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertFromSubscription(supabase, sub, userId);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      await upsertFromSubscription(supabase, event.data.object as Stripe.Subscription);
      break;
    }
    case "customer.subscription.deleted": {
      // Only the subscription on file: ending an older one mustn't cancel
      // the membership that replaced it.
      const sub = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      // Stripe auto-retries a few times before actually canceling -- see
      // docs/subscriptions_plan.md Phase 7 for a possible grace period
      // before this status would ever gate a feature off.
      const subId = invoiceSubscriptionId(invoice);
      if (subId) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subId);
      } else if (customerId) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
});
