const SHELL_CACHE = "shell-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./db.js", // Assure-toi que db.js est aussi mis en cache
  "./manifest.json",
  "./icon512_maskable.png",
  "./icon512_rounded.png"
];

// Installation : On met en cache uniquement les fichiers de l'interface
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : Nettoyage des anciens caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== SHELL_CACHE).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch : Stratégie Cache-First pour l'interface uniquement
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // On ignore les requêtes vers l'API dans le SW 
  // car app.js s'en occupe avec IndexedDB
  if (url.hostname.includes("exchangerate-api.com")) {
    return; 
  }

  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});