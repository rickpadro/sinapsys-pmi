import { router } from '@inertiajs/react';
import { CheckCircle2, Circle, Link2, Trash2 } from 'lucide-react';
import { useUrl } from '@/Lib/utils';

export default function RiskMitigationsList({ risk, projectId, canEdit }) {
    const url = useUrl();
    const mitigations = risk.mitigations ?? [];

    function remove(taskId) {
        router.delete(url(`/projects/${projectId}/risks/${risk.id}/mitigations/${taskId}`), { preserveScroll: true });
    }

    if (mitigations.length === 0) {
        return (
            <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                Sin tareas mitigantes vinculadas.
            </p>
        );
    }

    return (
        <ul className="space-y-1 mt-1">
            {mitigations.map(m => (
                <li key={m.task_id} className="flex items-center justify-between gap-2 rounded px-2 py-1 text-xs"
                    style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
                    <div className="flex items-center gap-1.5 min-w-0">
                        {m.task?.done
                            ? <CheckCircle2 size={11} style={{ color: 'var(--success)', flexShrink: 0 }} />
                            : <Circle size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        }
                        <span className="truncate">{m.task?.name ?? `Task #${m.task_id}`}</span>
                        {m.rationale && (
                            <span className="truncate italic" style={{ color: 'var(--text-muted)' }}>— {m.rationale}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {m.task && (
                            <span className={`px-1 rounded text-[10px] font-medium ${m.task.done ? 'text-[--success]' : 'text-[--warning]'}`}>
                                {m.task.done ? 'hecha' : 'pendiente'}
                            </span>
                        )}
                        {canEdit && (
                            <button onClick={() => remove(m.task_id)} title="Desvincular"
                                className="opacity-60 hover:opacity-100 transition-opacity">
                                <Trash2 size={11} style={{ color: 'var(--destructive)' }} />
                            </button>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}
