// Main Application File for EcoShop Solar Panels
// Handles Firebase integration, product display, cart management, and user interactions

class EcoShopApp {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.categories = [];
        this.cart = { items: [], total: 0 };
        this.filters = {
            category: '',
            priceRange: '',
            search: ''
        };
        this.init();
    }

    async init() {
        try {
            // Initialize Firebase Auth
            await this.initializeAuth();
            
            // Load sample products (for demo purposes)
            this.loadSampleProducts();
            
            // Load categories
            await this.loadCategories();
            
            // Load user cart if authenticated
            if (this.currentUser) {
                await this.loadUserCart();
            }
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('EcoShop app initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showNotification('Error al inicializar la aplicación', 'error');
        }
    }

    // Initialize authentication
    async initializeAuth() {
        return new Promise((resolve) => {
            firebase.auth().onAuthStateChanged(async (user) => {
                this.currentUser = user;
                this.updateAuthUI();
                
                if (user) {
                    console.log('User authenticated:', user.email);
                    await this.loadUserCart();
                } else {
                    console.log('User signed out');
                    this.clearCart();
                }
                
                resolve();
            });
        });
    }

    // Update authentication UI
    updateAuthUI() {
        const loginLink = document.getElementById('loginLink');
        const userInfo = document.getElementById('userInfo');

        if (this.currentUser) {
            if (loginLink) loginLink.style.display = 'none';
            if (userInfo) {
                userInfo.style.display = 'flex';
                userInfo.innerHTML = `
                    <span>${this.currentUser.displayName || this.currentUser.email}</span>
                    <button onclick="firebaseAuth.signOut()" class="btn-signout">Cerrar Sesión</button>
                `;
            }
        } else {
            if (loginLink) loginLink.style.display = 'inline-flex';
            if (userInfo) userInfo.style.display = 'none';
        }
    }

    // Load sample products for demo
    loadSampleProducts() {
        this.products = [
            {
                id: 'panel-1',
                name: 'Panel Solar Monocristalino 400W',
                description: 'Panel solar de alta eficiencia con tecnología monocristalina. Ideal para instalaciones residenciales y comerciales.',
                price: 8500,
                originalPrice: 9500,
                categoryId: 'residencial',
                power: '400W',
                stock: 25,
                imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
                isActive: true,
                isNew: true,
                createdAt: new Date()
            },
            {
                id: 'panel-2',
                name: 'Panel Solar Policristalino 350W',
                description: 'Panel solar policristalino de excelente relación calidad-precio. Perfecto para proyectos de mediana escala.',
                price: 7200,
                originalPrice: 8200,
                categoryId: 'comercial',
                power: '350W',
                stock: 30,
                imageUrl: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                isActive: true,
                isNew: false,
                createdAt: new Date()
            },
            {
                id: 'panel-3',
                name: 'Panel Solar Bifacial 450W',
                description: 'Panel solar bifacial de última generación. Captura energía solar por ambas caras para máxima eficiencia.',
                price: 12000,
                originalPrice: 13500,
                categoryId: 'industrial',
                power: '450W',
                stock: 15,
                imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
                isActive: true,
                isNew: true,
                createdAt: new Date()
            },
            {
                id: 'panel-4',
                name: 'Panel Solar Flexible 200W',
                description: 'Panel solar flexible ideal para aplicaciones móviles, barcos, caravanas y superficies curvas.',
                price: 5500,
                originalPrice: 6500,
                categoryId: 'especializado',
                power: '200W',
                stock: 20,
                imageUrl: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                isActive: true,
                isNew: false,
                createdAt: new Date()
            },
            {
                id: 'panel-5',
                name: 'Panel Solar de Alta Potencia 500W',
                description: 'Panel solar de alta potencia diseñado para grandes instalaciones industriales y granjas solares.',
                price: 15000,
                originalPrice: 16500,
                categoryId: 'industrial',
                power: '500W',
                stock: 10,
                imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
                isActive: true,
                isNew: true,
                createdAt: new Date()
            },
            {
                id: 'panel-6',
                name: 'Panel Solar Residencial 300W',
                description: 'Panel solar compacto perfecto para techos residenciales. Fácil instalación y mantenimiento.',
                price: 6500,
                originalPrice: 7500,
                categoryId: 'residencial',
                power: '300W',
                stock: 35,
                imageUrl: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                isActive: true,
                isNew: false,
                createdAt: new Date()
            }
        ];

        this.renderProducts(this.products);
    }

    // Load categories
    async loadCategories() {
        try {
            const result = await firebaseInventory.getAllCategories();
            if (result.success) {
                this.categories = result.categories;
            } else {
                // Use sample categories for demo
                this.categories = [
                    { id: 'residencial', name: 'Residencial' },
                    { id: 'comercial', name: 'Comercial' },
                    { id: 'industrial', name: 'Industrial' },
                    { id: 'especializado', name: 'Especializado' }
                ];
            }
            this.renderCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Render categories
    renderCategories() {
        const dropdown = document.getElementById('categoriesDropdown');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (dropdown) {
            dropdown.innerHTML = this.categories.map(category => 
                `<a href="#" onclick="app.filterByCategory('${category.id}')">${category.name}</a>`
            ).join('');
        }
        
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' +
                this.categories.map(category => 
                    `<option value="${category.id}">${category.name}</option>`
                ).join('');
        }
    }

    // Render products in grid
    renderProducts(products) {
        const productsGrid = document.getElementById('productsGrid');
        
        if (!productsGrid) return;

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron productos</h3>
                    <p>Intenta con otros filtros o términos de búsqueda</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    // Create product card HTML
    createProductCard(product) {
        const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.imageUrl}" alt="${product.name}">
                    ${product.isNew ? '<div class="product-badge">Nuevo</div>' : ''}
                    ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-specs">
                        <span>${product.power}</span>
                        <span>${product.stock > 0 ? 'En stock' : 'Agotado'}</span>
                        <span>Envío Gratis</span>
                    </div>
                    <p>${product.description}</p>
                    <div class="product-price">
                        ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toLocaleString('es-MX')}</span>` : ''}
                        <span class="current-price">$${product.price.toLocaleString('es-MX')}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-quick-view" onclick="app.showProductDetails('${product.id}')">
                            Vista rápida
                        </button>
                        <button class="btn-add-cart" onclick="app.addToCart('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                            ${product.stock > 0 ? 'Añadir al carrito' : 'Agotado'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Show product details modal
    async showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showNotification('Producto no encontrado', 'error');
            return;
        }

        this.showModal(this.createProductModal(product));
    }

    // Create product modal HTML
    createProductModal(product) {
        const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        
        return `
            <div class="modal-content">
                <span class="close-modal" onclick="app.closeModal()">&times;</span>
                <div class="modal-body">
                    <div class="modal-image">
                        <img src="${product.imageUrl}" alt="${product.name}">
                    </div>
                    <div class="modal-info">
                        <h2>${product.name}</h2>
                        <div class="modal-specs">
                            <span>${product.power}</span>
                            <span>${product.stock > 0 ? 'En stock' : 'Agotado'}</span>
                            <span>Envío Gratis</span>
                        </div>
                        <p>${product.description}</p>
                        <div class="modal-price">
                            ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toLocaleString('es-MX')}</span>` : ''}
                            <span class="current-price">$${product.price.toLocaleString('es-MX')}</span>
                            ${discount > 0 ? `<span class="discount">-${discount}%</span>` : ''}
                        </div>
                        <div class="quantity-selector">
                            <label>Cantidad:</label>
                            <div class="quantity-controls">
                                <button onclick="app.changeQuantity(-1)">-</button>
                                <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}">
                                <button onclick="app.changeQuantity(1)">+</button>
                            </div>
                        </div>
                        <button class="btn-add-cart" onclick="app.addToCartFromModal('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                            ${product.stock > 0 ? 'Añadir al carrito' : 'Agotado'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Show modal
    showModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = content;
        modal.onclick = (e) => {
            if (e.target === modal) this.closeModal();
        };
        document.body.appendChild(modal);
    }

    // Close modal
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    // Change quantity in modal
    changeQuantity(delta) {
        const input = document.getElementById('productQuantity');
        if (input) {
            const newValue = Math.max(1, parseInt(input.value) + delta);
            input.value = newValue;
        }
    }

    // Add to cart from modal
    async addToCartFromModal(productId) {
        const quantity = parseInt(document.getElementById('productQuantity')?.value || 1);
        await this.addToCart(productId, quantity);
        this.closeModal();
    }

    // Add to cart
    async addToCart(productId, quantity = 1) {
        if (!this.currentUser) {
            this.showNotification('Debes iniciar sesión para agregar productos al carrito', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            if (firebaseInventory) {
                const result = await firebaseInventory.addToCart(this.currentUser.uid, productId, quantity);
                if (result.success) {
                    this.cart = result.cart;
                    this.updateCartUI();
                    this.showNotification('Producto agregado al carrito', 'success');
                } else {
                    this.showNotification(result.error, 'error');
                }
            } else {
                // Fallback for demo without Firebase
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    const existingItem = this.cart.items.find(item => item.productId === productId);
                    if (existingItem) {
                        existingItem.quantity += quantity;
                        existingItem.subtotal = existingItem.quantity * product.price;
                    } else {
                        this.cart.items.push({
                            productId: productId,
                            name: product.name,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            quantity: quantity,
                            subtotal: product.price * quantity
                        });
                    }
                    this.cart.total = this.cart.items.reduce((sum, item) => sum + item.subtotal, 0);
                    this.updateCartUI();
                    this.showNotification('Producto agregado al carrito', 'success');
                }
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Error al agregar al carrito', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Load user cart
    async loadUserCart() {
        if (!this.currentUser) return;

        try {
            if (firebaseInventory) {
                const result = await firebaseInventory.getUserCart(this.currentUser.uid);
                if (result.success) {
                    this.cart = result.cart;
                    this.updateCartUI();
                }
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    // Update cart UI
    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        // Update cart count
        const totalItems = this.cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        if (cartCount) cartCount.textContent = totalItems;

        // Update cart items
        if (cartItems) {
            if (this.cart.items?.length > 0) {
                cartItems.innerHTML = this.cart.items.map(item => this.createCartItemHTML(item)).join('');
            } else {
                cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
            }
        }

        // Update total
        if (cartTotal) {
            cartTotal.textContent = `Total: $${(this.cart.total || 0).toLocaleString('es-MX')}`;
        }

        // Update checkout button
        if (checkoutBtn) {
            checkoutBtn.disabled = totalItems === 0;
        }
    }

    // Create cart item HTML
    createCartItemHTML(item) {
        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.imageUrl}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toLocaleString('es-MX')}</p>
                    <div class="cart-item-quantity">
                        <button onclick="app.updateCartItemQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="app.updateCartItemQuantity('${item.productId}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="app.removeFromCart('${item.productId}')">&times;</button>
            </div>
        `;
    }

    // Update cart item quantity
    async updateCartItemQuantity(productId, newQuantity) {
        if (!this.currentUser) return;

        try {
            if (firebaseInventory) {
                const result = await firebaseInventory.updateCartItemQuantity(this.currentUser.uid, productId, newQuantity);
                if (result.success) {
                    this.cart = result.cart;
                    this.updateCartUI();
                }
            } else {
                // Fallback for demo
                const item = this.cart.items.find(item => item.productId === productId);
                if (item) {
                    if (newQuantity <= 0) {
                        this.cart.items = this.cart.items.filter(item => item.productId !== productId);
                    } else {
                        item.quantity = newQuantity;
                        item.subtotal = item.price * newQuantity;
                    }
                    this.cart.total = this.cart.items.reduce((sum, item) => sum + item.subtotal, 0);
                    this.updateCartUI();
                }
            }
        } catch (error) {
            console.error('Error updating cart quantity:', error);
        }
    }

    // Remove from cart
    async removeFromCart(productId) {
        if (!this.currentUser) return;

        try {
            if (firebaseInventory) {
                const result = await firebaseInventory.removeFromCart(this.currentUser.uid, productId);
                if (result.success) {
                    this.cart = result.cart;
                    this.updateCartUI();
                    this.showNotification('Producto removido del carrito', 'success');
                }
            } else {
                // Fallback for demo
                this.cart.items = this.cart.items.filter(item => item.productId !== productId);
                this.cart.total = this.cart.items.reduce((sum, item) => sum + item.subtotal, 0);
                this.updateCartUI();
                this.showNotification('Producto removido del carrito', 'success');
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    }

    // Clear cart
    clearCart() {
        this.cart = { items: [], total: 0 };
        this.updateCartUI();
    }

    // Checkout
    async checkout() {
        if (!this.currentUser) {
            this.showNotification('Debes iniciar sesión para realizar una compra', 'error');
            return;
        }

        if (!this.cart.items || this.cart.items.length === 0) {
            this.showNotification('Tu carrito está vacío', 'error');
            return;
        }

        // For now, just show a success message
        this.showNotification('¡Compra realizada con éxito! Gracias por tu compra.', 'success');
        
        // Clear cart
        if (firebaseInventory) {
            await firebaseInventory.clearCart(this.currentUser.uid);
        }
        this.clearCart();
        
        // Close cart
        this.toggleCart();
    }

    // Search products
    async searchProducts() {
        const searchTerm = document.getElementById('searchInput')?.value.trim();
        if (!searchTerm) {
            this.renderProducts(this.products);
            return;
        }

        const filteredProducts = this.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.renderProducts(filteredProducts);
    }

    // Filter by category
    filterByCategory(categoryId = null) {
        if (!categoryId) {
            categoryId = document.getElementById('categoryFilter')?.value;
        }

        this.filters.category = categoryId;
        this.applyFilters();
    }

    // Filter by price
    filterByPrice() {
        const priceRange = document.getElementById('priceFilter')?.value;
        this.filters.priceRange = priceRange;
        this.applyFilters();
    }

    // Apply all filters
    applyFilters() {
        let filteredProducts = [...this.products];

        // Category filter
        if (this.filters.category) {
            filteredProducts = filteredProducts.filter(product => product.categoryId === this.filters.category);
        }

        // Price filter
        if (this.filters.priceRange) {
            const [min, max] = this.filters.priceRange.split('-').map(Number);
            filteredProducts = filteredProducts.filter(product => {
                if (max) {
                    return product.price >= min && product.price <= max;
                } else {
                    return product.price >= min;
                }
            });
        }

        // Search filter
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        this.renderProducts(filteredProducts);
    }

    // Toggle cart sidebar
    toggleCart() {
        const cart = document.getElementById('cart');
        if (cart) {
            cart.classList.toggle('open');
        }
    }

    // Show loading overlay
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Setup event listeners
    setupEventListeners() {
        // Cart toggle
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.toggleCart());
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchProducts();
                }
            });
        }
    }
}

// Initialize EcoShop app
const app = new EcoShopApp();

// Global functions for HTML onclick handlers
window.scrollToProducts = () => {
    document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
};

window.openContactForm = () => {
    alert('Formulario de contacto - En desarrollo');
};

window.openWhatsApp = () => {
    const message = encodeURIComponent('Hola, me interesa información sobre paneles solares. ¿Podrían ayudarme?');
    const phone = '8120858045';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
};

window.searchProducts = () => {
    app.searchProducts();
};

window.filterByCategory = () => {
    app.filterByCategory();
};

window.filterByPrice = () => {
    app.filterByPrice();
};

window.toggleCart = () => {
    app.toggleCart();
};

window.checkout = () => {
    app.checkout();
};

window.subscribeNewsletter = () => {
    const email = document.getElementById('newsletterEmail')?.value.trim();
    if (email) {
        app.showNotification('¡Gracias por suscribirte!', 'success');
        document.getElementById('newsletterEmail').value = '';
    } else {
        app.showNotification('Por favor, ingresa tu email', 'error');
    }
}; 