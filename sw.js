const SHELL_CACHE = "shell-v9";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./db.js",
  "https://cdn.jsdelivr.net/npm/idb@7/build/umd.js",
  "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
  "./manifest.json",
  "./icon512_maskable.png",
  "./icon512_rounded.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE)
          .map((key) => caches.delete(key)),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  if (url.hostname.includes("exchangerate-api.com")) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      return (
        response ||
        fetch(e.request).catch(() => {
          console.warn(
            `[Service Worker] Impossible de charger ${url.href} hors-ligne.`,
          );
        })
      );
    }),
  );
});
