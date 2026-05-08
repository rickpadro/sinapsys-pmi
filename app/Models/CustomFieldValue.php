<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CustomFieldValue extends Model
{
    protected $fillable = [
        'custom_field_id', 'target_type', 'target_id', 'value', 'value_json',
    ];

    protected function casts(): array
    {
        return [
            'value_json' => 'array',
        ];
    }

    public function customField(): BelongsTo
    {
        return $this->belongsTo(CustomField::class);
    }

    public function target(): MorphTo
    {
        return $this->morphTo();
    }

    // Devuelve el valor en el tipo correcto según field_type
    public function resolvedValue(): mixed
    {
        $type = $this->customField?->field_type;
        return match ($type) {
            'multi_select' => $this->value_json ?? [],
            'boolean'      => (bool) $this->value,
            'number'       => $this->value !== null ? (float) $this->value : null,
            default        => $this->value,
        };
    }
}
