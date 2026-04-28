const CACHE = 'calendar-v1';

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './js/app.js',
  './js/auth.js',
  './js/calendar.js',
  './js/categories.js',
  './js/config.js',
  './js/mini-calendar.js',
  './js/modal.js',
  './js/popup.js',
  './js/storage.js',
  './js/supabase.js',
  './js/supabase-config.js',
  './js/utils.js',
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap',
];

// Cache app shell on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Remove old caches on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Supabase API calls → network-first (skip cache, return empty on failure)
// - Everything else  → cache-first, falling back to network
self.addEventListener('fetch', event => {
  const url = event.request.url;

  if (url.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          caches.open(CACHE).then(cache =>
            cache.put(event.request, response.clone())
          );
        }
        return response;
      });
    })
  );
});
