import { Button } from '@/Components/ui/button';
import { PROJECT_TYPES, PRIORITIES } from '@/Lib/constants';

export default function StepConfirm({ data, selectedTemplate, processing, onBack }) {
    return (
        <>
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                Confirmar creación
            </h2>

            <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: data.color }} />
                    <div>
                        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{data.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
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
                                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
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
                                <span
                                    key={i}
                                    className="text-xs px-2 py-0.5 rounded"
                                    style={{ backgroundColor: 'var(--border)', color: 'var(--muted)' }}
                                >
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
                <Button type="button" variant="outline" onClick={onBack}>← Volver</Button>
            </div>
        </>
    );
}
