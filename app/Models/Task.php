<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use App\Models\TaskDependency;
use App\Models\TimeEntry;

class Task extends Model
{
    protected $fillable = [
        'user_id',
        'assigned_to',
        'project_id',
        'section_id',
        'name',
        'priority',
        'category',
        'due_date',
        'estimated_time',
        'notes',
        'steps',
        'done',
        'completed_at',
        'status',
        'order_in_section',
    ];

    protected function casts(): array
    {
        return [
            'due_date'         => 'date',
            'done'             => 'boolean',
            'completed_at'     => 'datetime',
            'estimated_time'   => 'decimal:2',
            'priority'         => 'integer',
            'steps'            => 'array',
            'order_in_section' => 'integer',
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

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function taskSteps(): HasMany
    {
        return $this->hasMany(TaskStep::class)->orderBy('order');
    }

    public function customFieldValues(): MorphMany
    {
        return $this->morphMany(CustomFieldValue::class, 'target');
    }

    public function dependencies(): HasMany
    {
        return $this->hasMany(TaskDependency::class);
    }

    public function dependents(): HasMany
    {
        return $this->hasMany(TaskDependency::class, 'depends_on_task_id');
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class)->orderByDesc('logged_on');
    }

    // Accessor: total logged minutes
    public function getTotalLoggedMinutesAttribute(): int
    {
        return $this->timeEntries()->sum('minutes');
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
