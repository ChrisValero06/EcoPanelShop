// Cart functionality
let cart = [];
let cartTotal = 0;

// Product data
const products = [
    {
        id: 1,
        name: "Panel Solar Monocristalino 400W",
        price: 7225.00,
        originalPrice: 8500.00,
        image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        specs: "400W",
        description: "Panel solar de alta eficiencia con tecnología monocristalina. Ideal para instalaciones residenciales y comerciales."
    },
    {
        id: 2,
        name: "Panel Solar Policristalino 550W",
        price: 10880.00,
        originalPrice: 12800.00,
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
        specs: "550W",
        description: "Panel solar policristalino de alta potencia. Perfecto para instalaciones industriales y grandes proyectos."
    },
    {
        id: 3,
        name: "Inversor Solar Híbrido 5kW",
        price: 21760.00,
        originalPrice: 25600.00,
        image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        specs: "5kW",
        description: "Inversor híbrido con batería integrada. Permite almacenar energía y usar durante la noche."
    },
    {
        id: 4,
        name: "Kit Solar Residencial 3kW",
        price: 38250.00,
        originalPrice: 45000.00,
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
        specs: "3kW",
        description: "Kit completo con paneles, inversor y estructura. Incluye instalación y garantía extendida."
    }
];

// DOM Elements
const cartIcon = document.querySelector('.cart-icon');
const cartSidebar = document.querySelector('.cart-sidebar');
const closeCart = document.querySelector('.close-cart');
const cartItems = document.querySelector('.cart-items');
const cartCount = document.querySelector('.cart-count');
const cartTotalElement = document.querySelector('.cart-total span');
const btnCheckout = document.querySelector('.btn-checkout');
const whatsappButton = document.querySelector('.whatsapp-button');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cart toggle
    cartIcon.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    addToCartButtons.forEach((button, index) => {
        button.addEventListener('click', () => addToCart(products[index]));
    });
    
    // Quick view buttons
    const quickViewButtons = document.querySelectorAll('.btn-quick-view');
    quickViewButtons.forEach((button, index) => {
        button.addEventListener('click', () => showQuickView(products[index]));
    });
    
    // Checkout button
    btnCheckout.addEventListener('click', checkout);
    
    // WhatsApp button
    whatsappButton.addEventListener('click', openWhatsApp);
    
    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletter);
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
    
    // Initialize cart
    updateCartDisplay();
});

// Cart Functions
function toggleCart() {
    cartSidebar.classList.toggle('open');
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showNotification(`${product.name} añadido al carrito`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    cartItems.innerHTML = '';
    cartTotal = 0;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Tu carrito está vacío</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            cartTotal += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toLocaleString('es-MX')}</p>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">&times;</button>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    // Update total
    cartTotalElement.textContent = `$${cartTotal.toLocaleString('es-MX')}`;
}

// Quick View Function
function showQuickView(product) {
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-body">
                <div class="modal-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="modal-info">
                    <h2>${product.name}</h2>
                    <div class="modal-specs">
                        <span>${product.specs}</span>
                        <span>En stock</span>
                        <span>Envío Gratis</span>
                    </div>
                    <p>${product.description}</p>
                    <div class="modal-price">
                        <span class="original-price">$${product.originalPrice.toLocaleString('es-MX')}</span>
                        <span class="current-price">$${product.price.toLocaleString('es-MX')}</span>
                        <span class="discount">-15%</span>
                    </div>
                    <button class="btn-add-cart" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">Añadir al carrito</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeModal = modal.querySelector('.close-modal');
    closeModal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Checkout Function
function checkout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }
    
    // Here you would typically redirect to a checkout page
    // For now, we'll show a simple alert
    const total = cartTotal.toLocaleString('es-MX');
    alert(`Procesando compra por $${total}. Redirigiendo al checkout...`);
    
    // Clear cart after checkout
    cart = [];
    updateCartDisplay();
    toggleCart();
}

// WhatsApp Function
function openWhatsApp() {
    const message = encodeURIComponent('Hola, me interesa información sobre paneles solares. ¿Podrían ayudarme?');
    const phone = '8120858045';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

// Newsletter Function
function handleNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    if (email) {
        showNotification('¡Gracias por suscribirte!', 'success');
        e.target.reset();
    }
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function smoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add CSS for cart items and modal
const additionalStyles = `
    .cart-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid #eee;
    }
    
    .cart-item-image img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .cart-item-details h4 {
        font-size: 14px;
        margin-bottom: 5px;
    }
    
    .cart-item-details p {
        color: #667eea;
        font-weight: 600;
        margin-bottom: 10px;
    }
    
    .cart-item-quantity {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .cart-item-quantity button {
        background: #f8f9fa;
        border: 1px solid #ddd;
        width: 25px;
        height: 25px;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .remove-item {
        background: none;
        border: none;
        color: #e74c3c;
        font-size: 18px;
        cursor: pointer;
        margin-left: auto;
    }
    
    .quick-view-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }
    
    .close-modal {
        position: absolute;
        top: 15px;
        right: 20px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        z-index: 1;
    }
    
    .modal-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        padding: 30px;
    }
    
    .modal-image img {
        width: 100%;
        border-radius: 8px;
    }
    
    .modal-info h2 {
        font-size: 24px;
        margin-bottom: 15px;
    }
    
    .modal-specs {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    }
    
    .modal-specs span {
        background: #f8f9fa;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 12px;
    }
    
    .modal-price {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
    }
    
    @media (max-width: 768px) {
        .modal-body {
            grid-template-columns: 1fr;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 