import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useUrl } from '@/Lib/utils';
import { Link2, Trash2, AlertCircle, Plus } from 'lucide-react';

const DEP_TYPES = {
    finish_to_start:  'Termina → Empieza',
    start_to_start:   'Empieza → Empieza',
    finish_to_finish: 'Termina → Termina',
};

const SELECT_STYLE = {
    backgroundColor: 'var(--background)',
    borderColor:     'var(--border)',
    color:           'var(--foreground)',
};

export default function TaskDependencies({ task, projectTasks = [], basePath = '' }) {
    const url = useUrl();
    const [deps, setDeps]             = useState([]);
    const [loading, setLoading]       = useState(true);
    const [adding, setAdding]         = useState(false);
    const [form, setForm]             = useState({ depends_on_task_id: '', type: 'finish_to_start', lag_days: 0 });
    const [processing, setProcessing] = useState(false);

    function fetchDeps() {
        return fetch(`${basePath}/tasks/${task.id}/dependencies`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then(r => r.json())
            .then(setDeps);
    }

    useEffect(() => {
        fetchDeps().finally(() => setLoading(false));
    }, [task.id]);

    function handleAdd(e) {
        e.preventDefault();
        if (!form.depends_on_task_id) return;
        setProcessing(true);
        router.post(url(`/tasks/${task.id}/dependencies`), form, {
            preserveScroll: true,
            onSuccess: () => {
                fetchDeps();
                setAdding(false);
                setForm({ depends_on_task_id: '', type: 'finish_to_start', lag_days: 0 });
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    }

    function handleDelete(depId) {
        router.delete(url(`/tasks/${task.id}/dependencies/${depId}`), {
            preserveScroll: true,
            onSuccess: () => setDeps(prev => prev.filter(d => d.id !== depId)),
        });
    }

    const availableTasks = projectTasks.filter(
        t => t.id !== task.id && !deps.some(d => d.depends_on_task_id === t.id)
    );

    if (loading) {
        return <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>Cargando...</p>;
    }

    return (
        <div className="space-y-2">
            {deps.length === 0 && !adding && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sin dependencias.</p>
            )}

            {deps.map(dep => (
                <div key={dep.id} className="group flex items-center gap-2 text-sm py-1">
                    <Link2 size={13} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
                    <span
                        className="flex-1 truncate"
                        style={{ color: dep.depends_on?.done ? 'var(--text-muted)' : 'var(--foreground)' }}
                    >
                        {dep.depends_on?.name ?? `Tarea #${dep.depends_on_task_id}`}
                    </span>
                    {!dep.depends_on?.done && (
                        <AlertCircle
                            size={12}
                            className="flex-shrink-0"
                            style={{ color: 'var(--warning)' }}
                            title="Pendiente"
                        />
                    )}
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {DEP_TYPES[dep.type]}
                    </span>
                    {dep.lag_days !== 0 && (
                        <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                            +{dep.lag_days}d
                        </span>
                    )}
                    <button
                        onClick={() => handleDelete(dep.id)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--destructive)' }}
                        title="Eliminar dependencia"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            ))}

            {adding ? (
                <form onSubmit={handleAdd} className="space-y-2 pt-1">
                    <select
                        value={form.depends_on_task_id}
                        onChange={e => setForm(p => ({ ...p, depends_on_task_id: e.target.value }))}
                        className="w-full rounded-md border px-2 py-1.5 text-xs"
                        style={SELECT_STYLE}
                        required
                    >
                        <option value="">Selecciona una tarea...</option>
                        {availableTasks.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <select
                        value={form.type}
                        onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                        className="w-full rounded-md border px-2 py-1.5 text-xs"
                        style={SELECT_STYLE}
                    >
                        {Object.entries(DEP_TYPES).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                    <div>
                        <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
                            Días de desfase
                        </label>
                        <input
                            type="number"
                            min="-365"
                            max="365"
                            value={form.lag_days}
                            onChange={e => setForm(p => ({ ...p, lag_days: Number(e.target.value) }))}
                            className="w-full rounded-md border px-2 py-1.5 text-xs"
                            style={SELECT_STYLE}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="xs" disabled={processing || !form.depends_on_task_id}>
                            {processing ? '...' : 'Agregar'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => { setAdding(false); setForm({ depends_on_task_id: '', type: 'finish_to_start', lag_days: 0 }); }}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setAdding(true)}
                    className="flex items-center gap-1 text-xs mt-1"
                    style={{ color: 'var(--primary)' }}
                >
                    <Plus size={12} /> Agregar dependencia
                </button>
            )}
        </div>
    );
}
