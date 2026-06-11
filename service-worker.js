/* D+J Bildung – Service Worker
   Macht die App installierbar und grundlegend offline-fähig.
   Bei jeder Code-Änderung die Versionsnummer in CACHE erhöhen (v1 -> v2 ...),
   damit Nutzer die neue Version bekommen. */
const CACHE = 'djbildung-v1';

const CORE = [
  './',
  './index.html',
  './angebotsgenerator.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

// Install: Kern-Dateien in den Cache legen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

// Activate: alte Caches aufräumen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch-Strategie
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Seiten (HTML): erst Netz, dann Cache (damit Updates schnell kommen, offline trotzdem läuft)
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Gleiche Domain (Icons, Manifest): erst Cache, dann Netz
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((r) => r || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }))
    );
    return;
  }

  // Fremde Domains (CDN: jsPDF, QR-Code, Chatbot): erst Cache, dann Netz – ohne hart zu scheitern
  event.respondWith(
    caches.match(req).then((cached) =>
      cached || fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached)
    )
  );
});
