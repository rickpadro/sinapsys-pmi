<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $fillable = [
        'user_id',
        'assigned_to',
        'project_id',
        'name',
        'priority',
        'category',
        'due_date',
        'estimated_time',
        'notes',
        'steps',
        'done',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'done' => 'boolean',
            'completed_at' => 'datetime',
            'estimated_time' => 'decimal:2',
            'priority' => 'integer',
            'steps' => 'array',
        ];
    }

    // Relationships

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    // Scopes

    public function scopeOverdue($query)
    {
        return $query->where('done', false)
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->toDateString());
    }

    public function scopeToday($query)
    {
        return $query->where('done', false)
            ->where('due_date', now()->toDateString());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('done', false)
            ->whereNotNull('due_date')
            ->where('due_date', '>', now()->toDateString())
            ->where('due_date', '<=', now()->addDays(7)->toDateString());
    }

    public function scopeCompleted($query)
    {
        return $query->where('done', true);
    }
}
