import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { PRIORITIES } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';
import { enqueue, notifyQueueChange } from '@/Lib/offlineQueue';
import { Pencil, Trash2, Clock } from 'lucide-react';

export default function TaskRow({ task, onEdit }) {
    const url      = useUrl();
    const priority = PRIORITIES[task.priority];
    const isOverdue = !task.done && task.due_date && new Date(task.due_date) < new Date(new Date().toDateString());

    const [localDone, setLocalDone] = useState(task.done);
    const [queued,    setQueued]    = useState(false);

    // Sync local state when Inertia reloads props
    useEffect(() => {
        setLocalDone(task.done);
        setQueued(false);
    }, [task.done]);

    async function handleToggle() {
        if (!navigator.onLine) {
            setLocalDone((prev) => !prev);
            setQueued(true);
            await enqueue('PATCH', url(`/tasks/${task.id}/toggle`), {});
            notifyQueueChange();
            return;
        }
        router.patch(url(`/tasks/${task.id}/toggle`), {}, { preserveScroll: true });
    }

    function handleDelete() {
        if (confirm('¿Eliminar esta tarea?')) {
            router.delete(url(`/tasks/${task.id}`), { preserveScroll: true });
        }
    }

    return (
        <div className="group flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
            {/* Checkbox */}
            <input
                type="checkbox"
                checked={localDone}
                onChange={handleToggle}
                className="h-4 w-4 shrink-0 rounded"
                style={queued ? { accentColor: '#FDAB3D' } : {}}
            />

            {/* Priority icon */}
            <span className="shrink-0 text-sm" style={{ color: priority.color }}>
                {priority.icon}
            </span>

            {/* Name */}
            <span
                className={`min-w-0 flex-1 truncate text-sm ${localDone ? 'line-through' : ''}`}
                style={{ color: localDone ? 'var(--text-muted)' : 'var(--foreground)' }}
            >
                {task.name}
            </span>

            {/* Queued indicator */}
            {queued && (
                <span title="Cambio en cola — se sincronizará al reconectarse">
                    <Clock size={12} style={{ color: '#FDAB3D' }} />
                </span>
            )}

            {/* Project badge */}
            {task.project && (
                <span
                    className="hidden shrink-0 truncate rounded-full px-2 py-0.5 text-[10px] text-white sm:block sm:max-w-[100px]"
                    style={{ backgroundColor: task.project.color }}
                >
                    {task.project.name}
                </span>
            )}

            {/* Assignee avatar */}
            {task.assignee && (
                <span
                    className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white sm:flex"
                    title={`Asignado a ${task.assignee.name}`}
                    style={{ backgroundColor: 'var(--primary)' }}
                >
                    {task.assignee.name?.[0]?.toUpperCase()}
                </span>
            )}

            {/* Due date */}
            {task.due_date && (
                <span
                    className="shrink-0 text-xs"
                    style={{ color: isOverdue ? 'var(--destructive)' : 'var(--text-muted)' }}
                >
                    {new Date(task.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                </span>
            )}

            {/* Estimated time */}
            {task.estimated_time && (
                <span className="hidden shrink-0 text-xs sm:block" style={{ color: 'var(--text-muted)' }}>
                    {task.estimated_time}h
                </span>
            )}

            {/* Actions */}
            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    onClick={() => onEdit?.(task)}
                    className="rounded p-1 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                >
                    <Pencil size={14} />
                </button>
                <button
                    onClick={handleDelete}
                    className="rounded p-1 transition-colors"
                    style={{ color: 'var(--destructive)' }}
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}
