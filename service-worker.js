const CACHE_NAME = 'bara-co-v3-20260806';
const STATIC_ASSETS = [
  '/css/global.css',
  '/js/carrito.js',
  '/js/main.js',
  '/js/search.js',
  '/manifest.json'
];

// Instala inmediatamente la versión nueva del Service Worker.
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Elimina las cachés anteriores que conservaban HTML viejo.
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith('bara-co-') && key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML: primero red. Evita volver a mostrar versiones antiguas de Inicio o Tienda.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
            );
          }
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
            (await caches.match('/index.html')) ||
            Response.error()
          );
        })
    );
    return;
  }

  // Recursos estáticos: caché rápida con actualización en segundo plano.
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
            );
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
