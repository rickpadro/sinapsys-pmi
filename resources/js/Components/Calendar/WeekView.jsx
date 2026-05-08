import CalendarEvent from '@/Components/Calendar/CalendarEvent';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function WeekView({ month, tasks, today, onEventClick }) {
    const weekDays = getWeekDays(today);
    const tasksByDate = groupByDate(tasks);

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[700px]">
                {/* Header row */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b" style={{ borderColor: 'var(--border)' }}>
                    <div />
                    {weekDays.map((date) => {
                        const dateStr = formatDate(date);
                        const isToday = dateStr === today;
                        return (
                            <div
                                key={dateStr}
                                className="px-2 py-2 text-center"
                                style={{ backgroundColor: isToday ? 'var(--accent)' : 'transparent' }}
                            >
                                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                    {DAY_NAMES[date.getDay()]}
                                </div>
                                <div
                                    className={`text-sm ${isToday ? 'font-bold' : ''}`}
                                    style={{ color: isToday ? 'var(--primary)' : 'var(--foreground)' }}
                                >
                                    {date.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Time grid */}
                {HOURS.map((hour) => (
                    <div
                        key={hour}
                        className="grid grid-cols-[60px_repeat(7,1fr)] border-b"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <div
                            className="px-2 py-1 text-right text-[10px]"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {hour}:00
                        </div>
                        {weekDays.map((date) => {
                            const dateStr = formatDate(date);
                            const dayTasks = hour === 8 ? (tasksByDate[dateStr] || []) : [];
                            return (
                                <div
                                    key={dateStr}
                                    className="min-h-[36px] border-r p-0.5 last:border-r-0"
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    {dayTasks.map((t) => (
                                        <CalendarEvent
                                            key={t.id}
                                            task={t}
                                            onClick={onEventClick}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

function getWeekDays(todayStr) {
    const today = new Date(todayStr + 'T12:00:00');
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        return d;
    });
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
