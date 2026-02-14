const CACHE_NAME = "aquahills-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/login.html",
  "/order.html",
  "/orders.html",
  "/admin.html",
  "/address.html",
  "/css/style.css",
  "/js/firebase.js",
  "/assets/logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
