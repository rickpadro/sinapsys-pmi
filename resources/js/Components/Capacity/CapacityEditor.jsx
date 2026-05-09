import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

export default function CapacityEditor({ sections = [], members = [], capacityMatrix = {}, projectId, url }) {
    const sprints = sections.filter(s => s.type === 'sprint');

    // Build initial state from capacityMatrix
    const [matrix, setMatrix] = useState(() => {
        const state = {};
        members.forEach(m => {
            state[m.id] = {};
            sprints.forEach(s => {
                const cap = capacityMatrix[s.id];
                state[m.id][s.id] = cap?.by_member?.[m.user?.name] != null
                    ? Math.round((cap.by_member[m.user.name] / ((cap.weeks || 2) * 40)) * 100)
                    : 100;
            });
        });
        return state;
    });

    const [saving, setSaving] = useState(false);

    function handleSave() {
        setSaving(true);
        const capacities = [];
        members.forEach(m => {
            sprints.forEach(s => {
                capacities.push({
                    project_member_id: m.id,
                    section_id:        s.id,
                    dedication_pct:    matrix[m.id]?.[s.id] ?? 100,
                });
            });
        });
        router.post(url(`/projects/${projectId}/capacity/bulk`), { capacities }, {
            preserveScroll: true,
            onSuccess: () => setSaving(false),
            onError:   () => setSaving(false),
        });
    }

    if (sprints.length === 0) return (
        <p className="text-sm text-center py-4" style={{ color:'var(--text-muted)' }}>Agrega secciones de tipo Sprint para configurar capacidades.</p>
    );

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold" style={{ color:'var(--text-muted)' }}>Miembro</th>
                            {sprints.map(s => (
                                <th key={s.id} className="px-2 py-2 text-center font-medium max-w-[80px]" style={{ color:'var(--text-muted)' }}>
                                    <span className="truncate block">{s.name}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor:'var(--border)' }}>
                        {members.map(m => (
                            <tr key={m.id}>
                                <td className="px-3 py-2 font-medium" style={{ color:'var(--foreground)' }}>{m.user?.name}</td>
                                {sprints.map(s => {
                                    const pct = matrix[m.id]?.[s.id] ?? 100;
                                    return (
                                        <td key={s.id} className="px-2 py-1.5 text-center">
                                            <div className="flex items-center justify-center gap-0.5">
                                                <input type="number" min="0" max="100" value={pct}
                                                    onChange={e => setMatrix(prev => ({
                                                        ...prev,
                                                        [m.id]: { ...prev[m.id], [s.id]: Number(e.target.value) }
                                                    }))}
                                                    className="w-12 text-center rounded border text-xs py-1"
                                                    style={{ backgroundColor:'var(--background)', borderColor:pct<100?'var(--warning)':'var(--border)', color:'var(--foreground)' }}
                                                />
                                                <span style={{ color:'var(--text-muted)' }}>%</span>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end">
                <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar capacidades'}</Button>
            </div>
        </div>
    );
}
