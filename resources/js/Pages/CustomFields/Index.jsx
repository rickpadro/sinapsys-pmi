import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { useUrl } from '@/Lib/utils';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';

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

const EMPTY_FORM = { name: '', field_type: 'text', applies_to: 'task', options: '' };
const SELECT_STYLE = { backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' };

export default function CustomFieldsIndex({ project, customFields, currentRole, isOwner }) {
    const url     = useUrl();
    const canEdit = ['owner', 'manager'].includes(currentRole);

    const [modal, setModal] = useState({ open: false, field: null });
    const [form,  setForm]  = useState(EMPTY_FORM);
    const [processing, setProcessing] = useState(false);

    function openCreate() {
        setForm(EMPTY_FORM);
        setModal({ open: true, field: null });
    }

    function openEdit(field) {
        setForm({
            name:       field.name,
            field_type: field.field_type,
            applies_to: field.applies_to,
            options:    Array.isArray(field.options) ? field.options.join(', ') : (field.options ?? ''),
        });
        setModal({ open: true, field });
    }

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        const payload = {
            name:       form.name,
            field_type: form.field_type,
            applies_to: form.applies_to,
            options:    ['select', 'multi_select'].includes(form.field_type)
                ? form.options.split(',').map(o => o.trim()).filter(Boolean)
                : null,
        };

        const path = modal.field
            ? url(`/projects/${project.id}/custom-fields/${modal.field.id}`)
            : url(`/projects/${project.id}/custom-fields`);
        const method = modal.field ? 'put' : 'post';

        router[method](path, payload, {
            preserveScroll: true,
            onSuccess: () => { setModal({ open: false, field: null }); setProcessing(false); },
            onError:   () => setProcessing(false),
        });
    }

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
                        <Button size="sm" onClick={openCreate}>
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
                                            <Button variant="ghost" size="xs" onClick={() => openEdit(field)}>
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

            {/* Create / Edit modal */}
            <Dialog open={modal.open} onOpenChange={v => !v && setModal({ open: false, field: null })}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{modal.field ? 'Editar campo' : 'Nuevo campo personalizado'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Nombre *</Label>
                            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="mt-1" autoFocus required />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label>Tipo</Label>
                                <select value={form.field_type} onChange={e => setForm(p => ({ ...p, field_type: e.target.value }))}
                                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SELECT_STYLE}>
                                    {Object.entries(FIELD_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Aplica a</Label>
                                <select value={form.applies_to} onChange={e => setForm(p => ({ ...p, applies_to: e.target.value }))}
                                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SELECT_STYLE}>
                                    {Object.entries(APPLIES_TO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                        </div>
                        {['select', 'multi_select'].includes(form.field_type) && (
                            <div>
                                <Label>Opciones (separadas por coma)</Label>
                                <Input value={form.options} onChange={e => setForm(p => ({ ...p, options: e.target.value }))}
                                    className="mt-1" placeholder="Opción 1, Opción 2, Opción 3" />
                            </div>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setModal({ open: false, field: null })}>Cancelar</Button>
                            <Button type="submit" disabled={processing || !form.name.trim()}>
                                {processing ? 'Guardando...' : modal.field ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
