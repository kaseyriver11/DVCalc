// APP_BASE_URL feeds directly into Stripe's success_url/cancel_url/
// return_url params, which Stripe validates as absolute URLs -- a scheme-
// less or empty value (e.g. "dvccompanion.com" instead of
// "https://dvccompanion.com", or the secret simply unset) throws deep
// inside the Stripe SDK with a generic "Invalid URL: An explicit scheme
// (such as https) must be provided", which is hard to trace back to this
// one env var. Normalizing it here means a misconfigured secret degrades
// to *something* that still works (an https:// URL) rather than crashing
// the whole request.
export function normalizeBaseUrl(raw: string | undefined): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "https://your-app-domain.example.com";
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withScheme.replace(/\/+$/, "");
}
