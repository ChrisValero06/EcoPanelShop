# EcoShop - Sistema de Paneles Solares con Firebase

## 🚀 Descripción

EcoShop es una plataforma web completa para la venta de paneles solares, desarrollada con Firebase para garantizar escalabilidad, seguridad y compatibilidad multiplataforma (web y móvil).

## ✨ Características Principales

### 🔐 Autenticación Segura
- **Firebase Authentication** con múltiples proveedores
- Login con email/password
- Login con Google
- Registro de usuarios
- Recuperación de contraseñas
- Verificación de email
- Protección de rutas

### 🛍️ Gestión de Inventario
- **Firebase Firestore** para base de datos en tiempo real
- Catálogo de productos dinámico
- Categorías de productos
- Búsqueda y filtros avanzados
- Gestión de stock en tiempo real
- Imágenes almacenadas en Firebase Storage

### 🛒 Carrito de Compras
- Carrito persistente por usuario
- Gestión de cantidades
- Cálculo automático de totales
- Proceso de checkout integrado

### 📱 Diseño Responsivo
- Compatible con dispositivos móviles
- Interfaz moderna y intuitiva
- Navegación optimizada para touch
- PWA ready para instalación en móviles

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **UI/UX**: Font Awesome, Google Fonts
- **Responsive**: CSS Grid, Flexbox
- **Real-time**: Firebase Firestore listeners

## 📋 Requisitos Previos

- Cuenta de Google (para Firebase)
- Navegador web moderno
- Conexión a internet

## 🔧 Configuración de Firebase

### 1. Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombra tu proyecto (ej: "ecoshop-solar")
4. Sigue los pasos del asistente

### 2. Configurar Authentication

1. En Firebase Console, ve a "Authentication"
2. Haz clic en "Comenzar"
3. En "Sign-in method", habilita:
   - **Email/Password**
   - **Google**
4. Configura los dominios autorizados

### 3. Configurar Firestore Database

1. Ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba"
4. Elige la ubicación más cercana

### 4. Configurar Storage

1. Ve a "Storage"
2. Haz clic en "Comenzar"
3. Selecciona "Comenzar en modo de prueba"
4. Elige la ubicación más cercana

### 5. Obtener Configuración

1. Ve a "Configuración del proyecto" (ícono de engranaje)
2. En "Tus apps", haz clic en "Agregar app"
3. Selecciona "Web"
4. Registra tu app y copia la configuración

### 6. Actualizar Configuración

Edita el archivo `firebase-config.js` y reemplaza la configuración:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-real",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id",
  measurementId: "tu-measurement-id"
};
```

## 📁 Estructura del Proyecto

```
EcoShop/
├── index.html              # Página principal
├── login.html              # Página de login
├── css/
│   └── styles.css          # Estilos principales
├── firebase-config.js      # Configuración de Firebase
├── firebase-auth.js        # Sistema de autenticación
├── firebase-inventory.js   # Gestión de inventario
├── app.js                  # Lógica principal de la app
├── login-app.js           # Lógica de la página de login
└── README.md              # Este archivo
```

## 🚀 Instalación y Uso

### Opción 1: Servidor Local

1. Clona o descarga el proyecto
2. Configura Firebase (ver sección anterior)
3. Abre `index.html` en tu navegador
4. ¡Listo para usar!

### Opción 2: Firebase Hosting (Recomendado)

1. Instala Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Inicia sesión en Firebase:
```bash
firebase login
```

3. Inicializa el proyecto:
```bash
firebase init hosting
```

4. Despliega:
```bash
firebase deploy
```

## 📊 Estructura de la Base de Datos

### Colección: `users`
```javascript
{
  uid: "string",
  email: "string",
  firstName: "string",
  lastName: "string",
  role: "user|admin",
  createdAt: "timestamp",
  lastLogin: "timestamp"
}
```

### Colección: `products`
```javascript
{
  name: "string",
  description: "string",
  price: "number",
  originalPrice: "number",
  categoryId: "string",
  power: "string",
  stock: "number",
  imageUrl: "string",
  isActive: "boolean",
  isNew: "boolean",
  createdAt: "timestamp"
}
```

### Colección: `categories`
```javascript
{
  name: "string",
  description: "string",
  isActive: "boolean",
  createdAt: "timestamp"
}
```

### Colección: `carts`
```javascript
{
  userId: "string",
  items: [
    {
      productId: "string",
      name: "string",
      price: "number",
      quantity: "number",
      subtotal: "number"
    }
  ],
  total: "number",
  updatedAt: "timestamp"
}
```

## 🔒 Seguridad

- **Reglas de Firestore** configuradas para proteger datos
- **Autenticación** obligatoria para operaciones sensibles
- **Validación** de datos en frontend y backend
- **Rate limiting** para prevenir abusos
- **Logs de actividad** para auditoría

## 📱 Compatibilidad Móvil

El sistema está diseñado para funcionar perfectamente en dispositivos móviles:

- **Responsive Design** con breakpoints optimizados
- **Touch-friendly** interfaces
- **Offline support** con Firebase persistence
- **PWA ready** para instalación como app

## 🔄 Funcionalidades Futuras

- [ ] Integración con pasarelas de pago
- [ ] Sistema de reseñas y calificaciones
- [ ] Chat en vivo para soporte
- [ ] Notificaciones push
- [ ] App móvil nativa (React Native/Flutter)
- [ ] Panel de administración
- [ ] Sistema de cupones y descuentos
- [ ] Integración con redes sociales

## 🐛 Solución de Problemas

### Error: "Firebase not initialized"
- Verifica que `firebase-config.js` esté correctamente configurado
- Asegúrate de que los scripts de Firebase se carguen antes que tu código

### Error: "Permission denied"
- Verifica las reglas de Firestore
- Asegúrate de que el usuario esté autenticado

### Error: "Network error"
- Verifica tu conexión a internet
- Comprueba que Firebase esté disponible

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@ecoshop.com
- WhatsApp: +52 812 085 8045

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para el futuro sostenible** 
