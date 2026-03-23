const CACHE_NAME = "tapout-student-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/page1.png",
  "/page2.png",
  "/page3.png",
  "/student-manifest.json",
  "/icons/icon-192-student.png",
  "/icons/icon-512-student.png"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))
    )
  );
  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", event => {
  if(event.request.mode === "navigate"){
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/"))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(res => res || fetch(event.request))
    );
  }
});
