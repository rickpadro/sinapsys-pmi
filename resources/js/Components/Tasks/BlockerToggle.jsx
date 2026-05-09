import { router } from '@inertiajs/react';
import { useUrl } from '@/Lib/utils';
import { AlertTriangle } from 'lucide-react';

export default function BlockerToggle({ task, canEdit = false }) {
    const url = useUrl();

    if (!canEdit) return task.is_blocker
        ? <span className="text-xs font-semibold" style={{ color: 'var(--warning)' }}>⚠ Bloqueante</span>
        : null;

    function toggle() {
        router.put(url(`/tasks/${task.id}`), { ...task, is_blocker: !task.is_blocker }, { preserveScroll: true });
    }

    return (
        <button
            onClick={toggle}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border transition-colors"
            style={{
                borderColor:     task.is_blocker ? 'var(--warning)' : 'var(--border)',
                color:           task.is_blocker ? 'var(--warning)' : 'var(--text-muted)',
                backgroundColor: task.is_blocker ? '#FDAB3D15' : 'transparent',
            }}
        >
            <AlertTriangle size={11} />
            {task.is_blocker ? 'Bloqueante' : 'Marcar bloqueante'}
        </button>
    );
}
