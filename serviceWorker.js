const CacheKeyShop = "Shop-v1.0.0";
const appShell = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/app.js',
  '/js/script.js',
  '/manifest.json',
  '/icons/icon-512.png',
];
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(CacheKeyShop).then(cache => {
      return cache.addAll(appShell);
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});
