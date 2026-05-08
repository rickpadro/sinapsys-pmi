import { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { PRIORITIES } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';
import { List, LayoutGrid } from 'lucide-react';

const MS_PER_DAY = 86400000;
const diffDays = (a, b) => Math.round((new Date(a) - new Date(b)) / MS_PER_DAY);
const addDays  = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const fmtMonth = (d) => new Date(d).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
const fmtDay   = (d) => new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

const STATUS_COLOR = { planned: '#9B9DB0', active: '#4A6CF7', completed: '#00CA72', archived: '#9B9DB0' };

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

        // 7-day padding
        start = addDays(start, -7);
        end   = addDays(end, 14);

        const total = Math.max(1, diffDays(end, start));

        // Build month headers
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

    function pct(date) { return (diffDays(date, rangeStart) / totalDays) * 100; }
    function widthPct(from, to) { return Math.max(0.5, (diffDays(to, from) / totalDays) * 100); }

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
                <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                    {/* Month headers */}
                    <div className="relative h-8 border-b" style={{ borderColor: 'var(--border)' }}>
                        {months.map((m, i) => (
                            <div key={i} className="absolute top-0 h-full flex items-center justify-center text-[10px] border-r"
                                style={{ left: `${m.left}%`, width: `${m.width}%`, borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                {m.width > 5 && m.label}
                            </div>
                        ))}
                    </div>

                    {/* Section rows */}
                    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {sections.map(section => (
                            <div key={section.id} className="flex">
                                {/* Section label */}
                                <div className="w-36 flex-shrink-0 px-3 py-2.5 border-r flex items-center gap-2"
                                    style={{ borderColor: 'var(--border)' }}>
                                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: STATUS_COLOR[section.status] ?? '#9B9DB0' }} />
                                    <span className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>
                                        {section.name}
                                    </span>
                                </div>

                                {/* Gantt area */}
                                <div className="relative flex-1 h-10 overflow-hidden">
                                    {/* Section bar */}
                                    {section.start_date && section.end_date && (
                                        <div
                                            className="absolute top-2 h-6 rounded-md flex items-center px-2"
                                            style={{
                                                left:            `${Math.max(0, pct(section.start_date))}%`,
                                                width:           `${widthPct(section.start_date, section.end_date)}%`,
                                                backgroundColor: STATUS_COLOR[section.status] + '33',
                                                border:          `1px solid ${STATUS_COLOR[section.status]}`,
                                            }}
                                        >
                                            <span className="text-[10px] truncate" style={{ color: STATUS_COLOR[section.status] }}>
                                                {section.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Task milestones */}
                                    {section.tasks?.map(task => {
                                        const p = PRIORITIES[task.priority];
                                        const left = pct(task.due_date + 'T12:00:00');
                                        if (left < 0 || left > 100) return null;
                                        return (
                                            <div
                                                key={task.id}
                                                className="absolute top-3 w-3 h-3 rounded-full transform -translate-x-1/2 border-2 border-white"
                                                style={{ left: `${left}%`, backgroundColor: p?.color ?? '#C4C4C4' }}
                                                title={`${task.name} — ${fmtDay(task.due_date)}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 px-4 py-2 border-t text-[10px]"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: 'var(--border)' }} /> Sección (barra)</span>
                        {Object.entries(PRIORITIES).map(([k, p]) => (
                            <span key={k} className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: p.color }} /> {p.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
