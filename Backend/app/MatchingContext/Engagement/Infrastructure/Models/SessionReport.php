<?php

namespace App\MatchingContext\Engagement\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionReport extends Model
{
    use HasUuids;

    protected $table = 'session_reports';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'session_id',
        'reported_by',
        'outcome',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(EngagementSession::class, 'session_id');
    }
}
