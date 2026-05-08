<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TwilioSmsService
{
    public function send(string $phone, string $message): bool
    {
        $sid   = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from  = config('services.twilio.from');

        if (!$sid || !$token || !$from) {
            Log::warning('Twilio: credenciales no configuradas');
            return false;
        }

        try {
            $response = Http::timeout(10)
                ->withBasicAuth($sid, $token)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                    'From' => $from,
                    'To'   => '+' . preg_replace('/[^0-9]/', '', $phone),
                    'Body' => $message,
                ]);

            if (!$response->successful()) {
                Log::warning('Twilio: error', ['status' => $response->status(), 'body' => $response->body()]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('Twilio: excepción', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
