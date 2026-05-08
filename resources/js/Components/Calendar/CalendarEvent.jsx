import { PRIORITIES } from '@/Lib/constants';

export default function CalendarEvent({ task, onClick }) {
    const priority = PRIORITIES[task.priority];
    const color = task.project?.color || '#888780';

    return (
        <button
            onClick={() => onClick?.(task)}
            className="flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-left text-[11px] leading-tight transition-opacity hover:opacity-80"
            style={{
                backgroundColor: `${color}18`,
                color: 'var(--foreground)',
            }}
        >
            <span style={{ color: priority.color }} className="shrink-0">
                {priority.icon}
            </span>
            <span className={`truncate ${task.done ? 'line-through opacity-50' : ''}`}>
                {task.name}
            </span>
        </button>
    );
}
