<?php

namespace App\Models;

use App\Models\ProjectRoleDefinition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMember extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'invited_by',
        'role',
        'role_definition_id',
        'invitation_email',
        'invitation_token',
        'accepted_at',
    ];

    protected function casts(): array
    {
        return ['accepted_at' => 'datetime'];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function roleDefinition(): BelongsTo
    {
        return $this->belongsTo(ProjectRoleDefinition::class);
    }

    public function isPending(): bool
    {
        return is_null($this->accepted_at);
    }
}
