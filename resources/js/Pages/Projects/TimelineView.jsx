import { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { useUrl } from '@/Lib/utils';
import { List, LayoutGrid } from 'lucide-react';
import TimelineGantt, { addDays, fmtMonth } from '@/Components/Timeline/TimelineGantt';

const MS_PER_DAY = 86400000;
const diffDays = (a, b) => Math.round((new Date(a) - new Date(b)) / MS_PER_DAY);

export default function TimelineView({ project, sections, currentRole }) {
    const url = useUrl();

    const { rangeStart, rangeEnd, totalDays, months } = useMemo(() => {
        const dates = [
            ...sections.filter(s => s.start_date).map(s => new Date(s.start_date)),
            ...sections.filter(s => s.end_date).map(s => new Date(s.end_date)),
            ...sections.flatMap(s => s.tasks?.filter(t => t.due_date).map(t => new Date(t.due_date + 'T12:00:00')) ?? []),
        ];

        let start = dates.length ? new Date(Math.min(...dates)) : new Date();
        let end   = dates.length ? new Date(Math.max(...dates)) : addDays(new Date(), 90);

        start = addDays(start, -7);
        end   = addDays(end, 14);

        const total = Math.max(1, diffDays(end, start));

        const mths = [];
        const cur = new Date(start.getFullYear(), start.getMonth(), 1);
        while (cur <= end) {
            const mEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
            const s = Math.max(diffDays(cur, start), 0);
            const e = Math.min(diffDays(mEnd, start), total);
            mths.push({ label: fmtMonth(cur), left: (s / total) * 100, width: ((e - s) / total) * 100 });
            cur.setMonth(cur.getMonth() + 1);
        }

        return { rangeStart: start, rangeEnd: end, totalDays: total, months: mths };
    }, [sections]);

    const hasDates = sections.some(s => s.start_date || s.end_date || s.tasks?.some(t => t.due_date));

    return (
        <AppLayout title={`${project.name} — Timeline`}>
            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg p-3"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: project.color }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{project.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded capitalize"
                        style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        {project.methodology ?? 'pmi'}
                    </span>
                </div>
                <div className="flex gap-2">
                    <Link href={url(`/projects/${project.id}`)}><Button variant="outline" size="sm"><List size={14} /> Lista</Button></Link>
                    <Link href={url(`/projects/${project.id}/board`)}><Button variant="outline" size="sm"><LayoutGrid size={14} /> Tablero</Button></Link>
                </div>
            </div>

            {!hasDates ? (
                <div className="rounded-lg p-12 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Sin fechas definidas</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Agrega fechas de inicio/fin a las secciones o fechas de entrega a las tareas para ver el Gantt.
                    </p>
                </div>
            ) : (
                <TimelineGantt
                    sections={sections}
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                    totalDays={totalDays}
                    months={months}
                />
            )}
        </AppLayout>
    );
}
