<?php

namespace App\MatchingContext\Rfs\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RfsConstraint extends Model
{
    use HasUuids;

    protected $table = 'rfs_constraints';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'rfs_id',
        'min_budget',
        'max_budget',
        'start_date',
        'deadline',
        'region',
        'district',
    ];

    protected $casts = [
        'min_budget' => 'decimal:2',
        'max_budget' => 'decimal:2',
        'start_date' => 'date',
        'deadline' => 'date',
    ];

    public function rfs(): BelongsTo
    {
        return $this->belongsTo(Rfs::class, 'rfs_id');
    }
}
