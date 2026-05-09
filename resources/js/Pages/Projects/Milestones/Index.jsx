import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import MilestoneCard from '@/Components/Milestones/MilestoneCard';
import MilestoneEditor from '@/Components/Milestones/MilestoneEditor';
import { useUrl } from '@/Lib/utils';
import { ArrowLeft, Plus, CheckCircle2, Trash2, Target } from 'lucide-react';

export default function MilestonesIndex({ project, milestones, currentRole, isOwner }) {
    const url     = useUrl();
    const canEdit = ['owner','manager'].includes(currentRole);
    const [editor, setEditor] = useState({ open:false, milestone:null });

    function handleDelete(milestone) {
        if (!confirm(`¿Eliminar el hito "${milestone.name}"?`)) return;
        router.delete(url(`/projects/${project.id}/milestones/${milestone.id}`), { preserveScroll:true });
    }

    function handleMarkMet(milestone) {
        router.patch(url(`/projects/${project.id}/milestones/${milestone.id}/mark-met`), {}, { preserveScroll:true });
    }

    const stats = { total: milestones.length, met: milestones.filter(m=>m.status==='met').length, atRisk: milestones.filter(m=>m.status==='at_risk').length };

    return (
        <AppLayout title={`Hitos — ${project.name}`}>
            <div className="mx-auto max-w-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={url(`/projects/${project.id}`)}><Button variant="ghost" size="sm"><ArrowLeft size={14}/></Button></Link>
                        <div>
                            <h1 className="text-base font-semibold flex items-center gap-2" style={{color:'var(--foreground)'}}><Target size={16}/> Hitos contractuales</h1>
                            <p className="text-xs" style={{color:'var(--text-muted)'}}>{project.name} · {stats.met}/{stats.total} cumplidos{stats.atRisk > 0 ? ` · ${stats.atRisk} en riesgo` : ''}</p>
                        </div>
                    </div>
                    {canEdit && <Button size="sm" onClick={() => setEditor({open:true, milestone:null})}><Plus size={14}/> Nuevo hito</Button>}
                </div>

                {milestones.length === 0 ? (
                    <div className="rounded-lg p-12 text-center" style={{backgroundColor:'var(--surface)',border:'1px solid var(--border)'}}>
                        <Target size={32} className="mx-auto mb-2 opacity-20"/>
                        <p className="text-sm" style={{color:'var(--text-muted)'}}>Sin hitos definidos.{canEdit && ' Agrega hitos contractuales para hacer seguimiento.'}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {milestones.map(milestone => (
                            <div key={milestone.id} className="group relative">
                                <MilestoneCard milestone={milestone}/>
                                {canEdit && (
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {milestone.status !== 'met' && (
                                            <Button variant="ghost" size="xs" onClick={() => handleMarkMet(milestone)} title="Marcar como cumplido">
                                                <CheckCircle2 size={13} style={{color:'var(--success)'}}/>
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="xs" onClick={() => setEditor({open:true, milestone})}>
                                            ✏
                                        </Button>
                                        <Button variant="ghost" size="xs" onClick={() => handleDelete(milestone)} style={{color:'var(--destructive)'}}>
                                            <Trash2 size={13}/>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <MilestoneEditor open={editor.open} onClose={() => setEditor({open:false, milestone:null})} milestone={editor.milestone} projectId={project.id}/>
        </AppLayout>
    );
}
