import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useUrl } from '@/Lib/utils';

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

export default function CustomFieldEditor({ open, field, projectId, onClose }) {
    const url = useUrl();
    const [form, setForm] = useState(() =>
        field
            ? {
                name:       field.name,
                field_type: field.field_type,
                applies_to: field.applies_to,
                options:    Array.isArray(field.options) ? field.options.join(', ') : (field.options ?? ''),
              }
            : EMPTY_FORM
    );
    const [processing, setProcessing] = useState(false);

    function handleOpenChange(v) {
        if (!v) onClose();
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

        const path   = field
            ? url(`/projects/${projectId}/custom-fields/${field.id}`)
            : url(`/projects/${projectId}/custom-fields`);
        const method = field ? 'put' : 'post';

        router[method](path, payload, {
            preserveScroll: true,
            onSuccess: () => { setProcessing(false); onClose(); },
            onError:   () => setProcessing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{field ? 'Editar campo' : 'Nuevo campo personalizado'}</DialogTitle>
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
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing || !form.name.trim()}>
                            {processing ? 'Guardando...' : field ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
