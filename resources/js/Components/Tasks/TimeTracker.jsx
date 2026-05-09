import { Clock, Plus } from 'lucide-react';

function fmtMins(m) {
    if (!m && m !== 0) return '—';
    const h   = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}h${min > 0 ? ` ${min}m` : ''}` : `${min}m`;
}

export default function TimeTracker({ totalMinutes = 0, estimatedMinutes = null, onLogTime }) {
    const pct  = estimatedMinutes > 0 ? Math.min(100, Math.round((totalMinutes / estimatedMinutes) * 100)) : null;
    const over = estimatedMinutes > 0 && totalMinutes > estimatedMinutes;

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
                <Clock size={13} style={{ color: over ? 'var(--destructive)' : 'var(--text-muted)' }} />
                <span className="text-xs font-medium" style={{ color: over ? 'var(--destructive)' : 'var(--foreground)' }}>
                    {fmtMins(totalMinutes)}
                </span>
                {estimatedMinutes > 0 && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        / {fmtMins(estimatedMinutes)} est.
                    </span>
                )}
            </div>

            {estimatedMinutes > 0 && (
                <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--border)', minWidth: '60px' }}
                >
                    <div
                        className="h-full rounded-full transition-all"
                        style={{
                            width:           `${pct}%`,
                            backgroundColor: over ? 'var(--destructive)' : pct > 80 ? 'var(--warning)' : 'var(--success)',
                        }}
                    />
                </div>
            )}

            {onLogTime && (
                <button
                    onClick={onLogTime}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors"
                    style={{
                        backgroundColor: 'var(--background)',
                        border:          '1px solid var(--border)',
                        color:           'var(--text-muted)',
                    }}
                >
                    <Plus size={11} /> Tiempo
                </button>
            )}
        </div>
    );
}
