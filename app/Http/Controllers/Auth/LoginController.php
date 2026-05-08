<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    // Método contraseña — login directo sin OTP
    public function store(Request $request)
    {
        $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
            'password'   => ['required'],
        ]);

        $user = $this->findUser($request->identifier);

        if (!$user || !Auth::attempt(['email' => $user->email, 'password' => $request->password], $request->boolean('remember'))) {
            return back()->withErrors(['identifier' => 'Credenciales incorrectas.']);
        }

        $request->session()->regenerate();
        return redirect()->intended('/');
    }

    // Método passwordless — envía OTP sin contraseña
    public function sendOtp(Request $request)
    {
        $request->validate(['identifier' => ['required', 'string', 'max:255']]);

        $user = $this->findUser($request->identifier);

        if (!$user) {
            return back()->withErrors(['identifier' => 'No encontramos una cuenta con ese correo o teléfono.']);
        }

        try {
            app(OtpService::class)->generate($user);
        } catch (\Throwable $e) {
            \Log::error('OTP send error: ' . $e->getMessage());
            return back()->withErrors(['identifier' => 'Error al enviar el código. Intenta de nuevo.']);
        }

        $request->session()->put('otp_user_id', $user->id);
        $request->session()->put('otp_remember', $request->boolean('remember'));
        $request->session()->save();

        return redirect()->route('login.otp');
    }

    public function create(Request $request)
    {
        if ($request->session()->has('otp_user_id')) {
            return redirect()->route('login.otp');
        }

        return Inertia::render('Auth/Login');
    }

    public function showOtp(Request $request)
    {
        $userId = $request->session()->get('otp_user_id');
        if (!$userId) return redirect()->route('login');

        $user = User::findOrFail($userId);

        return Inertia::render('Auth/Login', [
            'step'        => 'otp',
            'maskedEmail' => $this->maskEmail($user->email),
            'maskedPhone' => $user->phone ? $this->maskPhone($user->phone) : null,
            'canResend'   => app(OtpService::class)->canResend($user),
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $userId = $request->session()->get('otp_user_id');
        if (!$userId) return redirect()->route('login');

        $request->validate([
            'code'  => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user = User::findOrFail($userId);

        if (!app(OtpService::class)->verify($user, $request->code)) {
            return back()->withErrors(['code' => 'Código incorrecto o expirado.']);
        }

        if ($request->filled('phone') && !$user->phone) {
            $user->update(['phone' => preg_replace('/[^0-9]/', '', $request->phone)]);
        }

        $remember = $request->session()->pull('otp_remember', false);
        $request->session()->forget('otp_user_id');

        Auth::login($user, $remember);
        $request->session()->regenerate();

        return redirect()->intended('/');
    }

    public function resendOtp(Request $request)
    {
        $userId = $request->session()->get('otp_user_id');
        if (!$userId) return redirect()->route('login');

        $user    = User::findOrFail($userId);
        $service = app(OtpService::class);

        if (!$service->canResend($user)) {
            return Inertia::render('Auth/Login', [
                'step'        => 'otp',
                'maskedEmail' => $this->maskEmail($user->email),
                'maskedPhone' => $user->phone ? $this->maskPhone($user->phone) : null,
                'canResend'   => false,
                'error'       => 'Espera un momento antes de reenviar.',
            ]);
        }

        $service->generate($user);

        return Inertia::render('Auth/Login', [
            'step'        => 'otp',
            'maskedEmail' => $this->maskEmail($user->email),
            'maskedPhone' => $user->phone ? $this->maskPhone($user->phone) : null,
            'canResend'   => false,
            'resent'      => true,
        ]);
    }

    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }

    // ─── Helpers ───

    private function findUser(string $input): ?User
    {
        $input = trim($input);

        // Email
        if (filter_var($input, FILTER_VALIDATE_EMAIL)) {
            return User::where('email', $input)->first();
        }

        // Teléfono — normalizar a solo dígitos
        $digits = preg_replace('/[^0-9]/', '', $input);
        if (strlen($digits) < 7) return null;

        // Intentar coincidencia exacta primero
        $user = User::where('phone', $digits)->first();
        if ($user) return $user;

        // Coincidencia por últimos 10 dígitos (maneja variaciones de código de país)
        return User::where('phone', 'like', '%' . substr($digits, -10))->first();
    }

    private function maskEmail(string $email): string
    {
        [$local, $domain] = explode('@', $email);
        $visible = substr($local, 0, min(2, strlen($local)));
        return $visible . str_repeat('*', max(0, strlen($local) - 2)) . '@' . $domain;
    }

    private function maskPhone(string $phone): string
    {
        $clean = preg_replace('/[^0-9]/', '', $phone);
        return '***-***-' . substr($clean, -4);
    }
}
