import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { count, replayAll, notifyQueueChange } from '@/Lib/offlineQueue';

export default function OfflineBanner() {
    const [isOnline,   setIsOnline]   = useState(() => navigator.onLine);
    const [pending,    setPending]    = useState(0);
    const [syncing,    setSyncing]    = useState(false);
    const [justSynced, setJustSynced] = useState(false);

    const refreshCount = useCallback(async () => {
        const n = await count();
        setPending(n);
    }, []);

    const doSync = useCallback(async () => {
        const n = await count();
        if (n === 0) return;

        setSyncing(true);
        const { synced } = await replayAll();
        setSyncing(false);

        if (synced > 0) {
            notifyQueueChange();
            setJustSynced(true);
            setTimeout(() => setJustSynced(false), 3000);
            router.reload({ preserveScroll: true });
        }

        refreshCount();
    }, [refreshCount]);

    // Initial count
    useEffect(() => { refreshCount(); }, [refreshCount]);

    // Queue change events (dispatched by TaskRow / PhaseTaskList)
    useEffect(() => {
        window.addEventListener('sinapsys:queue-updated', refreshCount);
        return () => window.removeEventListener('sinapsys:queue-updated', refreshCount);
    }, [refreshCount]);

    // Online / offline events
    useEffect(() => {
        const goOnline  = () => { setIsOnline(true);  doSync(); };
        const goOffline = () => setIsOnline(false);
        window.addEventListener('online',  goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online',  goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, [doSync]);

    // SW messages (Background Sync trigger)
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;
        const handler = (e) => { if (e.data?.type === 'SYNC_REQUESTED') doSync(); };
        navigator.serviceWorker.addEventListener('message', handler);
        return () => navigator.serviceWorker.removeEventListener('message', handler);
    }, [doSync]);

    // Nothing to show
    if (isOnline && pending === 0 && !justSynced) return null;

    // ── Synced confirmation ────────────────────────────────────────────────────
    if (justSynced) {
        return (
            <div className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: 'var(--success)' }}>
                <CheckCircle size={13} />
                Cambios sincronizados
            </div>
        );
    }

    // ── Syncing in progress ────────────────────────────────────────────────────
    if (syncing) {
        return (
            <div className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: 'var(--primary)' }}>
                <RefreshCw size={13} className="animate-spin" />
                Sincronizando {pending} cambio{pending !== 1 ? 's' : ''}…
            </div>
        );
    }

    // ── Offline ────────────────────────────────────────────────────────────────
    if (!isOnline) {
        return (
            <div className="flex items-center justify-between gap-2 px-4 py-1.5 text-xs font-medium"
                style={{ backgroundColor: '#FDAB3D', color: '#1A1B2E' }}>
                <span className="flex items-center gap-1.5">
                    <WifiOff size={13} />
                    Sin conexión
                    {pending > 0 && (
                        <span className="opacity-75">
                            — {pending} cambio{pending !== 1 ? 's' : ''} en cola
                        </span>
                    )}
                </span>
            </div>
        );
    }

    // ── Online but has pending (e.g. sync failed partially) ───────────────────
    return (
        <div className="flex items-center justify-between gap-2 px-4 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: 'var(--primary)' }}>
            <span className="flex items-center gap-1.5">
                <RefreshCw size={13} />
                {pending} cambio{pending !== 1 ? 's' : ''} pendiente{pending !== 1 ? 's' : ''}
            </span>
            <button
                onClick={doSync}
                className="rounded px-2 py-0.5 font-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
                Reintentar
            </button>
        </div>
    );
}
