// Push Notifications foundation (account.html's Notification Settings ->
// "Push Notifications" toggle registers this). There's no send-side backend
// deployed yet -- this just handles a push event WHEN one eventually
// arrives, mirroring the shape send-banking-reminders/ would need to POST
// (a JSON body with title/body/url), and click-through to the app.
//
// Deliberately does nothing else: no caching, no offline support. This
// isn't an offline-first PWA, just a push endpoint.

self.addEventListener("push", (event) => {
  let payload = { title: "DVC Companion", body: "You have a new notification." };
  if (event.data) {
    try { payload = { ...payload, ...event.data.json() }; } catch { payload.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || undefined,
      data: { url: payload.url || "/account.html" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/account.html";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(url) && "focus" in c);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

// Pure network pass-through -- NOT caching or offline support (this is
// still not an offline-first PWA, see the file comment above). Chrome/
// Android's "Add to Home Screen" install criteria require a registered
// service worker with a fetch listener before it'll treat the site as
// installable at all; every request here just goes straight to the
// network, identical to what would happen with no service worker.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
