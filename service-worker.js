/* D+J Bildung – Service Worker
   Macht die App installierbar und die App-Dateien offline-fähig.
   WICHTIG: Datenbank-Abfragen (Supabase) und andere Fremd-Dienste werden NIE
   zwischengespeichert – sie gehen immer frisch ans Netz, damit das Dashboard
   stets den aktuellen Stand zeigt.
   Bei Code-Änderungen die Versionsnummer erhöhen (v2 -> v3 ...). */
const CACHE = 'djbildung-v8';

const CORE = [
  './',
  './index.html',
  './admin.html',
  './angebotsgenerator.html',
  './impressum.html',
  './datenschutz.html',
  './manifest.json',
  './supabase-config.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

// Install: Kern-Dateien cachen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// Activate: ALTE Caches löschen (entfernt auch alte, fälschlich gecachte Daten)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;            // Schreibvorgänge nie anfassen
  const url = new URL(req.url);

  // NUR eigene Dateien behandeln. Alles Fremde (Supabase-Datenbank/Login,
  // CDN-Bibliotheken, Chat) geht direkt und ungecacht ans Netz -> immer aktuell.
  if (url.origin !== self.location.origin) return;

  // Eigene Dateien: erst Netz (aktuell), Cache nur als Offline-Reserve.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
