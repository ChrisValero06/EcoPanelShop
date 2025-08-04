const CacheKeyShop = "Shop-v1.0.0";
const appShell = [
  './',
  './index.html',
  './contacto.html',
  './css/styles.css',
  './css/login-styles.css',
  './js/app.js',
  './js/script.js',
  './js/contacto.js',
  './js/Firebase-config.js',
  './js/notification-config.js',
  './manifest.json',
  './icons/icon-512.png',
];

// Instalación del Service Worker
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(CacheKeyShop).then(cache => {
      return cache.addAll(appShell);
    })
  );
});

// Activación del Service Worker
self.addEventListener("activate", activateEvent => {
  activateEvent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CacheKeyShop) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar peticiones de red
self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received.');
  
  event.notification.close();
  
  // Abrir la aplicación cuando se hace clic en la notificación
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Manejar notificaciones cerradas
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event.notification.tag);
});

// Manejar mensajes del cliente
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Manejar solicitudes de notificación desde el cliente
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Función para mostrar notificación desde el Service Worker
function showNotificationFromSW(title, options = {}) {
  const defaultOptions = {
    icon: '/icons/icon-512.png',
    badge: '/icons/icon-512.png',
    tag: 'sw-notification',
    requireInteraction: true,
    ...options
  };
  
  return self.registration.showNotification(title, defaultOptions);
}

// Función para programar notificación
function scheduleNotification(title, options = {}, delay = 5000) {
  setTimeout(() => {
    showNotificationFromSW(title, options);
  }, delay);
}
