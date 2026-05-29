<?php

namespace App\MatchingContext\Rfs\Infrastructure\Models;

use App\MatchingContext\Business\Infrastructure\Models\Business;
use App\MatchingContext\Engagement\Infrastructure\Models\EngagementSession;
use App\MatchingContext\Matching\Infrastructure\Models\MatchShortlist;
use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Rfs extends Model
{
    use HasUuids;

    protected $table = 'rfs';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'buyer_id',
        'title',
        'description',
        'service_type_id',
        'project_size',
        'expertise_level',
        'status',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'buyer_id');
    }

    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class, 'service_type_id');
    }

    public function constraints(): HasOne
    {
        return $this->hasOne(RfsConstraint::class, 'rfs_id');
    }

    public function preferences(): HasOne
    {
        return $this->hasOne(RfsPreference::class, 'rfs_id');
    }

    public function shortlists(): HasMany
    {
        return $this->hasMany(MatchShortlist::class, 'rfs_id');
    }

    public function engagementSessions(): HasMany
    {
        return $this->hasMany(EngagementSession::class, 'rfs_id');
    }
}
