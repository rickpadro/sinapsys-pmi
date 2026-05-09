import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export function useBurndown(projectId, sectionId) {
    const { basePath } = usePage().props;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!projectId || !sectionId) return;
        setLoading(true);
        const url = `${basePath || ''}/projects/${projectId}/reports/burndown/data?section=${sectionId}`;
        fetch(url, {
            headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
            credentials: 'same-origin',
        })
            .then(r => r.ok ? r.json() : Promise.reject(r.status))
            .then(d => { setData(d); setError(null); })
            .catch(err => setError(err))
            .finally(() => setLoading(false));
    }, [projectId, sectionId]);

    return { data, loading, error };
}
