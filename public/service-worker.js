const CACHE_NAME = 'logme-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/public/DriverDeliveryLogForm.html',
  '/public/AddLogEntry.html',
  '/public/FinalizeDailyLog.html',
  '/public/confirmation.html',
  '/public/styles/output.css',
  '/public/styles/styles.css',
  '/public/scripts/app.js',
  '/public/scripts/auth.js',
  '/public/scripts/emailService.js',
  '/public/scripts/finalizeLog.js',
  '/public/images/logmelogo.jpg',
  '/public/images/18wheeler.jpeg',
  '/public/images/yellowVest.jpeg',
  '/public/images/driverblue.jpeg',
  '/public/images/drivergrey.jpeg'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve cached content if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});
