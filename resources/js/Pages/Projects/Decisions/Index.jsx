import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import DecisionsList from '@/Components/Decisions/DecisionsList';
import DecisionEditor from '@/Components/Decisions/DecisionEditor';
import { useUrl } from '@/Lib/utils';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';

export default function DecisionsIndex({ project, decisions, currentRole, isOwner }) {
    const url     = useUrl();
    const canEdit = ['owner','manager'].includes(currentRole);
    const [editorOpen, setEditorOpen] = useState(false);

    const pendingCount   = decisions.filter(d => d.status === 'pending').length;
    const confirmedCount = decisions.filter(d => d.status === 'confirmed').length;

    return (
        <AppLayout title={`Decisiones — ${project.name}`}>
            <div className="mx-auto max-w-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={url(`/projects/${project.id}`)}><Button variant="ghost" size="sm"><ArrowLeft size={14}/></Button></Link>
                        <div>
                            <h1 className="text-base font-semibold flex items-center gap-2" style={{color:'var(--foreground)'}}><BookOpen size={16}/> Log de decisiones</h1>
                            <p className="text-xs" style={{color:'var(--text-muted)'}}>
                                {project.name} · {decisions.length} total · {confirmedCount} confirmadas · {pendingCount > 0 && <span style={{color:'var(--warning)'}}>{pendingCount} pendientes</span>}
                            </p>
                        </div>
                    </div>
                    {canEdit && <Button size="sm" onClick={() => setEditorOpen(true)}><Plus size={14}/> Nueva decisión</Button>}
                </div>

                <DecisionsList decisions={decisions} canEdit={canEdit} projectId={project.id} url={url}/>
            </div>
            <DecisionEditor open={editorOpen} onClose={() => setEditorOpen(false)} decision={null} projectId={project.id}/>
        </AppLayout>
    );
}
