<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomFieldRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:255'],
            'slug'       => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/'],
            'field_type' => ['required', 'in:text,number,date,select,multi_select,boolean,url'],
            'applies_to' => ['required', 'in:project,section,task,task_step'],
            'options'    => ['nullable', 'array'],
            'required'   => ['boolean'],
        ];
    }
}
