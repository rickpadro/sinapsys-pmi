<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StorePushSubscriptionRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'endpoint' => ['required', 'string', 'max:2048'],
            'p256dh'   => ['nullable', 'string', 'max:255'],
            'auth'     => ['nullable', 'string', 'max:255'],
        ];
    }
}
