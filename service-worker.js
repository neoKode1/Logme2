const CACHE_NAME = 'logme-cache-v1';
const urlsToCache = [
  '/',
  '/public/styles.css',
  '/public/app.js',
  '/public/images/logme%20logo.jpg',
  '/public/Add%20Log%20Entry.html',
  '/public/Driver%20Delivery%20Log%20Form.html',
  '/public/Finalize%20Daily%20Log.html',
  // Add other assets you want to cache
];

// Install event - cache assets
self.addEventListener('install', function(event) {
    console.log('[SW] Service Worker installing');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('[SW] Cache opened');
                console.log('[SW] Caching URLs:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('[SW] Cache error:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating.');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve cached content if available
self.addEventListener('fetch', function(event) {
    console.log('[SW] Fetch event for:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    console.log('[SW] Found in cache:', event.request.url);
                    return response;
                }
                console.log('[SW] Fetching:', event.request.url);
                return fetch(event.request).then(
                    function(response) {
                        console.log('[SW] Fetch response:', {
                            status: response.status,
                            type: response.type,
                            url: response.url
                        });
                        return response;
                    }
                );
            })
            .catch(error => {
                console.error('[SW] Fetch error:', error);
            })
    );
});
