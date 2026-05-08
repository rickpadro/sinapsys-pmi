<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskStep extends Model
{
    protected $fillable = [
        'task_id', 'description', 'done', 'order',
        'assigned_to', 'due_date', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'done'         => 'boolean',
            'due_date'     => 'date',
            'completed_at' => 'datetime',
        ];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
