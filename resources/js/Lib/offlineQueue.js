const DB_NAME    = 'sinapsys-offline';
const DB_VERSION = 1;
const STORE      = 'mutations';

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror  = () => reject(req.error);
    });
}

export async function enqueue(method, url, data = {}) {
    const db  = await openDB();
    return new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE, 'readwrite');
        const req = tx.objectStore(STORE).add({ method, url, data, timestamp: Date.now() });
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
    });
}

export async function getAll() {
    const db  = await openDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
    });
}

export async function remove(id) {
    const db  = await openDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id);
        req.onsuccess = () => resolve();
        req.onerror   = () => reject(req.error);
    });
}

export async function count() {
    const db  = await openDB();
    return new Promise((resolve, reject) => {
        const req = db.transaction(STORE, 'readonly').objectStore(STORE).count();
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
    });
}

function getCsrfToken() {
    return decodeURIComponent(
        document.cookie.split('; ')
            .find((r) => r.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] ?? ''
    );
}

export async function replayAll() {
    const items = await getAll();
    if (items.length === 0) return { synced: 0, failed: 0 };

    const csrf = getCsrfToken();
    let synced = 0;
    let failed = 0;

    for (const item of items) {
        try {
            const res = await fetch(item.url, {
                method: item.method,
                headers: {
                    'Content-Type':  'application/json',
                    'Accept':        'application/json',
                    'X-Inertia':     'true',
                    'X-XSRF-TOKEN':  csrf,
                },
                credentials: 'same-origin',
                body: ['GET', 'HEAD'].includes(item.method) ? undefined : JSON.stringify(item.data),
            });

            if (res.ok || res.status === 302 || res.status === 303) {
                await remove(item.id);
                synced++;
            } else {
                failed++;
            }
        } catch {
            failed++; // Still offline
        }
    }

    return { synced, failed };
}

export function notifyQueueChange() {
    window.dispatchEvent(new CustomEvent('sinapsys:queue-updated'));
}

// Register background sync with the SW (best-effort)
export async function requestBackgroundSync() {
    try {
        const reg = await navigator.serviceWorker?.ready;
        await reg?.sync?.register('sinapsys-sync');
    } catch {
        // Background Sync not supported — online event handles it
    }
}
