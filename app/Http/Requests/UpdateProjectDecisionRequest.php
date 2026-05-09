<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectDecisionRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'title'              => ['sometimes', 'required', 'string', 'max:255'],
            'description'        => ['sometimes', 'required', 'string'],
            'status'             => ['nullable', 'in:confirmed,pending,rejected'],
            'blocks_description' => ['nullable', 'string', 'max:500'],
            'blocks_section_id'  => ['nullable', 'exists:sections,id'],
            'blocks_milestone_id'=> ['nullable', 'exists:milestones,id'],
            'decided_by'         => ['nullable', 'exists:users,id'],
            'decided_on'         => ['nullable', 'date'],
            'tags'               => ['nullable', 'array'],
            'tags.*'             => ['string', 'max:50'],
        ];
    }
}
