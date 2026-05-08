<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Section extends Model
{
    protected $fillable = [
        'project_id', 'name', 'description', 'sprint_goal',
        'start_date', 'end_date', 'color', 'status', 'order',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class)->orderBy('order_in_section');
    }

    public function customFieldValues(): MorphMany
    {
        return $this->morphMany(CustomFieldValue::class, 'target');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    // Métricas para Burndown (Scrum)
    public function totalStoryPoints(): int
    {
        return (int) $this->customFieldValues()
            ->whereHas('customField', fn ($q) => $q->where('slug', 'story_points'))
            ->sum('value');
    }
}
