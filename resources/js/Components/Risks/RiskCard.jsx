import { AlertTriangle, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';

const P_LABELS = { low:'Baja', medium:'Media', high:'Alta' };
const I_LABELS = { low:'Bajo', medium:'Medio', high:'Alto', critical:'Crítico' };
const STATUS_COLORS = { open:'var(--destructive)', mitigated:'var(--success)', materialized:'var(--warning)', closed:'var(--text-muted)' };

export default function RiskCard({ risk, onEdit, onMaterialize, onClose: onCloseRisk, canEdit }) {
    const sColor = STATUS_COLORS[risk.status] ?? 'var(--text-muted)';
    const mitigatingTasks = risk.mitigations?.filter(m => !m.task?.done).length ?? 0;

    return (
        <div className="rounded-md border p-3" style={{ backgroundColor:'var(--surface)', borderColor:'var(--border)' }}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor:'var(--background)', color:'var(--text-muted)' }}>{risk.code}</span>
                        <span className="text-xs" style={{ color:sColor }}>● {risk.status}</span>
                    </div>
                    <p className="text-sm font-medium" style={{ color:'var(--foreground)' }}>{risk.name}</p>
                    <div className="flex gap-3 mt-1">
                        <span className="text-xs" style={{ color:'var(--text-muted)' }}>P: <b style={{ color:'var(--foreground)' }}>{P_LABELS[risk.probability]}</b></span>
                        <span className="text-xs" style={{ color:'var(--text-muted)' }}>I: <b style={{ color: risk.impact==='critical'?'var(--destructive)':risk.impact==='high'?'var(--warning)':'var(--foreground)' }}>{I_LABELS[risk.impact]}</b></span>
                        {risk.mitigations?.length > 0 && (
                            <span className="text-xs" style={{ color: mitigatingTasks === 0 ? 'var(--warning)' : 'var(--success)' }}>
                                {risk.mitigations.length} task{risk.mitigations.length!==1?'s':''} mitigante{risk.mitigations.length!==1?'s':''}
                                {mitigatingTasks > 0 ? ` · ${mitigatingTasks} pendiente${mitigatingTasks!==1?'s':''}` : ' ✓'}
                            </span>
                        )}
                    </div>
                </div>
                {canEdit && risk.status === 'open' && (
                    <div className="flex gap-1 flex-shrink-0">
                        <button onClick={onEdit} className="text-xs px-2 py-0.5 rounded border" style={{ borderColor:'var(--border)', color:'var(--text-muted)' }}>Editar</button>
                        <button onClick={onMaterialize} className="text-xs px-2 py-0.5 rounded border" style={{ borderColor:'var(--warning)', color:'var(--warning)' }}>Materializó</button>
                    </div>
                )}
            </div>
            {risk.mitigation_plan && (
                <p className="text-xs mt-2 pt-2 border-t" style={{ borderColor:'var(--border)', color:'var(--text-muted)' }}>{risk.mitigation_plan}</p>
            )}
        </div>
    );
}
