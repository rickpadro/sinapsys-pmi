import { Input } from '@/Components/ui/input';

export default function CustomFieldValueInput({ field, value, onChange }) {
    const { field_type, options = [] } = field;

    if (field_type === 'boolean') {
        return (
            <input
                type="checkbox"
                checked={!!value}
                onChange={e => onChange(e.target.checked)}
                className="h-4 w-4 cursor-pointer"
            />
        );
    }

    if (field_type === 'select') {
        return (
            <select
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
                <option value="">— seleccionar —</option>
                {(Array.isArray(options) ? options : []).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        );
    }

    if (field_type === 'multi_select') {
        const selected = Array.isArray(value) ? value : [];
        function toggle(opt) {
            onChange(selected.includes(opt) ? selected.filter(v => v !== opt) : [...selected, opt]);
        }
        return (
            <div className="flex flex-wrap gap-2">
                {(Array.isArray(options) ? options : []).map(opt => (
                    <label key={opt} className="flex items-center gap-1 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selected.includes(opt)}
                            onChange={() => toggle(opt)}
                            className="h-3.5 w-3.5"
                        />
                        {opt}
                    </label>
                ))}
            </div>
        );
    }

    const typeMap = { number: 'number', date: 'date', url: 'url', text: 'text' };
    return (
        <Input
            type={typeMap[field_type] ?? 'text'}
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
        />
    );
}
