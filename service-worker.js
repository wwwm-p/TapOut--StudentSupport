const CACHE_NAME="tapout-student-v1";
const ASSETS=[
  "/","/index.html","/style.css","/page1.png","/page2.png","/page3.png",
  "/student-manifest.json","/icons/icon-192-student.png","/icons/icon-512-student.png"
];

self.addEventListener("install", e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener("activate", e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME?caches.delete(k):null))));self.clients.claim();});
self.addEventListener("fetch", e=>{
  if(e.request.mode==="navigate"){e.respondWith(fetch(e.request).catch(()=>caches.match("/")));} 
  else{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));}
});
