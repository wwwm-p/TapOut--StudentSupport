// safe service worker — won’t break layout
self.addEventListener("install", () => { self.skipWaiting(); });
self.addEventListener("activate", () => { self.clients.claim(); });
self.addEventListener("fetch", event => { event.respondWith(fetch(event.request)); });
