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
  if (window.panelesService) {
    window.panelesService.obtenerPaneles()
      .then((paneles) => {
        if (paneles && Object.keys(paneles).length > 0) {
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
    console.warn("Servicio de paneles no está disponible. Verifica tu configuración de Firebase.");
  }
}

// Mostrar paneles solares en la sección de productos
async function mostrarPanelesEnProductos() {
  const productsGrid = document.getElementById("productsGrid");
  if (!productsGrid) return;
  
  // Mostrar loading
  productsGrid.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Cargando productos desde Firebase...</p>
    </div>
  `;
  
  try {
    if (window.panelesService) {
      const paneles = await window.panelesService.obtenerPaneles();
      
      if (paneles && Object.keys(paneles).length > 0) {
        productsGrid.innerHTML = ""; // Limpia el grid
        
        Object.keys(paneles).forEach((key) => {
          const panel = paneles[key];
          const panelHTML = `
            <div class="product-card" data-panel-id="${key}">
              <div class="product-image">
                <img src="${panel.imagen || 'https://via.placeholder.com/350x250?text=Panel+Solar'}" alt="${panel.nombre || 'Panel Solar'}">
                ${!panel.disponible ? '<div class="out-of-stock">Agotado</div>' : ''}
              </div>
              <div class="product-info">
                <h3>${panel.nombre || 'Panel Solar'}</h3>
                <div class="product-specs">
                  <span><i class="fas fa-bolt"></i> Potencia: ${panel.potencia || 'N/A'} W</span>
                  <span><i class="fas fa-tag"></i> Categoría: ${panel.categoria || 'N/A'}</span>
                  <span><i class="fas fa-ruler-combined"></i> Dimensiones: ${panel.dimensiones || 'N/A'}</span>
                  <span><i class="fas fa-boxes"></i> Stock: ${panel.stock || '0'}</span>
                </div>
                <p>${panel.descripcion || 'Sin descripción disponible'}</p>
                <div class="product-price">
                  <span class="current-price">$${parseFloat(panel.precio || 0).toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                </div>
                <button class="btn-add-cart" onclick="addToCart('${key}', '${panel.nombre}', ${panel.precio || 0})" ${!panel.disponible || panel.stock <= 0 ? 'disabled' : ''}>
                  <i class="fas fa-shopping-cart"></i> 
                  ${!panel.disponible || panel.stock <= 0 ? 'Agotado' : 'Agregar al Carrito'}
                </button>
              </div>
            </div>
          `;
          productsGrid.innerHTML += panelHTML;
        });
        
        // Mostrar notificación de productos cargados
        if (window.notificationManager && window.notificationManager.canShowNotifications()) {
          window.notificationManager.showNotification(
            'Productos cargados',
            `Se han cargado ${Object.keys(paneles).length} paneles solares desde Firebase.`
          );
        }
      } else {
        // Si no hay paneles en Firebase, mostrar paneles de muestra
        mostrarPanelesDeMuestra();
      }
    } else {
      // Fallback a paneles de muestra si el servicio no está disponible
      mostrarPanelesDeMuestra();
    }
  } catch (error) {
    console.error("Error al cargar paneles:", error);
    // Mostrar paneles de muestra en caso de error
    mostrarPanelesDeMuestra();
  }
}

// Función para mostrar paneles solares de muestra
function mostrarPanelesDeMuestra() {
  const productsGrid = document.getElementById("productsGrid");
  if (!productsGrid) return;
  
  const panelesMuestra = [
    {
      nombre: "Panel Solar Monocristalino 400W",
      potencia: "400",
      categoria: "Residencial",
      descripcion: "Panel solar de alta eficiencia ideal para hogares. Tecnología monocristalina con 25 años de garantía.",
      precio: "8500.00",
      stock: "15",
      disponible: true,
      dimensiones: "1650 x 992 x 35 mm",
      imagen: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      nombre: "Panel Solar Policristalino 350W",
      potencia: "350",
      categoria: "Comercial",
      descripcion: "Panel policristalino perfecto para instalaciones comerciales. Excelente relación calidad-precio.",
      precio: "6200.00",
      stock: "8",
      disponible: true,
      dimensiones: "1580 x 808 x 35 mm",
      imagen: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      nombre: "Panel Solar Bifacial 450W",
      potencia: "450",
      categoria: "Industrial",
      descripcion: "Panel bifacial de última generación. Captura energía por ambas caras para máxima eficiencia.",
      precio: "12800.00",
      stock: "5",
      disponible: true,
      dimensiones: "1765 x 1048 x 35 mm",
      imagen: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      nombre: "Panel Solar Flexible 200W",
      potencia: "200",
      categoria: "Móvil",
      descripcion: "Panel solar flexible para aplicaciones móviles y superficies curvas. Ideal para caravanas y barcos.",
      precio: "4500.00",
      stock: "0",
      disponible: false,
      dimensiones: "1200 x 600 x 2 mm",
      imagen: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      nombre: "Panel Solar Premium 500W",
      potencia: "500",
      categoria: "Premium",
      descripcion: "Panel solar premium con la más alta eficiencia del mercado. Garantía extendida de 30 años.",
      precio: "15900.00",
      stock: "3",
      disponible: true,
      dimensiones: "1850 x 1100 x 35 mm",
      imagen: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      nombre: "Panel Solar Residencial 300W",
      potencia: "300",
      categoria: "Residencial",
      descripcion: "Panel solar compacto perfecto para techos residenciales. Fácil instalación y mantenimiento.",
      precio: "5800.00",
      stock: "12",
      disponible: true,
      dimensiones: "1480 x 670 x 35 mm",
      imagen: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
  ];
  
  productsGrid.innerHTML = ""; // Limpia el grid
  
  panelesMuestra.forEach((panel, index) => {
    const panelHTML = `
      <div class="product-card" data-panel-id="muestra-${index}">
        <div class="product-image">
          <img src="${panel.imagen}" alt="${panel.nombre}">
          ${!panel.disponible ? '<div class="out-of-stock">Agotado</div>' : ''}
        </div>
        <div class="product-info">
          <h3>${panel.nombre}</h3>
          <div class="product-specs">
            <span><i class="fas fa-bolt"></i> Potencia: ${panel.potencia} W</span>
            <span><i class="fas fa-tag"></i> Categoría: ${panel.categoria}</span>
            <span><i class="fas fa-ruler-combined"></i> Dimensiones: ${panel.dimensiones}</span>
            <span><i class="fas fa-boxes"></i> Stock: ${panel.stock}</span>
          </div>
          <p>${panel.descripcion}</p>
          <div class="product-price">
            <span class="current-price">$${parseFloat(panel.precio).toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
          </div>
          <button class="btn-add-cart" onclick="addToCart('muestra-${index}', '${panel.nombre}', ${panel.precio})" ${!panel.disponible || panel.stock <= 0 ? 'disabled' : ''}>
            <i class="fas fa-shopping-cart"></i> 
            ${!panel.disponible || panel.stock <= 0 ? 'Agotado' : 'Agregar al Carrito'}
          </button>
        </div>
      </div>
    `;
    productsGrid.innerHTML += panelHTML;
  });
}

// Función para agregar productos al carrito (actualizada)
function addToCart(panelId, productName, price) {
  // Obtener el carrito actual del localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Buscar si el producto ya está en el carrito
  const existingProduct = cart.find(item => item.id === panelId);
  
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      id: panelId,
      name: productName,
      price: parseFloat(price),
      quantity: 1,
      imagen: 'https://via.placeholder.com/100x100?text=Panel'
    });
  }
  
  // Guardar el carrito actualizado
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Actualizar el contador del carrito
  updateCartCount();
  
  // Actualizar el sidebar del carrito
  updateCartSidebar();
  
  // Mostrar notificación
  if (window.notificationManager && window.notificationManager.canShowNotifications()) {
    window.notificationManager.showNotification(
      'Producto agregado',
      `${productName} ha sido agregado al carrito.`
    );
  }
  
  console.log('Producto agregado al carrito:', productName);
}

// Función para actualizar el contador del carrito
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartCountElement = document.getElementById('cartCount');
  if (cartCountElement) {
    cartCountElement.textContent = totalItems;
  }
}

// Función para actualizar el sidebar del carrito
function updateCartSidebar() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartItemsElement = document.getElementById('cartItems');
  const cartTotalElement = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  if (!cartItemsElement) return;
  
  if (cart.length === 0) {
    cartItemsElement.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Tu carrito está vacío</p>
      </div>
    `;
    if (cartTotalElement) cartTotalElement.textContent = 'Total: $0.00';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }
  
  let cartHTML = '';
  let total = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    cartHTML += `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.imagen}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>$${item.price.toFixed(2)}</p>
          <div class="cart-item-quantity">
            <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
        </div>
        <button class="remove-item" onclick="removeFromCart('${item.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  });
  
  cartItemsElement.innerHTML = cartHTML;
  if (cartTotalElement) cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
  if (checkoutBtn) checkoutBtn.disabled = false;
}

// Función para actualizar cantidad de un item en el carrito
function updateCartItemQuantity(itemId, newQuantity) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (newQuantity <= 0) {
    cart = cart.filter(item => item.id !== itemId);
  } else {
    const item = cart.find(item => item.id === itemId);
    if (item) {
      item.quantity = newQuantity;
    }
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  updateCartSidebar();
}

// Función para remover item del carrito
function removeFromCart(itemId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => item.id !== itemId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  updateCartSidebar();
}

// Función de inicialización
function inicializarApp() {
  console.log('Inicializando aplicación...');
  
  // Actualizar contador del carrito al cargar
  updateCartCount();
  
  // Actualizar sidebar del carrito al cargar
  updateCartSidebar();
  
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
