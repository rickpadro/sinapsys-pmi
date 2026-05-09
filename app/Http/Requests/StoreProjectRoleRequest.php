<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                         => ['required', 'string', 'max:50'],
            'permissions'                  => ['required', 'array'],
            'permissions.can_edit'         => ['boolean'],
            'permissions.can_invite'       => ['boolean'],
            'permissions.can_delete'       => ['boolean'],
            'permissions.can_view_reports' => ['boolean'],
        ];
    }
}
