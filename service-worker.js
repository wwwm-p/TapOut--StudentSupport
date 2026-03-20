const CACHE_NAME = "student-support-v2";

const ASSETS_TO_CACHE = [
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

// =======================
// INSTALL (SAFE)
// =======================
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
          console.log("[SW] Cached:", asset);
        } catch (err) {
          console.warn("[SW] Failed to cache:", asset);
        }
      }
    })
  );

  self.skipWaiting();
});

// =======================
// ACTIVATE
// =======================
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// =======================
// FETCH (SAFE CACHE FIRST)
// =======================
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Only cache valid responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Offline fallback for navigation
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
