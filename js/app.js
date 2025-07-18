if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./serviceWorker.js', { scope: './' })
    .then(() => console.log('Service Worker registrado'))
    .catch(err => console.error('Error al registrar el Service Worker:', err));
}

//  Leer paneles solares desde Firestore y mostrarlos en consola
if (typeof db !== 'undefined') {
  db.collection("paneles").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      console.log("Panel:", doc.id, doc.data());
    });
  }).catch((error) => {
    console.error("Error al leer paneles:", error);
  });
} else {
  console.warn("Firestore no está inicializado. Verifica tu configuración de Firebase.");
}
