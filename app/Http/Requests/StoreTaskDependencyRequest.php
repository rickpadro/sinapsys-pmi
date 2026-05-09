<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskDependencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'depends_on_task_id' => ['required', 'integer', 'exists:tasks,id'],
            'type'               => ['required', 'in:finish_to_start,start_to_start,finish_to_finish'],
            'lag_days'           => ['integer', 'min:0', 'max:365'],
        ];
    }
}
