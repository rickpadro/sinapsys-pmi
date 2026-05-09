import { PRIORITIES } from '@/Lib/constants';

export default function BoardDragLayer({ draggingTask }) {
    if (!draggingTask) return null;
    const p = PRIORITIES[draggingTask.priority];
    return (
        <div
            className="fixed pointer-events-none z-50 w-64 opacity-80 rotate-2 shadow-2xl rounded-md border-l-4 p-3"
            style={{
                backgroundColor: 'var(--surface)',
                borderColor: p?.color ?? '#C4C4C4',
                borderLeftWidth: '3px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(2deg)',
            }}
        >
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {draggingTask.name}
            </p>
            {p && (
                <span className="text-[10px] font-medium mt-1 block" style={{ color: p.color }}>
                    {p.icon} {p.label}
                </span>
            )}
        </div>
    );
}
