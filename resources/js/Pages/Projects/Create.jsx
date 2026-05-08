import { router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import ProjectForm from '@/Components/Projects/ProjectForm';
import { useUrl } from '@/Lib/utils';

export default function Create() {
    const url = useUrl();

    return (
        <AppLayout title="Nuevo Proyecto">
            <div
                className="mx-auto max-w-2xl rounded-lg p-4 sm:p-6"
                style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-card)',
                }}
            >
                <ProjectForm onCancel={() => router.get(url('/projects'))} />
            </div>
        </AppLayout>
    );
}
