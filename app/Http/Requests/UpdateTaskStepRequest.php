<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskStepRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'description' => ['sometimes', 'required', 'string', 'max:500'],
            'done'        => ['sometimes', 'boolean'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'due_date'    => ['nullable', 'date'],
            'order'       => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
