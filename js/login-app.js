// Login Page Application
// Handles Firebase authentication for the login page

class LoginApp {
    constructor() {
        this.auth = firebase.auth();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Forgot password form
        const forgotForm = document.getElementById('forgotForm');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }

        // Real-time validation
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail(emailInput.value));
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', () => this.validatePassword(passwordInput.value));
        }
    }

    checkAuthState() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                // User is already signed in, redirect to main page
                window.location.href = 'index.html';
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        // Clear previous messages
        this.hideMessages();

        // Validation
        if (!this.validateEmail(email) || !this.validatePassword(password)) {
            return;
        }

        // Set loading state
        this.setLoading(true);

        try {
            const result = await firebaseAuth.signInWithEmail(email, password);
            
            if (result.success) {
                this.showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Error al iniciar sesión. Intenta de nuevo.');
        } finally {
            this.setLoading(false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('regFirstName').value.trim();
        const lastName = document.getElementById('regLastName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            this.showError('Por favor, completa todos los campos');
            return;
        }

        if (!this.validateEmail(email)) {
            return;
        }

        if (!this.validatePassword(password)) {
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Las contraseñas no coinciden');
            return;
        }

        // Set loading state
        this.setLoading(true);

        try {
            const result = await firebaseAuth.signUpWithEmail(email, password, firstName, lastName);
            
            if (result.success) {
                this.showSuccess('¡Cuenta creada exitosamente! Verifica tu email y luego inicia sesión.');
                this.closeRegisterModal();
                
                // Clear form
                document.getElementById('registerForm').reset();
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showError('Error al crear la cuenta. Intenta de nuevo.');
        } finally {
            this.setLoading(false);
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgotEmail').value.trim();

        if (!email || !this.validateEmail(email)) {
            return;
        }

        // Set loading state
        this.setLoading(true);

        try {
            const result = await firebaseAuth.resetPassword(email);
            
            if (result.success) {
                this.showSuccess(result.message);
                this.closeForgotModal();
                
                // Clear form
                document.getElementById('forgotForm').reset();
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('Password reset error:', error);
            this.showError('Error al enviar el email de restablecimiento.');
        } finally {
            this.setLoading(false);
        }
    }

    async signInWithGoogle() {
        try {
            this.setLoading(true);
            const result = await firebaseAuth.signInWithGoogle();
            
            if (result.success) {
                this.showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('Google sign in error:', error);
            this.showError('Error al iniciar sesión con Google.');
        } finally {
            this.setLoading(false);
        }
    }

    async signInWithFacebook() {
        this.showError('Inicio de sesión con Facebook no disponible en este momento');
    }

    // Validation functions
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.style.borderColor = isValid ? '#667eea' : '#e74c3c';
        }
        
        if (email && !isValid) {
            this.showError('Por favor, ingresa un email válido');
            return false;
        }
        
        return true;
    }

    validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        const isValid = passwordRegex.test(password);
        
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.style.borderColor = isValid ? '#667eea' : '#e74c3c';
        }
        
        if (password && !isValid) {
            this.showError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
            return false;
        }
        
        return true;
    }

    // UI functions
    setLoading(loading) {
        const loginBtn = document.querySelector('.login-btn');
        const btnText = document.querySelector('.btn-text');
        const btnLoading = document.querySelector('.btn-loading');

        if (loginBtn) {
            loginBtn.disabled = loading;
        }

        if (btnText) {
            btnText.style.display = loading ? 'none' : 'inline';
        }

        if (btnLoading) {
            btnLoading.style.display = loading ? 'inline-flex' : 'none';
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }

    showSuccess(message) {
        const successMessage = document.getElementById('success-message');
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
        }
    }

    hideMessages() {
        const errorMessage = document.getElementById('error-message');
        const successMessage = document.getElementById('success-message');
        
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
    }

    showRegisterForm() {
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showForgotPassword() {
        const modal = document.getElementById('forgotModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeForgotModal() {
        const modal = document.getElementById('forgotModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Initialize login app
const loginApp = new LoginApp();

// Global functions for HTML onclick handlers
window.togglePassword = function() {
    const passwordField = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordField.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
};

window.signInWithGoogle = function() {
    loginApp.signInWithGoogle();
};

window.signInWithFacebook = function() {
    loginApp.signInWithFacebook();
};

window.showRegisterForm = function() {
    loginApp.showRegisterForm();
};

window.closeRegisterModal = function() {
    loginApp.closeRegisterModal();
};

window.showForgotPassword = function() {
    loginApp.showForgotPassword();
};

window.closeForgotModal = function() {
    loginApp.closeForgotModal();
};

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.style.display = 'none';
    }
}); 