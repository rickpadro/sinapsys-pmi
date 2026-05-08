import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { useUrl } from '@/Lib/utils';
import { ArrowLeft, TrendingDown } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const fmtDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

export default function Burndown({ project, burndowns, hasStoryPoints }) {
    const url = useUrl();
    const [selected, setSelected] = useState(burndowns[0]?.id ?? null);

    const sprint = burndowns.find(b => b.id === selected);

    return (
        <AppLayout title={`Burndown — ${project.name}`}>
            <div className="mx-auto max-w-3xl space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={url(`/projects/${project.id}`)}>
                            <Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button>
                        </Link>
                        <div>
                            <h1 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                                Burndown Chart
                            </h1>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.name}</p>
                        </div>
                    </div>
                    <Link href={url(`/projects/${project.id}/reports/velocity`)}>
                        <Button variant="outline" size="sm">Ver Velocity →</Button>
                    </Link>
                </div>

                {!hasStoryPoints ? (
                    <EmptyState
                        title="Campo story_points no encontrado"
                        msg="Agrega el campo personalizado 'story_points' de tipo Número a este proyecto para activar el Burndown."
                        href={url(`/projects/${project.id}/custom-fields`)}
                        cta="Agregar campo"
                    />
                ) : burndowns.length === 0 ? (
                    <EmptyState
                        title="Sin datos de sprint"
                        msg="Las secciones necesitan fechas de inicio y fin, y al menos una tarea con story points asignados."
                    />
                ) : (
                    <>
                        {/* Sprint selector */}
                        {burndowns.length > 1 && (
                            <div className="flex flex-wrap gap-2">
                                {burndowns.map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => setSelected(b.id)}
                                        className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                                        style={{
                                            borderColor:     selected === b.id ? 'var(--primary)' : 'var(--border)',
                                            backgroundColor: selected === b.id ? 'var(--primary)' : 'transparent',
                                            color:           selected === b.id ? '#fff' : 'var(--foreground)',
                                        }}
                                    >
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Stats */}
                        {sprint && (
                            <>
                                <div className="grid grid-cols-3 gap-3">
                                    <StatCard label="Total SP" value={sprint.total} color="var(--primary)" />
                                    <StatCard
                                        label="SP Restantes"
                                        value={sprint.data.findLast(d => d.actual !== null)?.actual ?? '—'}
                                        color="var(--destructive)"
                                    />
                                    <StatCard
                                        label="Completados"
                                        value={sprint.total - (sprint.data.findLast(d => d.actual !== null)?.actual ?? sprint.total)}
                                        color="var(--success)"
                                    />
                                </div>

                                {/* Chart */}
                                <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                                    <p className="mb-3 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                        {sprint.name} · {sprint.start_date} → {sprint.end_date}
                                    </p>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart data={sprint.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
        </div>
    );
}

function EmptyState({ title, msg, href, cta }) {
    return (
        <div className="rounded-lg p-12 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <TrendingDown size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>{title}</p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{msg}</p>
            {href && cta && (
                <a href={href} className="text-xs underline" style={{ color: 'var(--primary)' }}>{cta}</a>
            )}
        </div>
    );
}
