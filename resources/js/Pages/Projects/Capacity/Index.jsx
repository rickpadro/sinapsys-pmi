import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import CapacityHeatmap from '@/Components/Capacity/CapacityHeatmap';
import CapacityEditor from '@/Components/Capacity/CapacityEditor';
import { useUrl } from '@/Lib/utils';
import { ArrowLeft, BarChart3 } from 'lucide-react';

export default function CapacityIndex({ project, sections, members, capacityMatrix, heatmap, currentRole, isOwner }) {
    const url     = useUrl();
    const canEdit = ['owner','manager'].includes(currentRole);
    const sprints = sections.filter(s => s.type === 'sprint');

    return (
        <AppLayout title={`Capacity — ${project.name}`}>
            <div className="mx-auto max-w-4xl">
                <div className="mb-4 flex items-center gap-3">
                    <Link href={url(`/projects/${project.id}`)}><Button variant="ghost" size="sm"><ArrowLeft size={14}/></Button></Link>
                    <div>
                        <h1 className="text-base font-semibold flex items-center gap-2" style={{color:'var(--foreground)'}}><BarChart3 size={16}/> Capacity Planning</h1>
                        <p className="text-xs" style={{color:'var(--text-muted)'}}>{project.name} · {members.length} miembros · {sprints.length} sprints</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-lg p-4" style={{backgroundColor:'var(--surface)',border:'1px solid var(--border)'}}>
                        <p className="text-sm font-semibold mb-3" style={{color:'var(--foreground)'}}>Vista general (heatmap)</p>
                        <CapacityHeatmap sections={sections} heatmap={heatmap}/>
                    </div>

                    {canEdit && (
                        <div className="rounded-lg p-4" style={{backgroundColor:'var(--surface)',border:'1px solid var(--border)'}}>
                            <p className="text-sm font-semibold mb-3" style={{color:'var(--foreground)'}}>Editor de dedicación (%)</p>
                            <CapacityEditor sections={sections} members={members} capacityMatrix={capacityMatrix} projectId={project.id} url={url}/>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
