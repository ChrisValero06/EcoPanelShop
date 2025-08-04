// Configuración para notificaciones push
const notificationConfig = {
    // Clave VAPID pública (reemplaza con tu clave real)
    vapidKey: 'TU_VAPID_PUBLIC_KEY',
    
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
        }
    },
    
    // Configuración de permisos
    permissionOptions: {
        title: 'EcoPanelShop quiere enviarte notificaciones',
        body: 'Las notificaciones pueden incluir alertas, sonidos y contadores de íconos, los cuales se pueden establecer en Configuración.',
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

// Exportar configuración
window.notificationConfig = {
    getNotificationConfig,
    getNotificationMessage,
    getNotificationOptions
}; 