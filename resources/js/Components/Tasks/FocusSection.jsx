import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import TaskRow from '@/Components/Tasks/TaskRow';

const VARIANT_STYLES = {
    overdue: { bg: 'rgba(228,66,88,0.05)', color: 'var(--destructive)', label: 'Vencidas' },
    today: { bg: 'rgba(253,171,61,0.05)', color: 'var(--warning)', label: 'Hoy' },
    upcoming: { bg: 'rgba(74,108,247,0.05)', color: 'var(--primary)', label: 'Próximas (7 días)' },
    no_date: { bg: 'transparent', color: 'var(--text-muted)', label: 'Sin fecha' },
    completed: { bg: 'rgba(0,202,114,0.05)', color: 'var(--success)', label: 'Completadas' },
};

export default function FocusSection({ variant, tasks, onEdit }) {
    const [collapsed, setCollapsed] = useState(variant === 'completed');
    const style = VARIANT_STYLES[variant] || VARIANT_STYLES.no_date;

    if (tasks.length === 0) return null;

    return (
        <div
            className="rounded-lg"
            style={{
                backgroundColor: style.bg,
                border: '1px solid var(--border)',
            }}
        >
            {/* Header */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex w-full items-center gap-2 px-4 py-2.5"
            >
                {collapsed
                    ? <ChevronRight size={16} style={{ color: style.color }} />
                    : <ChevronDown size={16} style={{ color: style.color }} />
                }
                <span className="text-sm font-semibold" style={{ color: style.color }}>
                    {style.label}
                </span>
                <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                    style={{ backgroundColor: style.color }}
                >
                    {tasks.length}
                </span>
            </button>

            {/* Tasks */}
            {!collapsed && (
                <div className="px-1 pb-1">
                    {tasks.map((task) => (
                        <TaskRow key={task.id} task={task} onEdit={onEdit} />
                    ))}
                </div>
            )}
        </div>
    );
}
