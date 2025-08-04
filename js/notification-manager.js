// Gestor de notificaciones locales para EcoPanelShop
class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.isSupported = 'Notification' in window;
        this.init();
    }

    // Inicializar el gestor de notificaciones
    init() {
        if (this.isSupported) {
            this.permission = Notification.permission;
            console.log('NotificationManager inicializado. Permisos:', this.permission);
        } else {
            console.warn('Las notificaciones no están soportadas en este navegador');
        }
    }

    // Solicitar permisos de notificación
    async requestPermission() {
        if (!this.isSupported) {
            throw new Error('Las notificaciones no están soportadas');
        }

        try {
            this.permission = await Notification.requestPermission();
            console.log('Permisos de notificación:', this.permission);
            return this.permission;
        } catch (error) {
            console.error('Error al solicitar permisos:', error);
            throw error;
        }
    }

    // Verificar si se pueden mostrar notificaciones
    canShowNotifications() {
        return this.isSupported && this.permission === 'granted';
    }

    // Mostrar notificación básica
    showNotification(title, options = {}) {
        if (!this.canShowNotifications()) {
            console.warn('No se pueden mostrar notificaciones. Permisos:', this.permission);
            return null;
        }

        const defaultOptions = {
            icon: '/icons/icon-512.png',
            badge: '/icons/icon-512.png',
            tag: 'ecopanel-notification',
            requireInteraction: true,
            ...options
        };

        const notification = new Notification(title, defaultOptions);

        // Manejar clic en la notificación
        notification.onclick = function() {
            window.focus();
            notification.close();
            
            // Ejecutar acción personalizada si se proporciona
            if (options.onClick) {
                options.onClick();
            }
        };

        return notification;
    }

    // Mostrar notificación de bienvenida
    showWelcomeNotification() {
        return this.showNotification(
            '¡Bienvenido a EcoPanelShop!',
            {
                body: 'Gracias por unirte a nuestra comunidad de energía sostenible.',
                tag: 'welcome-notification'
            }
        );
    }

    // Mostrar notificación de formulario enviado
    showContactFormNotification(nombre) {
        return this.showNotification(
            'EcoPanelShop - Información Recibida',
            {
                body: `Gracias ${nombre}, hemos recibido tu mensaje. Nos pondremos en contacto contigo pronto.`,
                tag: 'contact-form-notification'
            }
        );
    }

    // Mostrar notificación de oferta
    showOfferNotification() {
        return this.showNotification(
            '¡Oferta especial!',
            {
                body: 'Descubre nuestros paneles solares con descuento exclusivo.',
                tag: 'offer-notification'
            }
        );
    }

    // Mostrar notificación de recordatorio
    showReminderNotification() {
        return this.showNotification(
            'Recordatorio EcoPanelShop',
            {
                body: 'No olvides revisar nuestras últimas ofertas en energía renovable.',
                tag: 'reminder-notification'
            }
        );
    }

    // Mostrar notificación de nuevo producto
    showNewProductNotification() {
        return this.showNotification(
            '¡Nuevo producto disponible!',
            {
                body: 'Hemos agregado nuevos paneles solares a nuestro catálogo.',
                tag: 'new-product-notification'
            }
        );
    }

    // Mostrar notificación de actualización de precios
    showPriceUpdateNotification() {
        return this.showNotification(
            'Actualización de precios',
            {
                body: 'Los precios de nuestros paneles solares han sido actualizados.',
                tag: 'price-update-notification'
            }
        );
    }

    // Programar notificación
    scheduleNotification(title, options = {}, delay = 5000) {
        if (!this.canShowNotifications()) {
            return null;
        }

        return setTimeout(() => {
            this.showNotification(title, options);
        }, delay);
    }

    // Mostrar notificación desde el Service Worker
    async showNotificationFromSW(title, options = {}) {
        if ('serviceWorker' in navigator && this.canShowNotifications()) {
            const registration = await navigator.serviceWorker.ready;
            return registration.showNotification(title, {
                icon: '/icons/icon-512.png',
                badge: '/icons/icon-512.png',
                tag: 'sw-notification',
                requireInteraction: true,
                ...options
            });
        }
        return null;
    }

    // Enviar mensaje al Service Worker para mostrar notificación
    sendNotificationToSW(title, options = {}) {
        if ('serviceWorker' in navigator && this.canShowNotifications()) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                title: title,
                options: {
                    icon: '/icons/icon-512.png',
                    badge: '/icons/icon-512.png',
                    tag: 'sw-notification',
                    requireInteraction: true,
                    ...options
                }
            });
        }
    }
}

// Crear instancia global
const notificationManager = new NotificationManager();

// Exportar para uso global
window.notificationManager = notificationManager;

// Función de conveniencia para mostrar notificaciones rápidas
window.showNotification = (title, body, options = {}) => {
    return notificationManager.showNotification(title, {
        body: body,
        ...options
    });
};

// Función para solicitar permisos
window.requestNotificationPermission = () => {
    return notificationManager.requestPermission();
}; 