if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('../serviceWorker.js')
          .then(reg => console.log('Service Worker registrado:', reg.scope))
          .catch(err => console.error('Error al registrar SW:', err));
      });
    }
