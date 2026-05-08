import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import ChatMessage from '@/Components/AI/ChatMessage';
import { Button } from '@/Components/ui/button';
import { useUrl } from '@/Lib/utils';
import { PRIORITIES, PROJECT_TYPES, PMI_PHASES, PROJECT_COLORS } from '@/Lib/constants';
import { Send, Loader2, Sparkles, Check, RotateCcw } from 'lucide-react';

export default function CreateAI() {
    const url = useUrl();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [proposal, setProposal] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [confirming, setConfirming] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages, sending]);

    function extractProposal(text) {
        const match = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (!match) return null;
        try {
            const data = JSON.parse(match[1]);
            if (data.proposal && data.project) return data;
        } catch {}
        return null;
    }

    async function handleSend(e) {
        e.preventDefault();
        if (!text.trim() || sending) return;

        const userMsg = { role: 'user', content: text.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setText('');
        setSending(true);

        try {
            const csrfToken = document.cookie
                .split('; ')
                .find(r => r.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];

            const res = await fetch(url('/projects-ai/chat'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(csrfToken || ''),
                },
                credentials: 'same-origin',
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await res.json();
            const assistantMsg = { role: 'assistant', content: data.reply };
            setMessages([...newMessages, assistantMsg]);

            const found = extractProposal(data.reply);
            if (found) {
                setProposal(found.project);
                const allTasks = [];
                Object.entries(found.phase_tasks || {}).forEach(([phase, names]) => {
                    names.forEach(name => {
                        allTasks.push({
                            name,
                            priority: 3,
                            category: 'desarrollo',
                            phase: Number(phase),
                        });
                    });
                });
                setTasks(allTasks);
            }
        } catch {
            setMessages([...newMessages, { role: 'assistant', content: 'Error de conexión. Intenta de nuevo.' }]);
        } finally {
            setSending(false);
        }
    }

    function handleConfirm() {
        setConfirming(true);
        router.post(url('/projects-ai/confirm'), {
            project: proposal,
            tasks: tasks.filter(t => t.enabled !== false),
        }, {
            onFinish: () => setConfirming(false),
        });
    }

    function handleReset() {
        setMessages([]);
        setProposal(null);
        setTasks([]);
    }

    function toggleTask(index) {
        setTasks(prev => prev.map((t, i) =>
            i === index ? { ...t, enabled: t.enabled === false ? true : false } : t
        ));
    }

    return (
        <AppLayout title="Crear Proyecto con IA">
            <div className="grid gap-4 xl:grid-cols-2">
                {/* Chat panel */}
                <div
                    className="flex flex-col rounded-lg"
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-card)',
                        height: 'calc(100vh - 140px)',
                    }}
                >
                    <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
                        <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                            Asistente de creación
                        </span>
                        {messages.length > 0 && (
                            <button onClick={handleReset} className="ml-auto" style={{ color: 'var(--text-muted)' }}>
                                <RotateCcw size={14} />
                            </button>
                        )}
                    </div>

                    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                        {messages.length === 0 && (
                            <div className="py-8 text-center">
                                <Sparkles size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--primary)' }} />
                                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                    Describe tu idea de proyecto
                                </p>
                                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                    El asistente te ayudará a definir todos los detalles y sugerirá tareas por fase PMI.
                                </p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <ChatMessage key={i} message={msg} />
                        ))}
                        {sending && (
                            <div className="flex justify-start">
                                <div
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                                    style={{ backgroundColor: 'var(--accent)', color: 'var(--text-muted)' }}
                                >
                                    <Loader2 size={14} className="animate-spin" />
                                    Analizando...
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="flex gap-2 border-t p-3" style={{ borderColor: 'var(--border)' }}>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Ej: Quiero crear una app de delivery para restaurantes..."
                            disabled={sending}
                            className="flex-1 rounded-md border px-3 py-2 text-sm outline-none disabled:opacity-50"
                            style={{
                                backgroundColor: 'var(--background)',
                                borderColor: 'var(--border)',
                                color: 'var(--foreground)',
                            }}
                            autoFocus
                        />
                        <Button type="submit" size="sm" disabled={sending || !text.trim()}>
                            <Send size={14} />
                        </Button>
                    </form>
                </div>

                {/* Review panel */}
                <div
                    className="rounded-lg overflow-y-auto"
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-card)',
                        maxHeight: 'calc(100vh - 140px)',
                    }}
                >
                    {!proposal ? (
                        <div className="flex h-full items-center justify-center p-8">
                            <div className="text-center">
                                <div
                                    className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                                    style={{ backgroundColor: 'var(--accent)' }}
                                >
                                    <Sparkles size={20} style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    La propuesta del proyecto aparecerá aquí cuando el asistente la genere.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4">
                            <h2 className="mb-4 text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                                Propuesta de Proyecto
                            </h2>

                            {/* Project fields */}
                            <div className="space-y-3">
                                <ReviewField label="Nombre" value={proposal.name} onChange={(v) => setProposal({ ...proposal, name: v })} />

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <ReviewSelect label="Tipo" value={proposal.type} options={PROJECT_TYPES} onChange={(v) => setProposal({ ...proposal, type: v })} />
                                    <ReviewSelect label="Prioridad" value={proposal.priority} options={Object.fromEntries(Object.entries(PRIORITIES).map(([k, v]) => [k, `${v.icon} ${v.label}`]))} onChange={(v) => setProposal({ ...proposal, priority: Number(v) })} />
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <ReviewRange label="Impacto" value={proposal.impact} color="var(--success)" onChange={(v) => setProposal({ ...proposal, impact: v })} />
                                    <ReviewRange label="Esfuerzo" value={proposal.effort} color="var(--warning)" onChange={(v) => setProposal({ ...proposal, effort: v })} />
                                </div>

                                <ReviewField label="Descripción" value={proposal.description} multiline onChange={(v) => setProposal({ ...proposal, description: v })} />

                                <div>
                                    <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Tags</span>
                                    <div className="flex flex-wrap gap-1">
                                        {(proposal.tags || []).map((tag, i) => (
                                            <span key={i} className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: 'var(--accent)', color: 'var(--foreground)' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Viabilidad</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <ReviewRange label="Mercado" value={proposal.viability_mercado} color="#4A6CF7" onChange={(v) => setProposal({ ...proposal, viability_mercado: v })} />
                                    <ReviewRange label="Financiero" value={proposal.viability_financiero} color="#00CA72" onChange={(v) => setProposal({ ...proposal, viability_financiero: v })} />
                                    <ReviewRange label="Técnico" value={proposal.viability_tecnico} color="#FDAB3D" onChange={(v) => setProposal({ ...proposal, viability_tecnico: v })} />
                                    <ReviewRange label="Riesgo" value={proposal.viability_riesgo} color="#E44258" onChange={(v) => setProposal({ ...proposal, viability_riesgo: v })} />
                                </div>

                                {/* Color */}
                                <div>
                                    <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Color</span>
                                    <div className="flex gap-1.5">
                                        {PROJECT_COLORS.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setProposal({ ...proposal, color: c })}
                                                className="h-6 w-6 rounded-full"
                                                style={{
                                                    backgroundColor: c,
                                                    outline: proposal.color === c ? '2px solid var(--foreground)' : 'none',
                                                    outlineOffset: '2px',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tasks by phase */}
                            <div className="mt-6">
                                <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                                    Tareas sugeridas por fase
                                </h3>
                                {[0, 1, 2, 3, 4].map(phase => {
                                    const phaseTasks = tasks.filter(t => t.phase === phase);
                                    if (phaseTasks.length === 0) return null;
                                    return (
                                        <div key={phase} className="mb-3">
                                            <p className="mb-1 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                                                {PMI_PHASES[phase]}
                                            </p>
                                            <div className="space-y-1">
                                                {phaseTasks.map((task, i) => {
                                                    const globalIdx = tasks.indexOf(task);
                                                    return (
                                                        <label
                                                            key={i}
                                                            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm transition-colors"
                                                            style={{
                                                                color: task.enabled === false ? 'var(--text-muted)' : 'var(--foreground)',
                                                                textDecoration: task.enabled === false ? 'line-through' : 'none',
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={task.enabled !== false}
                                                                onChange={() => toggleTask(globalIdx)}
                                                                className="rounded"
                                                            />
                                                            {task.name}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Confirm button */}
                            <div className="mt-6 flex gap-3">
                                <Button onClick={handleConfirm} disabled={confirming} className="flex-1">
                                    {confirming ? (
                                        <><Loader2 size={14} className="animate-spin" /> Creando...</>
                                    ) : (
                                        <><Check size={14} /> Crear proyecto</>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={() => router.get(url('/projects'))}>
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function ReviewField({ label, value, onChange, multiline }) {
    const Tag = multiline ? 'textarea' : 'input';
    return (
        <div>
            <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
            <Tag
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                rows={multiline ? 2 : undefined}
                className="w-full rounded-md border px-2.5 py-1.5 text-sm"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
        </div>
    );
}

function ReviewSelect({ label, value, options, onChange }) {
    return (
        <div>
            <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-md border px-2.5 py-1.5 text-sm"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
                {Object.entries(options).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                ))}
            </select>
        </div>
    );
}

function ReviewRange({ label, value, color, onChange }) {
    return (
        <div>
            <div className="mb-0.5 flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span className="text-xs font-semibold" style={{ color }}>{value}</span>
            </div>
            <input
                type="range" min={1} max={10} value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full" style={{ accentColor: color }}
            />
        </div>
    );
}
