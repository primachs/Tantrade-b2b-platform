<?php

namespace App\MatchingContext\Signal\Infrastructure\Models;

use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Engagement\Infrastructure\Models\EngagementSession;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutcomeSignal extends Model
{
    use HasUuids;

    protected $table = 'outcome_signals';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'session_id',
        'seller_id',
        'outcome',
        'confidence_score',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(EngagementSession::class, 'session_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'seller_id');
    }
}
