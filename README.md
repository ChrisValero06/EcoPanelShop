# EcoPanelShop - Tienda de Paneles Solares

Una aplicación web moderna y responsiva para la venta de paneles solares con integración completa a Firebase Realtime Database.

## 🚀 Características Principales

### 📱 Diseño Responsivo
- **Mobile-First**: Optimizado para dispositivos móviles
- **Adaptativo**: Se adapta perfectamente a tablets y desktops
- **Táctil**: Interfaz optimizada para pantallas táctiles

### 🔥 Integración Firebase
- **Realtime Database**: Sincronización en tiempo real
- **Autenticación**: Sistema de login seguro
- **Notificaciones**: Sistema de notificaciones push

### 🛍️ Funcionalidades de E-commerce
- **Catálogo de Productos**: Paneles solares con información detallada
- **Carrito de Compras**: Gestión completa de productos
- **Filtros y Búsqueda**: Búsqueda avanzada por categorías y precios
- **Gestión de Stock**: Control de inventario en tiempo real

### 👨‍💼 Panel de Administración
- **CRUD Completo**: Crear, Leer, Actualizar, Eliminar paneles
- **Formularios Intuitivos**: Interfaz fácil de usar
- **Validación de Datos**: Validación en tiempo real
- **Notificaciones**: Feedback inmediato al usuario

## 📋 Campos de Paneles Solares

Cada panel solar incluye los siguientes campos:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| **Nombre** | Texto | Nombre del producto | ✅ |
| **Potencia** | Número | Potencia en vatios (W) | ✅ |
| **Precio** | Decimal | Precio en pesos mexicanos | ✅ |
| **Stock** | Número | Cantidad disponible | ❌ |
| **Disponible** | Booleano | Estado de disponibilidad | ❌ |
| **Categoría** | Select | Tipo de panel (Residencial, Comercial, etc.) | ❌ |
| **Descripción** | Texto | Descripción detallada | ❌ |
| **Dimensiones** | Texto | Dimensiones del panel | ❌ |
| **Imagen** | URL | URL de la imagen del producto | ❌ |

## 🛠️ Configuración Firebase

### 1. Crear Proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Realtime Database
4. Configura las reglas de seguridad

### 2. Configurar Credenciales
Edita el archivo `js/Firebase-config.js` con tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com"
};
```

### 3. Reglas de Base de Datos
Configura las reglas en Firebase Realtime Database:

```json
{
  "rules": {
    "paneles": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## 📁 Estructura del Proyecto

```
EcoPanelShop/
├── index.html              # Página principal
├── cart.html              # Página del carrito
├── contacto.html          # Página de contacto
├── login.html             # Página de login
├── css/
│   ├── styles.css         # Estilos principales
│   └── login-styles.css   # Estilos de login
├── js/
│   ├── app.js             # Lógica principal
│   ├── Firebase-config.js # Configuración Firebase
│   ├── admin-paneles.js   # Administración de paneles
│   ├── local-auth.js      # Autenticación local
│   ├── notification-config.js # Configuración notificaciones
│   ├── notification-manager.js # Gestor de notificaciones
│   ├── contacto.js        # Lógica de contacto
│   └── script.js          # Scripts adicionales
├── icons/
│   └── icon-512.png       # Icono de la aplicación
├── manifest.json          # Manifest PWA
├── serviceWorker.js       # Service Worker
└── README.md             # Documentación
```

## 🚀 Funcionalidades Implementadas

### ✅ Gestión de Productos
- [x] Listado de paneles solares
- [x] Agregar nuevos paneles
- [x] Editar paneles existentes
- [x] Eliminar paneles
- [x] Validación de formularios
- [x] Gestión de imágenes

### ✅ Carrito de Compras
- [x] Agregar productos al carrito
- [x] Modificar cantidades
- [x] Eliminar productos
- [x] Calcular totales
- [x] Persistencia local

### ✅ Filtros y Búsqueda
- [x] Búsqueda por nombre
- [x] Filtro por categoría
- [x] Filtro por precio
- [x] Ordenamiento

### ✅ Responsividad
- [x] Mobile-First Design
- [x] Breakpoints optimizados
- [x] Elementos táctiles
- [x] Navegación móvil

### ✅ Notificaciones
- [x] Notificaciones push
- [x] Notificaciones locales
- [x] Feedback de acciones

## 📱 Breakpoints Responsivos

| Dispositivo | Ancho | Características |
|-------------|-------|-----------------|
| **Mobile** | < 480px | 1 columna, botones grandes |
| **Tablet** | 480px - 768px | 2 columnas, navegación adaptada |
| **Desktop** | > 768px | 3+ columnas, navegación completa |

## 🎨 Componentes UI

### Modal de Administración
- Formulario responsivo
- Validación en tiempo real
- Botones de acción claros
- Cierre intuitivo

### Tarjetas de Productos
- Información completa
- Estado de stock
- Botones de acción
- Imágenes optimizadas

### Carrito Lateral
- Lista de productos
- Controles de cantidad
- Total en tiempo real
- Botones de acción

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos y responsivos
- **JavaScript ES6+**: Lógica de aplicación
- **Firebase**: Backend y base de datos
- **Font Awesome**: Iconografía
- **PWA**: Progressive Web App

## 📊 Base de Datos

### Estructura Firebase Realtime Database

```json
{
  "paneles": {
    "panel_id_1": {
      "nombre": "Panel Solar Monocristalino 400W",
      "potencia": 400,
      "precio": 8500.00,
      "stock": 15,
      "disponible": true,
      "categoria": "Residencial",
      "descripcion": "Panel solar de alta eficiencia...",
      "dimensiones": "1650 x 992 x 35 mm",
      "imagen": "https://ejemplo.com/imagen.jpg",
      "fechaCreacion": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

## 🚀 Instalación y Uso

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/EcoPanelShop.git
   cd EcoPanelShop
   ```

2. **Configurar Firebase**
   - Edita `js/Firebase-config.js` con tus credenciales
   - Configura las reglas de base de datos

3. **Servir la aplicación**
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js
   npx serve .
   
   # Con PHP
   php -S localhost:8000
   ```

4. **Acceder a la aplicación**
   - Abre `http://localhost:8000` en tu navegador
   - La aplicación funciona offline gracias al Service Worker

## 📱 PWA Features

- **Instalable**: Se puede instalar como app nativa
- **Offline**: Funciona sin conexión
- **Notificaciones**: Sistema de notificaciones push
- **Responsive**: Se adapta a cualquier dispositivo

## 🔒 Seguridad

- Validación de formularios en cliente y servidor
- Autenticación Firebase
- Reglas de base de datos seguras
- Sanitización de datos

## 📈 Próximas Mejoras

- [ ] Sistema de pagos
- [ ] Gestión de usuarios
- [ ] Historial de pedidos
- [ ] Sistema de reseñas
- [ ] Integración con APIs de envío
- [ ] Dashboard de analytics

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

- **Teléfono**: +52 812 085 8045
- **Email**: contacto@ecopanel-shop.com
- **Sitio Web**: https://ecopanel-shop.com

---

**EcoPanelShop** - Energía solar para un futuro sostenible 🌞
