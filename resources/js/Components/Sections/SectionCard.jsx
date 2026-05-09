import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { PRIORITIES } from '@/Lib/constants';
import { ChevronDown, ChevronRight, Plus, CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';

const STATUS_COLORS = {
    planned:  'var(--text-muted)',
    active:   'var(--primary)',
    done:     'var(--success)',
    archived: 'var(--border)',
};

const STATUS_LABELS = {
    planned:  'Planificada',
    active:   'Activa',
    done:     'Completada',
    archived: 'Archivada',
};

export default function SectionCard({ section, canEdit, onAddTask, onDelete, url }) {
    const [collapsed, setCollapsed] = useState(false);
    const doneTasks  = section.tasks?.filter(t => t.done).length ?? 0;
    const totalTasks = section.tasks?.length ?? 0;

    return (
        <div className="rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2.5">
                <button onClick={() => setCollapsed(c => !c)} style={{ color: 'var(--text-muted)' }}>
                    {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                </button>
                <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[section.status] ?? 'var(--border)' }}
                />
                <span className="flex-1 text-sm font-semibold flex items-center" style={{ color: 'var(--foreground)' }}>
                    {section.name}
                    {section.type && section.type !== 'sprint' && (
                        <span className="text-[9px] px-1 py-0.5 rounded ml-1" style={{
                            backgroundColor: section.type === 'discovery' ? '#4A6CF720' : '#9B9DB020',
                            color: section.type === 'discovery' ? '#4A6CF7' : '#9B9DB0'
                        }}>
                            {section.type === 'discovery' ? '🔍 Discovery' : '➿ Track'}
                        </span>
                    )}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {doneTasks}/{totalTasks}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: STATUS_COLORS[section.status], backgroundColor: 'var(--background)' }}>
                    {STATUS_LABELS[section.status] ?? section.status}
                </span>
                {canEdit && (
                    <>
                        <Button variant="ghost" size="xs" onClick={() => onAddTask(section.id)}>
                            <Plus size={13} />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => onDelete(section.id)}
                            style={{ color: 'var(--destructive)' }}>
                            <Trash2 size={13} />
                        </Button>
                    </>
                )}
            </div>

            {/* Task list */}
            {!collapsed && (
                <div className="px-4 pb-3 space-y-1 border-t" style={{ borderColor: 'var(--border)' }}>
                    {section.tasks?.length === 0 && (
                        <p className="py-3 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                            Sin tareas.{' '}
                            {canEdit && (
                                <button onClick={() => onAddTask(section.id)} className="underline" style={{ color: 'var(--primary)' }}>
                                    Agregar
                                </button>
                            )}
                        </p>
                    )}
                    {section.tasks?.map(task => (
                        <SectionTaskRow
                            key={task.id}
                            task={task}
                            url={url}
                            canEdit={canEdit}
                            onEdit={() => onAddTask(section.id, task)}
                        />
                    ))}
                    {canEdit && section.tasks?.length > 0 && (
                        <button
                            onClick={() => onAddTask(section.id)}
                            className="mt-1 flex items-center gap-1.5 text-xs px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <Plus size={12} /> Nueva tarea
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function SectionTaskRow({ task, url, canEdit, onEdit }) {
    const p        = PRIORITIES[task.priority];
    const isOverdue = !task.done && task.due_date && new Date(task.due_date) < new Date(new Date().toDateString());

    return (
        <div className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
            <button
                onClick={() => router.patch(url(`/tasks/${task.id}/toggle`), {}, { preserveScroll: true })}
                style={{ color: task.done ? 'var(--success)' : 'var(--border)' }}
                className="flex-shrink-0"
            >
                {task.done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            </button>
            <span className="flex-shrink-0 text-xs" style={{ color: p.color }}>{p.icon}</span>
            <span
                className={`flex-1 text-sm min-w-0 truncate ${task.done ? 'line-through' : ''}`}
                style={{ color: task.done ? 'var(--text-muted)' : 'var(--foreground)' }}
            >
                {task.name}
            </span>
            {task.assignee && (
                <span
                    className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center text-white"
                    style={{ backgroundColor: 'var(--primary)' }}
                    title={task.assignee.name}
                >
                    {task.assignee.name.charAt(0).toUpperCase()}
                </span>
            )}
            {task.due_date && (
                <span className="flex-shrink-0 text-xs" style={{ color: isOverdue ? 'var(--destructive)' : 'var(--text-muted)' }}>
                    {new Date(task.due_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                </span>
            )}
            {canEdit && (
                <button
                    onClick={onEdit}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                >
                    <Pencil size={12} />
                </button>
            )}
        </div>
    );
}
