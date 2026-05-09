<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeEntry extends Model
{
    protected $fillable = ['task_id', 'user_id', 'minutes', 'logged_on', 'description'];

    protected function casts(): array
    {
        return ['logged_on' => 'date'];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Helper: minutes to "2h 30m" format
    public function getFormattedDurationAttribute(): string
    {
        $h = intdiv($this->minutes, 60);
        $m = $this->minutes % 60;
        return $h > 0 ? "{$h}h " . ($m > 0 ? "{$m}m" : '') : "{$m}m";
    }
}
