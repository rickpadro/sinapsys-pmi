import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { useUrl } from '@/Lib/utils';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import CustomFieldEditor from '@/Components/CustomFields/CustomFieldEditor';

const FIELD_TYPES = {
    text:         'Texto',
    number:       'Número',
    date:         'Fecha',
    select:       'Selección',
    multi_select: 'Multi-selección',
    boolean:      'Sí/No',
    url:          'URL',
};

const APPLIES_TO = {
    project:   'Proyecto',
    section:   'Sección',
    task:      'Tarea',
    task_step: 'Paso de tarea',
};

export default function CustomFieldsIndex({ project, customFields, currentRole }) {
    const url     = useUrl();
    const canEdit = ['owner', 'manager'].includes(currentRole);

    const [modal, setModal] = useState({ open: false, field: null });

    function handleDelete(field) {
        if (!confirm(`¿Eliminar el campo "${field.name}"?`)) return;
        router.delete(url(`/projects/${project.id}/custom-fields/${field.id}`), { preserveScroll: true });
    }

    return (
        <AppLayout title={`Campos — ${project.name}`}>
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={url(`/projects/${project.id}`)}>
                            <Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button>
                        </Link>
                        <div>
                            <h1 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                                Campos personalizados
                            </h1>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.name}</p>
                        </div>
                    </div>
                    {canEdit && (
                        <Button size="sm" onClick={() => setModal({ open: true, field: null })}>
                            <Plus size={14} /> Nuevo campo
                        </Button>
                    )}
                </div>

                {/* Fields list */}
                <div className="rounded-lg" style={{ border: '1px solid var(--border)' }}>
                    {customFields.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Sin campos personalizados.
                                {canEdit && ' Agrega campos para enriquecer tus tareas o secciones.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                            {customFields.map(field => (
                                <div key={field.id} className="flex items-center gap-3 px-4 py-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                                            {field.name}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                            {FIELD_TYPES[field.field_type] ?? field.field_type}
                                            {' · '}
                                            {APPLIES_TO[field.applies_to] ?? field.applies_to}
                                            {Array.isArray(field.options) && field.options.length > 0 && (
                                                <span> · {field.options.join(', ')}</span>
                                            )}
                                        </p>
                                    </div>
                                    {canEdit && (
                                        <div className="flex gap-1 flex-shrink-0">
                                            <Button variant="ghost" size="xs" onClick={() => setModal({ open: true, field })}>
                                                <Pencil size={13} />
                                            </Button>
                                            <Button variant="ghost" size="xs" onClick={() => handleDelete(field)}
                                                style={{ color: 'var(--destructive)' }}>
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CustomFieldEditor
                key={modal.field ? modal.field.id : 'new'}
                open={modal.open}
                field={modal.field}
                projectId={project.id}
                onClose={() => setModal({ open: false, field: null })}
            />
        </AppLayout>
    );
}
