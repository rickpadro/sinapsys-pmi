import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { PROJECT_TYPES, PRIORITIES, PROJECT_COLORS } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';
import { CheckCircle2, LayoutGrid, List, Layers } from 'lucide-react';

const METHODOLOGY_ICONS = {
    pmi:    { icon: Layers,     label: 'PMI', color: '#4A6CF7' },
    scrum:  { icon: LayoutGrid, label: 'Scrum', color: '#00CA72' },
    custom: { icon: List,       label: 'Custom', color: '#FDAB3D' },
};

const SELECT_STYLE = {
    backgroundColor: 'var(--background)',
    borderColor:     'var(--border)',
    color:           'var(--foreground)',
};

export default function CreateWizard({ templates }) {
    const url  = useUrl();
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        template_id:   '',
        methodology:   '',
        default_view:  'list',
        name:          '',
        type:          'interno',
        priority:      3,
        color:         '#4A6CF7',
        description:   '',
        phase:         0,
        impact:        5,
        effort:        5,
        viability_mercado:    5,
        viability_financiero: 5,
        viability_tecnico:    5,
        viability_riesgo:     5,
        tags:  [],
        links: [],
    });

    const selectedTemplate = templates.find(t => t.id === Number(data.template_id));

    function selectTemplate(template) {
        setData(prev => ({
            ...prev,
            template_id:  template.id,
            methodology:  template.slug,
            default_view: template.default_view,
        }));
        setStep(2);
    }

    function handleSubmit(e) {
        e.preventDefault();
        post(url('/projects'));
    }

    return (
        <AppLayout title="Nuevo Proyecto">
            <div className="mx-auto max-w-2xl">
                {/* Step indicator */}
                <div className="mb-6 flex items-center gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center text-white"
                                style={{ backgroundColor: s <= step ? 'var(--primary)' : 'var(--border)' }}
                            >
                                {s < step ? <CheckCircle2 size={14} /> : s}
                            </div>
                            <span className="text-xs" style={{ color: s === step ? 'var(--foreground)' : 'var(--text-muted)' }}>
                                {s === 1 ? 'Metodología' : s === 2 ? 'Datos' : 'Confirmar'}
                            </span>
                            {s < 3 && <div className="w-8 h-px" style={{ backgroundColor: 'var(--border)' }} />}
                        </div>
                    ))}
                </div>

                <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                    {/* Step 1: Choose template */}
                    {step === 1 && (
                        <div>
                            <h2 className="mb-1 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                                ¿Qué metodología usará este proyecto?
                            </h2>
                            <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                                Esto configura automáticamente las secciones, campos y vista por defecto.
                            </p>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {templates.map(template => {
                                    const meta = METHODOLOGY_ICONS[template.slug] ?? METHODOLOGY_ICONS.custom;
                                    const Icon = meta.icon;
                                    return (
                                        <button
                                            key={template.id}
                                            onClick={() => selectTemplate(template)}
                                            className="flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-left transition-all hover:shadow-md"
                                            style={{
                                                borderColor:     data.template_id === template.id ? meta.color : 'var(--border)',
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
                                                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{template.description}</p>
                                            </div>
                                            <div className="w-full space-y-1">
                                                {template.default_sections.slice(0, 3).map((s, i) => (
                                                    <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                                                        {s.name}
                                                    </div>
                                                ))}
                                                {template.default_sections.length > 3 && (
                                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        +{template.default_sections.length - 3} más...
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Project data */}
                    {step === 2 && (
                        <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                                Datos del proyecto
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <Label htmlFor="name">Nombre *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="mt-1"
                                        autoFocus
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-xs" style={{ color: 'var(--destructive)' }}>{errors.name}</p>}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label>Tipo</Label>
                                        <select value={data.type} onChange={e => setData('type', e.target.value)}
                                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SELECT_STYLE}>
                                            {Object.entries(PROJECT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Prioridad</Label>
                                        <select value={data.priority} onChange={e => setData('priority', Number(e.target.value))}
                                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SELECT_STYLE}>
                                            {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Descripción</Label>
                                    <textarea id="description" value={data.description || ''} onChange={e => setData('description', e.target.value)}
                                        rows={3} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SELECT_STYLE} />
                                </div>

                                <div>
                                    <Label>Color</Label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {PROJECT_COLORS.map(c => (
                                            <button key={c} type="button" onClick={() => setData('color', c)}
                                                className="h-8 w-8 rounded-full transition-transform"
                                                style={{
                                                    backgroundColor: c,
                                                    outline:      data.color === c ? '2px solid var(--foreground)' : 'none',
                                                    outlineOffset: '2px',
                                                    transform:    data.color === c ? 'scale(1.15)' : 'scale(1)',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Button type="submit" disabled={!data.name.trim()}>Siguiente →</Button>
                                <Button type="button" variant="outline" onClick={() => setStep(1)}>← Volver</Button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit}>
                            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                                Confirmar creación
                            </h2>

                            <div className="mb-6 space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: data.color }} />
                                    <div>
                                        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{data.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {PROJECT_TYPES[data.type]} · {PRIORITIES[data.priority]?.label} · {selectedTemplate?.name ?? 'Sin template'}
                                        </p>
                                    </div>
                                </div>

                                {selectedTemplate && (
                                    <div>
                                        <p className="mb-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                            Secciones que se crearán:
                                        </p>
                                        <div className="space-y-1">
                                            {selectedTemplate.default_sections.map((s, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                                                    {s.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedTemplate?.default_fields?.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                            Campos personalizados:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedTemplate.default_fields.map((f, i) => (
                                                <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                                    {f.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creando...' : 'Crear proyecto'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setStep(2)}>← Volver</Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
