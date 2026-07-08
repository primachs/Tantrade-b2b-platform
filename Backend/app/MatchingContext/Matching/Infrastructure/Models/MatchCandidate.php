<?php

namespace App\MatchingContext\Matching\Infrastructure\Models;

use App\MatchingContext\Business\Infrastructure\Models\Business;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchCandidate extends Model
{
    use HasUuids;

    protected $table = 'match_candidates';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'shortlist_id',
        'seller_id',
        'score',
        'rank',
    ];

    public function shortlist(): BelongsTo
    {
        return $this->belongsTo(MatchShortlist::class, 'shortlist_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'seller_id');
    }
}
