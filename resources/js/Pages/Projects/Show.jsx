import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import PhaseProgress from '@/Components/Projects/PhaseProgress';
import PhaseTaskList from '@/Components/Projects/PhaseTaskList';
import ViabilityRadar from '@/Components/Projects/ViabilityRadar';
import AssistantPanel from '@/Components/AI/AssistantPanel';
import TeamTab from '@/Components/Projects/TeamTab';
import SectionList from '@/Components/Sections/SectionList';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { PRIORITIES, PROJECT_TYPES } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';
import { Input } from '@/Components/ui/input';
import { Pencil, Trash2, Plus, ExternalLink, X, Users, LayoutGrid, GanttChartSquare, TrendingDown, Zap } from 'lucide-react';

export default function Show({ project, aiMessages, members, currentRole, isOwner }) {
    const url = useUrl();
    const priority = PRIORITIES[project.priority];

    function handleDelete() {
        if (confirm('¿Eliminar este proyecto?')) {
            router.delete(url(`/projects/${project.id}`));
        }
    }

    return (
        <AppLayout title={project.name}>
            {/* Header bar */}
            <div
                className="mb-4 flex flex-col gap-3 rounded-lg p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-4"
                style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                }}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: project.color }}
                    />
                    <Badge
                        className="text-white"
                        style={{ backgroundColor: project.color }}
                    >
                        {PROJECT_TYPES[project.type]}
                    </Badge>
                    <span
                        className="text-sm font-medium"
                        style={{ color: priority.color }}
                    >
                        {priority.icon} {priority.label}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        I:{project.impact}/E:{project.effort}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href={url(`/projects/${project.id}/overview`)}>
                        <Button variant="outline" size="sm">
                            <LayoutGrid size={14} /> Overview
                        </Button>
                    </Link>
                    <Link href={url(`/projects/${project.id}/board`)}>
                        <Button variant="outline" size="sm">
                            <LayoutGrid size={14} /> Tablero
                        </Button>
                    </Link>
                    <Link href={url(`/projects/${project.id}/timeline`)}>
                        <Button variant="outline" size="sm">
                            <GanttChartSquare size={14} /> Timeline
                        </Button>
                    </Link>
                    {(isOwner || currentRole === 'manager') && (
                        <Link href={url(`/projects/${project.id}/edit`)}>
                            <Button variant="outline" size="sm">
                                <Pencil size={14} /> Editar
                            </Button>
                        </Link>
                    )}
                    {isOwner && (
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 size={14} /> Eliminar
                        </Button>
                    )}
                </div>
            </div>

            {/* Phase Progress */}
            <div
                className="mb-4 rounded-lg p-4"
                style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                }}
            >
                <PhaseProgress
                    currentPhase={project.phase}
                    color={project.color}
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="info">
                <TabsList>
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="tasks">Tareas PMI</TabsTrigger>
                    {currentRole !== 'viewer' && (
                        <TabsTrigger value="ai">Asistente IA</TabsTrigger>
                    )}
                    <TabsTrigger value="team">
                        <Users size={13} className="mr-1" />
                        Equipo
                        {members?.length > 0 && (
                            <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]"
                                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
                                {members.length}
                            </span>
                        )}
                    </TabsTrigger>
                    {(isOwner || currentRole === 'manager') && (
                        <TabsTrigger value="config">Config</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="info">
                    <div
                        className="rounded-lg p-4"
                        style={{
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                        }}
                    >
                        {/* Description */}
                        {project.description && (
                            <div className="mb-4">
                                <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                                    Descripción
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    {project.description}
                                </p>
                            </div>
                        )}

                        {/* Tags */}
                        {project.tags && project.tags.length > 0 && (
                            <div className="mb-4">
                                <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                                    Tags
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {project.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Viability */}
                        <div>
                            <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                                Viabilidad
                            </h3>
                            <div className="grid items-center gap-4 sm:grid-cols-2">
                                <ViabilityRadar project={project} size={220} />
                                <div className="space-y-3">
                                    <ViabilityBar label="Mercado" value={project.viability_mercado} color="#4A6CF7" />
                                    <ViabilityBar label="Financiero" value={project.viability_financiero} color="#00CA72" />
                                    <ViabilityBar label="Técnico" value={project.viability_tecnico} color="#FDAB3D" />
                                    <ViabilityBar label="Riesgo" value={project.viability_riesgo} color="#E44258" />
                                </div>
                            </div>
                        </div>

                        {/* URL XAMPP */}
                        {project.url_xampp && (
                            <div className="mb-4">
                                <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                                    URL XAMPP
                                </h3>
                                <a
                                    href={project.url_xampp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm underline"
                                    style={{ color: 'var(--primary)' }}
                                >
                                    {project.url_xampp}
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            </div>
                        )}

                        {/* Links & Docs */}
                        <LinksSection project={project} url={url} />

                        {/* Stats */}
                        <div
                            className="mt-4 flex gap-6 border-t pt-4 text-sm"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                        >
                            <span>Tareas pendientes: <strong>{project.pending_tasks_count}</strong></span>
                            <span>Completadas: <strong>{project.completed_tasks_count}</strong></span>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="tasks">
                    <div className="space-y-4">
                        {/* PMI phase checklist */}
                        {(project.methodology === 'pmi' || !project.methodology) && (
                            <div
                                className="rounded-lg p-4"
                                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                            >
                                <PhaseTaskList project={project} />
                            </div>
                        )}

                        {/* Sections with tasks */}
                        <div
                            className="rounded-lg p-4"
                            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                                    Tareas por sección
                                </h3>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {project.completed_tasks_count}/{project.pending_tasks_count + project.completed_tasks_count} completadas
                                </span>
                            </div>
                            <SectionList
                                project={project}
                                currentRole={currentRole}
                                members={members}
                            />
                        </div>
                    </div>
                </TabsContent>

                {currentRole !== 'viewer' && (
                    <TabsContent value="ai">
                        <AssistantPanel project={project} messages={aiMessages} />
                    </TabsContent>
                )}

                <TabsContent value="team">
                    <TeamTab
                        project={project}
                        members={members ?? []}
                        isOwner={isOwner}
                        currentRole={currentRole}
                    />
                </TabsContent>

                {(isOwner || currentRole === 'manager') && (
                    <TabsContent value="config">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <ConfigCard
                                title="Campos personalizados"
                                description="Define campos para tareas, secciones o el proyecto."
                                href={url(`/projects/${project.id}/custom-fields`)}
                                count={project.customFields?.length ?? 0}
                                unit="campos"
                            />
                            <ConfigCard
                                title="Roles del proyecto"
                                description="Crea roles adicionales con permisos personalizados."
                                href={url(`/projects/${project.id}/roles`)}
                                count={project.roleDefinitions?.length ?? 0}
                                unit="roles"
                            />
                            <ConfigCard
                                title="Burndown Chart"
                                description="Velocidad de avance por sprint. Requiere campo story_points."
                                href={url(`/projects/${project.id}/reports/burndown`)}
                            />
                            <ConfigCard
                                title="Velocity Chart"
                                description="Story points completados por sección/sprint."
                                href={url(`/projects/${project.id}/reports/velocity`)}
                            />
                            <ConfigCard title="Hitos" description="Hitos contractuales con fechas duras y estado de riesgo." href={url(`/projects/${project.id}/milestones`)} count={project.milestones?.length ?? 0} unit="hitos"/>
                            <ConfigCard title="Riesgos" description="Registro de riesgos con matriz prob×impacto." href={url(`/projects/${project.id}/risks`)} count={project.risks?.length ?? 0} unit="riesgos"/>
                            <ConfigCard title="Decisiones" description="Log de decisiones y definiciones del proyecto." href={url(`/projects/${project.id}/decisions`)} count={project.decisions?.length ?? 0} unit="decisiones"/>
                        </div>
                    </TabsContent>
                )}
            </Tabs>

        </AppLayout>
    );
}

function ViabilityBar({ label, value, color }) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ color }} className="font-semibold">{value}/10</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                <div
                    className="h-full rounded-full transition-all"
                    style={{
                        width: `${value * 10}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
        </div>
    );
}

function LinksSection({ project, url }) {
    const [adding, setAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [processing, setProcessing] = useState(false);

    function handleAdd(e) {
        e.preventDefault();
        if (!title.trim() || !linkUrl.trim()) return;
        setProcessing(true);
        router.post(url(`/projects/${project.id}/links`), { title: title.trim(), url: linkUrl.trim() }, {
            preserveScroll: true,
            onSuccess: () => { setTitle(''); setLinkUrl(''); setAdding(false); },
            onFinish: () => setProcessing(false),
        });
    }

    function handleRemove(index) {
        router.delete(url(`/projects/${project.id}/links/${index}`), { preserveScroll: true });
    }

    const links = project.links || [];

    return (
        <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    Links y Documentos
                </h3>
                {!adding && (
                    <Button variant="outline" size="xs" onClick={() => setAdding(true)}>
                        <Plus size={12} /> Agregar
                    </Button>
                )}
            </div>

            {adding && (
                <form onSubmit={handleAdd} className="mb-3 flex items-center gap-2">
                    <ExternalLink size={14} className="shrink-0 opacity-40" />
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título"
                        className="flex-1"
                        autoFocus
                    />
                    <Input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1"
                    />
                    <Button type="submit" size="xs" disabled={processing || !title.trim() || !linkUrl.trim()}>
                        {processing ? '...' : 'Guardar'}
                    </Button>
                    <button type="button" onClick={() => { setAdding(false); setTitle(''); setLinkUrl(''); }} style={{ color: 'var(--text-muted)' }}>
                        <X size={14} />
                    </button>
                </form>
            )}

            {links.length > 0 ? (
                <div className="space-y-1.5">
                    {links.map((link, i) => (
                        <div key={i} className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-w-0 flex-1 items-center gap-2"
                                style={{ color: 'var(--foreground)' }}
                            >
                                <ExternalLink size={14} className="shrink-0" style={{ color: 'var(--primary)' }} />
                                <span className="font-medium">{link.title}</span>
                                <span className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{link.url}</span>
                            </a>
                            <button
                                onClick={() => handleRemove(i)}
                                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                style={{ color: 'var(--destructive)' }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : !adding && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Sin links. Agrega documentos, repos, o URLs relevantes.
                </p>
            )}
        </div>
    );
}

function ConfigCard({ title, description, href, count, unit }) {
    return (
        <a
            href={href}
            className="block rounded-lg p-4 transition-shadow hover:shadow-md"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
                </div>
                {count > 0 && (
                    <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
                        {count} {unit}
                    </span>
                )}
            </div>
        </a>
    );
}

