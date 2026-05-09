<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreMemberCapacityRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'section_id'              => ['required', 'exists:sections,id'],
            'dedication_pct'          => ['required', 'numeric', 'min:0', 'max:100'],
            'available_hours_per_week'=> ['nullable', 'integer', 'min:1', 'max:80'],
            'notes'                   => ['nullable', 'string', 'max:500'],
        ];
    }
}
