<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class LinkTasksToMilestoneRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'task_ids'   => ['required', 'array', 'min:1'],
            'task_ids.*' => ['integer', 'exists:tasks,id'],
        ];
    }
}
