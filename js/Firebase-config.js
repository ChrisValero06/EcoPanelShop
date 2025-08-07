// Configuración de Firebase (REEMPLAZA estos valores por los de tu proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyChhNYQsf0_fHnXohdizYP7-eSM9kGdnaI",
  authDomain: "crudfirebase-5f35c.firebaseapp.com",
  databaseURL: "https://crudfirebase-5f35c-default-rtdb.firebaseio.com",
  projectId: "crudfirebase-5f35c",
  storageBucket: "crudfirebase-5f35c.firebasestorage.app",
  messagingSenderId: "339447477684",
  appId: "1:339447477684:web:5d0ef8c9c83ae3270f2ee1",
  measurementId: "G-GQTRERJG6E"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
// Inicializa Realtime Database
const database = firebase.database();

// Funciones para manejar paneles solares
const panelesService = {
  // Obtener todos los paneles
  obtenerPaneles: async () => {
    try {
      const snapshot = await database.ref("paneles").once('value');
      return snapshot.val() || {};
    } catch (error) {
      console.error("Error al obtener paneles:", error);
      throw error;
    }
  },

  // Agregar un nuevo panel
  agregarPanel: async (panelData) => {
    try {
      const nuevoPanelRef = database.ref("paneles").push();
      await nuevoPanelRef.set({
        nombre: panelData.nombre,
        potencia: panelData.potencia,
        precio: panelData.precio,
        stock: panelData.stock,
        disponible: panelData.disponible,
        categoria: panelData.categoria,
        descripcion: panelData.descripcion,
        dimensiones: panelData.dimensiones,
        imagen: panelData.imagen || 'https://via.placeholder.com/350x250?text=Panel+Solar',
        fechaCreacion: new Date().toISOString()
      });
      return nuevoPanelRef.key;
    } catch (error) {
      console.error("Error al agregar panel:", error);
      throw error;
    }
  },

  // Actualizar un panel existente
  actualizarPanel: async (panelId, panelData) => {
    try {
      await database.ref(`paneles/${panelId}`).update({
        nombre: panelData.nombre,
        potencia: panelData.potencia,
        precio: panelData.precio,
        stock: panelData.stock,
        disponible: panelData.disponible,
        categoria: panelData.categoria,
        descripcion: panelData.descripcion,
        dimensiones: panelData.dimensiones,
        imagen: panelData.imagen,
        fechaActualizacion: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error al actualizar panel:", error);
      throw error;
    }
  },

  // Eliminar un panel
  eliminarPanel: async (panelId) => {
    try {
      await database.ref(`paneles/${panelId}`).remove();
    } catch (error) {
      console.error("Error al eliminar panel:", error);
      throw error;
    }
  },

  // Obtener panel por ID
  obtenerPanelPorId: async (panelId) => {
    try {
      const snapshot = await database.ref(`paneles/${panelId}`).once('value');
      return snapshot.val();
    } catch (error) {
      console.error("Error al obtener panel:", error);
      throw error;
    }
  }
};

// Exportar para uso global
window.panelesService = panelesService;
