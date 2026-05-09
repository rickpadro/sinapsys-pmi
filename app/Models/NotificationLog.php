<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationLog extends Model {
    protected $fillable = ['user_id', 'type', 'payload', 'success', 'response_code', 'error_reason'];

    protected function casts(): array {
        return ['payload' => 'array', 'success' => 'boolean'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
