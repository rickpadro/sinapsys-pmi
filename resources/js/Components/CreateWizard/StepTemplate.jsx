import { LayoutGrid, List, Layers } from 'lucide-react';

const METHODOLOGY_ICONS = {
    pmi:    { icon: Layers,     label: 'PMI',    color: '#4A6CF7' },
    scrum:  { icon: LayoutGrid, label: 'Scrum',  color: '#00CA72' },
    custom: { icon: List,       label: 'Custom', color: '#FDAB3D' },
};

export default function StepTemplate({ templates, selectedId, onSelect }) {
    return (
        <div>
            <h2 className="mb-1 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                ¿Qué metodología usará este proyecto?
            </h2>
            <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
                Esto configura automáticamente las secciones, campos y vista por defecto.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
                {templates.map(template => {
                    const meta = METHODOLOGY_ICONS[template.slug] ?? METHODOLOGY_ICONS.custom;
                    const Icon = meta.icon;
                    return (
                        <button
                            key={template.id}
                            onClick={() => onSelect(template)}
                            className="flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-left transition-all hover:shadow-md"
                            style={{
                                borderColor:     selectedId === template.id ? meta.color : 'var(--border)',
                                backgroundColor: 'var(--background)',
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: meta.color + '20' }}
                            >
                                <Icon size={24} style={{ color: meta.color }} />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{template.name}</p>
                                <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{template.description}</p>
                            </div>
                            <div className="w-full space-y-1">
                                {template.default_sections.slice(0, 3).map((s, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                                        {s.name}
                                    </div>
                                ))}
                                {template.default_sections.length > 3 && (
                                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                                        +{template.default_sections.length - 3} más...
                                    </p>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
