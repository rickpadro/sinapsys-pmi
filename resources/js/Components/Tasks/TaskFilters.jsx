import { router } from '@inertiajs/react';
import { TASK_CATEGORIES } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';

export default function TaskFilters({ projects, filters }) {
    const url = useUrl();

    function apply(key, value) {
        router.get(url('/tasks'), {
            ...filters,
            [key]: value || undefined,
        }, { preserveState: true });
    }

    return (
        <div className="flex flex-wrap gap-2">
            <select
                value={filters.project_id || ''}
                onChange={(e) => apply('project_id', e.target.value)}
                className="w-full rounded-md border px-2.5 py-1.5 text-sm sm:w-auto"
                style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                }}
            >
                <option value="">Todos los proyectos</option>
                {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>

            <select
                value={filters.category || ''}
                onChange={(e) => apply('category', e.target.value)}
                className="w-full rounded-md border px-2.5 py-1.5 text-sm sm:w-auto"
                style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                }}
            >
                <option value="">Todas las categorías</option>
                {Object.entries(TASK_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                ))}
            </select>
        </div>
    );
}
