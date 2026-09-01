/**
 * VRB Room Rental — the service worker.
 *
 * It exists for one reason: a notification cannot be delivered to a page that
 * is closed, and only a service worker is awake when the app is not. It does
 * not cache the app or stand between it and Google — the dashboard is live
 * data and a stale copy of it would be worse than no copy.
 *
 * It has to live here, on dashboard.vrbroomrental.com, rather than inside the
 * app: the app is served by Apps Script into a cross-origin frame, and a frame
 * cannot register a worker. This is the origin we own, which is why the phone's
 * home-screen icon points at it.
 */

// A new worker should take over at once rather than waiting for every tab to
// close — there is only ever one tab, and it is the home-screen app.
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  // What arrives is counts, never names or amounts — this is read off a lock
  // screen by whoever is holding the phone. If it ever arrives empty, say the
  // least useful true thing rather than nothing, because a push that shows no
  // notification costs the app its permission on iOS.
  let data = { title: 'VRB Room Rental', body: 'Open the dashboard.', url: '/' };
  try { if (event.data) data = Object.assign(data, event.data.json()); } catch (e) { /* keep the default */ }

  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/images/icon-ios.png',
    badge: '/images/icon-maskable.png',
    // One reminder at a time: today's replaces yesterday's rather than stacking
    // up a column of them nobody reads.
    tag: 'vrb-daily',
    renotify: true,
    data: { url: data.url || '/' }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of open) {
      // Already running — bring it forward rather than opening a second copy.
      if (c.url.startsWith(self.registration.scope) && 'focus' in c) return c.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow(url);
  })());
});
