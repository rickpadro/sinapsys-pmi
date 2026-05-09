<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderTaskStepsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order'   => ['required', 'array', 'min:1'],
            'order.*' => ['integer', 'exists:task_steps,id'],
        ];
    }
}
