
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
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(odsquiz).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== odsquiz) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
    })
  );
});
