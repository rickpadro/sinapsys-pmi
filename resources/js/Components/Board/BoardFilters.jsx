import { PRIORITIES } from '@/Lib/constants';

const SELECT_STYLE = { backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' };

export default function BoardFilters({ members = [], value = {}, onChange }) {
    const hasFilters = value.assignee || value.priority;
    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <select
                value={value.assignee ?? ''}
                onChange={e => onChange({ ...value, assignee: e.target.value })}
                className="rounded-md border px-2 py-1.5 text-xs"
                style={SELECT_STYLE}
            >
                <option value="">Todos los miembros</option>
                {members.map(m => (
                    <option key={m.id} value={m.user?.id}>{m.user?.name}</option>
                ))}
            </select>
            <select
                value={value.priority ?? ''}
                onChange={e => onChange({ ...value, priority: e.target.value })}
                className="rounded-md border px-2 py-1.5 text-xs"
                style={SELECT_STYLE}
            >
                <option value="">Todas las prioridades</option>
                {Object.entries(PRIORITIES).map(([k, p]) => (
                    <option key={k} value={k}>{p.icon} {p.label}</option>
                ))}
            </select>
            {hasFilters && (
                <button
                    onClick={() => onChange({ assignee: '', priority: '' })}
                    className="text-xs px-2 py-1.5 rounded-md"
                    style={{ color: 'var(--destructive)', border: '1px solid var(--border)' }}
                >
                    × Limpiar
                </button>
            )}
        </div>
    );
}
