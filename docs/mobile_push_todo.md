# To do: mobile push notifications

Status: planned, not implemented. Added September 22, 2026 after UX-08.

Email reminders and in-app banners already exist. Mobile push delivery is a separate feature. Notification Settings currently shows **Unavailable** because this build has no configured push sender.

- [ ] Define which owner events trigger push, including banking deadlines and point expiry, with owner preferences, lead times, and timezone handling.
- [ ] Implement authenticated device enrollment and removal, allowing multiple devices per owner. Keep server credentials private and validate subscription ownership.
- [ ] Build and deploy the sending service and schedule. Include duplicate-send protection, retries, expired-subscription cleanup, and delivery diagnostics.
- [ ] Add mobile permission/setup flows for supported browsers and installed apps, with clear guidance for unsupported, denied, and incomplete setup states.
- [ ] Replace Unavailable only when the sender is operational and this device has completed enrollment. Provide a test notification and honest success/failure feedback.
- [ ] Handle sign-out, account deletion, opt-out, and device/account changes without delivering another owner's reminders.
- [ ] Verify on physical iOS and Android devices, including the app being closed, notification tap-through, denied permission, offline recovery, and disabled preferences.

Before implementation, verify current platform requirements using official documentation. Existing starting points: `account.html`, `service-worker.js`, `auth.js`, migration 011, and the email reminder functions under `supabase/functions/`. A granted browser permission or stored pending flag alone must never be presented as working delivery.
