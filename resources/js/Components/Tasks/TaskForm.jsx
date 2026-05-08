import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { PRIORITIES, TASK_CATEGORIES } from '@/Lib/constants';
import { useUrl } from '@/Lib/utils';
import { Plus, X, GripVertical } from 'lucide-react';

const DEFAULTS = {
    project_id:  '',
    section_id:  '',
    assigned_to: '',
    name:        '',
    priority:    3,
    category:    'personal',
    due_date:    '',
    estimated_time: '',
    notes:       '',
    steps:       [],
};

const SELECT_STYLE = {
    backgroundColor: 'var(--background)',
    borderColor:     'var(--border)',
    color:           'var(--foreground)',
};

export default function TaskForm({ open, onClose, task, projects, projectMembersMap, defaultProjectId, defaultSectionId }) {
    const url    = useUrl();
    const isEdit = !!task;
    const { data, setData, post, put, processing, errors, reset } = useForm(DEFAULTS);

    useEffect(() => {
        if (open) {
            if (task) {
                setData({
                    project_id:     task.project_id || '',
                    section_id:     task.section_id || '',
                    assigned_to:    task.assigned_to || '',
                    name:           task.name,
                    priority:       task.priority,
                    category:       task.category,
                    due_date:       task.due_date ? task.due_date.split('T')[0] : '',
                    estimated_time: task.estimated_time || '',
                    notes:          task.notes || '',
                    steps:          task.steps || [],
                });
            } else {
                reset();
                if (defaultProjectId) setData(prev => ({ ...prev, project_id: defaultProjectId }));
                if (defaultSectionId) setData(prev => ({ ...prev, section_id: defaultSectionId }));
            }
        }
    }, [open, task]);

    const projectMembers = data.project_id ? (projectMembersMap?.[data.project_id] ?? null) : null;

    function handleSubmit(e) {
        e.preventDefault();
        const payload = {
            ...data,
            project_id:     data.project_id || null,
            section_id:     data.section_id || null,
            assigned_to:    data.assigned_to || null,
            estimated_time: data.estimated_time || null,
            steps:          data.steps.length > 0 ? data.steps : null,
        };

        if (isEdit) {
            put(url(`/tasks/${task.id}`), {
                data: payload,
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            post(url('/tasks'), {
                data: payload,
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        }
    }

    function addStep() {
        setData('steps', [...data.steps, { text: '', done: false }]);
    }

    function updateStep(index, field, value) {
        setData('steps', data.steps.map((s, i) => i === index ? { ...s, [field]: value } : s));
    }

    function removeStep(index) {
        setData('steps', data.steps.filter((_, i) => i !== index));
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <Label htmlFor="task-name">Nombre *</Label>
                        <Input
                            id="task-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1"
                            autoFocus
                        />
                        {errors.name && <ErrMsg msg={errors.name} />}
                    </div>

                    {/* Project + Category */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Proyecto</Label>
                            <select
                                value={data.project_id}
                                onChange={(e) => {
                                    setData(prev => ({ ...prev, project_id: e.target.value, assigned_to: '' }));
                                }}
                                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                style={SELECT_STYLE}
                            >
                                <option value="">Sin proyecto</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Categoría</Label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                style={SELECT_STYLE}
                            >
                                {Object.entries(TASK_CATEGORIES).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Assignee (only when project has team members) */}
                    {projectMembers && (
                        <div>
                            <Label>Asignado a</Label>
                            <select
                                value={data.assigned_to}
                                onChange={(e) => setData('assigned_to', e.target.value)}
                                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                style={SELECT_STYLE}
                            >
                                <option value="">Sin asignar</option>
                                {projectMembers.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Priority + Date */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Prioridad</Label>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', Number(e.target.value))}
                                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                style={SELECT_STYLE}
                            >
                                {Object.entries(PRIORITIES).map(([k, v]) => (
                                    <option key={k} value={k}>{v.icon} {v.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="task-date">Fecha de entrega *</Label>
                            <Input
                                id="task-date"
                                type="date"
                                value={data.due_date}
                                onChange={(e) => setData('due_date', e.target.value)}
                                className="mt-1"
                            />
                            {errors.due_date && <ErrMsg msg={errors.due_date} />}
                        </div>
                    </div>

                    {/* Estimated time */}
                    <div>
                        <Label htmlFor="task-time">Tiempo estimado (horas)</Label>
                        <Input
                            id="task-time"
                            type="number"
                            step="0.25"
                            min="0"
                            value={data.estimated_time}
                            onChange={(e) => setData('estimated_time', e.target.value)}
                            className="mt-1"
                            placeholder="ej: 2.5"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="task-notes">Notas *</Label>
                        <textarea
                            id="task-notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            style={SELECT_STYLE}
                            placeholder="Contexto, instrucciones, criterios de aceptación..."
                        />
                        {errors.notes && <ErrMsg msg={errors.notes} />}
                    </div>

                    {/* Steps */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <Label>Pasos</Label>
                            <Button type="button" variant="outline" size="xs" onClick={addStep}>
                                <Plus size={12} /> Agregar paso
                            </Button>
                        </div>
                        {data.steps.length === 0 ? (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Sin pasos definidos. Agrega pasos para desglosar esta tarea.
                            </p>
                        ) : (
                            <div className="space-y-1.5">
                                {data.steps.map((step, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <GripVertical size={14} className="shrink-0 opacity-30" />
                                        <input
                                            type="checkbox"
                                            checked={step.done}
                                            onChange={(e) => updateStep(i, 'done', e.target.checked)}
                                            className="shrink-0 rounded"
                                        />
                                        <input
                                            type="text"
                                            value={step.text}
                                            onChange={(e) => updateStep(i, 'text', e.target.value)}
                                            placeholder={`Paso ${i + 1}`}
                                            className={`flex-1 rounded-md border px-2.5 py-1.5 text-sm ${step.done ? 'line-through' : ''}`}
                                            style={{
                                                backgroundColor: 'var(--background)',
                                                borderColor:     'var(--border)',
                                                color: step.done ? 'var(--text-muted)' : 'var(--foreground)',
                                            }}
                                        />
                                        <button type="button" onClick={() => removeStep(i)} style={{ color: 'var(--destructive)' }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ErrMsg({ msg }) {
    return <p className="mt-1 text-xs" style={{ color: 'var(--destructive)' }}>{msg}</p>;
}
