import { useForm, Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { useUrl } from '@/Lib/utils';
import { Eye, EyeOff, Mail, Lock, Sun, Moon, Loader2, ShieldCheck, Smartphone, RotateCcw, KeyRound, MessageSquare, Phone } from 'lucide-react';
import PhoneInput from '@/Components/ui/PhoneInput';

export default function Login({ step = 'credentials', maskedEmail, maskedPhone, canResend, resent }) {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    return (
        <>
        <Head title={step === 'otp' ? 'Verificación' : 'Iniciar sesión'} />
        <div
            className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
            style={{ backgroundColor: 'var(--background)' }}
        >
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: 'var(--primary)' }} />
            <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: 'var(--success)' }} />

            <button
                onClick={() => setDarkMode(!darkMode)}
                className="absolute top-4 right-4 rounded-lg p-2"
                style={{ color: 'var(--text-muted)' }}
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {step === 'otp'
                ? <OtpStep maskedEmail={maskedEmail} maskedPhone={maskedPhone} canResend={canResend} resent={resent} />
                : <CredentialsStep />
            }
        </div>
        <style>{`
            @keyframes shake {
                0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
            }
            .animate-shake{animation:shake 0.4s ease-in-out}
            @keyframes slideDown {
                from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)}
            }
            .animate-slideDown{animation:slideDown 0.2s ease-out}
        `}</style>
        </>
    );
}

/* ─── Step 1: email + method selector ─── */
function CredentialsStep() {
    const url  = useUrl();
    const [method, setMethod] = useState(null); // null | 'password' | 'code'
    const [shake, setShake]   = useState(false);

    // Un solo form — evita cursor jump por múltiples estados simultáneos
    const form = useForm({ identifier: '', password: '', remember: false });

    const isPhone        = /^\d/.test(form.data.identifier);
    const IdentifierIcon = isPhone ? Phone : Mail;

    function switchMethod(m) {
        setMethod(m);
        form.clearErrors();
    }

    const hasError = form.errors.identifier || form.errors.password;

    useEffect(() => {
        if (hasError) {
            setShake(true);
            const t = setTimeout(() => setShake(false), 500);
            return () => clearTimeout(t);
        }
    }, [hasError]);

    function submitPassword(e) {
        e.preventDefault();
        form.post(url('/login'));
    }

    function submitCode(e) {
        e.preventDefault();
        form.post(url('/login/send'));
    }

    return (
        <Card shake={shake}>
            {/* Logo */}
            <div className="mb-7 text-center">
                <img
                    src={url('/logo_sinapsys.png')}
                    alt="SinapSYS"
                    className="mx-auto mb-3 h-14"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Gestión de proyectos PMI</p>
            </div>

            {hasError && <ErrorBanner msg={form.errors.identifier || form.errors.password} />}

            {/* Identifier — email o teléfono */}
            <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    Correo electrónico o teléfono
                </label>

                {isPhone ? (
                    <PhoneInput
                        value={form.data.identifier}
                        onChange={(v) => { form.setData('identifier', v); form.clearErrors('identifier'); }}
                        error={!!form.errors.identifier}
                    />
                ) : (
                    <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                            <Mail size={16} />
                        </div>
                        <input
                            type="text"
                            value={form.data.identifier}
                            onChange={(e) => { form.setData('identifier', e.target.value); form.clearErrors('identifier'); }}
                            autoComplete="username"
                            autoFocus
                            placeholder="tu@correo.com"
                            className="w-full rounded-lg py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2"
                            style={inputStyle(!!form.errors.identifier)}
                        />
                    </div>
                )}

                {!isPhone && (
                    <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        ¿Prefieres entrar con teléfono? Escribe solo dígitos.
                    </p>
                )}
            </div>

            {/* Method selector */}
            {method === null && (
                <div className="animate-slideDown space-y-2">
                    <p className="mb-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                        ¿Cómo deseas ingresar?
                    </p>
                    <MethodBtn
                        icon={<KeyRound size={18} />}
                        title="Contraseña"
                        desc="Ingresa con tu contraseña habitual"
                        onClick={() => switchMethod('password')}
                        color="var(--primary)"
                    />
                    <MethodBtn
                        icon={<MessageSquare size={18} />}
                        title="Código de acceso"
                        desc="Recibe un código por email o SMS"
                        onClick={() => switchMethod('code')}
                        color="var(--success)"
                    />
                </div>
            )}

            {/* Password form */}
            {method === 'password' && (
                <form onSubmit={submitPassword} className="animate-slideDown space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                            Contraseña
                        </label>
                        <PasswordInput
                            value={form.data.password}
                            onChange={(v) => { form.clearErrors('password'); form.setData('password', v); }}
                            error={!!form.errors.password}
                        />
                    </div>

                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.data.remember}
                            onChange={(e) => form.setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded"
                            style={{ accentColor: 'var(--primary)' }}
                        />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Recordarme</span>
                    </label>

                    <SubmitBtn disabled={form.processing || !form.data.identifier || !form.data.password} processing={form.processing} color="var(--primary)">
                        Ingresar
                    </SubmitBtn>

                    <BackBtn onClick={() => switchMethod(null)} />
                </form>
            )}

            {/* Code form */}
            {method === 'code' && (
                <form onSubmit={submitCode} className="animate-slideDown space-y-4">
                    <div
                        className="rounded-lg px-4 py-3 text-sm"
                        style={{ backgroundColor: 'rgba(0,202,114,0.06)', border: '1px solid rgba(0,202,114,0.2)', color: 'var(--text-muted)' }}
                    >
                        Recibirás un código de 6 dígitos en tu correo
                        {form.data.identifier && <span style={{ color: 'var(--foreground)' }}> y/o SMS</span>}.
                        No necesitas contraseña.
                    </div>

                    <label className="flex cursor-pointer items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.data.remember}
                            onChange={(e) => form.setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded"
                            style={{ accentColor: 'var(--success)' }}
                        />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Recordarme</span>
                    </label>

                    <SubmitBtn disabled={form.processing || !form.data.identifier} processing={form.processing} color="var(--success)">
                        Enviar código
                    </SubmitBtn>

                    <BackBtn onClick={() => switchMethod(null)} />
                </form>
            )}

            <Footer />
        </Card>
    );
}

/* ─── Method button ─── */
function MethodBtn({ icon, title, desc, onClick, color }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-all hover:scale-[1.01]"
            style={{ backgroundColor: 'var(--background)', border: `1.5px solid var(--border)` }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
            <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: color + '18', color }}
            >
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
            <svg className="ml-auto shrink-0 h-4 w-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );
}

/* ─── Back button ─── */
function BackBtn({ onClick }) {
    return (
        <button type="button" onClick={onClick} className="w-full text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            ← Volver
        </button>
    );
}

/* ─── Step 2: OTP input ─── */
function OtpStep({ maskedEmail, maskedPhone, canResend: initialCanResend, resent }) {
    const url = useUrl();
    const { data, setData, post, processing, errors, clearErrors } = useForm({ code: '', phone: '' });
    const [digits, setDigits]     = useState(['', '', '', '', '', '']);
    const [canResend, setCanResend] = useState(initialCanResend);
    const [countdown, setCountdown] = useState(initialCanResend ? 0 : 60);
    const [resentOk, setResentOk]  = useState(!!resent);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (countdown <= 0) { setCanResend(true); return; }
        const t = setInterval(() => setCountdown(c => { if (c <= 1) { setCanResend(true); return 0; } return c - 1; }), 1000);
        return () => clearInterval(t);
    }, [countdown]);

    useEffect(() => { setData('code', digits.join('')); }, [digits]);

    function handleDigitChange(index, value) {
        if (!/^\d*$/.test(value)) return;
        const updated = [...digits];
        updated[index] = value.slice(-1);
        setDigits(updated);
        clearErrors('code');
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }

    function handleKeyDown(index, e) {
        if (e.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === 'ArrowLeft'  && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
    }

    function handlePaste(e) {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const updated = ['', '', '', '', '', ''];
        pasted.split('').forEach((d, i) => { if (i < 6) updated[i] = d; });
        setDigits(updated);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (data.code.length !== 6) return;
        clearErrors();
        post(url('/login/otp'));
    }

    function handleResend(e) {
        e.preventDefault();
        setCanResend(false);
        setCountdown(60);
        setResentOk(false);
        post(url('/login/resend'), {
            onSuccess: () => { setDigits(['', '', '', '', '', '']); setResentOk(true); inputRefs.current[0]?.focus(); },
        });
    }

    return (
        <Card>
            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(0,202,114,0.1)' }}>
                    <ShieldCheck size={32} style={{ color: 'var(--success)' }} />
                </div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Revisa tu correo</h1>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Código enviado a <span className="font-medium" style={{ color: 'var(--foreground)' }}>{maskedEmail}</span>
                </p>
                {maskedPhone && (
                    <p className="mt-1 flex items-center justify-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Smartphone size={12} /> También por SMS a {maskedPhone}
                    </p>
                )}
            </div>

            {resentOk && (
                <div className="mb-4 rounded-lg px-3 py-2.5 text-center text-sm"
                    style={{ backgroundColor: 'rgba(0,202,114,0.08)', border: '1px solid rgba(0,202,114,0.2)', color: 'var(--success)' }}>
                    Código reenviado.
                </div>
            )}

            {errors.code && <ErrorBanner msg={errors.code} />}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* 6-digit boxes */}
                <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
                    {digits.map((d, i) => (
                        <input
                            key={i}
                            ref={el => inputRefs.current[i] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={d}
                            onChange={(e) => handleDigitChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            autoFocus={i === 0}
                            className="h-12 w-10 rounded-xl text-center text-lg font-bold outline-none transition-all focus:ring-2"
                            style={{
                                backgroundColor: 'var(--background)',
                                border: `2px solid ${errors.code ? 'var(--destructive)' : d ? 'var(--success)' : 'var(--border)'}`,
                                color: 'var(--foreground)',
                                '--tw-ring-color': 'var(--success)',
                            }}
                        />
                    ))}
                </div>

                {/* Add phone if missing */}
                {!maskedPhone && (
                    <div>
                        <label className="mb-1.5 block text-xs" style={{ color: 'var(--text-muted)' }}>
                            Celular (opcional — para recibir SMS en próximos accesos)
                        </label>
                        <PhoneInput
                            value={data.phone}
                            onChange={(v) => setData('phone', v)}
                        />
                    </div>
                )}

                <SubmitBtn disabled={processing || data.code.length !== 6} processing={processing} color="var(--success)">
                    Ingresar
                </SubmitBtn>
            </form>

            {/* Resend */}
            <div className="mt-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                {canResend ? (
                    <button onClick={handleResend} disabled={processing} className="inline-flex items-center gap-1 font-medium" style={{ color: 'var(--primary)' }}>
                        <RotateCcw size={13} /> Reenviar código
                    </button>
                ) : (
                    <span>Reenviar en {countdown}s</span>
                )}
            </div>

            <div className="mt-3 text-center">
                <a href={url('/login')} className="text-xs" style={{ color: 'var(--text-muted)' }}>← Volver al inicio de sesión</a>
            </div>

            <Footer />
        </Card>
    );
}

/* ─── Shared primitives ─── */

function Card({ children, shake = false }) {
    return (
        <div
            className={`relative w-full max-w-[420px] rounded-xl p-6 sm:p-8 ${shake ? 'animate-shake' : ''}`}
            style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-modal)', border: '1px solid var(--border)' }}
        >
            {children}
        </div>
    );
}

function PasswordInput({ value, onChange, error }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                <Lock size={16} />
            </div>
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2"
                style={inputStyle(error)}
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} tabIndex={-1}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
}

function ErrorBanner({ msg }) {
    return (
        <div className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm"
            style={{ backgroundColor: 'rgba(228,66,88,0.08)', border: '1px solid rgba(228,66,88,0.2)', color: 'var(--destructive)' }}>
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {msg}
        </div>
    );
}

function SubmitBtn({ children, disabled, processing, color = 'var(--primary)' }) {
    return (
        <button
            type="submit"
            disabled={disabled}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: color }}
        >
            {processing ? <><Loader2 size={16} className="animate-spin" /> Procesando...</> : children}
        </button>
    );
}

function Footer() {
    return <p className="mt-6 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>SinapSYS Ecosistemas &copy; {new Date().getFullYear()}</p>;
}

function inputStyle(hasError) {
    return {
        backgroundColor: 'var(--background)',
        border: `1px solid ${hasError ? 'var(--destructive)' : 'var(--border)'}`,
        color: 'var(--foreground)',
        '--tw-ring-color': 'var(--primary)',
    };
}
