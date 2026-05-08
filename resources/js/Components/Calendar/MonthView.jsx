import CalendarEvent from '@/Components/Calendar/CalendarEvent';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MAX_VISIBLE = 3;

export default function MonthView({ month, tasks, today, onEventClick }) {
    const weeks = buildWeeks(month);
    const tasksByDate = groupByDate(tasks);

    return (
        <div>
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)' }}>
                {DAY_NAMES.map((d) => (
                    <div
                        key={d}
                        className="px-2 py-1.5 text-center text-xs font-medium"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)' }}>
                    {week.map((date) => {
                        const dateStr = formatDate(date);
                        const isToday = dateStr === today;
                        const isCurrentMonth = date.getMonth() === getMonthIndex(month);
                        const dayTasks = tasksByDate[dateStr] || [];

                        return (
                            <div
                                key={dateStr}
                                className="min-h-[50px] border-r p-0.5 last:border-r-0 sm:min-h-[80px] sm:p-1"
                                style={{
                                    borderColor: 'var(--border)',
                                    backgroundColor: isToday ? 'var(--accent)' : 'transparent',
                                    opacity: isCurrentMonth ? 1 : 0.4,
                                }}
                            >
                                <div className="mb-0.5 flex items-center justify-between px-1">
                                    <span
                                        className={`text-xs ${isToday ? 'font-bold' : ''}`}
                                        style={{ color: isToday ? 'var(--primary)' : 'var(--text-muted)' }}
                                    >
                                        {date.getDate()}
                                    </span>
                                </div>
                                <div className="space-y-0.5">
                                    {dayTasks.slice(0, MAX_VISIBLE).map((t) => (
                                        <CalendarEvent
                                            key={t.id}
                                            task={t}
                                            onClick={onEventClick}
                                        />
                                    ))}
                                    {dayTasks.length > MAX_VISIBLE && (
                                        <span
                                            className="block px-1 text-[10px]"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            +{dayTasks.length - MAX_VISIBLE} más
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function buildWeeks(month) {
    const [year, m] = month.split('-').map(Number);
    const firstDay = new Date(year, m - 1, 1);
    const lastDay = new Date(year, m, 0);

    // Start from the Sunday before the first day
    const start = new Date(firstDay);
    start.setDate(start.getDate() - start.getDay());

    const weeks = [];
    const current = new Date(start);

    while (current <= lastDay || current.getDay() !== 0) {
        if (current.getDay() === 0) weeks.push([]);
        weeks[weeks.length - 1].push(new Date(current));
        current.setDate(current.getDate() + 1);
        if (weeks.length > 6) break;
    }

    return weeks;
}

function getMonthIndex(month) {
    return Number(month.split('-')[1]) - 1;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function groupByDate(tasks) {
    const map = {};
    tasks.forEach((t) => {
        if (!map[t.due_date]) map[t.due_date] = [];
        map[t.due_date].push(t);
    });
    return map;
}
