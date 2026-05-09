import BurndownChart from '@/Components/Reports/BurndownChart';

export default function SprintReportCard({ sprint }) {
    const remaining = sprint.data.findLast(d => d.actual !== null)?.actual ?? '—';
    const completed = sprint.total - (sprint.data.findLast(d => d.actual !== null)?.actual ?? sprint.total);

    return (
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="mb-3 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {sprint.name} · {sprint.start_date} → {sprint.end_date}
            </p>
            <BurndownChart data={sprint.data} />
        </div>
    );
}
