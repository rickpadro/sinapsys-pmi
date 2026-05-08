<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectRoleDefinition extends Model
{
    protected $fillable = [
        'project_id', 'name', 'permissions', 'is_default', 'order',
    ];

    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'is_default'  => 'boolean',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(ProjectMember::class);
    }
}
