import { useState } from 'react';
import { router } from '@inertiajs/react';
import BoardCard from '@/Components/Board/BoardCard';
import TaskForm from '@/Components/Tasks/TaskForm';
import { Button } from '@/Components/ui/button';
import { Plus } from 'lucide-react';

const STATUS_STYLES = {
    planned:  { bg: 'var(--background)', dot: 'var(--text-muted)' },
    active:   { bg: 'color-mix(in srgb, var(--primary) 8%, transparent)', dot: 'var(--primary)' },
    done:     { bg: 'color-mix(in srgb, var(--success) 8%, transparent)', dot: 'var(--success)' },
    archived: { bg: 'var(--background)', dot: 'var(--border)' },
};

export default function BoardColumn({ section, customFields, project, canEdit, onMoveTask }) {
    const [isOver, setIsOver]   = useState(false);
    const [taskForm, setTaskForm] = useState(false);

    const style = STATUS_STYLES[section.status] ?? STATUS_STYLES.planned;

    function handleDragOver(e) {
        e.preventDefault();
        setIsOver(true);
    }

    function handleDragLeave() {
        setIsOver(false);
    }

    function handleDrop(e) {
        e.preventDefault();
        setIsOver(false);
        const taskId        = Number(e.dataTransfer.getData('taskId'));
        const fromSectionId = Number(e.dataTransfer.getData('fromSectionId'));
        if (!taskId || fromSectionId === section.id) return;
        onMoveTask(taskId, section.id, section.tasks.length);
    }

    return (
        <div
            className="flex flex-col rounded-xl w-72 flex-shrink-0"
            style={{ backgroundColor: style.bg, border: '1px solid var(--border)' }}
        >
            {/* Column header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: style.dot }} />
                <span className="flex-1 text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                    {section.name}
                </span>
                <span
                    className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                    {section.tasks?.length ?? 0}
                </span>
                {canEdit && (
                    <button
                        onClick={() => setTaskForm(true)}
                        className="opacity-50 hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--foreground)' }}
                    >
                        <Plus size={15} />
                    </button>
                )}
            </div>

            {/* Cards drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="flex-1 space-y-2 p-2 min-h-[120px] rounded-b-xl transition-colors"
                style={{ backgroundColor: isOver ? 'color-mix(in srgb, var(--primary) 5%, transparent)' : 'transparent' }}
            >
                {section.tasks?.map((task, idx) => (
                    <BoardCard
                        key={task.id}
                        task={task}
                        customFields={customFields}
                        onDragStart={(e) => {
                            e.dataTransfer.setData('taskId', task.id);
                            e.dataTransfer.setData('fromSectionId', section.id);
                            e.dataTransfer.effectAllowed = 'move';
                        }}
                    />
                ))}
                {(!section.tasks || section.tasks.length === 0) && !isOver && (
                    <p className="text-center text-xs py-4" style={{ color: 'var(--text-muted)' }}>
                        Arrastra tareas aquí
                    </p>
                )}
            </div>

            <TaskForm
                open={taskForm}
                onClose={() => setTaskForm(false)}
                task={null}
                projects={[{ id: project.id, name: project.name, color: project.color }]}
                defaultProjectId={project.id}
                defaultSectionId={section.id}
            />
        </div>
    );
}
