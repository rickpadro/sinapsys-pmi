<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiskMitigation extends Model {
    protected $fillable = ['risk_id', 'task_id', 'rationale'];

    public function risk(): BelongsTo { return $this->belongsTo(Risk::class); }
    public function task(): BelongsTo { return $this->belongsTo(Task::class); }
}
