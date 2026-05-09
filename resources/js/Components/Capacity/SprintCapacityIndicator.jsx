import { Users } from 'lucide-react';

export default function SprintCapacityIndicator({ capacity }) {
    if (!capacity || capacity.n_a) return null;

    const color = capacity.overcommitted
        ? 'var(--destructive)'
        : capacity.utilization_pct >= 90
        ? 'var(--warning)'
        : 'var(--success)';

    return (
        <div className="flex items-center gap-1.5 text-xs" style={{ color }}>
            <Users size={11}/>
            <span className="font-medium">{capacity.utilization_pct}%</span>
            {capacity.overcommitted && <span>⚠</span>}
            <span style={{ color:'var(--text-muted)' }}>
                {capacity.planned_story_points} SP · {capacity.total_hours_available}h disp.
            </span>
        </div>
    );
}
