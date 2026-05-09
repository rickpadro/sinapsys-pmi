import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function PushOptIn({ basePath = '', pushEnabled = false }) {
    const [status, setStatus] = useState(pushEnabled ? 'enabled' : 'idle');
    const [error,  setError]  = useState('');

    const VAPID_PUBLIC_KEY = window.__VAPID_PUBLIC_KEY__ ?? '';

    async function enable() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setError('Tu navegador no soporta push notifications.');
            return;
        }

        setStatus('requesting');
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') { setStatus('idle'); setError('Permiso denegado.'); return; }

            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: VAPID_PUBLIC_KEY || undefined,
            });

            const json = sub.toJSON();
            await fetch(`${basePath}/push/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type':'application/json', 'X-Requested-With':'XMLHttpRequest', 'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') },
                body: JSON.stringify({ endpoint:json.endpoint, p256dh:json.keys?.p256dh, auth:json.keys?.auth }),
                credentials: 'same-origin',
            });

            setStatus('enabled');
            setError('');
            router.reload({ only:['auth'] });
        } catch (err) {
            setStatus('idle');
            setError(err.message || 'Error al activar notificaciones.');
        }
    }

    async function disable() {
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await fetch(`${basePath}/push/unsubscribe`, {
                    method:'POST',
                    headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest','X-XSRF-TOKEN':getCookie('XSRF-TOKEN')},
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                    credentials: 'same-origin',
                });
                await sub.unsubscribe();
            }
            setStatus('idle');
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg p-3" style={{ backgroundColor:'var(--background)', border:'1px solid var(--border)' }}>
            <div>
                <p className="text-sm font-medium" style={{ color:'var(--foreground)' }}>Notificaciones push</p>
                <p className="text-xs" style={{ color:'var(--text-muted)' }}>
                    {status === 'enabled' ? 'Activadas — recibirás alertas de tareas y hitos.' : 'Recibe alertas de tareas vencidas y hitos en riesgo.'}
                </p>
                {error && <p className="text-xs mt-1" style={{ color:'var(--destructive)' }}>{error}</p>}
            </div>
            {status === 'enabled'
                ? <Button variant="outline" size="sm" onClick={disable}><BellOff size={13}/> Desactivar</Button>
                : <Button size="sm" onClick={enable} disabled={status==='requesting'}><Bell size={13}/> {status==='requesting'?'Activando...':'Activar'}</Button>
            }
        </div>
    );
}

function getCookie(name) {
    return document.cookie.split(';').map(c=>c.trim()).find(c=>c.startsWith(name+'='))?.split('=')?.[1]?.split(';')?.[0] ?? '';
}
