import { Link } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import StatsGrid from '@/Components/Dashboard/StatsGrid';
import TodayTasks from '@/Components/Dashboard/TodayTasks';
import ProjectsSummary from '@/Components/Dashboard/ProjectsSummary';
import PriorityMatrix from '@/Components/Projects/PriorityMatrix';
import { useUrl } from '@/Lib/utils';

export default function Dashboard({ stats, projects, todayTasks }) {
    const url = useUrl();
    return (
        <AppLayout title="Dashboard">
            <StatsGrid stats={stats} />

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <TodayTasks tasks={todayTasks} />
                <ProjectsSummary projects={projects} />
            </div>

            <div className="mt-4">
                <Link
                    href={url('/matrix')}
                    className="block rounded-lg transition-shadow hover:shadow-md"
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-card)',
                    }}
                >
                    <div className="p-4">
                        <h2 className="mb-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                            Matriz Impacto / Esfuerzo
                        </h2>
                        <PriorityMatrix
                            projects={projects}
                            interactive={false}
                            height={260}
                        />
                    </div>
                </Link>
            </div>
        </AppLayout>
    );
}
