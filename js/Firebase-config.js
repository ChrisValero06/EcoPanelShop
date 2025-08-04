// Configuración de Firebase (REEMPLAZA estos valores por los de tu proyecto)
const firebaseConfig = {
  apiKey: "TU_API_KEY_REAL",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
// Inicializa Realtime Database
const database = firebase.database();
