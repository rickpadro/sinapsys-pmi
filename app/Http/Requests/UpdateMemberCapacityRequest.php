<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMemberCapacityRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'dedication_pct'          => ['nullable', 'numeric', 'min:0', 'max:100'],
            'available_hours_per_week'=> ['nullable', 'integer', 'min:1', 'max:80'],
            'notes'                   => ['nullable', 'string', 'max:500'],
        ];
    }
}
