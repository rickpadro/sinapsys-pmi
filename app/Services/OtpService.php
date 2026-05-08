<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\LoginOtp;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    public function generate(User $user): string
    {
        LoginOtp::where('user_id', $user->id)->whereNull('used_at')->delete();

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        LoginOtp::create([
            'user_id'    => $user->id,
            'code_hash'  => hash('sha256', $code),
            'expires_at' => now()->addMinutes(10),
        ]);

        // Email
        try {
            Mail::to($user->email)->send(new OtpMail($user, $code));
        } catch (\Throwable $e) {
            Log::error('OTP email error: ' . $e->getMessage());
        }

        // SMS vía Twilio
        if ($user->phone) {
            try {
                app(TwilioSmsService::class)->send(
                    $user->phone,
                    "SinapSYS codigo: {$code}"
                );
            } catch (\Throwable $e) {
                Log::error('OTP SMS error: ' . $e->getMessage());
            }
        }

        return $code;
    }

    public function verify(User $user, string $code): bool
    {
        $otp = LoginOtp::where('user_id', $user->id)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->where('attempts', '<', 3)
            ->latest()
            ->first();

        if (!$otp) return false;

        $otp->increment('attempts');

        if (!hash_equals($otp->code_hash, hash('sha256', $code))) {
            return false;
        }

        $otp->update(['used_at' => now()]);
        return true;
    }

    public function canResend(User $user): bool
    {
        $latest = LoginOtp::where('user_id', $user->id)
            ->whereNull('used_at')
            ->latest()
            ->first();

        return !$latest || $latest->created_at->diffInSeconds(now()) >= 60;
    }
}
