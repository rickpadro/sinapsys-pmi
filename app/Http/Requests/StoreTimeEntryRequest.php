<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTimeEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'minutes'     => ['required', 'integer', 'min:1', 'max:1440'],
            'logged_on'   => ['required', 'date', 'before_or_equal:today'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'minutes.max'                => 'Máximo 24 horas (1440 minutos) por entrada.',
            'logged_on.before_or_equal'  => 'No puedes registrar tiempo futuro.',
        ];
    }
}
