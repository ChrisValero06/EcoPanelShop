console.log("EcoShop Landing Page cargada.");

// Función para hacer scroll a la sección de productos
function scrollToProducts() {
    const productsSection = document.getElementById('productos');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Función para abrir formulario de contacto
function openContactForm() {
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Función para buscar productos
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        const productDesc = card.querySelector('p').textContent.toLowerCase();
        
        if (productName.includes(searchTerm) || productDesc.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para filtrar por categoría
function filterByCategory() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter.value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productLocation = card.querySelector('.product-specs span:last-child').textContent.toLowerCase();
        
        if (selectedCategory === '' || productLocation.includes(selectedCategory)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para filtrar por precio
function filterByPrice() {
    const priceFilter = document.getElementById('priceFilter');
    const selectedRange = priceFilter.value;
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const priceText = card.querySelector('.current-price').textContent;
        const price = parseFloat(priceText.replace('$', '').replace(',', ''));
        
        let show = true;
        switch(selectedRange) {
            case '0-5000':
                show = price <= 5000;
                break;
            case '5000-15000':
                show = price > 5000 && price <= 15000;
                break;
            case '15000-30000':
                show = price > 15000 && price <= 30000;
                break;
            case '30000+':
                show = price > 30000;
                break;
            default:
                show = true;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

// Función para abrir/cerrar carrito
function toggleCart() {
    const cart = document.getElementById('cart');
    cart.classList.toggle('open');
}

// Función para checkout
function checkout() {
    alert('Función de checkout en desarrollo. Gracias por su interés.');
}

// Función para limpiar el carrito
function clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        localStorage.removeItem('cart');
        updateCartCount();
        updateCartSidebar();
        alert('Carrito vaciado exitosamente');
    }
}

// Función para suscribirse al newsletter
function subscribeNewsletter() {
    const email = document.getElementById('newsletterEmail').value;
    if (email) {
        alert('¡Gracias por suscribirse! Recibirá nuestras novedades en: ' + email);
        document.getElementById('newsletterEmail').value = '';
    } else {
        alert('Por favor ingrese su correo electrónico.');
    }
}

// Función para abrir WhatsApp
function openWhatsApp() {
    const phoneNumber = '528120858045';
    const message = 'Hola, me interesa conocer más sobre sus paneles solares.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Event listeners cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Agregar event listener al icono del carrito
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCart();
        });
    }
    
    // Agregar event listener para cerrar el carrito al hacer clic fuera
    document.addEventListener('click', function(e) {
        const cart = document.getElementById('cart');
        const cartIcon = document.getElementById('cartIcon');
        
        if (cart && cart.classList.contains('open') && 
            !cart.contains(e.target) && 
            !cartIcon.contains(e.target)) {
            cart.classList.remove('open');
        }
    });
    
    // Menú hamburguesa para móviles
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Cambiar el ícono
            const icon = mobileMenuBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
        
        // Cerrar menú al hacer clic en un enlace
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.className = 'fas fa-bars';
            });
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.className = 'fas fa-bars';
            }
        });
    }
});
