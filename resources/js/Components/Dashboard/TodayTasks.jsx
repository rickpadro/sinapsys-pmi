import { router } from '@inertiajs/react';
import { PRIORITIES } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';

export default function TodayTasks({ tasks }) {
    const url = useUrl();

    function handleToggle(taskId) {
        router.patch(url(`/tasks/${taskId}/toggle`), {}, { preserveScroll: true });
    }

    return (
        <div
            className="rounded-lg p-4"
            style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
            }}
        >
            <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                Tareas de hoy + vencidas
            </h2>

            {tasks.length === 0 ? (
                <p className="py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Sin tareas urgentes. Buen trabajo.
                </p>
            ) : (
                <div className="space-y-1">
                    {tasks.map((task) => {
                        const p = PRIORITIES[task.priority];
                        const isOverdue = task.due_date && new Date(task.due_date) < new Date(new Date().toDateString());
                        return (
                            <div
                                key={task.id}
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"
                                style={{ backgroundColor: isOverdue ? 'rgba(228,66,88,0.06)' : 'transparent' }}
                            >
                                <input
                                    type="checkbox"
                                    checked={false}
                                    onChange={() => handleToggle(task.id)}
                                    className="h-4 w-4 shrink-0 rounded"
                                />
                                <span style={{ color: p.color }} className="shrink-0">{p.icon}</span>
                                <span className="flex-1 truncate" style={{ color: 'var(--foreground)' }}>
                                    {task.name}
                                </span>
                                {task.project && (
                                    <span
                                        className="hidden shrink-0 truncate rounded-full px-2 py-0.5 text-[10px] text-white sm:block sm:max-w-[120px]"
                                        style={{ backgroundColor: task.project.color }}
                                    >
                                        {task.project.name}
                                    </span>
                                )}
                                {task.due_date && (
                                    <span
                                        className="shrink-0 text-xs"
                                        style={{ color: isOverdue ? 'var(--destructive)' : 'var(--text-muted)' }}
                                    >
                                        {new Date(task.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
