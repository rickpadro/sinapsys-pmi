<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDecision extends Model {
    protected $fillable = ['project_id','code','title','description','status','blocks_description','blocks_section_id','blocks_milestone_id','decided_by','decided_on','tags','order'];

    protected function casts(): array {
        return ['decided_on' => 'date', 'tags' => 'array'];
    }

    public function project(): BelongsTo       { return $this->belongsTo(Project::class); }
    public function blocksSection(): BelongsTo  { return $this->belongsTo(Section::class, 'blocks_section_id'); }
    public function blocksMilestone(): BelongsTo { return $this->belongsTo(Milestone::class, 'blocks_milestone_id'); }
    public function decidedBy(): BelongsTo      { return $this->belongsTo(User::class, 'decided_by'); }

    public function scopePending($query) { return $query->where('status', 'pending'); }
    public function scopeConfirmed($query) { return $query->where('status', 'confirmed'); }
}
