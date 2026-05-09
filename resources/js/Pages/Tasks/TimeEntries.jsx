import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { useUrl } from '@/Lib/utils';
import TimeEntryForm from '@/Components/Tasks/TimeEntryForm';
import TimeTracker from '@/Components/Tasks/TimeTracker';
import { ArrowLeft, Clock, Trash2 } from 'lucide-react';

export default function TimeEntries({ task, timeEntries, totalMinutes, estimatedMinutes }) {
    const url = useUrl();
    const [formOpen, setFormOpen] = useState(false);

    function handleDelete(entryId) {
        if (!confirm('¿Eliminar esta entrada de tiempo?')) return;
        router.delete(url(`/tasks/${task.id}/time-entries/${entryId}`), { preserveScroll: true });
    }

    return (
        <AppLayout title={`Tiempo — ${task.name}`}>
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={url(`/projects/${task.project_id}`)}>
                            <Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button>
                        </Link>
                        <div>
                            <h1 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                                Registro de tiempo
                            </h1>
                            <p className="text-xs truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>
                                {task.name}
                            </p>
                        </div>
                    </div>
                    <Button size="sm" onClick={() => setFormOpen(true)}>
                        <Clock size={14} /> Registrar
                    </Button>
                </div>

                {/* Summary */}
                <div
                    className="mb-4 rounded-lg p-4"
                    style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                    <TimeTracker totalMinutes={totalMinutes} estimatedMinutes={estimatedMinutes} />
                </div>

                {/* Entries list */}
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    {timeEntries.length === 0 ? (
                        <div className="py-12 text-center">
                            <Clock size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin registros de tiempo.</p>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                            {timeEntries.map(entry => {
                                const h        = Math.floor(entry.minutes / 60);
                                const m        = entry.minutes % 60;
                                const duration = h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
                                return (
                                    <div key={entry.id} className="group flex items-center gap-3 px-4 py-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-sm font-medium"
                                                    style={{ color: 'var(--foreground)' }}
                                                >
                                                    {duration}
                                                </span>
                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    {new Date(entry.logged_on + 'T12:00:00').toLocaleDateString('es-MX', {
                                                        day:   'numeric',
                                                        month: 'short',
                                                    })}
                                                </span>
                                                {entry.user && (
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        · {entry.user.name}
                                                    </span>
                                                )}
                                            </div>
                                            {entry.description && (
                                                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                                                    {entry.description}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ color: 'var(--destructive)' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <TimeEntryForm open={formOpen} onClose={() => setFormOpen(false)} task={task} />
        </AppLayout>
    );
}
