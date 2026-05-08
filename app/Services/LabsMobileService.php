<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LabsMobileService
{
    public function send(string $phone, string $message): bool
    {
        $username = config('services.labsmobile.username');
        $token    = config('services.labsmobile.token');
        $sender   = config('services.labsmobile.sender', 'SinapSYS');

        if (!$username || !$token) {
            Log::warning('LabsMobile: credenciales no configuradas');
            return false;
        }

        try {
            $payload = [
                'message'   => $message,
                'recipient' => [['msisdn' => $this->normalize($phone)]],
            ];

            // Solo incluir tpoa si está configurado y no vacío
            if ($sender) {
                $payload['tpoa'] = $sender;
            }

            $response = Http::timeout(5)->withBasicAuth($username, $token)
                ->post('https://api.labsmobile.com/json/send', $payload);

            if (!$response->successful()) {
                Log::warning('LabsMobile: error al enviar SMS', ['status' => $response->status(), 'body' => $response->body()]);
            }

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error('LabsMobile: excepción', ['error' => $e->getMessage()]);
            return false;
        }
    }

    private function normalize(string $phone): string
    {
        return preg_replace('/[^0-9]/', '', $phone);
    }
}
