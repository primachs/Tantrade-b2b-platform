<?php

namespace App\MatchingContext\Engagement\Infrastructure\Models;

use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EngagementSession extends Model
{
    use HasUuids;

    protected $table = 'engagement_sessions';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'rfs_id',
        'buyer_id',
        'seller_id',
        'status',
        'outcome',
        'confidence_score',
        'created_at',
        'closed_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function rfs(): BelongsTo
    {
        return $this->belongsTo(Rfs::class, 'rfs_id');
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'seller_id');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(SessionReport::class, 'session_id');
    }
}
