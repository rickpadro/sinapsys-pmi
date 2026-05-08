import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { PROJECT_TYPES, PMI_PHASES, PRIORITIES, PROJECT_COLORS } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';
import { Plus, X, ExternalLink } from 'lucide-react';

const DEFAULTS = {
    name: '',
    type: 'interno',
    priority: 3,
    phase: 0,
    impact: 5,
    effort: 5,
    description: '',
    tags: [],
    viability_mercado: 5,
    viability_financiero: 5,
    viability_tecnico: 5,
    viability_riesgo: 5,
    color: '#4A6CF7',
    url_xampp: '',
    links: [],
};

export default function ProjectForm({ project, onCancel }) {
    const url = useUrl();
    const isEdit = !!project;
    const { data, setData, post, put, processing, errors } = useForm({
        ...DEFAULTS,
        ...(project || {}),
        tags: project?.tags || [],
        links: project?.links || [],
    });

    function handleSubmit(e) {
        e.preventDefault();
        if (isEdit) {
            put(url(`/projects/${project.id}`));
        } else {
            post(url('/projects'));
        }
    }

    function setField(field, value) {
        setData(field, value);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Name + Type */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <Label htmlFor="name">Nombre del proyecto</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setField('name', e.target.value)}
                        className="mt-1"
                    />
                    {errors.name && <FieldError msg={errors.name} />}
                </div>
                <div>
                    <Label htmlFor="type">Tipo</Label>
                    <select
                        id="type"
                        value={data.type}
                        onChange={(e) => setField('type', e.target.value)}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        style={{
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)',
                        }}
                    >
                        {Object.entries(PROJECT_TYPES).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                    {errors.type && <FieldError msg={errors.type} />}
                </div>
            </div>

            {/* Row 2: Priority + Phase */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <select
                        id="priority"
                        value={data.priority}
                        onChange={(e) => setField('priority', Number(e.target.value))}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        style={{
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)',
                        }}
                    >
                        {Object.entries(PRIORITIES).map(([k, v]) => (
                            <option key={k} value={k}>{v.icon} {v.label}</option>
                        ))}
                    </select>
                    {errors.priority && <FieldError msg={errors.priority} />}
                </div>
                <div>
                    <Label htmlFor="phase">Fase PMI</Label>
                    <select
                        id="phase"
                        value={data.phase}
                        onChange={(e) => setField('phase', Number(e.target.value))}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        style={{
                            backgroundColor: 'var(--background)',
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)',
                        }}
                    >
                        {Object.entries(PMI_PHASES).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                    {errors.phase && <FieldError msg={errors.phase} />}
                </div>
            </div>

            {/* Row 3: Impact + Effort sliders */}
            <div className="grid gap-4 sm:grid-cols-2">
                <RangeField
                    label="Impacto"
                    value={data.impact}
                    onChange={(v) => setField('impact', v)}
                    color="var(--success)"
                    error={errors.impact}
                />
                <RangeField
                    label="Esfuerzo"
                    value={data.effort}
                    onChange={(v) => setField('effort', v)}
                    color="var(--warning)"
                    error={errors.effort}
                />
            </div>

            {/* Description */}
            <div>
                <Label htmlFor="description">Descripción</Label>
                <textarea
                    id="description"
                    value={data.description || ''}
                    onChange={(e) => setField('description', e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    style={{
                        backgroundColor: 'var(--background)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)',
                    }}
                />
            </div>

            {/* Tags */}
            <div>
                <Label htmlFor="tags">Tags (separadas por coma)</Label>
                <Input
                    id="tags"
                    value={(data.tags || []).join(', ')}
                    onChange={(e) =>
                        setField('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))
                    }
                    className="mt-1"
                    placeholder="saas, ia, marketing"
                />
            </div>

            {/* Viability — 4 sliders */}
            <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    Viabilidad (1-10)
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <RangeField label="Mercado" value={data.viability_mercado} onChange={(v) => setField('viability_mercado', v)} color="#4A6CF7" error={errors.viability_mercado} />
                    <RangeField label="Financiero" value={data.viability_financiero} onChange={(v) => setField('viability_financiero', v)} color="#00CA72" error={errors.viability_financiero} />
                    <RangeField label="Técnico" value={data.viability_tecnico} onChange={(v) => setField('viability_tecnico', v)} color="#FDAB3D" error={errors.viability_tecnico} />
                    <RangeField label="Riesgo" value={data.viability_riesgo} onChange={(v) => setField('viability_riesgo', v)} color="#E44258" error={errors.viability_riesgo} />
                </div>
            </div>

            {/* URL XAMPP */}
            <div>
                <Label htmlFor="url_xampp">URL XAMPP</Label>
                <Input
                    id="url_xampp"
                    value={data.url_xampp || ''}
                    onChange={(e) => setField('url_xampp', e.target.value)}
                    className="mt-1"
                    placeholder="http://localhost/mi-proyecto/"
                />
            </div>

            {/* Links / Documentos */}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <Label>Links y Documentos</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setField('links', [...(data.links || []), { title: '', url: '' }])}
                    >
                        <Plus size={12} /> Agregar
                    </Button>
                </div>
                {(!data.links || data.links.length === 0) ? (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Sin links. Agrega documentos, repos, o URLs relevantes.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {data.links.map((link, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <ExternalLink size={14} className="shrink-0 opacity-40" />
                                    <Input
                                        value={link.title}
                                        onChange={(e) => {
                                            const updated = [...data.links];
                                            updated[i] = { ...updated[i], title: e.target.value };
                                            setField('links', updated);
                                        }}
                                        placeholder="Título"
                                        className="flex-1"
                                    />
                                    <Input
                                        value={link.url}
                                        onChange={(e) => {
                                            const updated = [...data.links];
                                            updated[i] = { ...updated[i], url: e.target.value };
                                            setField('links', updated);
                                        }}
                                        placeholder="https://..."
                                        className="flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setField('links', data.links.filter((_, j) => j !== i))}
                                        style={{ color: 'var(--destructive)' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                {errors[`links.${i}.title`] && <FieldError msg={`Link ${i + 1}: ${errors[`links.${i}.title`]}`} />}
                                {errors[`links.${i}.url`] && <FieldError msg={`Link ${i + 1}: ${errors[`links.${i}.url`]}`} />}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Color picker */}
            <div>
                <Label>Color del proyecto</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {PROJECT_COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setField('color', c)}
                            className="h-8 w-8 rounded-full transition-transform"
                            style={{
                                backgroundColor: c,
                                outline: data.color === c ? '2px solid var(--foreground)' : 'none',
                                outlineOffset: '2px',
                                transform: data.color === c ? 'scale(1.15)' : 'scale(1)',
                            }}
                        />
                    ))}
                </div>
                {errors.color && <FieldError msg={errors.color} />}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear proyecto'}
                </Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
            </div>
        </form>
    );
}

function RangeField({ label, value, onChange, color, error }) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <Label>{label}</Label>
                <span className="text-sm font-semibold" style={{ color }}>
                    {value}
                </span>
            </div>
            <input
                type="range"
                min={1}
                max={10}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: color }}
            />
            {error && <FieldError msg={error} />}
        </div>
    );
}

function FieldError({ msg }) {
    return (
        <p className="mt-1 text-xs" style={{ color: 'var(--destructive)' }}>
            {msg}
        </p>
    );
}
