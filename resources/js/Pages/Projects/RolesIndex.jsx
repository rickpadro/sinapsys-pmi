import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { useUrl } from '@/Lib/utils';
import { Plus, Pencil, Trash2, ArrowLeft, Shield } from 'lucide-react';

const PERM_LABELS = {
    can_edit:   'Puede editar',
    can_invite: 'Puede invitar',
    can_delete: 'Puede eliminar',
};

const EMPTY_FORM = {
    name: '',
    permissions: { can_edit: false, can_invite: false, can_delete: false },
};

export default function RolesIndex({ project, roles, currentRole, isOwner }) {
    const url     = useUrl();
    const canEdit = ['owner', 'manager'].includes(currentRole);

    const [modal, setModal]       = useState({ open: false, role: null });
    const [form,  setForm]        = useState(EMPTY_FORM);
    const [processing, setProcessing] = useState(false);

    function openCreate() {
        setForm(EMPTY_FORM);
        setModal({ open: true, role: null });
    }

    function openEdit(role) {
        setForm({
            name:        role.name,
            permissions: { ...{ can_edit: false, can_invite: false, can_delete: false }, ...role.permissions },
        });
        setModal({ open: true, role });
    }

    function setPerm(key, val) {
        setForm(p => ({ ...p, permissions: { ...p.permissions, [key]: val } }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);

        const path = modal.role
            ? url(`/projects/${project.id}/roles/${modal.role.id}`)
            : url(`/projects/${project.id}/roles`);
        const method = modal.role ? 'put' : 'post';

        router[method](path, form, {
            preserveScroll: true,
            onSuccess: () => { setModal({ open: false, role: null }); setProcessing(false); },
            onError:   () => setProcessing(false),
        });
    }

    function handleDelete(role) {
        if (!confirm(`¿Eliminar el rol "${role.name}"?`)) return;
        router.delete(url(`/projects/${project.id}/roles/${role.id}`), { preserveScroll: true });
    }

    return (
        <AppLayout title={`Roles — ${project.name}`}>
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={url(`/projects/${project.id}`)}>
                            <Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button>
                        </Link>
                        <div>
                            <h1 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                                Roles del proyecto
                            </h1>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.name}</p>
                        </div>
                    </div>
                    {canEdit && (
                        <Button size="sm" onClick={openCreate}>
                            <Plus size={14} /> Nuevo rol
                        </Button>
                    )}
                </div>

                {/* Roles list */}
                <div className="rounded-lg" style={{ border: '1px solid var(--border)' }}>
                    {roles.length === 0 ? (
                        <div className="py-12 text-center">
                            <Shield size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Sin roles definidos.
                                {canEdit && ' Agrega roles para controlar los permisos del equipo.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                            {roles.map(role => (
                                <div key={role.id} className="flex items-center gap-3 px-4 py-3">
                                    <Shield size={16} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                            {role.name}
                                            {role.is_default && (
                                                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded"
                                                    style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                                    default
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                            {Object.entries(role.permissions ?? {})
                                                .filter(([, v]) => v)
                                                .map(([k]) => PERM_LABELS[k] ?? k)
                                                .join(' · ') || 'Solo lectura'}
                                        </p>
                                    </div>
                                    {canEdit && (
                                        <div className="flex gap-1 flex-shrink-0">
                                            <Button variant="ghost" size="xs" onClick={() => openEdit(role)}>
                                                <Pencil size={13} />
                                            </Button>
                                            <Button variant="ghost" size="xs" onClick={() => handleDelete(role)}
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

                <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Los roles del sistema (owner, manager, contributor, viewer) siempre están disponibles.
                    Estos roles adicionales se pueden asignar al invitar miembros.
                </p>
            </div>

            {/* Modal */}
            <Dialog open={modal.open} onOpenChange={v => !v && setModal({ open: false, role: null })}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{modal.role ? 'Editar rol' : 'Nuevo rol'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Nombre del rol *</Label>
                            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="mt-1" placeholder="ej: Scrum Master, Auditor..." autoFocus required />
                        </div>
                        <div>
                            <Label className="mb-2 block">Permisos</Label>
                            <div className="space-y-2">
                                {Object.entries(PERM_LABELS).map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!form.permissions[key]}
                                            onChange={e => setPerm(key, e.target.checked)}
                                            className="rounded"
                                        />
                                        <span style={{ color: 'var(--foreground)' }}>{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setModal({ open: false, role: null })}>Cancelar</Button>
                            <Button type="submit" disabled={processing || !form.name.trim()}>
                                {processing ? 'Guardando...' : modal.role ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
