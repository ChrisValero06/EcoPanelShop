// Funciones de administración para paneles solares
const adminPaneles = {
  // Función para agregar un nuevo panel
  agregarPanel: async (panelData) => {
    try {
      // Validar datos requeridos
      if (!panelData.nombre || !panelData.potencia || !panelData.precio) {
        throw new Error('Los campos Nombre, Potencia y Precio son obligatorios');
      }

      // Convertir valores numéricos
      const panelProcessed = {
        nombre: panelData.nombre.trim(),
        potencia: parseInt(panelData.potencia) || 0,
        precio: parseFloat(panelData.precio) || 0,
        stock: parseInt(panelData.stock) || 0,
        disponible: panelData.disponible === 'true' || panelData.disponible === true,
        categoria: panelData.categoria || 'General',
        descripcion: panelData.descripcion || '',
        dimensiones: panelData.dimensiones || '',
        imagen: panelData.imagen || 'https://via.placeholder.com/350x250?text=Panel+Solar'
      };

      const panelId = await window.panelesService.agregarPanel(panelProcessed);
      
      // Mostrar notificación de éxito
      if (window.notificationManager && window.notificationManager.canShowNotifications()) {
        window.notificationManager.showNotification(
          'Panel agregado',
          `El panel "${panelProcessed.nombre}" ha sido agregado exitosamente.`
        );
      }

      return panelId;
    } catch (error) {
      console.error('Error al agregar panel:', error);
      throw error;
    }
  },

  // Función para actualizar un panel existente
  actualizarPanel: async (panelId, panelData) => {
    try {
      // Validar datos requeridos
      if (!panelData.nombre || !panelData.potencia || !panelData.precio) {
        throw new Error('Los campos Nombre, Potencia y Precio son obligatorios');
      }

      // Convertir valores numéricos
      const panelProcessed = {
        nombre: panelData.nombre.trim(),
        potencia: parseInt(panelData.potencia) || 0,
        precio: parseFloat(panelData.precio) || 0,
        stock: parseInt(panelData.stock) || 0,
        disponible: panelData.disponible === 'true' || panelData.disponible === true,
        categoria: panelData.categoria || 'General',
        descripcion: panelData.descripcion || '',
        dimensiones: panelData.dimensiones || '',
        imagen: panelData.imagen || 'https://via.placeholder.com/350x250?text=Panel+Solar'
      };

      await window.panelesService.actualizarPanel(panelId, panelProcessed);
      
      // Mostrar notificación de éxito
      if (window.notificationManager && window.notificationManager.canShowNotifications()) {
        window.notificationManager.showNotification(
          'Panel actualizado',
          `El panel "${panelProcessed.nombre}" ha sido actualizado exitosamente.`
        );
      }
    } catch (error) {
      console.error('Error al actualizar panel:', error);
      throw error;
    }
  },

  // Función para eliminar un panel
  eliminarPanel: async (panelId, nombrePanel) => {
    try {
      if (confirm(`¿Estás seguro de que quieres eliminar el panel "${nombrePanel}"?`)) {
        await window.panelesService.eliminarPanel(panelId);
        
        // Mostrar notificación de éxito
        if (window.notificationManager && window.notificationManager.canShowNotifications()) {
          window.notificationManager.showNotification(
            'Panel eliminado',
            `El panel "${nombrePanel}" ha sido eliminado exitosamente.`
          );
        }
        
        // Recargar la lista de productos
        if (typeof mostrarPanelesEnProductos === 'function') {
          mostrarPanelesEnProductos();
        }
      }
    } catch (error) {
      console.error('Error al eliminar panel:', error);
      throw error;
    }
  },

  // Función para cargar datos de un panel para edición
  cargarPanelParaEdicion: async (panelId) => {
    try {
      const panel = await window.panelesService.obtenerPanelPorId(panelId);
      return panel;
    } catch (error) {
      console.error('Error al cargar panel para edición:', error);
      throw error;
    }
  },

  // Función para validar formulario de panel
  validarFormularioPanel: (formData) => {
    const errores = [];

    if (!formData.nombre || formData.nombre.trim() === '') {
      errores.push('El nombre del producto es obligatorio');
    }

    if (!formData.potencia || isNaN(parseInt(formData.potencia)) || parseInt(formData.potencia) <= 0) {
      errores.push('La potencia debe ser un número mayor a 0');
    }

    if (!formData.precio || isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) <= 0) {
      errores.push('El precio debe ser un número mayor a 0');
    }

    if (formData.stock && (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0)) {
      errores.push('El stock debe ser un número mayor o igual a 0');
    }

    return errores;
  },

  // Función para mostrar formulario de agregar/editar panel
  mostrarFormularioPanel: (panelId = null, panelData = null) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${panelId ? 'Editar' : 'Agregar'} Producto</h2>
          <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <form id="panelForm" class="panel-form">
          <div class="form-group">
            <label for="nombre">Nombre del Producto *</label>
            <input type="text" id="nombre" name="nombre" value="${panelData?.nombre || ''}" required>
          </div>
          
          <div class="form-group">
            <label for="potencia">Potencia (W) *</label>
            <input type="number" id="potencia" name="potencia" value="${panelData?.potencia || ''}" min="1" required>
          </div>
          
          <div class="form-group">
            <label for="precio">Precio *</label>
            <input type="number" id="precio" name="precio" value="${panelData?.precio || ''}" min="0.01" step="0.01" required>
          </div>
          
          <div class="form-group">
            <label for="stock">Stock</label>
            <input type="number" id="stock" name="stock" value="${panelData?.stock || '0'}" min="0">
          </div>
          
          <div class="form-group">
            <label for="disponible">Disponible</label>
            <select id="disponible" name="disponible">
              <option value="true" ${panelData?.disponible ? 'selected' : ''}>Sí</option>
              <option value="false" ${!panelData?.disponible ? 'selected' : ''}>No</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="categoria">Categoría</label>
            <select id="categoria" name="categoria">
              <option value="Residencial" ${panelData?.categoria === 'Residencial' ? 'selected' : ''}>Residencial</option>
              <option value="Comercial" ${panelData?.categoria === 'Comercial' ? 'selected' : ''}>Comercial</option>
              <option value="Industrial" ${panelData?.categoria === 'Industrial' ? 'selected' : ''}>Industrial</option>
              <option value="Agrícola" ${panelData?.categoria === 'Agrícola' ? 'selected' : ''}>Agrícola</option>
              <option value="Premium" ${panelData?.categoria === 'Premium' ? 'selected' : ''}>Premium</option>
              <option value="Móvil" ${panelData?.categoria === 'Móvil' ? 'selected' : ''}>Móvil</option>
              <option value="General" ${panelData?.categoria === 'General' ? 'selected' : ''}>General</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea id="descripcion" name="descripcion" rows="3">${panelData?.descripcion || ''}</textarea>
          </div>
          
          <div class="form-group">
            <label for="dimensiones">Dimensiones del Panel</label>
            <input type="text" id="dimensiones" name="dimensiones" value="${panelData?.dimensiones || ''}" placeholder="ej: 1650 x 992 x 35 mm">
          </div>
          
          <div class="form-group">
            <label for="imagen">URL de la Imagen</label>
            <input type="url" id="imagen" name="imagen" value="${panelData?.imagen || ''}" placeholder="https://ejemplo.com/imagen.jpg">
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
            <button type="submit" class="btn-primary">${panelId ? 'Actualizar' : 'Agregar'} Panel</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Manejar envío del formulario
    const form = modal.querySelector('#panelForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const panelData = Object.fromEntries(formData.entries());
      
      // Validar formulario
      const errores = adminPaneles.validarFormularioPanel(panelData);
      if (errores.length > 0) {
        alert('Errores en el formulario:\n' + errores.join('\n'));
        return;
      }

      try {
        if (panelId) {
          await adminPaneles.actualizarPanel(panelId, panelData);
        } else {
          await adminPaneles.agregarPanel(panelData);
        }
        
        modal.remove();
        
        // Recargar la lista de productos
        if (typeof mostrarPanelesEnProductos === 'function') {
          mostrarPanelesEnProductos();
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });
  }
};

// Exportar para uso global
window.adminPaneles = adminPaneles;
