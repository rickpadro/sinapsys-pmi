import { PRIORITIES } from '@/Lib/constants';

const STATUS_COLOR = { planned: '#9B9DB0', active: '#4A6CF7', completed: '#00CA72', archived: '#9B9DB0' };

export default function TimelineRow({ section, pct, widthPct, fmtDay }) {
    const color = STATUS_COLOR[section.status] ?? '#9B9DB0';

    const hasCritical = section.tasks?.some(t => t.on_critical_path);

    return (
        <div className="flex">
            {/* Section label */}
            <div
                className="w-36 flex-shrink-0 px-3 py-2.5 border-r flex items-center gap-2"
                style={{ borderColor: 'var(--border)' }}
            >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {section.name}
                </span>
            </div>

            {/* Gantt area */}
            <div className="relative flex-1 h-10 overflow-hidden">
                {/* Section bar */}
                {section.start_date && section.end_date && (
                    <div
                        className="absolute top-2 h-6 rounded-md flex items-center px-2"
                        style={{
                            left:            `${Math.max(0, pct(section.start_date))}%`,
                            width:           `${widthPct(section.start_date, section.end_date)}%`,
                            backgroundColor: color + '33',
                            border:          `1px solid ${color}`,
                        }}
                    >
                        <span className="text-[10px] truncate" style={{ color }}>
                            {hasCritical && '🔴 '}{section.name}
                        </span>
                    </div>
                )}

                {/* Task milestones */}
                {section.tasks?.map(task => {
                    const p = PRIORITIES[task.priority];
                    const left = pct(task.due_date + 'T12:00:00');
                    if (left < 0 || left > 100) return null;
                    return (
                        <div
                            key={task.id}
                            className="absolute top-3 w-3 h-3 rounded-full transform -translate-x-1/2 border-2 border-white"
                            style={{ left: `${left}%`, backgroundColor: p?.color ?? '#C4C4C4' }}
                            title={`${task.name} — ${fmtDay(task.due_date)}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}
