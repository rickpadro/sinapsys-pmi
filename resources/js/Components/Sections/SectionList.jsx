import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import TaskForm from '@/Components/Tasks/TaskForm';
import { PRIORITIES } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';
import { ChevronDown, ChevronRight, Plus, CheckCircle2, Circle, Pencil, Trash2, LayoutGrid } from 'lucide-react';
import { Link } from '@inertiajs/react';

const STATUS_COLORS = {
    planned:    'var(--text-muted)',
    active:     'var(--primary)',
    done:       'var(--success)',
    archived:   'var(--border)',
};

const STATUS_LABELS = {
    planned:  'Planificada',
    active:   'Activa',
    done:     'Completada',
    archived: 'Archivada',
};

export default function SectionList({ project, currentRole, members }) {
    const url = useUrl();
    const sections = project.sections ?? [];
    const canEdit  = ['owner', 'manager'].includes(currentRole);

    const [collapsed, setCollapsed]       = useState({});
    const [addingSection, setAddingSection] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [taskForm, setTaskForm]           = useState({ open: false, task: null, sectionId: null });

    function toggleSection(id) {
        setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
    }

    function openTaskForm(sectionId, task = null) {
        setTaskForm({ open: true, task, sectionId });
    }

    function handleAddSection(e) {
        e.preventDefault();
        if (!newSectionName.trim()) return;
        router.post(url(`/projects/${project.id}/sections`), { name: newSectionName.trim() }, {
            preserveScroll: true,
            onSuccess: () => { setNewSectionName(''); setAddingSection(false); },
        });
    }

    function handleDeleteSection(sectionId) {
        if (!confirm('¿Eliminar esta sección? Las tareas quedarán sin sección.')) return;
        router.delete(url(`/projects/${project.id}/sections/${sectionId}`), { preserveScroll: true });
    }

    return (
        <div className="space-y-2">
            {/* Board view link */}
            <div className="mb-3 flex justify-end">
                <Link href={url(`/projects/${project.id}/board`)}>
                    <Button variant="outline" size="sm">
                        <LayoutGrid size={14} /> Tablero Kanban
                    </Button>
                </Link>
            </div>

            {sections.length === 0 && (
                <p className="py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Sin secciones. Ejecuta la migración o agrega una sección.
                </p>
            )}

            {sections.map((section) => {
                const isCollapsed = collapsed[section.id];
                const doneTasks   = section.tasks?.filter(t => t.done).length ?? 0;
                const totalTasks  = section.tasks?.length ?? 0;

                return (
                    <div key={section.id} className="rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                        {/* Section header */}
                        <div className="flex items-center gap-2 px-4 py-2.5">
                            <button onClick={() => toggleSection(section.id)} style={{ color: 'var(--text-muted)' }}>
                                {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                            </button>
                            <span
                                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: STATUS_COLORS[section.status] ?? 'var(--border)' }}
                            />
                            <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                                {section.name}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {doneTasks}/{totalTasks}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: STATUS_COLORS[section.status], backgroundColor: 'var(--background)' }}>
                                {STATUS_LABELS[section.status] ?? section.status}
                            </span>
                            {canEdit && (
                                <>
                                    <Button variant="ghost" size="xs" onClick={() => openTaskForm(section.id)}>
                                        <Plus size={13} />
                                    </Button>
                                    <Button variant="ghost" size="xs" onClick={() => handleDeleteSection(section.id)}
                                        style={{ color: 'var(--destructive)' }}>
                                        <Trash2 size={13} />
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Task list */}
                        {!isCollapsed && (
                            <div className="px-4 pb-3 space-y-1 border-t" style={{ borderColor: 'var(--border)' }}>
                                {section.tasks?.length === 0 && (
                                    <p className="py-3 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                                        Sin tareas. {canEdit && <button onClick={() => openTaskForm(section.id)} className="underline" style={{ color: 'var(--primary)' }}>Agregar</button>}
                                    </p>
                                )}
                                {section.tasks?.map(task => (
                                    <SectionTaskRow
                                        key={task.id}
                                        task={task}
                                        url={url}
                                        canEdit={canEdit}
                                        onEdit={() => openTaskForm(section.id, task)}
                                    />
                                ))}
                                {canEdit && section.tasks?.length > 0 && (
                                    <button
                                        onClick={() => openTaskForm(section.id)}
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
            })}

            {/* Add section */}
            {canEdit && (
                <div className="pt-1">
                    {addingSection ? (
                        <form onSubmit={handleAddSection} className="flex items-center gap-2">
                            <Input
                                value={newSectionName}
                                onChange={e => setNewSectionName(e.target.value)}
                                placeholder="Nombre de la sección"
                                autoFocus
                                className="flex-1"
                            />
                            <Button type="submit" size="sm" disabled={!newSectionName.trim()}>Crear</Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => { setAddingSection(false); setNewSectionName(''); }}>
                                Cancelar
                            </Button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setAddingSection(true)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-dashed w-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                        >
                            <Plus size={12} /> Agregar sección
                        </button>
                    )}
                </div>
            )}

            <TaskForm
                open={taskForm.open}
                onClose={() => setTaskForm({ open: false, task: null, sectionId: null })}
                task={taskForm.task}
                projects={[{ id: project.id, name: project.name, color: project.color }]}
                defaultProjectId={project.id}
                defaultSectionId={taskForm.sectionId}
            />
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
