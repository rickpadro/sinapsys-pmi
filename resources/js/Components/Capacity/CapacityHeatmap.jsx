const HEAT_COLORS = {
    green:   { bg:'#00CA7215', border:'#00CA72', label:'<70%' },
    yellow:  { bg:'#FDAB3D15', border:'#FDAB3D', label:'70-90%' },
    red:     { bg:'#E4425815', border:'#E44258', label:'>90%' },
    na:      { bg:'transparent', border:'var(--border)', label:'N/A' },
};

export default function CapacityHeatmap({ sections = [], heatmap = {} }) {
    const sprints = sections.filter(s => s.type === 'sprint');

    if (sprints.length === 0) return (
        <p className="text-xs text-center py-4" style={{ color:'var(--text-muted)' }}>Sin sprints con fechas definidas.</p>
    );

    return (
        <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-[300px]">
                {sprints.map(sprint => {
                    const heat = heatmap[sprint.id] ?? 'na';
                    const cfg  = HEAT_COLORS[heat] ?? HEAT_COLORS.na;
                    return (
                        <div key={sprint.id} className="flex-1 min-w-[80px] rounded-md border p-2 text-center"
                            style={{ backgroundColor:cfg.bg, borderColor:cfg.border }}>
                            <p className="text-[10px] font-medium truncate" style={{ color:'var(--foreground)' }}>{sprint.name}</p>
                            <p className="text-[10px] mt-0.5" style={{ color:cfg.border }}>{cfg.label}</p>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px]" style={{ color:'var(--text-muted)' }}>
                {Object.entries(HEAT_COLORS).filter(([k]) => k !== 'na').map(([k, v]) => (
                    <span key={k} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor:v.border }}/>
                        {v.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
