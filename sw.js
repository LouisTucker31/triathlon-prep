// Offline support: pre-cache the app shell, then fetch network-first so the
// installed app always picks up the latest version, falling back to the cache
// when offline or on a slow connection. Bump VERSION to force a clean re-cache.
const VERSION = "v3";
const CACHE = "tri-packing-" + VERSION;
const NETWORK_TIMEOUT = 3000;
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
  // cache: "reload" skips the browser's HTTP cache so we store fresh copies
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
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
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // no-cache: revalidate with the server instead of trusting GitHub Pages' 10-minute max-age
    const network = fetch(req, { cache: "no-cache" }).then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    });
    const fallback = () => cache.match(req, { ignoreSearch: true })
      .then(hit => hit || (req.mode === "navigate" ? cache.match("index.html") : undefined));
    e.waitUntil(network.catch(() => {}));
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), NETWORK_TIMEOUT));
      return await Promise.race([network, timeout]);
    } catch {
      return (await fallback()) || network.catch(() => Response.error());
    }
  })());
});
