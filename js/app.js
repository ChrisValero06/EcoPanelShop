if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./serviceWorker.js', { scope: './' })
    .then(() => console.log('Service Worker registrado'))
    .catch(err => console.error('Error al registrar el Service Worker:', err));
}

// Inicializar gestor de notificaciones
function initializeNotifications() {
  if (window.notificationManager) {
    console.log('Gestor de notificaciones inicializado');
    
    // Mostrar notificación de bienvenida si los permisos están concedidos
    if (window.notificationManager.canShowNotifications()) {
      setTimeout(() => {
        window.notificationManager.showWelcomeNotification();
      }, 3000);
    }
  }
}

// Leer paneles solares desde Firebase Realtime Database y mostrarlos en consola
function cargarPaneles() {
  if (typeof database !== 'undefined') {
    database.ref("paneles").once('value')
      .then((snapshot) => {
        const paneles = snapshot.val();
        if (paneles) {
          Object.keys(paneles).forEach((key) => {
            console.log("Panel:", key, paneles[key]);
          });
        } else {
          console.log("No hay paneles registrados");
        }
      })
      .catch((error) => {
        console.error("Error al leer paneles:", error);
      });
  } else {
    console.warn("Firebase Realtime Database no está inicializado. Verifica tu configuración de Firebase.");
  }
}

// Mostrar paneles solares en la sección de productos
function mostrarPanelesEnProductos() {
  if (typeof database !== 'undefined') {
    database.ref("paneles").once('value')
      .then((snapshot) => {
        const productsGrid = document.getElementById("productsGrid");
        if (!productsGrid) return; // Si no existe el elemento, salir
        
        productsGrid.innerHTML = ""; // Limpia el grid

        const paneles = snapshot.val();
        if (!paneles) {
          productsGrid.innerHTML = "<p>No hay paneles registrados.</p>";
          return;
        }

        Object.keys(paneles).forEach((key) => {
          const panel = paneles[key];
          // cada campo varia segun la estructura
          const panelHTML = `
            <div class="product-card">
              <div class="product-image">
                <img src="${panel.imagen || 'https://via.placeholder.com/350x250?text=Panel+Solar'}" alt="${panel.nombre || 'Panel Solar'}">
              </div>
              <div class="product-info">
                <h3>${panel.nombre || 'Panel Solar'}</h3>
                <div class="product-specs">
                  <span>Potencia: ${panel.potencia || 'N/A'} W</span>
                  <span>Ubicación: ${panel.ubicacion || 'N/A'}</span>
                </div>
                <p>${panel.descripcion || ''}</p>
                <div class="product-price">
                  <span class="current-price">$${panel.precio || '0.00'}</span>
                </div>
              </div>
            </div>
          `;
          productsGrid.innerHTML += panelHTML;
        });
        
        // Mostrar notificación de productos cargados
        if (window.notificationManager && window.notificationManager.canShowNotifications()) {
          window.notificationManager.showNotification(
            'Productos cargados',
            `Se han cargado ${Object.keys(paneles).length} paneles solares disponibles.`
          );
        }
      })
      .catch((error) => {
        console.error("Error al leer paneles:", error);
        const productsGrid = document.getElementById("productsGrid");
        if (productsGrid) {
          productsGrid.innerHTML = "<p>Error al cargar los paneles.</p>";
        }
      });
  }
}

// Función de inicialización
function inicializarApp() {
  console.log('Inicializando aplicación...');
  
  // Verificar que Firebase esté disponible para los paneles solares
  if (typeof firebase === 'undefined') {
    console.error('Firebase no está disponible para cargar paneles solares');
    return;
  }
  
  // Verificar que Realtime Database esté disponible
  if (typeof database === 'undefined') {
    console.error('Firebase Realtime Database no está inicializado');
    return;
  }
  
  console.log('Firebase Realtime Database está listo para cargar paneles solares');
  
  // Inicializar notificaciones locales
  initializeNotifications();
  
  // Cargar paneles solares desde Firebase (registrados desde app móvil Maui)
  cargarPaneles();
  mostrarPanelesEnProductos();
}

// Llama a la función al cargar la página:
document.addEventListener('DOMContentLoaded', function() {
  // Esperar un poco para asegurar que Firebase esté inicializado
  setTimeout(() => {
    inicializarApp();
  }, 1000);
});

// También intentar inicializar cuando la ventana esté completamente cargada
window.addEventListener('load', function() {
  setTimeout(() => {
    if (typeof database === 'undefined') {
      inicializarApp();
    }
  }, 2000);
});
