<?php

namespace App\Services;

use App\Models\CustomField;
use App\Models\CustomFieldValue;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class CustomFieldResolver
{
    public function valuesFor(Model $target): array
    {
        return CustomFieldValue::where('target_type', $target->getMorphClass())
            ->where('target_id', $target->getKey())
            ->with('customField')
            ->get()
            ->mapWithKeys(fn ($v) => [$v->customField->slug => $this->cast($v)])
            ->toArray();
    }

    public function set(Model $target, CustomField $field, mixed $value): CustomFieldValue
    {
        return CustomFieldValue::updateOrCreate(
            [
                'custom_field_id' => $field->id,
                'target_type'     => $target->getMorphClass(),
                'target_id'       => $target->getKey(),
            ],
            $this->payloadFor($field, $value)
        );
    }

    private function cast(CustomFieldValue $v): mixed
    {
        return match ($v->customField->field_type) {
            'number'       => is_numeric($v->value) ? (float) $v->value : null,
            'boolean'      => filter_var($v->value, FILTER_VALIDATE_BOOLEAN),
            'date'         => $v->value ? Carbon::parse($v->value) : null,
            'multi_select' => $v->value_json ?? [],
            default        => $v->value,
        };
    }

    private function payloadFor(CustomField $field, mixed $value): array
    {
        if ($field->field_type === 'multi_select') {
            return ['value_json' => is_array($value) ? $value : [], 'value' => null];
        }

        return ['value' => is_scalar($value) ? (string) $value : null, 'value_json' => null];
    }
}
