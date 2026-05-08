import AppLayout from '@/Components/Layout/AppLayout';
import PriorityMatrix from '@/Components/Projects/PriorityMatrix';
import { QUADRANTS } from '@/Lib/constants';

export default function Matrix({ projects }) {
    return (
        <AppLayout title="Matriz de Prioridad">
            <div
                className="rounded-lg p-4"
                style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-card)',
                }}
            >
                {/* Legend */}
                <div className="mb-4 flex flex-wrap gap-4">
                    {Object.entries(QUADRANTS).map(([k, q]) => (
                        <div key={k} className="flex items-center gap-1.5 text-xs">
                            <div
                                className="h-3 w-3 rounded-sm"
                                style={{ backgroundColor: q.color }}
                            />
                            <span style={{ color: 'var(--text-muted)' }}>{q.label}</span>
                        </div>
                    ))}
                </div>

                <PriorityMatrix projects={projects} height={500} />
            </div>
        </AppLayout>
    );
}
