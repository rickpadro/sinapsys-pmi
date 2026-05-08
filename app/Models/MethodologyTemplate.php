<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MethodologyTemplate extends Model
{
    protected $fillable = [
        'slug', 'name', 'description',
        'default_sections', 'default_fields', 'default_view', 'default_roles',
    ];

    protected function casts(): array
    {
        return [
            'default_sections' => 'array',
            'default_fields'   => 'array',
            'default_roles'    => 'array',
        ];
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'template_id');
    }
}
