<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Risk extends Model {
    protected $fillable = ['project_id','code','name','description','probability','impact','status','mitigation_plan','owner_id','identified_on','closed_on'];

    protected function casts(): array {
        return ['identified_on' => 'date', 'closed_on' => 'date'];
    }

    public function project(): BelongsTo  { return $this->belongsTo(Project::class); }
    public function owner(): BelongsTo    { return $this->belongsTo(User::class, 'owner_id'); }
    public function mitigations(): HasMany { return $this->hasMany(RiskMitigation::class); }

    public function riskScore(): int {
        $pMap = ['low' => 1, 'medium' => 2, 'high' => 3];
        $iMap = ['low' => 1, 'medium' => 2, 'high' => 3, 'critical' => 4];
        return ($pMap[$this->probability] ?? 1) * ($iMap[$this->impact] ?? 1);
    }

    public function scopeOpen($query) { return $query->where('status', 'open'); }
    public function scopeByProject($query, int $projectId) { return $query->where('project_id', $projectId); }
}
