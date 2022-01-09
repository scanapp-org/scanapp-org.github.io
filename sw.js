/**
 * Service worker for scanapp PWA.
 */

var cacheName = 'v4:static';
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll([
                '/assets/app.css',
                '/assets/main.css',
                // '/assets/js/html5-qrcode.min.js',
                // '/assets/js/app.js',
                '/assets/fonts/ibm-plex-sans/ibm-plex-sans-v2-latin-300.woff2',
            ]);
        }).then(function() {
            self.skipWaiting();
        })
    );
});

// With request network
self.addEventListener('fetch', function(event) {
    event.respondWith(
        // try the cache
        caches.match(event.request).then(function(response) {
            // return it if there is a response or else fetch again.
            return response || fetch(event.request);
            // return fetch(event.request);
        })
    );
});
