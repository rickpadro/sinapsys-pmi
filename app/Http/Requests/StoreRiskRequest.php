<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreRiskRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'code'            => ['required', 'string', 'max:10'],
            'name'            => ['required', 'string', 'max:255'],
            'description'     => ['required', 'string'],
            'probability'     => ['required', 'in:low,medium,high'],
            'impact'          => ['required', 'in:low,medium,high,critical'],
            'mitigation_plan' => ['nullable', 'string'],
            'owner_id'        => ['nullable', 'exists:users,id'],
            'identified_on'   => ['required', 'date'],
        ];
    }
}
