import { PRIORITIES } from '@/Lib/constants';
import TimelineHeader from '@/Components/Timeline/TimelineHeader';
import TimelineRow from '@/Components/Timeline/TimelineRow';

const MS_PER_DAY = 86400000;
const diffDays = (a, b) => Math.round((new Date(a) - new Date(b)) / MS_PER_DAY);
export const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
export const fmtMonth = (d) => new Date(d).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
export const fmtDay   = (d) => new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

export default function TimelineGantt({ sections, rangeStart, totalDays, months }) {
    function pct(date) { return (diffDays(date, rangeStart) / totalDays) * 100; }
    function widthPct(from, to) { return Math.max(0.5, (diffDays(to, from) / totalDays) * 100); }

    return (
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <TimelineHeader months={months} />

            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {sections.map(section => (
                    <TimelineRow
                        key={section.id}
                        section={section}
                        pct={pct}
                        widthPct={widthPct}
                        fmtDay={fmtDay}
                    />
                ))}
            </div>

            {/* Legend */}
            <div
                className="flex items-center gap-4 px-4 py-2 border-t text-[10px]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
                <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: 'var(--border)' }} /> Sección (barra)
                </span>
                {Object.entries(PRIORITIES).map(([k, p]) => (
                    <span key={k} className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: p.color }} /> {p.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
