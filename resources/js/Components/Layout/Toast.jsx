import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (flash?.success) {
            setMessage({ type: 'success', text: flash.success });
            setVisible(true);
        } else if (flash?.error) {
            setMessage({ type: 'error', text: flash.error });
            setVisible(true);
        }
    }, [flash?.success, flash?.error]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => setVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    const isSuccess = message.type === 'success';

    return (
        <div
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-white shadow-lg transition-all"
            style={{
                backgroundColor: isSuccess ? 'var(--success)' : 'var(--destructive)',
            }}
        >
            {isSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
            <button onClick={() => setVisible(false)} className="ml-2 opacity-70 hover:opacity-100">
                <X size={14} />
            </button>
        </div>
    );
}
