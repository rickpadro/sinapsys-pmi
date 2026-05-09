const PROB_LABELS   = ['Alta','Media','Baja'];
const PROB_KEYS     = ['high','medium','low'];
const IMPACT_LABELS = ['Bajo','Medio','Alto','Crítico'];
const IMPACT_KEYS   = ['low','medium','high','critical'];
const HEAT_COLORS   = { critical:'#E4425820', high:'#FDAB3D20', medium:'#4A6CF720', low:'transparent' };
const HEAT_BORDERS  = { critical:'#E44258', high:'#FDAB3D', medium:'#4A6CF7', low:'var(--border)' };

export default function RiskMatrix({ matrix = {}, onCellClick }) {
    function score(p, i) {
        const pM = {low:1,medium:2,high:3}, iM = {low:1,medium:2,high:3,critical:4};
        const s = (pM[p]??1)*(iM[i]??1);
        return s>=9?'critical':s>=6?'high':s>=3?'medium':'low';
    }

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[360px]">
                <div className="flex items-end mb-1">
                    <div className="w-16 flex-shrink-0"/>
                    {IMPACT_LABELS.map((l,i) => (
                        <div key={i} className="flex-1 text-center text-[10px] font-semibold" style={{ color:'var(--text-muted)' }}>{l}</div>
                    ))}
                </div>
                {PROB_KEYS.map((p, pi) => (
                    <div key={p} className="flex items-center mb-1">
                        <div className="w-16 flex-shrink-0 text-[10px] font-semibold text-right pr-2" style={{ color:'var(--text-muted)' }}>{PROB_LABELS[pi]}</div>
                        {IMPACT_KEYS.map(imp => {
                            const heat  = score(p, imp);
                            const risks = matrix[p]?.[imp] ?? [];
                            return (
                                <button key={imp} onClick={() => onCellClick?.(p, imp, risks)}
                                    className="flex-1 min-h-[52px] rounded mx-0.5 border flex flex-col items-center justify-center gap-0.5 transition-opacity hover:opacity-80"
                                    style={{ backgroundColor:HEAT_COLORS[heat], borderColor:HEAT_BORDERS[heat] }}>
                                    {risks.length > 0 && (
                                        <>
                                            <span className="text-base font-bold" style={{ color:HEAT_BORDERS[heat] }}>{risks.length}</span>
                                            <span className="text-[9px]" style={{ color:HEAT_BORDERS[heat] }}>{risks.map(r=>r.code).join(', ')}</span>
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
