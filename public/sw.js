/* YR NOVATECH service worker
 *
 * Design rules (do not break auth / Supabase / dashboards / payments):
 *  - Never intercept cross-origin requests (Supabase REST + Auth, fonts, ads).
 *  - Never intercept navigations, HTML documents, or same-origin data/API calls.
 *  - Never cache authenticated or private responses.
 *  - Cache only immutable, content-hashed build assets under /assets/.
 */
const ASSET_CACHE = "yrnovatech-assets-v1";
const SW_PREFIX = "yrnovatech-";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith(SW_PREFIX) && k !== ASSET_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Pass through anything not same-origin untouched (Supabase, fonts, ads).
  if (url.origin !== self.location.origin) return;

  // Never take over navigations or HTML documents.
  if (req.mode === "navigate") return;

  // Only cache immutable hashed build assets; everything else is network-only.
  if (!url.pathname.startsWith("/assets/")) return;

  event.respondWith(
    caches.open(ASSET_CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});