import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, Cell,
} from 'recharts';

const STATUS_COLOR = { planned: '#9B9DB0', active: '#4A6CF7', completed: '#00CA72', archived: '#9B9DB0' };

export default function VelocityChart({ data, height = 280 }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip
                    formatter={(v, n) => [`${v} SP`, n === 'total_points' ? 'Total' : 'Completados']}
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6 }}
                    labelStyle={{ color: 'var(--foreground)' }}
                />
                <Legend formatter={v => v === 'total_points' ? 'Total SP' : 'Completados'} />
                <Bar dataKey="total_points" fill="#E8E8EA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed_points" radius={[4, 4, 0, 0]}>
                    {data.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLOR[entry.status] ?? '#4A6CF7'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
