// Simple PWA service worker for instant installation and offline fallback caching
const CACHE_NAME = 'bvp-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Let the browser handle standard API or hot reload queries directly
  if (e.request.url.includes('/api/') || e.request.url.includes('chrome-extension')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((response) => {
        // Return response directly if not valid or is a range query
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Cache dynamic assets on the fly
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          try {
            cache.put(e.request, responseToCache);
          } catch (err) {
            // Ignore potential cache.put issues for external resources
          }
        });
        
        return response;
      }).catch(() => {
        // Fallback for offline HTML page
        return caches.match('/');
      });
    })
  );
});
