import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import PhoneInput from '@/Components/ui/PhoneInput';
import { useUrl } from '@/Lib/utils';
import { UserPlus, Pencil, Trash2, FolderOpen, X, Plus, Eye, EyeOff, ShieldCheck, Shield } from 'lucide-react';

const ROLE_META = {
    manager:     { label: 'Manager',     color: '#FDAB3D' },
    contributor: { label: 'Colaborador', color: '#00CA72' },
    viewer:      { label: 'Observador',  color: '#9B9DB0' },
};

export default function Index({ users, myProjects }) {
    const url = useUrl();
    const [search, setSearch]               = useState('');
    const [createOpen, setCreateOpen]       = useState(false);
    const [editingUser, setEditingUser]     = useState(null);
    const [projectsUser, setProjectsUser]   = useState(null);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    function handleDelete(user) {
        if (!confirm(`¿Eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`)) return;
        router.delete(url(`/users/${user.id}`), { preserveScroll: true });
    }

    return (
        <AppLayout title="Usuarios">
            {/* Toolbar */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Input
                    placeholder="Buscar por nombre o email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="sm:w-72"
                />
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <UserPlus size={15} /> Nuevo usuario
                </Button>
            </div>

            {/* Tabla */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {/* Header */}
                <div
                    className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide"
                    style={{ backgroundColor: 'var(--surface)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
                >
                    <span>Usuario</span>
                    <span>Contacto</span>
                    <span>Proyectos</span>
                    <span>Acciones</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="px-4 py-12 text-center text-sm" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-muted)' }}>
                        {search ? 'Sin resultados.' : 'No hay usuarios. Crea el primero.'}
                    </div>
                ) : (
                    filtered.map((user, i) => (
                        <div
                            key={user.id}
                            className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                            style={{
                                backgroundColor: 'var(--surface)',
                                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                            }}
                        >
                            {/* Nombre */}
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                    style={{ backgroundColor: user.is_admin ? '#E44258' : 'var(--primary)' }}
                                >
                                    {user.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="truncate text-sm font-medium" style={{ color: 'var(--foreground)' }}>{user.name}</p>
                                        {user.is_admin && (
                                            <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: '#E44258' }}>
                                                ADMIN
                                            </span>
                                        )}
                                        {user.is_me && (
                                            <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                                Tú
                                            </span>
                                        )}
                                    </div>
                                    <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                                </div>
                            </div>

                            {/* Contacto */}
                            <div className="min-w-0">
                                {user.phone
                                    ? <p className="truncate text-sm" style={{ color: 'var(--text-muted)' }}>+{user.phone}</p>
                                    : <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Sin teléfono</p>
                                }
                            </div>

                            {/* Proyectos badge */}
                            <button
                                onClick={() => setProjectsUser(projectsUser?.id === user.id ? null : user)}
                                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                style={{ color: 'var(--primary)' }}
                                title="Gestionar proyectos"
                            >
                                <FolderOpen size={13} />
                                {user.memberships.length + user.pending.length}
                            </button>

                            {/* Acciones */}
                            <div className="flex items-center gap-1">
                                {!user.is_me && (
                                    <button
                                        onClick={() => router.patch(url(`/users/${user.id}/toggle-admin`), {}, { preserveScroll: true })}
                                        className="rounded p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                        title={user.is_admin ? 'Quitar Admin' : 'Hacer Admin'}
                                        style={{ color: user.is_admin ? '#E44258' : 'var(--text-muted)' }}
                                    >
                                        {user.is_admin ? <ShieldCheck size={14} /> : <Shield size={14} />}
                                    </button>
                                )}
                                <button
                                    onClick={() => user.is_me ? window.location.href = url('/profile') : setEditingUser(user)}
                                    className="rounded p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                    title={user.is_me ? 'Editar mi perfil' : 'Editar usuario'}
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <Pencil size={14} />
                                </button>
                                {!user.is_me && (
                                    <button
                                        onClick={() => handleDelete(user)}
                                        className="rounded p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                        title="Eliminar usuario"
                                        style={{ color: 'var(--destructive)' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Panel de proyectos inline */}
            {projectsUser && (
                <ProjectsPanel
                    user={projectsUser}
                    myProjects={myProjects}
                    url={url}
                    onClose={() => setProjectsUser(null)}
                />
            )}

            {/* Modal crear usuario */}
            <UserFormModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                url={url}
            />

            {/* Modal editar usuario */}
            {editingUser && (
                <UserFormModal
                    open={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    user={editingUser}
                    url={url}
                />
            )}
        </AppLayout>
    );
}

/* ─── Modal crear/editar usuario ─── */
function UserFormModal({ open, onClose, user, url }) {
    const isEdit = !!user;
    const [showPass, setShowPass] = useState(false);

    const form = useForm({
        name:     user?.name     ?? '',
        email:    user?.email    ?? '',
        phone:    user?.phone    ?? '',
        password: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        if (isEdit) {
            form.put(url(`/users/${user.id}`), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            form.post(url('/users'), {
                preserveScroll: true,
                onSuccess: () => { form.reset(); onClose(); },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Nombre completo *" error={form.errors.name}>
                        <Input
                            value={form.data.name}
                            onChange={e => form.setData('name', e.target.value)}
                            placeholder="Nombre completo"
                            autoFocus
                        />
                    </Field>

                    <Field label="Correo electrónico *" error={form.errors.email}>
                        <Input
                            type="email"
                            value={form.data.email}
                            onChange={e => form.setData('email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                        />
                    </Field>

                    <Field label="Teléfono" error={form.errors.phone}>
                        <PhoneInput
                            value={form.data.phone}
                            onChange={v => form.setData('phone', v)}
                        />
                    </Field>

                    <Field
                        label={isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                        error={form.errors.password}
                    >
                        <div className="relative">
                            <Input
                                type={showPass ? 'text' : 'password'}
                                value={form.data.password}
                                onChange={e => form.setData('password', e.target.value)}
                                placeholder={isEdit ? 'Dejar vacío para mantener' : 'Mínimo 8 caracteres'}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: 'var(--text-muted)' }}
                                tabIndex={-1}
                            >
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </Field>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" size="sm" disabled={form.processing}>
                            {form.processing ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear usuario'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* ─── Panel de proyectos ─── */
function ProjectsPanel({ user, myProjects, url, onClose }) {
    const [addOpen, setAddOpen]             = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedRole, setSelectedRole]       = useState('contributor');
    const [processing, setProcessing]           = useState(false);

    const memberProjectIds = user.memberships.map(m => m.project_id);
    const available = myProjects.filter(p => !memberProjectIds.includes(p.id));

    function handleRoleChange(memberId, role) {
        router.patch(url(`/users/members/${memberId}/role`), { role }, { preserveScroll: true });
    }

    function handleRemove(memberId) {
        if (!confirm('¿Remover del proyecto?')) return;
        router.delete(url(`/users/members/${memberId}`), { preserveScroll: true });
    }

    function handleAdd(e) {
        e.preventDefault();
        if (!selectedProject) return;
        setProcessing(true);
        router.post(url('/users/add-to-project'), {
            user_id: user.id, project_id: selectedProject, role: selectedRole,
        }, {
            preserveScroll: true,
            onSuccess: () => { setAddOpen(false); setSelectedProject(''); setProcessing(false); },
            onError:   () => setProcessing(false),
        });
    }

    return (
        <div className="mt-3 rounded-xl p-4" style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--primary)' }}>
            <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    Proyectos de {user.name}
                </p>
                <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
            </div>

            {/* Membresías activas */}
            {user.memberships.length > 0 && (
                <div className="mb-3 space-y-1.5">
                    {user.memberships.map(m => (
                        <div key={m.member_id} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--background)' }}>
                            <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: m.project?.color ?? '#999' }} />
                            <span className="flex-1 truncate text-sm" style={{ color: 'var(--foreground)' }}>{m.project?.name}</span>
                            <select
                                value={m.role}
                                onChange={e => handleRoleChange(m.member_id, e.target.value)}
                                className="rounded border px-2 py-0.5 text-xs"
                                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            >
                                <option value="manager">Manager</option>
                                <option value="contributor">Colaborador</option>
                                <option value="viewer">Observador</option>
                            </select>
                            <button onClick={() => handleRemove(m.member_id)} style={{ color: 'var(--destructive)' }} title="Remover">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pendientes */}
            {user.pending.map(m => (
                <div key={m.member_id} className="mb-1.5 flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--background)' }}>
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full opacity-40" style={{ backgroundColor: m.project?.color ?? '#999' }} />
                    <span className="flex-1 truncate text-sm" style={{ color: 'var(--text-muted)' }}>{m.project?.name}</span>
                    <Badge variant="secondary" className="text-xs">Pendiente</Badge>
                    <button onClick={() => handleRemove(m.member_id)} style={{ color: 'var(--destructive)' }}><Trash2 size={14} /></button>
                </div>
            ))}

            {user.memberships.length === 0 && user.pending.length === 0 && (
                <p className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>Sin proyectos asignados.</p>
            )}

            {/* Agregar a proyecto */}
            {available.length > 0 && (
                !addOpen ? (
                    <Button size="xs" variant="outline" onClick={() => setAddOpen(true)}>
                        <Plus size={13} /> Agregar a proyecto
                    </Button>
                ) : (
                    <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2 rounded-lg border p-2.5" style={{ borderColor: 'var(--border)' }}>
                        <select
                            value={selectedProject}
                            onChange={e => setSelectedProject(e.target.value)}
                            className="flex-1 rounded border px-2 py-1.5 text-xs"
                            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            required
                        >
                            <option value="">Seleccionar proyecto...</option>
                            {available.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <select
                            value={selectedRole}
                            onChange={e => setSelectedRole(e.target.value)}
                            className="rounded border px-2 py-1.5 text-xs"
                            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        >
                            <option value="manager">Manager</option>
                            <option value="contributor">Colaborador</option>
                            <option value="viewer">Observador</option>
                        </select>
                        <Button type="submit" size="xs" disabled={!selectedProject || processing}>
                            {processing ? '...' : 'Agregar'}
                        </Button>
                        <Button type="button" size="xs" variant="outline" onClick={() => setAddOpen(false)}>
                            <X size={12} />
                        </Button>
                    </form>
                )
            )}
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <Label className="mb-1.5 block text-xs">{label}</Label>
            {children}
            {error && <p className="mt-1 text-xs" style={{ color: 'var(--destructive)' }}>{error}</p>}
        </div>
    );
}
