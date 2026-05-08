import { Link } from '@inertiajs/react';
import { PRIORITIES, PROJECT_TYPES, PMI_PHASES } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';
import { ArrowRight } from 'lucide-react';

export default function ProjectsSummary({ projects }) {
    const url = useUrl();

    return (
        <div
            className="rounded-lg p-4"
            style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
            }}
        >
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    Proyectos
                </h2>
                <Link
                    href={url('/projects')}
                    className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--primary)' }}
                >
                    Ver todos <ArrowRight size={12} />
                </Link>
            </div>

            {projects.length === 0 ? (
                <p className="py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Sin proyectos aún.
                </p>
            ) : (
                <div className="space-y-1.5">
                    {projects.map((project) => {
                        const priority = PRIORITIES[project.priority];
                        const phase = PMI_PHASES[project.phase];
                        const score = project.effort > 0
                            ? (project.impact / project.effort).toFixed(1)
                            : '0';

                        return (
                            <Link
                                key={project.id}
                                href={url(`/projects/${project.id}`)}
                                className="flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                            >
                                {/* Color dot */}
                                <div
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: project.color }}
                                />

                                {/* Name */}
                                <span
                                    className="flex-1 truncate text-sm font-medium"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    {project.name}
                                </span>

                                {/* Phase */}
                                <span
                                    className="hidden shrink-0 text-xs sm:block"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {phase}
                                </span>

                                {/* Priority */}
                                <span
                                    className="shrink-0 text-xs"
                                    style={{ color: priority.color }}
                                >
                                    {priority.icon}
                                </span>

                                {/* Pending tasks */}
                                {project.pending_tasks_count > 0 && (
                                    <span
                                        className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                                        style={{
                                            backgroundColor: 'var(--accent)',
                                            color: 'var(--text-muted)',
                                        }}
                                    >
                                        {project.pending_tasks_count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
