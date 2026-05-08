import { FolderKanban, CheckSquare, AlertTriangle, CalendarClock, CircleCheckBig } from 'lucide-react';

const STATS = [
    { key: 'active_projects', label: 'Proyectos activos', icon: FolderKanban, color: 'var(--primary)' },
    { key: 'total_tasks', label: 'Tareas pendientes', icon: CheckSquare, color: 'var(--success)' },
    { key: 'overdue_tasks', label: 'Vencidas', icon: AlertTriangle, color: 'var(--destructive)' },
    { key: 'today_tasks', label: 'Hoy', icon: CalendarClock, color: 'var(--warning)' },
    { key: 'completed_week', label: 'Completadas (semana)', icon: CircleCheckBig, color: 'var(--success)' },
];

export default function StatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-6 gap-3 lg:grid-cols-5">
            {STATS.map(({ key, label, icon: Icon, color }, i) => (
                <div
                    key={key}
                    className={`flex items-center gap-3 rounded-lg p-3 sm:p-4
                        ${i < 3 ? 'col-span-2 lg:col-span-1' : ''}
                        ${i >= 3 ? 'col-span-3 lg:col-span-1' : ''}
                    `}
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-card)',
                    }}
                >
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                        style={{ backgroundColor: `${color}15`, color }}
                    >
                        <Icon size={18} />
                    </div>
                    <div>
                        <p className="text-xl font-bold sm:text-2xl" style={{ color: 'var(--foreground)' }}>
                            {stats[key]}
                        </p>
                        <p className="text-[11px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                            {label}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
