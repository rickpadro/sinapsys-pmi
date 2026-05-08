import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { PHASE_TASKS, PMI_PHASES } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';
import { enqueue, notifyQueueChange } from '@/Lib/offlineQueue';
import { Clock } from 'lucide-react';

export default function PhaseTaskList({ project }) {
    const url = useUrl();
    const phaseTasks = PHASE_TASKS[project.phase] || [];

    const [localCompleted, setLocalCompleted] = useState(project.phase_tasks || {});
    const [queuedKeys,     setQueuedKeys]     = useState(new Set());

    // Sync when Inertia reloads
    useEffect(() => {
        setLocalCompleted(project.phase_tasks || {});
        setQueuedKeys(new Set());
    }, [project.phase_tasks]);

    async function toggle(taskName) {
        const key = `${project.phase}:${taskName}`;

        if (!navigator.onLine) {
            setLocalCompleted((prev) => ({ ...prev, [key]: !prev[key] }));
            setQueuedKeys((prev) => { const s = new Set(prev); s.add(key); return s; });
            await enqueue('PATCH', url(`/projects/${project.id}/phase-task`), { key });
            notifyQueueChange();
            return;
        }

        router.patch(url(`/projects/${project.id}/phase-task`), { key }, { preserveScroll: true });
    }

    const doneCount = phaseTasks.filter((t) => localCompleted[`${project.phase}:${t}`]).length;

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    Fase: {PMI_PHASES[project.phase]}
                </h3>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {doneCount}/{phaseTasks.length}
                </span>
            </div>

            <div className="space-y-1.5">
                {phaseTasks.map((task) => {
                    const key    = `${project.phase}:${task}`;
                    const isDone = !!localCompleted[key];
                    const isQ    = queuedKeys.has(key);

                    return (
                        <label
                            key={key}
                            className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 transition-colors"
                            style={{ backgroundColor: isDone ? 'var(--accent)' : 'transparent' }}
                        >
                            <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => toggle(task)}
                                className="rounded"
                                style={isQ ? { accentColor: '#FDAB3D' } : {}}
                            />
                            <span
                                className={`flex-1 text-sm ${isDone ? 'line-through' : ''}`}
                                style={{ color: isDone ? 'var(--text-muted)' : 'var(--foreground)' }}
                            >
                                {task}
                            </span>
                            {isQ && (
                                <Clock size={12} style={{ color: '#FDAB3D' }} title="En cola offline" />
                            )}
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
