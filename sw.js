/* ═══════════════════════════════════════════════════════════
   Annamay Restaurant — Service Worker
   Strategy: Cache-first for assets, network-first for HTML
═══════════════════════════════════════════════════════════ */

const CACHE_NAME   = 'annamay-v4';
const STATIC_CACHE = 'annamay-static-v4';
const IMG_CACHE    = 'annamay-images-v4';

/* Core assets to pre-cache on install */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/wheel.css',
  '/css/menu.css',
  '/css/ui.css',
  '/css/kitchen.css',
  '/js/data.js',
  '/js/wheel.js',
  '/js/app.js',
  '/js/pwa.js',
  '/js/seo.js',
  '/manifest.json',
  '/images/default.jpg',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap'
];

/* ── INSTALL — pre-cache all core assets ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE — clean old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== IMG_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH — serve from cache, fallback to network ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Skip non-GET and cross-origin except Google Fonts */
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin && !url.hostname.includes('fonts.g')) return;

  /* Images: cache-first with fallback to default.jpg */
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMG_CACHE).then(async cache => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          if (fresh.ok) cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const fallback = await caches.match('/images/default.jpg');
          return fallback || new Response('', { status: 404 });
        }
      })
    );
    return;
  }

  /* HTML (index.html): network-first so content stays fresh */
  if (request.destination === 'document' || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  /* CSS / JS / fonts: cache-first */
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
        }
        return res;
      });
    })
  );
});
