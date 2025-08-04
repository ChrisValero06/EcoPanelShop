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
  './manifest.json',
  './icons/icon-512.png',
];

// Importar Firebase Messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuración de Firebase (debe coincidir con la configuración del cliente)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
  databaseURL: "TU_DATABASE_URL"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener instancia de messaging
const messaging = firebase.messaging();

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

// Manejar notificaciones push en segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'EcoPanelShop';
  const notificationOptions = {
    body: payload.notification.body || 'Tienes una nueva notificación',
    icon: payload.notification.icon || '/icons/icon-512.png',
    badge: '/icons/icon-512.png',
    tag: 'background-notification',
    requireInteraction: true,
    data: payload.data || {}
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
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
});
