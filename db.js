const DB_NAME = 'pwa-convertir-db';
const DB_VERSION = 1;

// On vérifie si idb existe bien avant d'essayer de l'utiliser
if (typeof idb !== 'undefined') {
  // On l'attache à "window" pour être 100% sûr que app.js puisse la lire
  window.dbPromise = idb.openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('rates')) {
        db.createObjectStore('rates', { keyPath: 'base_code' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });
} else {
  console.error("La bibliothèque IndexedDB n'est pas disponible.");
  window.dbPromise = null;
}