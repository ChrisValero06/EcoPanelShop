// Firebase Inventory Management System for EcoShop Solar Panels
// Compatible with Web and Mobile

class FirebaseInventory {
    constructor() {
        this.db = firebase.firestore();
        this.storage = firebase.storage();
        this.productsCollection = 'products';
        this.categoriesCollection = 'categories';
        this.cartCollection = 'carts';
    }

    // ===== PRODUCT MANAGEMENT =====

    // Get all products
    async getAllProducts() {
        try {
            const snapshot = await this.db.collection(this.productsCollection)
                .where('isActive', '==', true)
                .orderBy('createdAt', 'desc')
                .get();

            const products = [];
            snapshot.forEach(doc => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return {
                success: true,
                products: products
            };
        } catch (error) {
            console.error('Get all products error:', error);
            return {
                success: false,
                error: 'Error al obtener productos'
            };
        }
    }

    // Get products by category
    async getProductsByCategory(categoryId) {
        try {
            const snapshot = await this.db.collection(this.productsCollection)
                .where('categoryId', '==', categoryId)
                .where('isActive', '==', true)
                .orderBy('name')
                .get();

            const products = [];
            snapshot.forEach(doc => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return {
                success: true,
                products: products
            };
        } catch (error) {
            console.error('Get products by category error:', error);
            return {
                success: false,
                error: 'Error al obtener productos por categoría'
            };
        }
    }

    // Get single product
    async getProduct(productId) {
        try {
            const doc = await this.db.collection(this.productsCollection).doc(productId).get();
            
            if (doc.exists) {
                return {
                    success: true,
                    product: {
                        id: doc.id,
                        ...doc.data()
                    }
                };
            } else {
                return {
                    success: false,
                    error: 'Producto no encontrado'
                };
            }
        } catch (error) {
            console.error('Get product error:', error);
            return {
                success: false,
                error: 'Error al obtener producto'
            };
        }
    }

    // ===== CART MANAGEMENT =====

    // Get user cart
    async getUserCart(userId) {
        try {
            const doc = await this.db.collection(this.cartCollection).doc(userId).get();
            
            if (doc.exists) {
                return {
                    success: true,
                    cart: doc.data()
                };
            } else {
                // Create empty cart
                const emptyCart = {
                    userId: userId,
                    items: [],
                    total: 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                await this.db.collection(this.cartCollection).doc(userId).set(emptyCart);
                
                return {
                    success: true,
                    cart: emptyCart
                };
            }
        } catch (error) {
            console.error('Get user cart error:', error);
            return {
                success: false,
                error: 'Error al obtener carrito'
            };
        }
    }

    // Add item to cart
    async addToCart(userId, productId, quantity = 1) {
        try {
            const cartRef = this.db.collection(this.cartCollection).doc(userId);
            
            // Get product details
            const productResult = await this.getProduct(productId);
            if (!productResult.success) {
                return productResult;
            }

            const product = productResult.product;
            
            // Check stock
            if (product.stock < quantity) {
                return {
                    success: false,
                    error: 'Stock insuficiente'
                };
            }

            // Use transaction to update cart
            const result = await this.db.runTransaction(async (transaction) => {
                const cartDoc = await transaction.get(cartRef);
                
                let cart;
                if (cartDoc.exists) {
                    cart = cartDoc.data();
                } else {
                    cart = {
                        userId: userId,
                        items: [],
                        total: 0,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                }

                // Check if item already exists in cart
                const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
                
                if (existingItemIndex >= 0) {
                    // Update quantity
                    cart.items[existingItemIndex].quantity += quantity;
                    cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].quantity * product.price;
                } else {
                    // Add new item
                    cart.items.push({
                        productId: productId,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        quantity: quantity,
                        subtotal: product.price * quantity
                    });
                }

                // Recalculate total
                cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
                cart.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

                transaction.set(cartRef, cart);
                return cart;
            });

            return {
                success: true,
                cart: result,
                message: 'Producto agregado al carrito'
            };
        } catch (error) {
            console.error('Add to cart error:', error);
            return {
                success: false,
                error: 'Error al agregar al carrito'
            };
        }
    }

    // Update cart item quantity
    async updateCartItemQuantity(userId, productId, quantity) {
        try {
            const cartRef = this.db.collection(this.cartCollection).doc(userId);
            
            const result = await this.db.runTransaction(async (transaction) => {
                const cartDoc = await transaction.get(cartRef);
                
                if (!cartDoc.exists) {
                    throw new Error('Carrito no encontrado');
                }

                const cart = cartDoc.data();
                const itemIndex = cart.items.findIndex(item => item.productId === productId);
                
                if (itemIndex === -1) {
                    throw new Error('Producto no encontrado en el carrito');
                }

                if (quantity <= 0) {
                    // Remove item
                    cart.items.splice(itemIndex, 1);
                } else {
                    // Update quantity
                    cart.items[itemIndex].quantity = quantity;
                    cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;
                }

                // Recalculate total
                cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
                cart.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

                transaction.set(cartRef, cart);
                return cart;
            });

            return {
                success: true,
                cart: result,
                message: 'Carrito actualizado'
            };
        } catch (error) {
            console.error('Update cart error:', error);
            return {
                success: false,
                error: 'Error al actualizar carrito'
            };
        }
    }

    // Remove from cart
    async removeFromCart(userId, productId) {
        return this.updateCartItemQuantity(userId, productId, 0);
    }

    // Clear cart
    async clearCart(userId) {
        try {
            await this.db.collection(this.cartCollection).doc(userId).delete();
            
            return {
                success: true,
                message: 'Carrito vaciado'
            };
        } catch (error) {
            console.error('Clear cart error:', error);
            return {
                success: false,
                error: 'Error al vaciar carrito'
            };
        }
    }

    // ===== CATEGORY MANAGEMENT =====

    // Get all categories
    async getAllCategories() {
        try {
            const snapshot = await this.db.collection(this.categoriesCollection)
                .where('isActive', '==', true)
                .orderBy('name')
                .get();

            const categories = [];
            snapshot.forEach(doc => {
                categories.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return {
                success: true,
                categories: categories
            };
        } catch (error) {
            console.error('Get categories error:', error);
            return {
                success: false,
                error: 'Error al obtener categorías'
            };
        }
    }

    // ===== SEARCH AND FILTERS =====

    // Search products
    async searchProducts(query) {
        try {
            const snapshot = await this.db.collection(this.productsCollection)
                .where('isActive', '==', true)
                .get();

            const products = [];
            const searchTerm = query.toLowerCase();
            
            snapshot.forEach(doc => {
                const product = doc.data();
                if (product.name.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm)) {
                    products.push({
                        id: doc.id,
                        ...product
                    });
                }
            });

            return {
                success: true,
                products: products
            };
        } catch (error) {
            console.error('Search products error:', error);
            return {
                success: false,
                error: 'Error al buscar productos'
            };
        }
    }

    // Get products by price range
    async getProductsByPriceRange(minPrice, maxPrice) {
        try {
            const snapshot = await this.db.collection(this.productsCollection)
                .where('isActive', '==', true)
                .where('price', '>=', minPrice)
                .where('price', '<=', maxPrice)
                .orderBy('price')
                .get();

            const products = [];
            snapshot.forEach(doc => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return {
                success: true,
                products: products
            };
        } catch (error) {
            console.error('Get products by price range error:', error);
            return {
                success: false,
                error: 'Error al obtener productos por rango de precio'
            };
        }
    }
}

// Initialize Firebase Inventory
const firebaseInventory = new FirebaseInventory();

// Export for use in other files
window.firebaseInventory = firebaseInventory; 