<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberCapacity extends Model {
    protected $fillable = ['project_member_id', 'section_id', 'dedication_pct', 'available_hours_per_week', 'notes'];

    protected function casts(): array {
        return ['dedication_pct' => 'decimal:2'];
    }

    public function member(): BelongsTo  { return $this->belongsTo(ProjectMember::class, 'project_member_id'); }
    public function section(): BelongsTo { return $this->belongsTo(Section::class); }

    public function availableHoursForWeeks(int $weeks): float {
        return ($this->dedication_pct / 100) * $this->available_hours_per_week * $weeks;
    }
}
