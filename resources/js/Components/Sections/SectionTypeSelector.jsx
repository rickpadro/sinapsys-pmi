const TYPES = [
    { value: 'sprint',     label: '🏃 Sprint',     desc: 'Sprint Scrum estándar, cuenta en Burndown' },
    { value: 'discovery',  label: '🔍 Discovery',  desc: 'Fase exploratoria, no cuenta en métricas Scrum' },
    { value: 'continuous', label: '➿ Continuous',  desc: 'Track paralelo continuo, cruza todos los sprints' },
];

export default function SectionTypeSelector({ value = 'sprint', onChange }) {
    return (
        <div className="space-y-1.5">
            {TYPES.map(t => (
                <button
                    key={t.value}
                    type="button"
                    onClick={() => onChange(t.value)}
                    className="w-full text-left rounded-md border px-3 py-2 transition-colors"
                    style={{
                        borderColor:     value === t.value ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: value === t.value ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--background)',
                    }}
                >
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{t.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                </button>
            ))}
        </div>
    );
}
