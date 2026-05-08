<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AnthropicService
{
    public function chat(string $systemPrompt, array $messages, int $maxTokens = 300): string
    {
        $response = Http::withHeaders([
            'x-api-key' => config('services.anthropic.key'),
            'anthropic-version' => '2023-06-01',
        ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
            'model' => config('services.anthropic.model', 'claude-sonnet-4-20250514'),
            'max_tokens' => $maxTokens,
            'system' => $systemPrompt,
            'messages' => $messages,
        ]);

        if ($response->failed()) {
            return 'Error al conectar con el asistente. Intenta de nuevo.';
        }

        return $response->json('content.0.text', 'Sin respuesta.');
    }
}
