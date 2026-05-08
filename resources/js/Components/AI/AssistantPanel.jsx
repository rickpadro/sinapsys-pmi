import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import ChatMessage from '@/Components/AI/ChatMessage';
import { Button } from '@/Components/ui/button';
import { useUrl } from '@/Lib/utils';
import { Send, Trash2, Loader2 } from 'lucide-react';

export default function AssistantPanel({ project, messages }) {
    const url = useUrl();
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    function handleSend(e) {
        e.preventDefault();
        if (!text.trim() || sending) return;

        setSending(true);
        router.post(url(`/projects/${project.id}/assistant`), {
            message: text.trim(),
        }, {
            preserveScroll: true,
            onFinish: () => {
                setSending(false);
                setText('');
            },
        });
    }

    function handleClear() {
        if (!confirm('¿Limpiar todo el historial de chat?')) return;
        router.delete(url(`/projects/${project.id}/assistant`), {
            preserveScroll: true,
        });
    }

    return (
        <div
            className="flex flex-col rounded-lg"
            style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                height: '450px',
            }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between border-b px-4 py-2"
                style={{ borderColor: 'var(--border)' }}
            >
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    Asistente IA
                </span>
                {messages.length > 0 && (
                    <Button variant="ghost" size="xs" onClick={handleClear}>
                        <Trash2 size={12} /> Limpiar
                    </Button>
                )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        Pregúntale al asistente sobre este proyecto.
                    </p>
                ) : (
                    messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))
                )}
                {sending && (
                    <div className="flex justify-start">
                        <div
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                            style={{ backgroundColor: 'var(--accent)', color: 'var(--text-muted)' }}
                        >
                            <Loader2 size={14} className="animate-spin" />
                            Pensando...
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="flex gap-2 border-t p-3"
                style={{ borderColor: 'var(--border)' }}
            >
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                    disabled={sending}
                    className="flex-1 rounded-md border px-3 py-2 text-sm outline-none disabled:opacity-50"
                    style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)',
                    }}
                />
                <Button type="submit" size="sm" disabled={sending || !text.trim()}>
                    <Send size={14} />
                </Button>
            </form>
        </div>
    );
}
