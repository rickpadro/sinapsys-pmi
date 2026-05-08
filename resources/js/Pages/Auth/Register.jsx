import { useForm, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useUrl } from '@/Lib/utils';
import { Eye, EyeOff, User, Lock, Sun, Moon, Loader2 } from 'lucide-react';
import PhoneInput from '@/Components/ui/PhoneInput';

const ROLE_LABELS = {
    manager:     'Gerente',
    contributor: 'Colaborador',
    viewer:      'Observador',
};

export default function Register({ token, email, projectName, projectColor, inviterName, role }) {
    const url = useUrl();
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name:                  '',
        phone:                 '',
        password:              '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    function handleSubmit(e) {
        e.preventDefault();
        clearErrors();
        post(url(`/register/${token}`));
    }

    const hasError = errors.name || errors.password || errors.password_confirmation;

    return (
        <>
        <Head title="Crear cuenta" />
        <div
            className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
            style={{ backgroundColor: 'var(--background)' }}
        >
            {/* Background decoration */}
            <div
                className="absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-20 blur-3xl"
                style={{ backgroundColor: projectColor || 'var(--primary)' }}
            />
            <div
                className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full opacity-15 blur-3xl"
                style={{ backgroundColor: 'var(--success)' }}
            />

            {/* Dark mode toggle */}
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="absolute top-4 right-4 rounded-lg p-2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Card */}
            <div
                className="relative w-full max-w-[400px] rounded-xl p-6 sm:p-8"
                style={{
                    backgroundColor: 'var(--surface)',
                    boxShadow: 'var(--shadow-modal)',
                    border: '1px solid var(--border)',
                }}
            >
                {/* Logo */}
                <div className="mb-6 text-center">
                    <img
                        src={url('/logo_sinapsys.png')}
                        alt="SinapSYS"
                        className="mx-auto mb-3 h-14"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>

                {/* Invitation context */}
                <div
                    className="mb-6 rounded-lg p-4"
                    style={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <div className="mb-1 flex items-center gap-2">
                        <div
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: projectColor || 'var(--primary)' }}
                        />
                        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                            {projectName}
                        </span>
                        <span
                            className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                                backgroundColor: `${projectColor || 'var(--primary)'}22`,
                                color: projectColor || 'var(--primary)',
                            }}
                        >
                            {ROLE_LABELS[role] ?? role}
                        </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--foreground)' }}>{inviterName}</strong> te invitó a colaborar.
                        Crea tu cuenta para unirte.
                    </p>
                </div>

                {/* Error banner */}
                {hasError && (
                    <div
                        className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm"
                        style={{
                            backgroundColor: 'rgba(228,66,88,0.08)',
                            border: '1px solid rgba(228,66,88,0.2)',
                            color: 'var(--destructive)',
                        }}
                    >
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.name || errors.password || errors.password_confirmation}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email — readonly */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            readOnly
                            className="w-full rounded-lg px-3 py-2.5 text-sm"
                            style={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-muted)',
                                cursor: 'not-allowed',
                                opacity: 0.75,
                            }}
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                            Nombre completo
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                <User size={16} />
                            </div>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => { clearErrors('name'); setData('name', e.target.value); }}
                                autoComplete="name"
                                autoFocus
                                placeholder="Tu nombre"
                                className="w-full rounded-lg py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:ring-2"
                                style={{
                                    backgroundColor: 'var(--background)',
                                    border: `1px solid ${errors.name ? 'var(--destructive)' : 'var(--border)'}`,
                                    color: 'var(--foreground)',
                                    '--tw-ring-color': 'var(--primary)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                            Celular <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional — para recibir OTP por SMS)</span>
                        </label>
                        <PhoneInput
                            value={data.phone}
                            onChange={(v) => setData('phone', v)}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                            Contraseña
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                <Lock size={16} />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => { clearErrors('password'); setData('password', e.target.value); }}
                                autoComplete="new-password"
                                placeholder="Mínimo 8 caracteres"
                                className="w-full rounded-lg py-2.5 pl-10 pr-10 text-sm outline-none transition-all focus:ring-2"
                                style={{
                                    backgroundColor: 'var(--background)',
                                    border: `1px solid ${errors.password ? 'var(--destructive)' : 'var(--border)'}`,
                                    color: 'var(--foreground)',
                                    '--tw-ring-color': 'var(--primary)',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm password */}
                    <div>
                        <label htmlFor="password_confirmation" className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                <Lock size={16} />
                            </div>
                            <input
                                id="password_confirmation"
                                type={showConfirm ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(e) => { clearErrors('password_confirmation'); setData('password_confirmation', e.target.value); }}
                                autoComplete="new-password"
                                placeholder="Repite tu contraseña"
                                className="w-full rounded-lg py-2.5 pl-10 pr-10 text-sm outline-none transition-all focus:ring-2"
                                style={{
                                    backgroundColor: 'var(--background)',
                                    border: `1px solid ${errors.password_confirmation ? 'var(--destructive)' : 'var(--border)'}`,
                                    color: 'var(--foreground)',
                                    '--tw-ring-color': 'var(--primary)',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing || !data.name || !data.password || !data.password_confirmation}
                        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: projectColor || 'var(--primary)' }}
                    >
                        {processing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Creando cuenta...
                            </>
                        ) : (
                            'Crear cuenta y unirme'
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    SinapSYS Ecosistemas &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
        </>
    );
}
