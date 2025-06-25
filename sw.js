
const CACHE_NAME = 'ecoshop-v1.0.0';


const appShell = [
  '/',
  '/index.html',
  '/login.html',
  '/css/styles.css',
  '/js/app.js',
  '/css/login-styles.css',
  '/js/firebase-config.js',
  '/js/firebase-auth.js',
  '/js/firebase-inventory.js',
  '/js/login-app.js',
  '/manifest.json',
  '/favicon.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js'
];

const appCacheKey = "EcoShop-v1"; 


self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(appCacheKey).then(cache => {
      cache.addAll(appShell);
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

  );
});
