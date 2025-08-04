// Sistema de autenticación local para EcoPanelShop
class LocalAuth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    // Inicializar el sistema de autenticación
    init() {
        // Verificar si hay una sesión guardada
        const savedUser = localStorage.getItem('localUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isAuthenticated = true;
                console.log('Usuario autenticado desde localStorage:', this.currentUser.email);
            } catch (error) {
                console.error('Error al cargar usuario guardado:', error);
                this.logout();
            }
        }
    }

    // Iniciar sesión
    async login(email, password) {
        try {
            // Simular validación de credenciales
            const user = await this.validateCredentials(email, password);
            
            if (user) {
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // Guardar en localStorage
                localStorage.setItem('localUser', JSON.stringify(user));
                
                console.log('Login exitoso:', user.email);
                return { success: true, user: user };
            } else {
                return { success: false, error: 'Credenciales incorrectas' };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: 'Error al iniciar sesión' };
        }
    }

    // Validar credenciales (simulado)
    async validateCredentials(email, password) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Credenciales de prueba (en producción esto vendría de una base de datos local)
        const validUsers = [
            { email: 'admin@ecoshop.com', password: 'admin123', name: 'Administrador' },
            { email: 'usuario@ecoshop.com', password: 'usuario123', name: 'Usuario Demo' },
            { email: 'test@ecoshop.com', password: 'test123', name: 'Usuario Test' }
        ];
        
        const user = validUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            return {
                email: user.email,
                name: user.name,
                uid: this.generateUID(),
                loginTime: new Date().toISOString()
            };
        }
        
        return null;
    }

    // Cerrar sesión
    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('localUser');
        console.log('Usuario desconectado');
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar si está autenticado
    isUserAuthenticated() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    // Generar UID único
    generateUID() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Registrar nuevo usuario
    async register(email, password, name) {
        try {
            // Simular validación de email único
            const existingUser = localStorage.getItem('localUser');
            if (existingUser) {
                const user = JSON.parse(existingUser);
                if (user.email === email) {
                    return { success: false, error: 'El email ya está registrado' };
                }
            }
            
            // Crear nuevo usuario
            const newUser = {
                email: email,
                name: name,
                uid: this.generateUID(),
                loginTime: new Date().toISOString()
            };
            
            // Guardar en localStorage (simulando base de datos local)
            localStorage.setItem('localUser', JSON.stringify(newUser));
            
            console.log('Usuario registrado:', newUser.email);
            return { success: true, user: newUser };
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, error: 'Error al registrar usuario' };
        }
    }

    // Cambiar contraseña
    async changePassword(email, oldPassword, newPassword) {
        try {
            // Simular validación
            const user = await this.validateCredentials(email, oldPassword);
            
            if (user) {
                // En un sistema real, aquí se actualizaría la contraseña
                console.log('Contraseña cambiada para:', email);
                return { success: true };
            } else {
                return { success: false, error: 'Contraseña actual incorrecta' };
            }
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            return { success: false, error: 'Error al cambiar contraseña' };
        }
    }

    // Recuperar contraseña
    async resetPassword(email) {
        try {
            // Simular envío de email
            console.log('Email de recuperación enviado a:', email);
            return { success: true, message: 'Se ha enviado un enlace de recuperación a tu email' };
        } catch (error) {
            console.error('Error al recuperar contraseña:', error);
            return { success: false, error: 'Error al enviar email de recuperación' };
        }
    }
}

// Crear instancia global
const localAuth = new LocalAuth();

// Exportar para uso global
window.localAuth = localAuth;

// Funciones de conveniencia
window.loginUser = (email, password) => localAuth.login(email, password);
window.logoutUser = () => localAuth.logout();
window.getCurrentUser = () => localAuth.getCurrentUser();
window.isAuthenticated = () => localAuth.isUserAuthenticated();
window.registerUser = (email, password, name) => localAuth.register(email, password, name); 