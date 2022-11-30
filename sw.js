/**
 * Service worker for scanapp PWA.
 */

// On new version, change this name.
var cacheName = 'v2.3.4:static';
self.addEventListener('install', function(event) {
    // prevents the waiting, meaning the service worker activates
    // as soon as it's finished installing
    // NOTE: don't use this if you don't want your sw to control pages
    // that were loaded with an older version
    self.skipWaiting();

    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll([
                // As new files are added, update this.
                '/assets/app.v2.2.8.2.css',
                '/assets/js/app.min.v2.3.3.js',
                '/assets/js/html5-qrcode.min.v2.3.4.js',
                '/assets/main.css',
                '/assets/css/index.v2.2.8.1.css',
                '/assets/fonts/ibm-plex-sans/ibm-plex-sans-v2-latin-300.woff2',
            ]);
        }).then(function() {
            self.skipWaiting();
        })
    );
});

// Remove old cache if any.
self.addEventListener('activate', (event) => {
    event.waitUntil((function(e) {
        return caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(cacheName) {
                if (self.cacheName !== cacheName) {
                    return caches.delete(cacheName);
                }
            }))
        });

    })());
});

// With request network
self.addEventListener('fetch', function(event) {
    event.respondWith(
        // try the cache
        caches.match(event.request).then(function(response) {
            // return it if there is a response or else fetch again.
            return response || fetch(event.request);
        })
    );
});
