import { CalendarDays, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

const STATUS_CONFIG = {
    planned:  { icon: Clock,         color: 'var(--text-muted)',    label: 'Planificado' },
    at_risk:  { icon: AlertTriangle, color: 'var(--warning)',       label: 'En Riesgo' },
    met:      { icon: CheckCircle2,  color: 'var(--success)',       label: 'Cumplido' },
    missed:   { icon: XCircle,       color: 'var(--destructive)',   label: 'Perdido' },
};
const CRIT_COLORS = { low:'var(--text-muted)', medium:'var(--primary)', high:'var(--warning)', critical:'var(--destructive)' };

export default function MilestoneCard({ milestone, compact = false }) {
    const cfg       = STATUS_CONFIG[milestone.status] ?? STATUS_CONFIG.planned;
    const Icon      = cfg.icon;
    const critColor = CRIT_COLORS[milestone.criticality] ?? 'var(--text-muted)';
    const days      = milestone.days_until ?? Math.round((new Date(milestone.target_date) - new Date()) / 86400000);
    const isUrgent  = days <= 14 && milestone.status !== 'met';

    return (
        <div className="rounded-lg border p-3" style={{ backgroundColor: 'var(--surface)', borderColor: isUrgent ? cfg.color : 'var(--border)' }}>
            <div className="flex items-start gap-2">
                <Icon size={16} className="flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{milestone.name}</p>
                    {!compact && milestone.description && (
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{milestone.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <CalendarDays size={11} />
                            {new Date(milestone.target_date + 'T12:00:00').toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'2-digit' })}
                        </span>
                        <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                        <span className="text-xs capitalize" style={{ color: critColor }}>● {milestone.criticality}</span>
                    </div>
                    {isUrgent && days >= 0 && (
                        <p className="text-xs mt-1 font-medium" style={{ color: cfg.color }}>
                            {days === 0 ? '¡Hoy!' : `${days} día${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`}
                        </p>
                    )}
                    {milestone.linked_tasks_count > 0 && (
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {milestone.linked_tasks?.filter(t => t.is_blocker && !t.done).length ?? 0} bloqueantes pendientes
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
