const CACHE_NAME = "tapout-v2";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./page1.png",
  "./page2.png",
  "./page3.png",
  "./icons/icon-192-student.png",
  "./icons/icon-512-student.png"
];

// install
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// activate
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).catch(() => caches.match("./index.html"));
    })
  );
});
