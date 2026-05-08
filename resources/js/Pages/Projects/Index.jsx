import { useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    DndContext,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import AppLayout from '@/Components/Layout/AppLayout';
import ProjectCard from '@/Components/Projects/ProjectCard';
import { Button } from '@/Components/ui/button';
import ExportDropdown from '@/Components/ExportDropdown';
import { PROJECT_TYPES, PMI_PHASES } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';
import { Plus, Sparkles, Users } from 'lucide-react';

const COLS = 3;

export default function Index({ projects: initialProjects, teamProjects = [], filters }) {
    const url = useUrl();

    // Build a slot map: slot index → project (or null)
    const buildSlotMap = useCallback((projects) => {
        const map = {};
        projects.forEach(p => {
            map[p.sort_order ?? Object.keys(map).length] = p;
        });
        return map;
    }, []);

    const [slotMap, setSlotMap] = useState(() => {
        const map = {};
        initialProjects.forEach((p, i) => {
            const slot = p.sort_order ?? i;
            map[slot] = p;
        });
        return map;
    });

    const [activeProject, setActiveProject] = useState(null);

    // Calculate how many rows we need (occupied + 1 extra row for dropping)
    const maxSlot = Math.max(0, ...Object.keys(slotMap).map(Number));
    const totalSlots = Math.max(
        Math.ceil(initialProjects.length / COLS) * COLS + COLS,
        Math.ceil((maxSlot + 1) / COLS) * COLS + COLS,
    );

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    );

    function applyFilter(key, value) {
        router.get(url('/projects'), {
            ...filters,
            [key]: value || undefined,
        }, { preserveState: true });
    }

    function handleDragStart(event) {
        const projectId = event.active.data.current?.projectId;
        const project = Object.values(slotMap).find(p => p?.id === projectId);
        setActiveProject(project || null);
    }

    function handleDragEnd(event) {
        setActiveProject(null);
        const { active, over } = event;
        if (!over) return;

        const fromSlot = active.data.current?.slot;
        const toSlot = over.data.current?.slot;
        if (fromSlot === undefined || toSlot === undefined || fromSlot === toSlot) return;

        // Swap
        const newMap = { ...slotMap };
        const fromProject = newMap[fromSlot] || null;
        const toProject = newMap[toSlot] || null;

        if (fromProject) newMap[toSlot] = fromProject;
        else delete newMap[toSlot];

        if (toProject) newMap[fromSlot] = toProject;
        else delete newMap[fromSlot];

        setSlotMap(newMap);
        persistOrder(newMap);
    }

    function persistOrder(map) {
        const order = {};
        Object.entries(map).forEach(([slot, project]) => {
            if (project) order[project.id] = Number(slot);
        });

        const csrfToken = document.cookie
            .split('; ')
            .find(r => r.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

        fetch(url('/projects/reorder'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-XSRF-TOKEN': decodeURIComponent(csrfToken || ''),
            },
            credentials: 'same-origin',
            body: JSON.stringify({ order }),
        });
    }

    const slots = Array.from({ length: totalSlots }, (_, i) => i);

    return (
        <AppLayout title="Proyectos">
            {/* Toolbar */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    <FilterSelect
                        label="Tipo"
                        value={filters.type || ''}
                        options={PROJECT_TYPES}
                        onChange={(v) => applyFilter('type', v)}
                    />
                    <FilterSelect
                        label="Fase"
                        value={filters.phase ?? ''}
                        options={PMI_PHASES}
                        onChange={(v) => applyFilter('phase', v)}
                    />
                </div>
                <div className="flex gap-2">
                    <ExportDropdown baseUrl={url('/export/projects')} />
                    <Link href={url('/projects-ai/create')}>
                        <Button size="sm" variant="outline">
                            <Sparkles size={16} /> Crear con IA
                        </Button>
                    </Link>
                    <Link href={url('/projects/create')}>
                        <Button size="sm">
                            <Plus size={16} /> Nuevo
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Mis proyectos */}
            {initialProjects.length > 0 && (
                <>
                    {teamProjects.length > 0 && (
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                            Mis proyectos
                        </p>
                    )}
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                            {slots.map((slotIndex) => (
                                <GridSlot
                                    key={slotIndex}
                                    slot={slotIndex}
                                    project={slotMap[slotIndex] || null}
                                />
                            ))}
                        </div>
                        <DragOverlay>
                            {activeProject && (
                                <div className="opacity-80">
                                    <ProjectCard project={activeProject} />
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                </>
            )}

            {initialProjects.length === 0 && teamProjects.length === 0 && (
                <p className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No hay proyectos. Crea tu primero.
                </p>
            )}

            {/* En equipo */}
            {teamProjects.length > 0 && (
                <div className="mt-8">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        <Users size={12} /> En equipo ({teamProjects.length})
                    </p>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        {teamProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} role={project.current_role} />
                        ))}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function GridSlot({ slot, project }) {
    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `slot-${slot}`,
        data: { slot },
    });

    return (
        <div
            ref={setDropRef}
            className="rounded-lg transition-colors"
            style={{
                minHeight: '60px',
                backgroundColor: isOver ? 'var(--accent)' : 'transparent',
                border: isOver ? '2px dashed var(--primary)' : '2px dashed transparent',
            }}
        >
            {project ? (
                <DraggableCard project={project} slot={slot} />
            ) : (
                <div
                    className="flex h-full min-h-[60px] items-center justify-center rounded-lg border border-dashed opacity-0 transition-opacity hover:opacity-40"
                    style={{ borderColor: 'var(--border)' }}
                />
            )}
        </div>
    );
}

function DraggableCard({ project, slot }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: `project-${project.id}`,
        data: { slot, projectId: project.id },
    });

    const style = transform ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: 50,
        opacity: 0.5,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={isDragging ? 'pointer-events-none' : ''}
        >
            <ProjectCard project={project} />
        </div>
    );
}

function FilterSelect({ label, value, options, onChange }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border px-2.5 py-1.5 text-sm sm:w-auto"
            style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
            }}
        >
            <option value="">Todos ({label})</option>
            {Object.entries(options).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
            ))}
        </select>
    );
}
