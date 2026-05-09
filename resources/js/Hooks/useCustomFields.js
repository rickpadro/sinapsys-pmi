import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export function useCustomFields(projectId) {
    const { basePath } = usePage().props;
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!projectId) { setLoading(false); return; }
        setLoading(true);
        fetch(`${basePath || ''}/projects/${projectId}/custom-fields/list`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
            credentials: 'same-origin',
        })
            .then(r => r.ok ? r.json() : Promise.reject(r.status))
            .then(data => { setFields(data); setError(null); })
            .catch(err => setError(err))
            .finally(() => setLoading(false));
    }, [projectId]);

    return { fields, loading, error };
}
