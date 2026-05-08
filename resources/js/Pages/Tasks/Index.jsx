import { useState } from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import FocusSection from '@/Components/Tasks/FocusSection';
import TaskFilters from '@/Components/Tasks/TaskFilters';
import TaskForm from '@/Components/Tasks/TaskForm';
import { Button } from '@/Components/ui/button';
import ExportDropdown from '@/Components/ExportDropdown';
import { useUrl } from '@/Lib/utils';
import { Plus } from 'lucide-react';

const SECTIONS = ['overdue', 'today', 'upcoming', 'no_date', 'completed'];

export default function Index({ grouped, projects, projectMembersMap, filters }) {
    const url = useUrl();
    const [formOpen, setFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    function handleEdit(task) {
        setEditingTask(task);
        setFormOpen(true);
    }

    function handleClose() {
        setFormOpen(false);
        setEditingTask(null);
    }

    const totalPending = SECTIONS
        .filter((s) => s !== 'completed')
        .reduce((sum, s) => sum + (grouped[s]?.length || 0), 0);

    return (
        <AppLayout title="Vista Foco">
            {/* Toolbar */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <TaskFilters projects={projects} filters={filters} />
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {totalPending} pendientes
                    </span>
                </div>
                <div className="flex gap-2">
                    <ExportDropdown baseUrl={url('/export/tasks')} />
                    <Button size="sm" onClick={() => { setEditingTask(null); setFormOpen(true); }}>
                        <Plus size={16} /> Nueva tarea
                    </Button>
                </div>
            </div>

            {/* Focus Sections */}
            <div className="space-y-3">
                {SECTIONS.map((section) => (
                    <FocusSection
                        key={section}
                        variant={section}
                        tasks={grouped[section] || []}
                        onEdit={handleEdit}
                    />
                ))}
            </div>

            {totalPending === 0 && (grouped.completed?.length || 0) === 0 && (
                <p className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Sin tareas. Crea tu primera tarea.
                </p>
            )}

            {/* Task Form Modal */}
            <TaskForm
                open={formOpen}
                onClose={handleClose}
                task={editingTask}
                projects={projects}
                projectMembersMap={projectMembersMap}
            />
        </AppLayout>
    );
}
