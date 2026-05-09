const STATUS_COLORS = { planned:'#9B9DB0', at_risk:'#FDAB3D', met:'#00CA72', missed:'#E44258' };
const CRIT_WIDTH    = { low:1, medium:1.5, high:2, critical:2.5 };

export default function MilestoneTimelineMarker({ pct, milestone, totalRows = 3 }) {
    if (pct < 0 || pct > 100) return null;
    const color     = STATUS_COLORS[milestone.status] ?? '#9B9DB0';
    const strokeW   = CRIT_WIDTH[milestone.criticality] ?? 1.5;
    const rowHeight = 40;
    const height    = totalRows * rowHeight;

    return (
        <div className="absolute top-0 z-10 pointer-events-none" style={{ left: `${pct}%`, height: `${height}px` }}>
            <svg width="24" height={height} style={{ overflow: 'visible', marginLeft: '-12px' }}>
                <line x1="12" y1="0" x2="12" y2={height} stroke={color} strokeWidth={strokeW} strokeDasharray={milestone.status === 'at_risk' ? '4 2' : 'none'} />
                <polygon points="8,0 16,0 12,6" fill={color} />
                <title>{milestone.name} · {milestone.target_date}</title>
            </svg>
            <div className="absolute top-1 text-[9px] font-bold whitespace-nowrap"
                style={{ color, transform: 'translateX(-50%)', left: '50%', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {milestone.name}
            </div>
        </div>
    );
}
