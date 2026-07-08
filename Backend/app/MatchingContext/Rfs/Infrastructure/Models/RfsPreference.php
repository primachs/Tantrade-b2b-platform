<?php

namespace App\MatchingContext\Rfs\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RfsPreference extends Model
{
    protected $table = 'rfs_preferences';

    protected $primaryKey = 'rfs_id';

    public $incrementing = false;

    public $timestamps = false;

    protected $keyType = 'string';

    protected $fillable = [
        'rfs_id',
        'cost_weight',
        'quality_weight',
        'speed_weight',
        'experience_weight',
        'location_weight',
    ];

    public function rfs(): BelongsTo
    {
        return $this->belongsTo(Rfs::class, 'rfs_id');
    }
}
