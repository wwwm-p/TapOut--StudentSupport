const CACHE_NAME = "tapout-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/page1.png",
  "/page2.png",
  "/page3.png",
  "/icons/icon-192-student.png",
  "/icons/icon-512-student.png"
];

// INSTALL → cache core files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATE → clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH → cache-first, network fallback
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).catch(() => {
        // fallback if offline and request fails
        return caches.match("/index.html");
      });
    })
  );
});
