import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import RiskMatrix from '@/Components/Risks/RiskMatrix';
import RiskCard from '@/Components/Risks/RiskCard';
import RiskEditor from '@/Components/Risks/RiskEditor';
import { useUrl } from '@/Lib/utils';
import { ArrowLeft, Plus, Shield } from 'lucide-react';

export default function RisksIndex({ project, risks, matrix, currentRole, isOwner }) {
    const url     = useUrl();
    const canEdit = ['owner','manager'].includes(currentRole);
    const [editor, setEditor]       = useState({ open:false, risk:null });
    const [selectedCell, setCell]   = useState(null);

    function handleMaterialize(risk) {
        if (!confirm(`¿Marcar "${risk.name}" como materializado?`)) return;
        router.patch(url(`/projects/${project.id}/risks/${risk.id}/materialize`), {}, { preserveScroll:true });
    }

    const displayRisks = selectedCell
        ? risks.filter(r => r.probability === selectedCell.p && r.impact === selectedCell.i)
        : risks.filter(r => r.status === 'open');

    const openCount = risks.filter(r => r.status==='open').length;

    return (
        <AppLayout title={`Riesgos — ${project.name}`}>
            <div className="mx-auto max-w-3xl">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={url(`/projects/${project.id}`)}><Button variant="ghost" size="sm"><ArrowLeft size={14}/></Button></Link>
                        <div>
                            <h1 className="text-base font-semibold flex items-center gap-2" style={{color:'var(--foreground)'}}><Shield size={16}/> Registro de riesgos</h1>
                            <p className="text-xs" style={{color:'var(--text-muted)'}}>{project.name} · {openCount} abiertos · {matrix.critical_count} en zona crítica</p>
                        </div>
                    </div>
                    {canEdit && <Button size="sm" onClick={() => setEditor({open:true,risk:null})}><Plus size={14}/> Registrar riesgo</Button>}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-lg p-4" style={{backgroundColor:'var(--surface)',border:'1px solid var(--border)'}}>
                        <p className="text-sm font-semibold mb-3" style={{color:'var(--foreground)'}}>Matriz Probabilidad × Impacto</p>
                        <RiskMatrix matrix={matrix.matrix ?? {}} onCellClick={(p,i,r) => setCell(selectedCell?.p===p&&selectedCell?.i===i ? null : {p,i,r})}/>
                        {selectedCell && <p className="text-xs mt-2 text-center" style={{color:'var(--text-muted)'}}>Mostrando {displayRisks.length} riesgo(s) · <button onClick={()=>setCell(null)} style={{color:'var(--primary)'}}>ver todos</button></p>}
                    </div>

                    <div className="space-y-2">
                        {displayRisks.length === 0 ? (
                            <div className="rounded-lg p-8 text-center" style={{backgroundColor:'var(--surface)',border:'1px solid var(--border)'}}>
                                <p className="text-sm" style={{color:'var(--text-muted)'}}>Sin riesgos{selectedCell?' en esta celda':' abiertos'}.</p>
                            </div>
                        ) : displayRisks.map(risk => (
                            <RiskCard key={risk.id} risk={risk} canEdit={canEdit}
                                onEdit={() => setEditor({open:true,risk})}
                                onMaterialize={() => handleMaterialize(risk)}/>
                        ))}
                    </div>
                </div>
            </div>
            <RiskEditor open={editor.open} onClose={() => setEditor({open:false,risk:null})} risk={editor.risk} projectId={project.id}/>
        </AppLayout>
    );
}
