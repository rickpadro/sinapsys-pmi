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
            'name'               => ['required', 'string', 'max:255'],
            'type'               => ['required', 'in:saas,idea,negocio,cliente,interno'],
            'priority'           => ['required', 'integer', 'between:1,4'],
            'phase'              => ['nullable', 'integer', 'between:0,4'],
            'impact'             => ['nullable', 'integer', 'between:1,10'],
            'effort'             => ['nullable', 'integer', 'between:1,10'],
            'description'        => ['nullable', 'string'],
            'tags'               => ['nullable', 'array'],
            'tags.*'             => ['string', 'max:50'],
            'viability_mercado'  => ['nullable', 'integer', 'between:1,10'],
            'viability_financiero' => ['nullable', 'integer', 'between:1,10'],
            'viability_tecnico'  => ['nullable', 'integer', 'between:1,10'],
            'viability_riesgo'   => ['nullable', 'integer', 'between:1,10'],
            'color'              => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'url_xampp'          => ['nullable', 'string', 'max:500'],
            'links'              => ['nullable', 'array'],
            'links.*.title'      => ['required', 'string', 'max:255'],
            'links.*.url'        => ['required', 'string', 'max:500'],
            'methodology'        => ['nullable', 'in:pmi,scrum,custom'],
            'default_view'       => ['nullable', 'in:list,board,timeline,calendar'],
            'template_id'        => ['nullable', 'exists:methodology_templates,id'],
        ];
    }
}
