<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMilestoneRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name'        => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'target_date' => ['sometimes', 'required', 'date'],
            'actual_date' => ['nullable', 'date'],
            'status'      => ['nullable', 'in:planned,at_risk,met,missed'],
            'criticality' => ['nullable', 'in:low,medium,high,critical'],
            'color'       => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'order'       => ['integer', 'min:0'],
        ];
    }
}
