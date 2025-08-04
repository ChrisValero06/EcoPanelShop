// Variables globales
let notificationPermission = 'default';

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Inicializar la aplicación
function initializeApp() {
    // Verificar si el usuario está autenticado usando el sistema local
    if (isAuthenticated()) {
        const user = getCurrentUser();
        console.log('Usuario autenticado:', user.email);
        initializeNotifications();
    } else {
        // Redirigir al login si no está autenticado
        window.location.href = 'login.html';
    }
}

// Configurar event listeners
function setupEventListeners() {
    const contactForm = document.getElementById('contactForm');
    const allowNotificationsBtn = document.getElementById('allowNotifications');
    const denyNotificationsBtn = document.getElementById('denyNotifications');

    contactForm.addEventListener('submit', handleFormSubmit);
    allowNotificationsBtn.addEventListener('click', requestNotificationPermission);
    denyNotificationsBtn.addEventListener('click', hideNotificationPermission);
}

// Manejar el envío del formulario
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    try {
        // Deshabilitar el botón y mostrar loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
        
        // Obtener datos del formulario
        const formData = new FormData(event.target);
        const currentUser = getCurrentUser();
        const contactData = {
            nombre: formData.get('nombre'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            direccion: formData.get('direccion'),
            intereses: formData.get('intereses'),
            mensaje: formData.get('mensaje'),
            fecha: new Date().toISOString(),
            userId: currentUser ? currentUser.uid : 'anonymous'
        };
        
        // Guardar en Firebase
        await saveContactData(contactData);
        
        // Mostrar mensaje de éxito
        showSuccessMessage();
        
        // Limpiar formulario
        event.target.reset();
        
        // Enviar notificación local
        await sendLocalNotification(contactData);
        
        // Mostrar solicitud de permisos de notificación si no están concedidos
        if (notificationPermission !== 'granted') {
            setTimeout(() => {
                showNotificationPermission();
            }, 2000);
        }
        
    } catch (error) {
        console.error('Error al enviar formulario:', error);
        alert('Error al enviar el formulario. Por favor, intenta de nuevo.');
    } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Guardar datos localmente (simulado)
async function saveContactData(data) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Usuario no autenticado');
        
        // Simular guardado en localStorage
        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        const newContact = {
            ...data,
            userId: user.uid,
            userEmail: user.email,
            timestamp: new Date().toISOString(),
            id: 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        };
        
        contacts.push(newContact);
        localStorage.setItem('contacts', JSON.stringify(contacts));
        
        console.log('Datos guardados exitosamente en localStorage');
        return newContact.id;
    } catch (error) {
        console.error('Error al guardar datos:', error);
        throw error;
    }
}

// Inicializar notificaciones locales
function initializeNotifications() {
    if (window.notificationConfig && window.notificationConfig.isNotificationSupported()) {
        notificationPermission = window.notificationConfig.getNotificationPermission();
        console.log('Estado de permisos de notificación:', notificationPermission);
        
        // Si los permisos ya están concedidos, mostrar notificación de bienvenida
        if (notificationPermission === 'granted') {
            setTimeout(() => {
                window.notificationConfig.showLocalNotification('welcome');
            }, 3000);
        }
    }
}

// Solicitar permisos de notificación
async function requestNotificationPermission() {
    try {
        if (window.notificationConfig && window.notificationConfig.isNotificationSupported()) {
            const permission = await window.notificationConfig.requestNotificationPermission();
            notificationPermission = permission;
            
            if (permission === 'granted') {
                console.log('Permisos de notificación concedidos');
                hideNotificationPermission();
                
                // Mostrar notificación de confirmación
                window.notificationConfig.showLocalNotification('welcome');
            } else {
                console.log('Permisos de notificación denegados');
            }
        }
    } catch (error) {
        console.error('Error al solicitar permisos:', error);
    }
}

// Ocultar solicitud de permisos
function hideNotificationPermission() {
    const notificationPermission = document.getElementById('notificationPermission');
    if (notificationPermission) {
        notificationPermission.style.display = 'none';
    }
}

// Mostrar solicitud de permisos
function showNotificationPermission() {
    const notificationPermission = document.getElementById('notificationPermission');
    if (notificationPermission && this.notificationPermission !== 'granted') {
        notificationPermission.style.display = 'block';
    }
}

// Mostrar mensaje de éxito
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.style.display = 'block';
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }
}

// Enviar notificación local
async function sendLocalNotification(contactData) {
    try {
        if (window.notificationConfig && notificationPermission === 'granted') {
            // Mostrar notificación de confirmación del formulario
            window.notificationConfig.showLocalNotification('contactFormSubmitted', {
                body: `Gracias ${contactData.nombre}, hemos recibido tu mensaje. Nos pondremos en contacto contigo pronto.`,
                data: {
                    contactId: contactData.userId,
                    email: contactData.email
                }
            });
            
            // Programar notificación de recordatorio para más tarde
            window.notificationConfig.scheduleNotification('reminder', 30000, {
                body: '¿Te interesa conocer más sobre nuestros paneles solares? ¡Visita nuestro catálogo!'
            });
            
            console.log('Notificación local enviada exitosamente');
        }
    } catch (error) {
        console.log('Error al enviar notificación local:', error);
    }
}

// Función para mostrar notificación personalizada
function showCustomNotification(title, body, options = {}) {
    if (window.notificationConfig && notificationPermission === 'granted') {
        return window.notificationConfig.showLocalNotification('custom', {
            title: title,
            body: body,
            ...options
        });
    }
}

// Registrar service worker para notificaciones
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceWorker.js')
        .then(function(registration) {
            console.log('Service Worker registrado:', registration);
            
            // Configurar Firebase Messaging
            if (messaging) {
                messaging.useServiceWorker(registration);
            }
        })
        .catch(function(error) {
            console.log('Error al registrar Service Worker:', error);
        });
}

// Función para descargar la web app
function downloadWebApp() {
    if (window.navigator.standalone) {
        // La app ya está instalada
        return;
    }
    
    // Mostrar prompt de instalación si está disponible
    if ('beforeinstallprompt' in window) {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            e.prompt();
        });
    }
}

// Exportar funciones para uso global
window.contactoApp = {
    downloadWebApp,
    requestNotificationPermission,
    hideNotificationPermission,
    showCustomNotification,
    scheduleCustomNotification
}; 