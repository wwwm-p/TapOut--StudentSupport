const CACHE_NAME = "tapout-student-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./page1.png",
  "./page2.png",
  "./page3.png",
  "./student-manifest.json",
  "./icons/icon-192-student.png",
  "./icons/icon-512-student.png"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

/* FETCH (offline fallback) */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request);
    })
  );
});
