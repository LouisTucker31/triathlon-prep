// Offline support: pre-cache the app shell, then serve from cache while
// refreshing it in the background. Bump VERSION to force a clean re-cache.
const VERSION = "v1";
const CACHE = "tri-packing-" + VERSION;
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "theme.js",
  "app.js",
  "liquid-glass-nav.js",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("tri-packing-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(cached => {
        const network = fetch(req)
          .then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
          .catch(() => cached || (req.mode === "navigate" ? cache.match("index.html") : Response.error()));
        if (cached) { e.waitUntil(network.catch(() => {})); return cached; }
        return network;
      })
    )
  );
});
