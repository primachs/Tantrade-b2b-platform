<?php

namespace App\MatchingContext\Rfs\Infrastructure\Models;

use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RfsAttribute extends Model
{
    use HasUuids;

    protected $table = 'rfs_attributes';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'rfs_id',
        'attribute_id',
        'value',
    ];

    public function rfs(): BelongsTo
    {
        return $this->belongsTo(Rfs::class, 'rfs_id');
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(ServiceAttribute::class, 'attribute_id');
    }
}
