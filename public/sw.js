// SinapSYS Projects — Service Worker
const VERSION = 'v1';
const BASE = self.location.pathname.replace('/sw.js', ''); // e.g. /00_SinapSYS/08_PMI_SinapSYS

const STATIC_CACHE = `sinapsys-static-${VERSION}`;
const PAGES_CACHE  = `sinapsys-pages-${VERSION}`;
const ALL_CACHES   = [STATIC_CACHE, PAGES_CACHE];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(PAGES_CACHE).then((cache) =>
            cache.add(new Request(`${BASE}/`, { credentials: 'same-origin' })).catch(() => {})
        )
    );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isStaticAsset(url) {
    const { pathname } = new URL(url);
    return (
        pathname.startsWith(`${BASE}/build/`) ||
        /\.(png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)$/.test(pathname)
    );
}

function isExternalFont(url) {
    return url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com');
}

async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline', { status: 503 });
    }
}

async function networkFirstWithFallback(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(PAGES_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Return app shell as last resort
        const shell = await caches.match(new Request(`${BASE}/`, { credentials: 'same-origin' }));
        return shell || new Response('Sin conexión', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only handle GET
    if (request.method !== 'GET') return;

    const url = request.url;

    // External fonts — cache first
    if (isExternalFont(url)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // Build assets (hashed JS/CSS) — cache first
    if (isStaticAsset(url)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // Skip cross-origin requests
    if (!url.startsWith(self.location.origin)) return;

    // Skip Inertia XHR (let them fail naturally when offline — mutations are queued client-side)
    if (request.headers.get('X-Inertia')) return;

    // HTML navigation — network first with app-shell fallback
    if (request.mode === 'navigate') {
        event.respondWith(networkFirstWithFallback(request));
        return;
    }
});

// ─── Background Sync ──────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
    if (event.tag === 'sinapsys-sync') {
        // Notify all open clients to run the replay logic
        event.waitUntil(
            self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
                clients.forEach((client) => client.postMessage({ type: 'SYNC_REQUESTED' }));
            })
        );
    }
});

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
    if (!event.data) return;
    const data = event.data.json();
    event.waitUntil(
        self.registration.showNotification(data.title || 'SinapSYS', {
            body:  data.body  || '',
            icon:  data.icon  || `${BASE}/icon_sinapsys.png`,
            badge: `${BASE}/favicon.png`,
            data:  { url: data.url || `${BASE}/` },
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || `${BASE}/`)
    );
});

// ─── Messages ─────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
