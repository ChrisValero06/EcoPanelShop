// Variables globales
let messaging;
let currentToken;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Inicializar la aplicación
function initializeApp() {
    // Verificar si el usuario está autenticado
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('Usuario autenticado:', user.email);
            initializeNotifications();
        } else {
            // Redirigir al login si no está autenticado
            window.location.href = 'login.html';
        }
    });
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
        const contactData = {
            nombre: formData.get('nombre'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            direccion: formData.get('direccion'),
            intereses: formData.get('intereses'),
            mensaje: formData.get('mensaje'),
            fecha: new Date().toISOString(),
            userId: firebase.auth().currentUser.uid
        };
        
        // Guardar en Firebase
        await saveContactData(contactData);
        
        // Mostrar mensaje de éxito
        showSuccessMessage();
        
        // Limpiar formulario
        event.target.reset();
        
        // Enviar notificación
        await sendNotification(contactData);
        
        // Mostrar solicitud de permisos de notificación
        setTimeout(() => {
            showNotificationPermission();
        }, 2000);
        
    } catch (error) {
        console.error('Error al enviar formulario:', error);
        alert('Error al enviar el formulario. Por favor, intenta de nuevo.');
    } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Guardar datos en Firebase
async function saveContactData(data) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('Usuario no autenticado');
        
        const contactRef = firebase.database().ref('contacts');
        const newContactRef = contactRef.push();
        
        await newContactRef.set({
            ...data,
            userId: user.uid,
            userEmail: user.email,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        
        console.log('Datos guardados exitosamente');
        return newContactRef.key;
    } catch (error) {
        console.error('Error al guardar datos:', error);
        throw error;
    }
}

// Inicializar notificaciones
function initializeNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        messaging = firebase.messaging();
        
        // Solicitar permisos de notificación
        messaging.requestPermission()
            .then(function(permission) {
                if (permission === 'granted') {
                    console.log('Permisos de notificación concedidos');
                    getToken();
                } else {
                    console.log('Permisos de notificación denegados');
                }
            })
            .catch(function(err) {
                console.log('Error al solicitar permisos:', err);
            });
        
        // Manejar mensajes en primer plano
        messaging.onMessage(function(payload) {
            console.log('Mensaje recibido:', payload);
            showCustomNotification(payload);
        });
    }
}

// Obtener token de notificación
function getToken() {
    const config = window.notificationConfig.getNotificationConfig();
    messaging.getToken({ vapidKey: config.vapidKey })
        .then(function(token) {
            if (token) {
                currentToken = token;
                saveTokenToDatabase(token);
                console.log('Token obtenido:', token);
            } else {
                console.log('No se pudo obtener el token');
            }
        })
        .catch(function(err) {
            console.log('Error al obtener token:', err);
        });
}

// Guardar token en Firebase
async function saveTokenToDatabase(token) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return;
        
        await firebase.database().ref(`users/${user.uid}/notificationToken`).set(token);
        console.log('Token guardado en la base de datos');
    } catch (error) {
        console.error('Error al guardar token:', error);
    }
}

// Solicitar permisos de notificación
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                console.log('Permisos concedidos');
                hideNotificationPermission();
                getToken();
            }
        });
    }
}

// Ocultar solicitud de permisos
function hideNotificationPermission() {
    const notificationPermission = document.getElementById('notificationPermission');
    notificationPermission.style.display = 'none';
}

// Mostrar solicitud de permisos
function showNotificationPermission() {
    const notificationPermission = document.getElementById('notificationPermission');
    notificationPermission.style.display = 'block';
}

// Mostrar mensaje de éxito
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}

// Enviar notificación
async function sendNotification(contactData) {
    try {
        // Enviar notificación al servidor (requiere backend)
        const response = await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contactData: contactData,
                userId: firebase.auth().currentUser.uid
            })
        });
        
        if (response.ok) {
            console.log('Notificación enviada exitosamente');
        }
    } catch (error) {
        console.log('Error al enviar notificación:', error);
        // Mostrar notificación local como fallback
        showLocalNotification(contactData);
    }
}

// Mostrar notificación local
function showLocalNotification(contactData) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const config = window.notificationConfig.getNotificationConfig();
        const message = window.notificationConfig.getNotificationMessage('contactFormSubmitted');
        
        const notification = new Notification(message.title, {
            body: `Gracias ${contactData.nombre}, ${message.body}`,
            icon: config.appIcon,
            badge: config.appIcon,
            tag: 'contact-form',
            requireInteraction: true
        });
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
    }
}

// Mostrar notificación personalizada
function showCustomNotification(payload) {
    const { title, body, icon } = payload.notification;
    
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: icon || '/icons/icon-512.png',
            badge: '/icons/icon-512.png',
            tag: 'custom-notification',
            requireInteraction: true
        });
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
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
    hideNotificationPermission
}; 