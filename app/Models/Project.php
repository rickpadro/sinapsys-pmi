<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'priority',
        'phase',
        'impact',
        'effort',
        'description',
        'tags',
        'viability_mercado',
        'viability_financiero',
        'viability_tecnico',
        'viability_riesgo',
        'phase_tasks',
        'color',
        'url_xampp',
        'links',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'phase_tasks' => 'array',
            'links' => 'array',
            'priority' => 'integer',
            'phase' => 'integer',
            'impact' => 'integer',
            'effort' => 'integer',
            'viability_mercado' => 'integer',
            'viability_financiero' => 'integer',
            'viability_tecnico' => 'integer',
            'viability_riesgo' => 'integer',
        ];
    }

    // Relationships

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function aiMessages(): HasMany
    {
        return $this->hasMany(AiMessage::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function getRoleFor(int $userId): ?string
    {
        if ($this->user_id === $userId) return 'owner';

        return $this->members()
            ->where('user_id', $userId)
            ->whereNotNull('accepted_at')
            ->value('role');
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->whereIn('phase', [0, 1, 2, 3]);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPriority($query, int $priority)
    {
        return $query->where('priority', $priority);
    }

    // Accessors

    public function getPriorityScoreAttribute(): float
    {
        return $this->effort > 0 ? round($this->impact / $this->effort, 2) : 0;
    }
}
