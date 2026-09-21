// Shared CORS headers for Edge Functions called directly from the browser
// (account.html via supabase.functions.invoke()) -- Supabase doesn't add
// these automatically, and without them the browser's preflight OPTIONS
// request fails before the function's own code ever runs, surfacing as
// supabase-js's generic "Failed to send a request to the Edge Function".
// Not needed by stripe-webhook or the Phase 5 functions -- those are only
// ever called server-to-server (Stripe, pg_cron, a plain email link), never
// from a browser fetch() across origins.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
