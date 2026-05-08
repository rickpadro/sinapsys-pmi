import { router } from '@inertiajs/react';
import { useUrl } from '@/Lib/utils';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea,
    Cell,
} from 'recharts';
import { PROJECT_TYPES } from '@/Lib/constants';

const QUADRANT_COLORS = {
    q1: { fill: '#00CA7220', label: 'Hacer primero' },
    q2: { fill: '#4A6CF720', label: 'Planificar' },
    q3: { fill: '#FDAB3D20', label: 'Delegar' },
    q4: { fill: '#C4C4C420', label: 'Evitar' },
};

export default function PriorityMatrix({ projects, interactive = true, height = 400 }) {
    const url = useUrl();
    const data = projects.map((p) => ({
        x: p.effort,
        y: p.impact,
        name: p.name,
        type: PROJECT_TYPES[p.type] || p.type,
        color: p.color,
        id: p.id,
    }));

    function handleClick(point) {
        if (interactive && point?.id) {
            router.get(url(`/projects/${point.id}`));
        }
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                {/* Quadrant backgrounds */}
                <ReferenceArea x1={0.5} x2={5.5} y1={5.5} y2={10.5} fill="#00CA72" fillOpacity={0.08} />
                <ReferenceArea x1={5.5} x2={10.5} y1={5.5} y2={10.5} fill="#4A6CF7" fillOpacity={0.08} />
                <ReferenceArea x1={0.5} x2={5.5} y1={0.5} y2={5.5} fill="#FDAB3D" fillOpacity={0.08} />
                <ReferenceArea x1={5.5} x2={10.5} y1={0.5} y2={5.5} fill="#C4C4C4" fillOpacity={0.08} />

                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                    type="number"
                    dataKey="x"
                    domain={[0.5, 10.5]}
                    ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                    name="Esfuerzo"
                    label={{ value: 'Esfuerzo →', position: 'bottom', offset: 0, fill: 'var(--text-muted)', fontSize: 12 }}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    stroke="var(--border)"
                />
                <YAxis
                    type="number"
                    dataKey="y"
                    domain={[0.5, 10.5]}
                    ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                    name="Impacto"
                    label={{ value: 'Impacto →', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 12 }}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    stroke="var(--border)"
                />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ strokeDasharray: '3 3' }}
                />
                <Scatter
                    data={data}
                    onClick={interactive ? handleClick : undefined}
                    style={interactive ? { cursor: 'pointer' } : undefined}
                >
                    {data.map((entry, i) => (
                        <Cell key={i} fill={entry.color} r={8} />
                    ))}
                </Scatter>
            </ScatterChart>
        </ResponsiveContainer>
    );
}

function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div
            className="rounded-md px-3 py-2 text-xs shadow-md"
            style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
            }}
        >
            <p className="font-semibold">{d.name}</p>
            <p style={{ color: 'var(--text-muted)' }}>
                {d.type} — I:{d.y} / E:{d.x} = {(d.y / d.x).toFixed(1)}
            </p>
        </div>
    );
}
