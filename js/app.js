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

// Mostrar paneles solares en la sección de productos
function mostrarPanelesEnProductos() {
  if (typeof db !== 'undefined') {
    db.collection("paneles").get().then((querySnapshot) => {
      const productsGrid = document.getElementById("productsGrid");
      productsGrid.innerHTML = ""; // Limpia el grid

      if (querySnapshot.empty) {
        productsGrid.innerHTML = "<p>No hay paneles registrados.</p>";
        return;
      }

      querySnapshot.forEach((doc) => {
        const panel = doc.data();
        // Personaliza los campos según tu estructura
        const panelHTML = `
          <div class="product-card">
            <div class="product-image">
              <img src="${panel.imagen || 'https://via.placeholder.com/350x250?text=Panel+Solar'}" alt="${panel.nombre || 'Panel Solar'}">
            </div>
            <div class="product-info">
              <h3>${panel.nombre || 'Panel Solar'}</h3>
              <div class="product-specs">
                <span>Potencia: ${panel.potencia || 'N/A'} W</span>
                <span>Ubicación: ${panel.ubicacion || 'N/A'}</span>
              </div>
              <p>${panel.descripcion || ''}</p>
              <div class="product-price">
                <span class="current-price">$${panel.precio || '0.00'}</span>
              </div>
            </div>
          </div>
        `;
        productsGrid.innerHTML += panelHTML;
      });
    }).catch((error) => {
      console.error("Error al leer paneles:", error);
      document.getElementById("productsGrid").innerHTML = "<p>Error al cargar los paneles.</p>";
    });
  }
}

// Llama a la función al cargar la página:
document.addEventListener('DOMContentLoaded', mostrarPanelesEnProductos);
