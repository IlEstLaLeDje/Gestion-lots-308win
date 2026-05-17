// Service Worker — .308 WIN v10.8
// Cache offline-first : le fichier HTML est servi depuis le cache dès le 2e chargement.
// La mise à jour GitHub est détectée en arrière-plan et appliquée au prochain lancement.

const CACHE_NAME = '308win-v10.8';
const FILES = [
  './',
  './index.html'
];

// Installation : mise en cache des fichiers essentiels
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// Activation : suppression des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch : cache-first avec mise à jour réseau en arrière-plan (stale-while-revalidate)
self.addEventListener('fetch', event => {
  // Ne gérer que les requêtes GET vers notre propre origine
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        // Requête réseau en arrière-plan pour mettre à jour le cache
        const networkFetch = fetch(event.request).then(response => {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => null);

        // Servir immédiatement depuis le cache si disponible, sinon attendre le réseau
        return cached || networkFetch;
      })
    )
  );
});
