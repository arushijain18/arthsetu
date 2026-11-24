const CACHE_NAME = 'arthsetu-irregular-v2';
const CORE_FILES = [
  './', './index.html', './app.css', './app.js', './content.js',
  './content/en.json', './content/hi.json', './content/schemes.json',
  './manifest.webmanifest', './icon.svg',
  './assets/bull-logo.png', './assets/hero-collage.webp', './assets/tier-daily.webp',
  './assets/tier-weekly.webp', './assets/tier-project.webp',
  './assets/bazaar-story.webp', './assets/community-worker.webp',
  './assets/folk-craft.webp', './assets/weaver-market.webp'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => caches.match('./index.html'))));
});
