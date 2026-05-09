import { CheckCircle2, XCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const STATUS_CONFIG = {
    confirmed: { Icon:CheckCircle2, color:'var(--success)',     label:'Confirmada' },
    pending:   { Icon:Clock,        color:'var(--warning)',     label:'Pendiente' },
    rejected:  { Icon:XCircle,      color:'var(--destructive)', label:'Rechazada' },
};

export default function DecisionCard({ decision, onConfirm, onReject, onEdit, canEdit }) {
    const [expanded, setExpanded] = useState(false);
    const cfg = STATUS_CONFIG[decision.status] ?? STATUS_CONFIG.pending;
    const { Icon } = cfg;
    const hasBlocker = decision.blocks_description || decision.blocks_section || decision.blocks_milestone;

    return (
        <div className="rounded-lg border" style={{ backgroundColor:'var(--surface)', borderColor:'var(--border)', borderLeft:`3px solid ${cfg.color}` }}>
            <button onClick={() => setExpanded(!expanded)} className="w-full flex items-start gap-3 p-3 text-left">
                <Icon size={15} className="flex-shrink-0 mt-0.5" style={{ color:cfg.color }}/>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color:'var(--text-muted)' }}>{decision.code}</span>
                        <span className="text-xs" style={{ color:cfg.color }}>{cfg.label}</span>
                        {hasBlocker && <AlertCircle size={11} style={{ color:'var(--warning)' }} title="Tiene bloqueo"/>}
                    </div>
                    <p className="text-sm font-medium mt-0.5 truncate" style={{ color:'var(--foreground)' }}>{decision.title}</p>
                </div>
                <ChevronRight size={14} className={`flex-shrink-0 mt-0.5 transition-transform ${expanded?'rotate-90':''}`} style={{ color:'var(--text-muted)' }}/>
            </button>

            {expanded && (
                <div className="px-3 pb-3 pt-1 border-t space-y-2" style={{ borderColor:'var(--border)' }}>
                    <p className="text-xs" style={{ color:'var(--text-muted)' }}>{decision.description}</p>
                    {hasBlocker && (
                        <div className="rounded px-2 py-1.5 text-xs" style={{ backgroundColor:'var(--background)', color:'var(--warning)' }}>
                            ⚠ Bloquea: {decision.blocks_description || decision.blocks_section?.name || decision.blocks_milestone?.name}
                        </div>
                    )}
                    {decision.decided_on && (
                        <p className="text-xs" style={{ color:'var(--text-muted)' }}>
                            Decidido: {new Date(decision.decided_on+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'2-digit'})}
                            {decision.decided_by && ` · ${decision.decided_by.name}`}
                        </p>
                    )}
                    {canEdit && decision.status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                            <button onClick={onConfirm} className="text-xs px-3 py-1 rounded" style={{ backgroundColor:'var(--success)', color:'#fff' }}>Confirmar</button>
                            <button onClick={onReject} className="text-xs px-3 py-1 rounded border" style={{ borderColor:'var(--destructive)', color:'var(--destructive)' }}>Rechazar</button>
                            <button onClick={onEdit} className="text-xs px-3 py-1 rounded border ml-auto" style={{ borderColor:'var(--border)', color:'var(--text-muted)' }}>Editar</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
