<?php

namespace App\Models;

use App\Models\MemberCapacity;
use App\Models\ProjectDecision;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', 'name', 'description', 'sprint_goal',
        'start_date', 'end_date', 'color', 'status', 'order', 'type',
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

    public function decisions(): HasMany
    {
        return $this->hasMany(ProjectDecision::class, 'blocks_section_id');
    }

    public function memberCapacities(): HasMany
    {
        return $this->hasMany(MemberCapacity::class);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    public function scopeSprints($query)
    {
        return $query->where('type', 'sprint');
    }

    public function scopeContinuous($query)
    {
        return $query->where('type', 'continuous');
    }

    // Métricas para Burndown (Scrum)
    public function totalStoryPoints(): int
    {
        return (int) $this->customFieldValues()
            ->whereHas('customField', fn ($q) => $q->where('slug', 'story_points'))
            ->sum('value');
    }
}
