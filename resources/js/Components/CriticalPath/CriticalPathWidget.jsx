import { AlertTriangle } from 'lucide-react';

export default function CriticalPathWidget({ criticalTasks = [], project }) {
    const blockers = criticalTasks.filter(t => t.is_blocker);

    if (criticalTasks.length === 0) return (
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sin tareas en critical path calculado.</p>
        </div>
    );

    return (
        <div className="rounded-lg p-3 space-y-2" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#E44258' }}>
                    🔴 Critical Path · {criticalTasks.length} tarea{criticalTasks.length !== 1 ? 's' : ''}
                </p>
                {blockers.length > 0 && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--warning)' }}>
                        <AlertTriangle size={11} /> {blockers.length} bloqueante{blockers.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                {criticalTasks.slice(0, 6).map((task, i) => (
                    <div key={task.id} className="flex items-center gap-2 text-xs">
                        {i > 0 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                        <span className={task.is_blocker ? 'font-bold' : ''} style={{ color: task.done ? 'var(--text-muted)' : 'var(--foreground)' }}>
                            {task.name}
                            {task.is_blocker && <span style={{ color: 'var(--warning)' }}> ⚠</span>}
                            {task.done && <span style={{ color: 'var(--success)' }}> ✓</span>}
                        </span>
                    </div>
                ))}
                {criticalTasks.length > 6 && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+{criticalTasks.length - 6} más...</p>
                )}
            </div>
        </div>
    );
}
