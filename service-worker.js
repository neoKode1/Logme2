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
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
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
  console.log('Fetching:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response; // Return the cached response if found
        }
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response. A response is a stream and because we want the browser to consume the response as well as the cache consuming the response, we need to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
