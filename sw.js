// Simple Service Worker with Stale-While-Revalidate caching strategy
const CACHE_NAME = 'pos-pwa-v1';
const PRECACHE = [
  '/', '/index.html', '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Basic offline strategy: try cache first, then network; update cache in background
  event.respondWith(
    caches.match(req).then(cached => {
      const networked = fetch(req).then(resp => {
        if (resp && resp.status === 200 && req.method === 'GET') {
          caches.open(CACHE_NAME).then(cache => cache.put(req, resp.clone()));
        }
        return resp.clone();
      }).catch(()=>cached);
      return cached || networked;
    })
  );
});