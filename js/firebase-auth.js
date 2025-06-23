// Firebase Authentication System for EcoShop Solar Panels
// Compatible with Web and Mobile

class FirebaseAuth {
    constructor() {
        this.auth = firebase.auth();
        this.currentUser = null;
        this.authStateListener = null;
        this.init();
    }

    init() {
        // Listen for auth state changes
        this.authStateListener = this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.onAuthStateChanged(user);
        });
    }

    // Sign in with email and password
    async signInWithEmail(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Sign up with email and password
    async signUpWithEmail(email, password, firstName, lastName) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update user profile
            await user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });

            // Create user document in Firestore
            await this.createUserDocument(user.uid, {
                email: email,
                firstName: firstName,
                lastName: lastName,
                role: 'user',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                }
            };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');
            
            const userCredential = await this.auth.signInWithPopup(provider);
            const user = userCredential.user;

            // Check if user document exists, if not create it
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (!userDoc.exists) {
                await this.createUserDocument(user.uid, {
                    email: user.email,
                    firstName: user.displayName?.split(' ')[0] || '',
                    lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                    role: 'user',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    provider: 'google'
                });
            } else {
                // Update last login
                await db.collection('users').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                }
            };
        } catch (error) {
            console.error('Google login error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Sign out
    async signOut() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Signout error:', error);
            return {
                success: false,
                error: 'Error al cerrar sesión'
            };
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return {
                success: true,
                message: 'Se ha enviado un email para restablecer tu contraseña'
            };
        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Create user document in Firestore
    async createUserDocument(uid, userData) {
        try {
            await db.collection('users').doc(uid).set(userData);
        } catch (error) {
            console.error('Create user document error:', error);
        }
    }

    // Get error message in Spanish
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No existe una cuenta con este email',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/invalid-email': 'Email inválido',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
            'auth/email-already-in-use': 'Ya existe una cuenta con este email',
            'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta de nuevo más tarde',
            'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
            'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
            'auth/cancelled-popup-request': 'Inicio de sesión cancelado',
            'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este email usando otro método de inicio de sesión'
        };
        
        return errorMessages[errorCode] || 'Error desconocido. Intenta de nuevo';
    }

    // Auth state change callback
    onAuthStateChanged(user) {
        if (user) {
            console.log('User authenticated:', user.email);
            this.updateUIForAuthenticatedUser(user);
        } else {
            console.log('User signed out');
            this.updateUIForUnauthenticatedUser();
        }
    }

    // Update UI for authenticated user
    updateUIForAuthenticatedUser(user) {
        const loginLink = document.getElementById('loginLink');
        const userInfo = document.getElementById('userInfo');
        
        if (loginLink) loginLink.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'flex';
            userInfo.innerHTML = `
                <span>${user.displayName || user.email}</span>
                <button onclick="firebaseAuth.signOut()" class="btn-signout">Cerrar Sesión</button>
            `;
        }
    }

    // Update UI for unauthenticated user
    updateUIForUnauthenticatedUser() {
        const loginLink = document.getElementById('loginLink');
        const userInfo = document.getElementById('userInfo');
        
        if (loginLink) loginLink.style.display = 'inline-flex';
        if (userInfo) userInfo.style.display = 'none';
    }

    // Cleanup
    destroy() {
        if (this.authStateListener) {
            this.authStateListener();
        }
    }
}

// Initialize Firebase Auth
const firebaseAuth = new FirebaseAuth();

// Export for use in other files
window.firebaseAuth = firebaseAuth; 