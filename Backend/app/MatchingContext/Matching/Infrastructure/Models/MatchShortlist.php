<?php

namespace App\MatchingContext\Matching\Infrastructure\Models;

use App\MatchingContext\Rfs\Infrastructure\Models\Rfs;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MatchShortlist extends Model
{
    use HasUuids;

    protected $table = 'match_shortlists';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'rfs_id',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function rfs(): BelongsTo
    {
        return $this->belongsTo(Rfs::class, 'rfs_id');
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(MatchCandidate::class, 'shortlist_id');
    }
}
