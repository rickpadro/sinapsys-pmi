<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id'  => ['nullable', 'exists:projects,id'],
            'section_id'  => ['nullable', 'exists:sections,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'priority' => ['required', 'integer', 'between:1,4'],
            'category' => ['required', 'in:personal,admin,cliente,desarrollo,soporte'],
            'due_date' => ['required', 'date'],
            'estimated_time' => ['nullable', 'numeric', 'min:0', 'max:999'],
            'notes' => ['required', 'string'],
            'steps' => ['nullable', 'array'],
            'steps.*.text' => ['required', 'string', 'max:500'],
            'steps.*.done' => ['boolean'],
        ];
    }
}
