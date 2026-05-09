<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Milestone extends Model {
    protected $fillable = ['project_id','name','description','target_date','actual_date','status','criticality','color','order'];

    protected function casts(): array {
        return ['target_date' => 'date', 'actual_date' => 'date'];
    }

    public function project(): BelongsTo { return $this->belongsTo(Project::class); }
    public function linkedTasks(): HasMany { return $this->hasMany(Task::class, 'linked_milestone_id'); }
    public function decisions(): HasMany { return $this->hasMany(ProjectDecision::class, 'blocks_milestone_id'); }

    public function isAtRisk(): bool { return $this->status === 'at_risk'; }
    public function isMet(): bool    { return $this->status === 'met' || $this->actual_date !== null; }

    public function daysUntil(): int {
        return today()->diffInDays($this->target_date, false);
    }
}
