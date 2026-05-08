import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import MonthView from '@/Components/Calendar/MonthView';
import WeekView from '@/Components/Calendar/WeekView';
import TaskForm from '@/Components/Tasks/TaskForm';
import { Button } from '@/Components/ui/button';
import { useUrl } from '@/Lib/utils';
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from 'lucide-react';

export default function Index({ tasks, projects, month, today }) {
    const url = useUrl();
    const [view, setView] = useState(() =>
        typeof window !== 'undefined' && window.innerWidth < 768 ? 'week' : 'month'
    );
    const [formOpen, setFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const [year, m] = month.split('-').map(Number);
    const monthLabel = new Date(year, m - 1).toLocaleDateString('es-MX', {
        month: 'long',
        year: 'numeric',
    });

    function navigate(offset) {
        const d = new Date(year, m - 1 + offset, 1);
        const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        router.get(url('/calendar'), { month: newMonth }, { preserveState: true });
    }

    function handleEventClick(task) {
        setEditingTask(task);
        setFormOpen(true);
    }

    function handleClose() {
        setFormOpen(false);
        setEditingTask(null);
    }

    return (
        <AppLayout title="Calendario">
            <div
                className="rounded-lg"
                style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-card)',
                }}
            >
                {/* Toolbar */}
                <div className="flex flex-col gap-2 border-b p-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon-sm" onClick={() => navigate(-1)}>
                            <ChevronLeft size={16} />
                        </Button>
                        <h2
                            className="min-w-[100px] text-center text-sm font-semibold capitalize sm:min-w-[160px]"
                            style={{ color: 'var(--foreground)' }}
                        >
                            {monthLabel}
                        </h2>
                        <Button variant="outline" size="icon-sm" onClick={() => navigate(1)}>
                            <ChevronRight size={16} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.get(url('/calendar'), {}, { preserveState: true })}
                        >
                            Hoy
                        </Button>
                    </div>

                    <div className="flex gap-1">
                        <Button
                            variant={view === 'month' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('month')}
                        >
                            <CalendarDays size={14} /> Mes
                        </Button>
                        <Button
                            variant={view === 'week' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('week')}
                        >
                            <CalendarRange size={14} /> Semana
                        </Button>
                    </div>
                </div>

                {/* Calendar view */}
                <div className="p-1">
                    {view === 'month' ? (
                        <MonthView
                            month={month}
                            tasks={tasks}
                            today={today}
                            onEventClick={handleEventClick}
                        />
                    ) : (
                        <WeekView
                            month={month}
                            tasks={tasks}
                            today={today}
                            onEventClick={handleEventClick}
                        />
                    )}
                </div>
            </div>

            {/* Edit task modal */}
            <TaskForm
                open={formOpen}
                onClose={handleClose}
                task={editingTask}
                projects={projects}
            />
        </AppLayout>
    );
}
