// NutriFamilia High-Performance Lightweight Service Worker for PWA Installation
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Non-blocking direct fetch passing through
self.addEventListener('fetch', () => {
  // Let the browser handle standard fast network streaming
});
