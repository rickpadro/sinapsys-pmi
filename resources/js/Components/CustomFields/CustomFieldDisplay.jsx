export default function CustomFieldDisplay({ field, value }) {
    if (value === null || value === undefined || value === '') {
        return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    }

    const { field_type } = field;

    if (field_type === 'boolean') {
        return <span>{value ? 'Sí' : 'No'}</span>;
    }

    if (field_type === 'date') {
        const d = new Date(value);
        return <span>{isNaN(d) ? value : d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</span>;
    }

    if (field_type === 'multi_select') {
        const arr = Array.isArray(value) ? value : [];
        return <span>{arr.length ? arr.join(', ') : '—'}</span>;
    }

    return <span>{String(value)}</span>;
}
