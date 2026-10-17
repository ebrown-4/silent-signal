/*
 * Silent Signal - Service Worker
 * Caches the application shell so the app loads and stays useful offline.
 */

// Versioned cache name - bump this when app shell files change
const CACHE_NAME = 'silent-signal-v5';

// Application shell: the files needed to open and run the main interface
const APP_SHELL = [
  './',
  './index.html',
  './submit.html',
  './post.html',
  './about.html',
  './offline.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
  './vendor/materialize.min.css',
  './vendor/materialize.min.js',
  './vendor/material-icons.css',
  './vendor/material-icons.woff2',
  './vendor/fonts.css',
  './vendor/fonts/23cb87eb0ddc.woff2',
  './vendor/fonts/3191af27b777.woff2',
  './vendor/fonts/36024e18f843.woff2',
  './vendor/fonts/48b69c5b8e64.woff2',
  './vendor/fonts/6fdfd6d23cb8.woff2',
  './vendor/fonts/93d4e61776cf.woff2',
  './vendor/fonts/9eac082ba4db.woff2',
  './vendor/fonts/a6b4ec26bf25.woff2',
  './vendor/fonts/cac1056b00eb.woff2',
  './vendor/fonts/d6e3c35b34cb.woff2',
  './vendor/fonts/ea4b831bbe9f.woff2',
  './icons/icon-96.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png'
];

// Install: save the application shell into Cache Storage,
// and finish caching before installation completes.
// If any file fails to cache, installation fails and the old
// service worker keeps running.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(APP_SHELL);
        console.log('[Silent Signal SW] Application shell cached successfully');
        await self.skipWaiting();
      } catch (error) {
        console.error('[Silent Signal SW] Install failed:', error);
        throw error; // rethrow so installation does not complete with a broken shell
      }
    })()
  );
});

// Activate: remove outdated cache versions, keep only the current one.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        const oldCaches = keys.filter(
          (key) => key.startsWith('silent-signal-') && key !== CACHE_NAME
        );
        await Promise.all(oldCaches.map((key) => caches.delete(key)));
        console.log('[Silent Signal SW] Old caches removed:', oldCaches);
        await self.clients.claim();
      } catch (error) {
        console.error('[Silent Signal SW] Activation failed:', error);
        throw error;
      }
    })()
  );
});

// Fetch: check Cache Storage first, fall back to the network.
// GET requests only; failed page navigations get the offline page.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // 1. Is the file already in Cache Storage?
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. Not cached - try the network.
        const networkResponse = await fetch(event.request);

        // A failed page load (offline or an error page like a raw 404)
        // should show our offline page instead of a broken browser page.
        if (!networkResponse.ok && event.request.mode === 'navigate') {
          const offlinePage = await caches.match('./offline.html');
          if (offlinePage) {
            return offlinePage;
          }
        }

        // Cache same-origin files we didn't pre-cache (e.g. post images)
        // so they are available on the next offline visit.
        if (networkResponse.ok && new URL(event.request.url).origin === self.location.origin) {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, networkResponse.clone());
          } catch (cacheError) {
            // A failed cache write should not break the response we already have.
            console.warn('[Silent Signal SW] Could not cache file:', event.request.url, cacheError);
          }
        }

        return networkResponse;
      } catch (error) {
        // 3. No cache and no network.
        if (event.request.mode === 'navigate') {
          const offlinePage = await caches.match('./offline.html');
          if (offlinePage) {
            return offlinePage;
          }
        }
        console.warn('[Silent Signal SW] Request failed and no offline fallback:', event.request.url);
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })()
  );
});
