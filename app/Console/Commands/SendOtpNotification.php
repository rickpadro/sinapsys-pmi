<?php

namespace App\Console\Commands;

use App\Mail\OtpMail;
use App\Models\LoginOtp;
use App\Models\User;
use App\Services\TwilioSmsService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendOtpNotification extends Command
{
    protected $signature   = 'otp:send {userId} {code}';
    protected $description = 'Envía el OTP por email y SMS en background';

    public function handle(): void
    {
        $user = User::find($this->argument('userId'));
        $code = $this->argument('code');
        if (!$user) return;
        $this->sendDirect($user, $code);
    }

    public function sendDirect(User $user, string $code): void
    {
        try {
            Mail::to($user->email)->send(new OtpMail($user, $code));
        } catch (\Throwable $e) {
            \Log::error('OTP email error: ' . $e->getMessage());
        }

        if ($user->phone) {
            try {
                app(TwilioSmsService::class)->send($user->phone, "SinapSYS codigo: {$code}");
            } catch (\Throwable $e) {
                \Log::error('OTP SMS error: ' . $e->getMessage());
            }
        }
    }
}
