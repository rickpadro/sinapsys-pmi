<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Models\LoginOtp;

Route::get('/debug/login', function () {
    $results = [];

    // 1. Info del entorno
    $results['env'] = [
        'PHP_BINARY'     => PHP_BINARY,
        'PHP_OS'         => PHP_OS_FAMILY,
        'MAIL_MAILER'    => config('mail.default'),
        'MAIL_HOST'      => config('mail.mailers.smtp.host'),
        'MAIL_PORT'      => config('mail.mailers.smtp.port'),
        'MAIL_SCHEME'    => config('mail.mailers.smtp.scheme'),
        'MAIL_USERNAME'  => config('mail.mailers.smtp.username'),
        'MAIL_FROM'      => config('mail.from.address'),
        'SESSION_DRIVER' => config('session.driver'),
        'APP_URL'        => config('app.url'),
    ];

    // 2. Usuario
    $user = User::find(1);
    $results['user'] = $user ? [
        'id'    => $user->id,
        'email' => $user->email,
        'phone' => $user->phone,
    ] : 'NO ENCONTRADO';

    // 3. Test SMTP
    try {
        $t = microtime(true);
        Mail::to($user->email)->send(new App\Mail\OtpMail($user, '000000'));
        $results['smtp'] = ['status' => 'OK', 'time' => round(microtime(true) - $t, 2) . 's'];
    } catch (\Throwable $e) {
        $results['smtp'] = ['status' => 'ERROR', 'message' => $e->getMessage()];
    }

    // 4. Test sesión
    session(['debug_test' => 'ok_' . time()]);
    session()->save();
    $results['session'] = [
        'id'         => session()->getId(),
        'driver'     => config('session.driver'),
        'value_set'  => session('debug_test'),
    ];

    // 5. Test OTP completo
    try {
        $t = microtime(true);
        $code = app(App\Services\OtpService::class)->generate($user);
        $otp  = LoginOtp::where('user_id', $user->id)->latest()->first();
        $results['otp'] = [
            'status'     => 'OK',
            'code'       => $code,
            'time'       => round(microtime(true) - $t, 2) . 's',
            'db_saved'   => $otp ? 'SI (expires: ' . $otp->expires_at . ')' : 'NO',
        ];
    } catch (\Throwable $e) {
        $results['otp'] = ['status' => 'ERROR', 'message' => $e->getMessage()];
    }

    return response()->json($results, 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
});

Route::get('/debug/session-check', function () {
    return response()->json([
        'session_id'    => session()->getId(),
        'otp_user_id'   => session('otp_user_id'),
        'all_session'   => session()->all(),
    ], 200, [], JSON_PRETTY_PRINT);
});
