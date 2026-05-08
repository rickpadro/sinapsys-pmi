import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { useUrl } from '@/Lib/utils';
import { Crown, UserPlus, X, RefreshCw, Mail } from 'lucide-react';

const ROLE_META = {
    owner:       { label: 'Propietario', color: '#4A6CF7' },
    manager:     { label: 'Manager',     color: '#FDAB3D' },
    contributor: { label: 'Colaborador', color: '#00CA72' },
    viewer:      { label: 'Observador',  color: '#9B9DB0' },
};

export default function TeamTab({ project, members, isOwner, currentRole }) {
    const url = useUrl();
    const canManage = isOwner || currentRole === 'manager';
    const accepted  = members.filter(m => m.accepted_at);
    const pending   = members.filter(m => !m.accepted_at);

    return (
        <div className="space-y-4">
            <Section title="Propietario">
                <MemberRow name={project.user.name} email={project.user.email} role="owner" />
            </Section>

            {accepted.length > 0 && (
                <Section title={`Equipo (${accepted.length})`}>
                    {accepted.map(m => (
                        <MemberRow
                            key={m.id}
                            name={m.user?.name || m.invitation_email}
                            email={m.user?.email || m.invitation_email}
                            role={m.role}
                            canManage={canManage}
                            onRoleChange={(role) =>
                                router.patch(url(`/projects/${project.id}/members/${m.id}/role`), { role }, { preserveScroll: true })
                            }
                            onRemove={() => {
                                if (confirm('¿Remover este miembro del proyecto?')) {
                                    router.delete(url(`/projects/${project.id}/members/${m.id}`), { preserveScroll: true });
                                }
                            }}
                        />
                    ))}
                </Section>
            )}

            {pending.length > 0 && (
                <Section title={`Invitaciones pendientes (${pending.length})`}>
                    {pending.map(m => (
                        <PendingRow
                            key={m.id}
                            member={m}
                            canManage={canManage}
                            onResend={() =>
                                router.post(url(`/projects/${project.id}/members/${m.id}/resend`), {}, { preserveScroll: true })
                            }
                            onCancel={() => {
                                if (confirm('¿Cancelar esta invitación?')) {
                                    router.delete(url(`/projects/${project.id}/members/${m.id}`), { preserveScroll: true });
                                }
                            }}
                        />
                    ))}
                </Section>
            )}

            {canManage && <InviteForm projectId={project.id} url={url} />}
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                {title}
            </p>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function MemberRow({ name, email, role, canManage, onRoleChange, onRemove }) {
    const meta    = ROLE_META[role] ?? ROLE_META.viewer;
    const isOwner = role === 'owner';
    const initials = name?.[0]?.toUpperCase() ?? '?';

    return (
        <div className="flex items-center gap-3">
            <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: meta.color }}
            >
                {initials}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: 'var(--foreground)' }}>{name}</p>
                <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{email}</p>
            </div>

            {canManage && !isOwner ? (
                <div className="flex shrink-0 items-center gap-2">
                    <select
                        value={role}
                        onChange={(e) => onRoleChange(e.target.value)}
                        className="rounded border px-2 py-1 text-xs"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    >
                        <option value="manager">Manager</option>
                        <option value="contributor">Colaborador</option>
                        <option value="viewer">Observador</option>
                    </select>
                    <button onClick={onRemove} title="Remover miembro" style={{ color: 'var(--destructive)' }}>
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <Badge
                    className="shrink-0 text-xs"
                    style={{ backgroundColor: meta.color + '20', color: meta.color, border: 'none' }}
                >
                    {isOwner && <Crown size={10} className="mr-1" />}
                    {meta.label}
                </Badge>
            )}
        </div>
    );
}

function PendingRow({ member, canManage, onResend, onCancel }) {
    return (
        <div className="flex items-center gap-3">
            <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--border)' }}
            >
                <Mail size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm" style={{ color: 'var(--text-muted)' }}>{member.invitation_email}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Pendiente · {ROLE_META[member.role]?.label}
                </p>
            </div>
            {canManage && (
                <div className="flex shrink-0 items-center gap-3">
                    <button onClick={onResend} title="Reenviar invitación" style={{ color: 'var(--primary)' }}>
                        <RefreshCw size={13} />
                    </button>
                    <button onClick={onCancel} title="Cancelar invitación" style={{ color: 'var(--destructive)' }}>
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}

function InviteForm({ projectId, url }) {
    const [email, setEmail]         = useState('');
    const [role, setRole]           = useState('contributor');
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        if (!email.trim()) return;
        setProcessing(true);
        router.post(
            url(`/projects/${projectId}/members`),
            { email: email.trim(), role },
            {
                preserveScroll: true,
                onSuccess: () => setEmail(''),
                onFinish: () => setProcessing(false),
            }
        );
    }

    return (
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Invitar miembro
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
                <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    required
                />
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="rounded border px-3 py-1.5 text-sm"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                    <option value="manager">Manager</option>
                    <option value="contributor">Colaborador</option>
                    <option value="viewer">Observador</option>
                </select>
                <Button type="submit" size="sm" disabled={processing || !email.trim()}>
                    <UserPlus size={14} />
                    {processing ? 'Enviando...' : 'Invitar'}
                </Button>
            </form>
        </div>
    );
}
