// Configuración para notificaciones locales del navegador
const notificationConfig = {
    // Configuración de la aplicación
    appName: 'EcoPanelShop',
    appIcon: '/icons/icon-512.png',
    
    // Configuración de notificaciones
    defaultNotificationOptions: {
        icon: '/icons/icon-512.png',
        badge: '/icons/icon-512.png',
        requireInteraction: true,
        tag: 'ecopanel-notification'
    },
    
    // Mensajes de notificación
    messages: {
        contactFormSubmitted: {
            title: 'EcoPanelShop - Información Recibida',
            body: 'Gracias por contactarnos. Nos pondremos en contacto contigo pronto.'
        },
        welcome: {
            title: '¡Bienvenido a EcoPanelShop!',
            body: 'Gracias por unirte a nuestra comunidad de energía sostenible.'
        },
        offer: {
            title: '¡Oferta especial!',
            body: 'Descubre nuestros paneles solares con descuento exclusivo.'
        },
        reminder: {
            title: 'Recordatorio EcoPanelShop',
            body: 'No olvides revisar nuestras últimas ofertas en energía renovable.'
        },
        newProduct: {
            title: '¡Nuevo producto disponible!',
            body: 'Hemos agregado nuevos paneles solares a nuestro catálogo.'
        },
        priceUpdate: {
            title: 'Actualización de precios',
            body: 'Los precios de nuestros paneles solares han sido actualizados.'
        }
    },
    
    // Configuración de permisos
    permissionOptions: {
        title: 'EcoPanelShop quiere enviarte notificaciones',
        body: 'Las notificaciones te mantendrán informado sobre nuevas ofertas, productos y actualizaciones.',
        allowText: 'Permitir',
        denyText: 'No permitir'
    }
};

// Función para obtener la configuración
function getNotificationConfig() {
    return notificationConfig;
}

// Función para obtener mensaje específico
function getNotificationMessage(type) {
    return notificationConfig.messages[type] || notificationConfig.messages.contactFormSubmitted;
}

// Función para obtener opciones de notificación
function getNotificationOptions(type = 'default') {
    const message = getNotificationMessage(type);
    return {
        ...notificationConfig.defaultNotificationOptions,
        title: message.title,
        body: message.body
    };
}

// Función para verificar si las notificaciones están soportadas
function isNotificationSupported() {
    return 'Notification' in window;
}

// Función para verificar el estado de los permisos
function getNotificationPermission() {
    if (!isNotificationSupported()) {
        return 'not-supported';
    }
    return Notification.permission;
}

// Función para solicitar permisos de notificación
async function requestNotificationPermission() {
    if (!isNotificationSupported()) {
        throw new Error('Las notificaciones no están soportadas en este navegador');
    }
    
    const permission = await Notification.requestPermission();
    return permission;
}

// Función para mostrar notificación local
function showLocalNotification(type, customData = {}) {
    if (!isNotificationSupported()) {
        console.warn('Las notificaciones no están soportadas');
        return null;
    }
    
    if (Notification.permission !== 'granted') {
        console.warn('Permisos de notificación no concedidos');
        return null;
    }
    
    const config = getNotificationConfig();
    const message = getNotificationMessage(type);
    
    const notificationOptions = {
        ...config.defaultNotificationOptions,
        title: customData.title || message.title,
        body: customData.body || message.body,
        data: customData.data || {}
    };
    
    const notification = new Notification(notificationOptions.title, notificationOptions);
    
    // Manejar clic en la notificación
    notification.onclick = function() {
        window.focus();
        notification.close();
        
        // Ejecutar acción personalizada si se proporciona
        if (customData.onClick) {
            customData.onClick();
        }
    };
    
    return notification;
}

// Función para programar notificaciones
function scheduleNotification(type, delay = 5000, customData = {}) {
    setTimeout(() => {
        showLocalNotification(type, customData);
    }, delay);
}

// Exportar configuración y funciones
window.notificationConfig = {
    getNotificationConfig,
    getNotificationMessage,
    getNotificationOptions,
    isNotificationSupported,
    getNotificationPermission,
    requestNotificationPermission,
    showLocalNotification,
    scheduleNotification
}; 