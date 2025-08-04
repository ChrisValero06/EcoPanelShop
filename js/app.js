if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./serviceWorker.js', { scope: './' })
    .then(() => console.log('Service Worker registrado'))
    .catch(err => console.error('Error al registrar el Service Worker:', err));
}

//  Leer paneles solares desde Realtime Database y mostrarlos en consola
if (typeof database !== 'undefined') {
  database.ref("paneles").once('value')
    .then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        console.log("Panel:", childSnapshot.key, childSnapshot.val());
      });
    })
    .catch((error) => {
      console.error("Error al leer paneles:", error);
    });
} else {
  console.warn("Realtime Database no está inicializado. Verifica tu configuración de Firebase.");
}

// Mostrar paneles solares en la sección de productos
function mostrarPanelesEnProductos() {
  if (typeof database !== 'undefined') {
    database.ref("paneles").once('value')
      .then((snapshot) => {
        const productsGrid = document.getElementById("productsGrid");
        productsGrid.innerHTML = ""; // Limpia el grid

        if (!snapshot.exists()) {
          productsGrid.innerHTML = "<p>No hay paneles registrados.</p>";
          return;
        }

        snapshot.forEach((childSnapshot) => {
          const panel = childSnapshot.val();
          const panelId = childSnapshot.key;
          // Personaliza los campos según tu estructura
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
                <button class="btn-add-to-cart" onclick="addToCart('${panelId}', '${panel.nombre || 'Panel Solar'}', '${panel.precio || '0'}', '${panel.imagen || ''}')">
                  <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                </button>
              </div>
            </div>
          `;
          productsGrid.innerHTML += panelHTML;
        });
      }).catch((error) => {
        console.error("Error al leer paneles:", error);
        document.getElementById("productsGrid").innerHTML = "<p>Error al cargar los paneles.</p>";
      });
  }
}

// Llama a la función al cargar la página:
document.addEventListener('DOMContentLoaded', mostrarPanelesEnProductos);


// Variables globales para el carrito
let cart = [];
let cartTotal = 0;

// Función para agregar producto al carrito
function addToCart(panelId, nombre, precio, imagen) {
  const existingItem = cart.find(item => item.id === panelId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: panelId,
      nombre: nombre,
      precio: parseFloat(precio) || 0,
      imagen: imagen,
      quantity: 1
    });
  }
  
  updateCartDisplay();
  updateCartTotal();
  showNotification('Producto agregado al carrito');
}

// Función para remover producto del carrito
function removeFromCart(panelId) {
  cart = cart.filter(item => item.id !== panelId);
  updateCartDisplay();
  updateCartTotal();
  showNotification('Producto removido del carrito');
}

// Función para actualizar cantidad
function updateQuantity(panelId, newQuantity) {
  const item = cart.find(item => item.id === panelId);
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(panelId);
    } else {
      item.quantity = newQuantity;
      updateCartDisplay();
      updateCartTotal();
    }
  }
}

// Función para actualizar la visualización del carrito
function updateCartDisplay() {
  const cartItems = document.getElementById('cartItems');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p>No hay productos en el carrito</p>';
    checkoutBtn.disabled = true;
    return;
  }
  
  checkoutBtn.disabled = false;
  cartItems.innerHTML = '';
  
  cart.forEach(item => {
    const itemHTML = `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.imagen || 'https://via.placeholder.com/50x50?text=Panel'}" alt="${item.nombre}">
        </div>
        <div class="cart-item-details">
          <h4>${item.nombre}</h4>
          <p>$${item.precio.toFixed(2)}</p>
          <div class="quantity-controls">
            <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
        </div>
        <div class="cart-item-total">
          <p>$${(item.precio * item.quantity).toFixed(2)}</p>
          <button onclick="removeFromCart('${item.id}')" class="remove-btn">×</button>
        </div>
      </div>
    `;
    cartItems.innerHTML += itemHTML;
  });
}

// Función para actualizar el total del carrito
function updateCartTotal() {
  cartTotal = cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
  document.getElementById('cartTotal').textContent = `Total: $${cartTotal.toFixed(2)}`;
}

// Función para mostrar notificaciones
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #009688;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Función para el proceso de checkout
function checkout() {
  if (cart.length === 0) {
    showNotification('El carrito está vacío');
    return;
  }
  
  // Aquí puedes agregar la lógica de pago
  // Por ahora solo muestra un mensaje de confirmación
  const orderDetails = {
    items: cart,
    total: cartTotal,
    date: new Date().toISOString(),
    orderId: 'ORD-' + Date.now()
  };
  
  // Guardar la orden en Realtime Database
  if (typeof database !== 'undefined') {
    const newOrderRef = database.ref("ordenes").push();
    newOrderRef.set(orderDetails)
      .then(() => {
        showNotification(`Orden creada con ID: ${newOrderRef.key}`);
        // Limpiar carrito después de la orden exitosa
        cart = [];
        updateCartDisplay();
        updateCartTotal();
        toggleCart(); // Cerrar el carrito
      })
      .catch((error) => {
        console.error("Error al crear la orden:", error);
        showNotification('Error al procesar la orden');
      });
  } else {
    showNotification('Error: Firebase no está conectado');
  }
}

// Función para abrir/cerrar el carrito
function toggleCart() {
  const cart = document.getElementById('cart');
  cart.classList.toggle('open');
}

// Función para cerrar el carrito cuando se hace clic fuera
document.addEventListener('click', function(event) {
  const cart = document.getElementById('cart');
  const cartButton = document.querySelector('.cart-button'); // Asegúrate de tener un botón para abrir el carrito
  
  if (!cart.contains(event.target) && !cartButton?.contains(event.target)) {
    cart.classList.remove('open');
  }
});
