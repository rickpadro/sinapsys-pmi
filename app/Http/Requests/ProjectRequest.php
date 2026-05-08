<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:saas,idea,negocio,cliente,interno'],
            'priority' => ['required', 'integer', 'between:1,4'],
            'phase' => ['required', 'integer', 'between:0,4'],
            'impact' => ['required', 'integer', 'between:1,10'],
            'effort' => ['required', 'integer', 'between:1,10'],
            'description' => ['nullable', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'viability_mercado' => ['required', 'integer', 'between:1,10'],
            'viability_financiero' => ['required', 'integer', 'between:1,10'],
            'viability_tecnico' => ['required', 'integer', 'between:1,10'],
            'viability_riesgo' => ['required', 'integer', 'between:1,10'],
            'color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'url_xampp' => ['nullable', 'string', 'max:500'],
            'links' => ['nullable', 'array'],
            'links.*.title' => ['required', 'string', 'max:255'],
            'links.*.url' => ['required', 'string', 'max:500'],
        ];
    }
}
