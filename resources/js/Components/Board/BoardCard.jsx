import { PRIORITIES } from '@/Lib/constants';
import { Calendar, User } from 'lucide-react';

const PRIORITY_BORDER = {
    1: '#E44258',
    2: '#FDAB3D',
    3: '#4A6CF7',
    4: '#C4C4C4',
};

export default function BoardCard({ task, customFields, onDragStart, onClick }) {
    const p         = PRIORITIES[task.priority];
    const isOverdue = !task.done && task.due_date && new Date(task.due_date) < new Date(new Date().toDateString());

    const cfValues = (customFields ?? []).map(cf => {
        const val = task.custom_field_values?.find(v => v.custom_field_id === cf.id);
        return val ? { label: cf.name, value: val.value } : null;
    }).filter(Boolean);

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onClick={onClick}
            className="rounded-md border cursor-grab active:cursor-grabbing select-none transition-shadow hover:shadow-md"
            style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                borderLeft: `3px solid ${PRIORITY_BORDER[task.priority] ?? '#C4C4C4'}`,
            }}
        >
            <div className="p-3 space-y-2">
                {/* Title */}
                <p
                    className={`text-sm font-medium leading-snug ${task.done ? 'line-through opacity-50' : ''}`}
                    style={{ color: 'var(--foreground)' }}
                >
                    {task.name}
                </p>

                {/* Custom field values */}
                {cfValues.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {cfValues.map((cf, i) => (
                            <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: 'var(--background)', color: 'var(--text-muted)' }}
                            >
                                {cf.label}: {cf.value}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer: due date + assignee */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium" style={{ color: p.color }}>
                            {p.icon} {p.label}
                        </span>
                        {task.due_date && (
                            <span
                                className="flex items-center gap-0.5 text-[10px]"
                                style={{ color: isOverdue ? 'var(--destructive)' : 'var(--text-muted)' }}
                            >
                                <Calendar size={10} />
                                {new Date(task.due_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                            </span>
                        )}
                    </div>
                    {task.assignee && (
                        <span
                            className="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: 'var(--primary)' }}
                            title={task.assignee.name}
                        >
                            {task.assignee.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
