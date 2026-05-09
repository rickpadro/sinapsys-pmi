import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const fmtDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

export default function BurndownChart({ data, height = 280 }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                    dataKey="date"
                    tickFormatter={fmtDate}
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip
                    formatter={(v, n) => [v === null ? '—' : `${v} SP`, n === 'ideal' ? 'Ideal' : 'Real']}
                    labelFormatter={fmtDate}
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6 }}
                    labelStyle={{ color: 'var(--foreground)' }}
                />
                <Legend formatter={v => v === 'ideal' ? 'Ideal' : 'Real'} />
                <Line type="monotone" dataKey="ideal" stroke="#9B9DB0" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="actual" stroke="#4A6CF7" dot={false} strokeWidth={2} connectNulls={false} />
                <ReferenceLine y={0} stroke="var(--success)" strokeDasharray="3 3" />
            </LineChart>
        </ResponsiveContainer>
    );
}
