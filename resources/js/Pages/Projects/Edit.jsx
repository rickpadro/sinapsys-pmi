import { router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import ProjectForm from '@/Components/Projects/ProjectForm';
import { useUrl } from '@/Lib/utils';

export default function Edit({ project }) {
    const url = useUrl();

    return (
        <AppLayout title={`Editar: ${project.name}`}>
            <div
                className="mx-auto max-w-2xl rounded-lg p-4 sm:p-6"
                style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-card)',
                }}
            >
                <ProjectForm
                    project={project}
                    onCancel={() => router.get(url(`/projects/${project.id}`))}
                />
            </div>
        </AppLayout>
    );
}
