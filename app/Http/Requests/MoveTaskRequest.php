<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MoveTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'task_id'          => ['required', 'integer', 'exists:tasks,id'],
            'section_id'       => ['required', 'integer', 'exists:sections,id'],
            'order_in_section' => ['required', 'integer', 'min:0'],
        ];
    }
}
