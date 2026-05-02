<?php

namespace App\MatchingContext\Business\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessTrustMetrics extends Model
{
    protected $table = 'business_trust_metrics';

    protected $primaryKey = 'business_id';

    public $incrementing = false;

    public $timestamps = false;

    protected $keyType = 'string';

    protected $fillable = [
        'business_id',
        'reliability_score',
        'success_rate',
        'response_rate',
        'dispute_rate',
        'avg_response_time',
        'session_completion_rate',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }
}
