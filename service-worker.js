const CACHE_NAME = "tapout-student-v2";
const ASSETS_TO_CACHE = [
  "/index.html",
  "/student-manifest.json",
  "/service-worker.js",
  "/style.css",
  "/page1.png",
  "/page2.png",
  "/page3.png",
  "/icons/icon-192-student.png",
  "/icons/icon-512-student.png"
];

self.addEventListener("install", event => {
  console.log("[SW] Installing student PWA...");
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("[SW] Activating student PWA...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          if (event.request.method === "GET") {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") return caches.match("/index.html");
        });
    })
  );
});
