const SHELL_CACHE = "shell-v9"; // On passe en v8 pour forcer la mise à jour

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./db.js",
  "https://cdn.jsdelivr.net/npm/idb@7/build/umd.js",
  "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap", // Les polices Google ajoutées ici !
  "./manifest.json",
  "./icon512_maskable.png",
  "./icon512_rounded.png",
];

// Installation
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting(); // Force l'installation immédiate
});

// Activation
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== SHELL_CACHE).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // Force la prise de contrôle sur toutes les pages ouvertes
});

// Fetch
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // On ignore l'API des devises
  if (url.hostname.includes("exchangerate-api.com")) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      // Retourne le cache OU tente le réseau OU capture l'erreur silencieusement
      return response || fetch(e.request).catch(() => {
          console.warn(`[Service Worker] Impossible de charger ${url.href} hors-ligne.`);
      });
    })
  );
});