import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { LayoutGrid } from 'lucide-react';
import { useUrl } from '@/Lib/utils';
import SectionCard from '@/Components/Sections/SectionCard';
import SectionEditor from '@/Components/Sections/SectionEditor';
import SectionReorderable from '@/Components/Sections/SectionReorderable';
import TaskForm from '@/Components/Tasks/TaskForm';

export default function SectionList({ project, currentRole }) {
    const url      = useUrl();
    const sections = project.sections ?? [];
    const canEdit  = ['owner', 'manager'].includes(currentRole);

    const [addingSection, setAddingSection] = useState(false);
    const [taskForm, setTaskForm]           = useState({ open: false, task: null, sectionId: null });

    function openTaskForm(sectionId, task = null) {
        setTaskForm({ open: true, task, sectionId });
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

            <SectionReorderable>
                {sections.map(section => (
                    <SectionCard
                        key={section.id}
                        section={section}
                        canEdit={canEdit}
                        onAddTask={openTaskForm}
                        onDelete={handleDeleteSection}
                        url={url}
                    />
                ))}
            </SectionReorderable>

            {/* Add section */}
            {canEdit && (
                <div className="pt-1">
                    <SectionEditor
                        projectId={project.id}
                        open={addingSection}
                        onOpen={() => setAddingSection(true)}
                        onClose={() => setAddingSection(false)}
                    />
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
