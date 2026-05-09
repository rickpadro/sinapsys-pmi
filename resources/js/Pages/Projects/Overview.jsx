import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import MilestoneCard from '@/Components/Milestones/MilestoneCard';
import CriticalPathWidget from '@/Components/CriticalPath/CriticalPathWidget';
import CapacityHeatmap from '@/Components/Capacity/CapacityHeatmap';
import { useUrl } from '@/Lib/utils';
import { List, LayoutGrid, GanttChartSquare, Target, Shield, BookOpen, BarChart3, AlertTriangle } from 'lucide-react';

const RISK_COLORS = { low:'var(--text-muted)', medium:'var(--primary)', high:'var(--warning)', critical:'var(--destructive)' };

export default function Overview({ project, milestones, upcomingMilestones, riskMatrix, topRisks, pendingDecisions, capacityHeatmap, criticalTasks, sections, currentRole, isOwner }) {
    const url     = useUrl();
    const canEdit = ['owner','manager'].includes(currentRole);

    return (
        <AppLayout title={`Overview — ${project.name}`}>
            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg p-3"
                style={{ backgroundColor:'var(--surface)', border:'1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor:project.color }}/>
                    <span className="text-sm font-semibold" style={{ color:'var(--foreground)' }}>{project.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded capitalize" style={{ backgroundColor:'var(--background)', border:'1px solid var(--border)', color:'var(--text-muted)' }}>
                        {project.methodology ?? 'pmi'}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href={url(`/projects/${project.id}`)}><Button variant="outline" size="sm"><List size={14}/> Lista</Button></Link>
                    <Link href={url(`/projects/${project.id}/board`)}><Button variant="outline" size="sm"><LayoutGrid size={14}/> Tablero</Button></Link>
                    <Link href={url(`/projects/${project.id}/timeline`)}><Button variant="outline" size="sm"><GanttChartSquare size={14}/> Timeline</Button></Link>
                </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <QuickStat icon={Target} label="Hitos" value={`${milestones.filter(m=>m.status==='met').length}/${milestones.length}`} sub="cumplidos" color="var(--success)" href={url(`/projects/${project.id}/milestones`)}/>
                <QuickStat icon={Shield} label="Riesgos" value={riskMatrix.open_total ?? 0} sub={`${riskMatrix.critical_count ?? 0} críticos`} color="var(--destructive)" href={url(`/projects/${project.id}/risks`)}/>
                <QuickStat icon={BookOpen} label="Decisiones" value={pendingDecisions.length} sub="pendientes" color="var(--warning)" href={url(`/projects/${project.id}/decisions`)}/>
                <QuickStat icon={BarChart3} label="Critical Path" value={criticalTasks.length} sub="tareas" color="#E44258" href={url(`/projects/${project.id}/timeline`)}/>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Left column */}
                <div className="space-y-4">
                    {/* Upcoming milestones */}
                    <Section title="Próximos hitos" icon={Target} href={url(`/projects/${project.id}/milestones`)} count={upcomingMilestones.length}>
                        {upcomingMilestones.length === 0
                            ? <Empty msg="Sin hitos próximos (30 días)"/>
                            : upcomingMilestones.slice(0,3).map(m => <MilestoneCard key={m.id} milestone={m} compact/>)
                        }
                    </Section>

                    {/* Pending decisions with blockers */}
                    <Section title="Decisiones pendientes" icon={BookOpen} href={url(`/projects/${project.id}/decisions`)} count={pendingDecisions.length}>
                        {pendingDecisions.length === 0
                            ? <Empty msg="Sin decisiones pendientes con bloqueos"/>
                            : pendingDecisions.slice(0,4).map(d => (
                                <div key={d.id} className="flex items-start gap-2 text-xs py-1.5 border-b last:border-0" style={{ borderColor:'var(--border)' }}>
                                    <span className="font-bold flex-shrink-0" style={{ color:'var(--text-muted)' }}>{d.code}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate" style={{ color:'var(--foreground)' }}>{d.title}</p>
                                        {(d.blocks_description || d.blocks_section?.name || d.blocks_milestone?.name) && (
                                            <p style={{ color:'var(--warning)' }}>
                                                ⚠ Bloquea: {d.blocks_description || d.blocks_section?.name || d.blocks_milestone?.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        }
                    </Section>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    {/* Critical path */}
                    <Section title="Critical Path" icon={AlertTriangle} count={criticalTasks.filter(t=>t.is_blocker).length + ' bloqueantes'}>
                        <CriticalPathWidget criticalTasks={criticalTasks} project={project}/>
                    </Section>

                    {/* Top risks */}
                    <Section title="Top Riesgos Abiertos" icon={Shield} href={url(`/projects/${project.id}/risks`)} count={riskMatrix.open_total}>
                        {topRisks.length === 0
                            ? <Empty msg="Sin riesgos abiertos"/>
                            : topRisks.slice(0,4).map(risk => (
                                <div key={risk.id} className="flex items-center gap-2 text-xs py-1.5 border-b last:border-0" style={{ borderColor:'var(--border)' }}>
                                    <span className="font-bold flex-shrink-0" style={{ color:RISK_COLORS[risk.impact] }}>{risk.code}</span>
                                    <p className="flex-1 min-w-0 truncate" style={{ color:'var(--foreground)' }}>{risk.name}</p>
                                    <span style={{ color: risk.mitigations?.length>0 ? 'var(--success)' : 'var(--warning)' }}>
                                        {risk.mitigations?.length>0 ? `${risk.mitigations.length} mitig.` : '⚠ sin mitig.'}
                                    </span>
                                </div>
                            ))
                        }
                    </Section>

                    {/* Capacity heatmap */}
                    <Section title="Capacity Sprints" icon={BarChart3} href={url(`/projects/${project.id}/capacity`)}>
                        <CapacityHeatmap sections={sections} heatmap={capacityHeatmap}/>
                    </Section>
                </div>
            </div>
        </AppLayout>
    );
}

function QuickStat({ icon: Icon, label, value, sub, color, href }) {
    return (
        <a href={href} className="rounded-lg p-3 transition-shadow hover:shadow-md"
            style={{ backgroundColor:'var(--surface)', border:'1px solid var(--border)', display:'block' }}>
            <div className="flex items-start justify-between">
                <Icon size={16} style={{ color }}/>
                <span className="text-2xl font-bold" style={{ color }}>{value}</span>
            </div>
            <p className="text-xs font-medium mt-1" style={{ color:'var(--foreground)' }}>{label}</p>
            <p className="text-xs" style={{ color:'var(--text-muted)' }}>{sub}</p>
        </a>
    );
}

function Section({ title, icon: Icon, href, count, children }) {
    return (
        <div className="rounded-lg p-4" style={{ backgroundColor:'var(--surface)', border:'1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color:'var(--foreground)' }}>
                    <Icon size={14}/> {title}
                    {count !== undefined && count !== null && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor:'var(--border)', color:'var(--text-muted)' }}>{count}</span>
                    )}
                </p>
                {href && <a href={href} className="text-xs" style={{ color:'var(--primary)' }}>Ver todo →</a>}
            </div>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function Empty({ msg }) {
    return <p className="text-xs text-center py-3" style={{ color:'var(--text-muted)' }}>{msg}</p>;
}
