import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import BoardColumn from '@/Components/Board/BoardColumn';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { PRIORITIES, PROJECT_TYPES } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';
import { List, Pencil, Trash2, Users } from 'lucide-react';

export default function BoardView({ project, sections: initialSections, customFields, members, currentRole, isOwner }) {
    const url      = useUrl();
    const priority = PRIORITIES[project.priority];
    const canEdit  = ['owner', 'manager', 'contributor'].includes(currentRole);

    // Optimistic local state for drag-drop
    const [sections, setSections] = useState(initialSections);

    function handleMoveTask(taskId, targetSectionId, orderInSection) {
        // Optimistic update
        setSections(prev => {
            const fromSection = prev.find(s => s.tasks.some(t => t.id === taskId));
            if (!fromSection) return prev;
            const task = fromSection.tasks.find(t => t.id === taskId);
            if (!task) return prev;

            return prev.map(s => {
                if (s.id === fromSection.id) {
                    return { ...s, tasks: s.tasks.filter(t => t.id !== taskId) };
                }
                if (s.id === targetSectionId) {
                    const updated = [...s.tasks];
                    updated.splice(orderInSection, 0, { ...task, section_id: targetSectionId });
                    return { ...s, tasks: updated };
                }
                return s;
            });
        });

        router.patch(
            url(`/projects/${project.id}/board/move-task`),
            { task_id: taskId, section_id: targetSectionId, order_in_section: orderInSection },
            {
                preserveScroll: true,
                onError: () => setSections(initialSections), // rollback on error
            }
        );
    }

    function handleDelete() {
        if (confirm('¿Eliminar este proyecto?')) {
            router.delete(url(`/projects/${project.id}`));
        }
    }

    return (
        <AppLayout title={`${project.name} — Tablero`}>
            {/* Header */}
            <div
                className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg p-3"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        {project.name}
                    </span>
                    <Badge className="text-white" style={{ backgroundColor: project.color }}>
                        {PROJECT_TYPES[project.type]}
                    </Badge>
                    <span className="text-sm font-medium" style={{ color: priority.color }}>
                        {priority.icon} {priority.label}
                    </span>
                    {project.methodology && (
                        <span
                            className="text-xs px-2 py-0.5 rounded-full capitalize"
                            style={{ backgroundColor: 'var(--background)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                        >
                            {project.methodology}
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <Link href={url(`/projects/${project.id}`)}>
                        <Button variant="outline" size="sm">
                            <List size={14} /> Vista Lista
                        </Button>
                    </Link>
                    {(isOwner || currentRole === 'manager') && (
                        <Link href={url(`/projects/${project.id}/edit`)}>
                            <Button variant="outline" size="sm">
                                <Pencil size={14} /> Editar
                            </Button>
                        </Link>
                    )}
                    {isOwner && (
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 size={14} />
                        </Button>
                    )}
                </div>
            </div>

            {/* Board */}
            <div
                className="flex gap-3 overflow-x-auto pb-4"
                style={{ minHeight: 'calc(100vh - 200px)' }}
            >
                {sections.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center py-16">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            Sin secciones. Agrega secciones desde la vista de lista.
                        </p>
                    </div>
                ) : (
                    sections.map(section => (
                        <BoardColumn
                            key={section.id}
                            section={section}
                            customFields={customFields}
                            project={project}
                            canEdit={canEdit}
                            onMoveTask={handleMoveTask}
                        />
                    ))
                )}
            </div>

            {/* Members indicator */}
            {members.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                    <Users size={13} style={{ color: 'var(--text-muted)' }} />
                    <div className="flex -space-x-1.5">
                        {members.slice(0, 5).map(m => (
                            <span
                                key={m.id}
                                className="w-6 h-6 rounded-full border-2 text-[10px] font-bold flex items-center justify-center text-white"
                                style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--surface)' }}
                                title={m.user?.name}
                            >
                                {m.user?.name?.charAt(0).toUpperCase()}
                            </span>
                        ))}
                    </div>
                    {members.length > 5 && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            +{members.length - 5} más
                        </span>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
