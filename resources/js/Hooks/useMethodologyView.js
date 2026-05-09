import { usePage } from '@inertiajs/react';

export function useMethodologyView(project) {
    const { basePath } = usePage().props;
    const base = basePath || '';
    const view = project?.default_view ?? 'list';

    const paths = {
        list:     `${base}/projects/${project?.id}`,
        board:    `${base}/projects/${project?.id}/board`,
        timeline: `${base}/projects/${project?.id}/timeline`,
        calendar: `${base}/calendar?project=${project?.id}`,
    };

    return {
        view,
        defaultPath: paths[view] ?? paths.list,
        paths,
    };
}
