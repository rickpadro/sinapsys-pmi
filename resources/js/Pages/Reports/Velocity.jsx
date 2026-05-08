import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { useUrl } from '@/Lib/utils';
import { ArrowLeft, Zap } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, Cell,
} from 'recharts';

const STATUS_COLOR = { planned: '#9B9DB0', active: '#4A6CF7', completed: '#00CA72', archived: '#9B9DB0' };

export default function Velocity({ project, velocity, hasStoryPoints }) {
    const url = useUrl();

    const avgVelocity = velocity.length > 0
        ? (velocity.reduce((s, v) => s + v.completed_points, 0) / velocity.length).toFixed(1)
        : 0;

    const totalCompleted = velocity.reduce((s, v) => s + v.completed_points, 0);
    const totalPoints    = velocity.reduce((s, v) => s + v.total_points, 0);

    return (
        <AppLayout title={`Velocity — ${project.name}`}>
            <div className="mx-auto max-w-3xl space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={url(`/projects/${project.id}`)}>
                            <Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button>
                        </Link>
                        <div>
                            <h1 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                                Velocity Chart
                            </h1>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.name}</p>
                        </div>
                    </div>
                    <Link href={url(`/projects/${project.id}/reports/burndown`)}>
                        <Button variant="outline" size="sm">← Burndown</Button>
                    </Link>
                </div>

                {!hasStoryPoints ? (
                    <EmptyState
                        href={url(`/projects/${project.id}/custom-fields`)}
                        cta="Agregar campo story_points"
                    />
                ) : velocity.length === 0 ? (
                    <EmptyState msg="Asigna story points a las tareas de cada sección para ver la velocidad." />
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <StatCard label="Velocidad promedio" value={`${avgVelocity} SP`} color="var(--primary)" />
                            <StatCard label="SP completados" value={totalCompleted.toFixed(1)} color="var(--success)" />
                            <StatCard
                                label="% completado"
                                value={`${totalPoints > 0 ? Math.round((totalCompleted / totalPoints) * 100) : 0}%`}
                                color="var(--warning)"
                            />
                        </div>

                        {/* Chart */}
                        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={velocity} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
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
                                        {velocity.map((entry, i) => (
                                            <Cell key={i} fill={STATUS_COLOR[entry.status] ?? '#4A6CF7'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Sprint table */}
                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--background)' }}>
                                        <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Sección/Sprint</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total SP</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Completados</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>% completado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                    {velocity.map(v => {
                                        const pct = v.total_points > 0 ? Math.round((v.completed_points / v.total_points) * 100) : 0;
                                        return (
                                            <tr key={v.id}>
                                                <td className="px-4 py-2.5 text-sm" style={{ color: 'var(--foreground)' }}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[v.status] ?? '#9B9DB0' }} />
                                                        {v.name}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-right text-sm" style={{ color: 'var(--text-muted)' }}>{v.total_points}</td>
                                                <td className="px-4 py-2.5 text-right text-sm font-medium" style={{ color: 'var(--success)' }}>{v.completed_points}</td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <span className="text-xs px-2 py-0.5 rounded-full"
                                                        style={{ backgroundColor: pct >= 80 ? '#00CA7220' : 'var(--background)', color: pct >= 80 ? 'var(--success)' : 'var(--text-muted)' }}>
                                                        {pct}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
        </div>
    );
}

function EmptyState({ msg, href, cta }) {
    return (
        <div className="rounded-lg p-12 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Zap size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Sin datos de velocity</p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                {msg ?? 'Agrega el campo story_points a este proyecto para activar este reporte.'}
            </p>
            {href && <a href={href} className="text-xs underline" style={{ color: 'var(--primary)' }}>{cta}</a>}
        </div>
    );
}
