<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRiskRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'code'            => ['sometimes', 'string', 'max:10'],
            'name'            => ['sometimes', 'required', 'string', 'max:255'],
            'description'     => ['sometimes', 'required', 'string'],
            'probability'     => ['nullable', 'in:low,medium,high'],
            'impact'          => ['nullable', 'in:low,medium,high,critical'],
            'status'          => ['nullable', 'in:open,mitigated,materialized,closed'],
            'mitigation_plan' => ['nullable', 'string'],
            'owner_id'        => ['nullable', 'exists:users,id'],
            'closed_on'       => ['nullable', 'date'],
        ];
    }
}
