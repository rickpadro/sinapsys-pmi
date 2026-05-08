import { Link } from '@inertiajs/react';
import { PRIORITIES, PROJECT_TYPES, PMI_PHASES } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';

const ROLE_META = {
    manager:     { label: 'Manager',     color: '#FDAB3D' },
    contributor: { label: 'Colaborador', color: '#00CA72' },
    viewer:      { label: 'Observador',  color: '#9B9DB0' },
};

export default function ProjectCard({ project, role }) {
    const url = useUrl();
    const priority = PRIORITIES[project.priority];
    const phaseName = PMI_PHASES[project.phase];
    const typeName = PROJECT_TYPES[project.type];
    const score = project.effort > 0
        ? (project.impact / project.effort).toFixed(1)
        : '0';

    return (
        <Link
            href={url(`/projects/${project.id}`)}
            className={`block rounded-lg transition-shadow hover:shadow-md ${role ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
            style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
            }}
            onClick={(e) => {
                // Prevent navigation during drag
                if (e.defaultPrevented) return;
            }}
        >
            {/* Color bar */}
            <div
                className="h-1 rounded-t-lg sm:h-1.5"
                style={{ backgroundColor: project.color }}
            />

            <div className="p-2 sm:p-4">
                {/* Header: type badge + priority */}
                <div className="mb-1 flex items-center justify-between sm:mb-2">
                    <span
                        className="truncate rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white sm:px-2 sm:text-xs"
                        style={{ backgroundColor: project.color }}
                    >
                        {typeName}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                        {role && ROLE_META[role] && (
                            <span
                                className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                                style={{ backgroundColor: ROLE_META[role].color + '25', color: ROLE_META[role].color }}
                            >
                                {ROLE_META[role].label}
                            </span>
                        )}
                        <span
                            className="text-[10px] font-medium sm:text-sm"
                            style={{ color: priority.color }}
                            title={`Prioridad: ${priority.label}`}
                        >
                            {priority.icon} <span className="hidden sm:inline">{priority.label}</span>
                        </span>
                    </div>
                </div>

                {/* Name */}
                <h3
                    className="mb-1 truncate text-xs font-semibold leading-snug sm:text-sm"
                    style={{ color: 'var(--foreground)' }}
                >
                    {project.name}
                </h3>

                {/* Phase - compact on mobile */}
                <div className="mb-1.5 flex items-center gap-1 sm:mb-3 sm:gap-2">
                    <div className="flex gap-0.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-1 w-3 rounded-full sm:h-1.5 sm:w-5"
                                style={{
                                    backgroundColor:
                                        i <= project.phase
                                            ? project.color
                                            : 'var(--border)',
                                }}
                            />
                        ))}
                    </div>
                    <span
                        className="hidden text-xs sm:block"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {phaseName}
                    </span>
                </div>

                {/* Footer: impact/effort + tasks */}
                <div
                    className="flex items-center justify-between text-[9px] sm:text-xs"
                    style={{ color: 'var(--text-muted)' }}
                >
                    <span>
                        <span className="hidden sm:inline">I:{project.impact} / E:{project.effort} = </span>
                        <span className="sm:hidden">{project.impact}/{project.effort}=</span>
                        {score}
                    </span>
                    {project.pending_tasks_count !== undefined && project.pending_tasks_count > 0 && (
                        <span>
                            {project.pending_tasks_count}<span className="hidden sm:inline"> pend.</span>
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
