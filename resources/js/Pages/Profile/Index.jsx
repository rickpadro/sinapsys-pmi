import { useForm } from '@inertiajs/react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import PhoneInput from '@/Components/ui/PhoneInput';
import { useUrl } from '@/Lib/utils';
import { User, Mail, Smartphone, Lock, Save } from 'lucide-react';

export default function Index({ user }) {
    const url = useUrl();

    const profileForm = useForm({
        name:  user.name  ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
    });

    const passwordForm = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    function submitProfile(e) {
        e.preventDefault();
        profileForm.put(url('/profile'), { preserveScroll: true });
    }

    function submitPassword(e) {
        e.preventDefault();
        passwordForm.put(url('/profile/password'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    }

    const initials = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?';

    return (
        <AppLayout title="Mi Perfil">
            <div className="mx-auto max-w-2xl space-y-5">

                {/* Avatar + nombre */}
                <div
                    className="flex items-center gap-4 rounded-xl p-5"
                    style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                    <div
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
                        style={{ backgroundColor: 'var(--primary)' }}
                    >
                        {initials}
                    </div>
                    <div>
                        <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>{user.name}</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                        {user.phone && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+{user.phone}</p>
                        )}
                    </div>
                </div>

                {/* Datos personales */}
                <Card title="Datos personales" icon={<User size={16} />}>
                    <form onSubmit={submitProfile} className="space-y-4">
                        <Field label="Nombre completo" error={profileForm.errors.name}>
                            <div className="relative">
                                <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <Input
                                    value={profileForm.data.name}
                                    onChange={e => profileForm.setData('name', e.target.value)}
                                    className="pl-9"
                                    placeholder="Tu nombre completo"
                                />
                            </div>
                        </Field>

                        <Field label="Correo electrónico" error={profileForm.errors.email}>
                            <div className="relative">
                                <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <Input
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={e => profileForm.setData('email', e.target.value)}
                                    className="pl-9"
                                    placeholder="tu@correo.com"
                                />
                            </div>
                        </Field>

                        <Field label="Teléfono celular" error={profileForm.errors.phone}>
                            <PhoneInput
                                value={profileForm.data.phone}
                                onChange={v => profileForm.setData('phone', v)}
                            />
                            <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                Se usa para recibir el código OTP por SMS al iniciar sesión.
                            </p>
                        </Field>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={profileForm.processing} size="sm">
                                <Save size={14} /> {profileForm.processing ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Cambiar contraseña */}
                <Card title="Cambiar contraseña" icon={<Lock size={16} />}>
                    <form onSubmit={submitPassword} className="space-y-4">
                        <Field label="Contraseña actual" error={passwordForm.errors.current_password}>
                            <Input
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={e => passwordForm.setData('current_password', e.target.value)}
                                placeholder="••••••••"
                            />
                        </Field>

                        <Field label="Nueva contraseña" error={passwordForm.errors.password}>
                            <Input
                                type="password"
                                value={passwordForm.data.password}
                                onChange={e => passwordForm.setData('password', e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                            />
                        </Field>

                        <Field label="Confirmar contraseña" error={passwordForm.errors.password_confirmation}>
                            <Input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                placeholder="Repite la nueva contraseña"
                            />
                        </Field>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={passwordForm.processing} size="sm">
                                <Lock size={14} /> {passwordForm.processing ? 'Actualizando...' : 'Cambiar contraseña'}
                            </Button>
                        </div>
                    </form>
                </Card>

            </div>
        </AppLayout>
    );
}

function Card({ title, icon, children }) {
    return (
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="mb-4 flex items-center gap-2">
                <span style={{ color: 'var(--primary)' }}>{icon}</span>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h2>
            </div>
            {children}
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
