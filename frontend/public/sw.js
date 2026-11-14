/**
 * Student Management System (MyPintou) - Service Worker
 * Version: 2.0.0
 * Features:
 * - Intelligent Network-First for Navigation Documents (Instant Update Delivery)
 * - Stale-While-Revalidate for Versioned Static Assets (Fast Loading)
 * - Network-Only for Google Apps Script & Sensitive Academic Data (Strict Security)
 * - Safe Cache Cleanup & Message-Based Skip-Waiting
 */

const CACHE_VERSION = "mypintou-v2.2.1";
const STATIC_CACHE = `mypintou-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `mypintou-runtime-${CACHE_VERSION}`;

// Pre-cached application shell resources
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon-32x32.png",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
  "/pwa-maskable-512x512.png",
  "/assets/images/app_icon.svg",
  "/assets/images/logo_light_theme.svg",
  "/assets/images/logo_dark_theme.svg"
];

// Install Event: Precache App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Precache asset caching partial failure:", err);
      });
    })
  );
  // Do not automatically force skipWaiting here without user consent
  // so active student score entries are never disrupted
});

// Activate Event: Clean up outdated cache versions and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith("mypintou-") && name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log("[SW] Deleting obsolete cache:", name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for SKIP_WAITING from app UI (User clicked "Update Now")
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Received SKIP_WAITING message, activating new service worker...");
    self.skipWaiting();
  }
});

// Fetch Event: Intelligent Strategy per request type
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 0. STRICT SCHEME CHECK: Cache API only supports http: and https: schemes.
  // Ignore chrome-extension://, moz-extension://, file://, data:, etc.
  if (!request.url || (!request.url.startsWith("http://") && !request.url.startsWith("https://"))) {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch (_) {
    return;
  }

  // Helper function to safely put into cache without throwing uncaught errors
  const safeCachePut = (cacheName, req, res) => {
    if (!req || !req.url || (!req.url.startsWith("http://") && !req.url.startsWith("https://"))) {
      return Promise.resolve();
    }
    return caches.open(cacheName).then((cache) => {
      return cache.put(req, res).catch(() => {});
    }).catch(() => {});
  };

  // 1. STRICT SECURITY: Never cache Google Apps Script or external API calls
  if (
    url.origin.includes("script.google.com") ||
    url.origin.includes("googleusercontent.com") ||
    url.pathname.includes("/exec") ||
    request.method !== "GET"
  ) {
    // Network-Only for all sensitive data & mutations
    return;
  }

  // 2. Navigation Requests (HTML pages): Network-First with Offline Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            safeCachePut(RUNTIME_CACHE, request, copy);
          }
          return response;
        })
        .catch(async () => {
          // If network failed, attempt to return cached page or offline.html
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match("/offline.html");
          return fallback || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
        })
    );
    return;
  }

  // 3. Static Assets (JS, CSS, Images, Fonts): Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".json");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              safeCachePut(RUNTIME_CACHE, request, copy);
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Default: Network with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          safeCachePut(RUNTIME_CACHE, request, copy);
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

