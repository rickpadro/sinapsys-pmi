<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpsertCustomFieldValueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'custom_field_id' => ['required', 'integer', 'exists:custom_fields,id'],
            'target_type'     => ['required', 'string', 'in:project,section,task,task_step'],
            'target_id'       => ['required', 'integer'],
            'value'           => ['nullable', 'string', 'max:5000'],
            'value_json'      => ['nullable', 'array'],
        ];
    }
}
