<?php

namespace App\MatchingContext\Taxonomy\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttributeValue extends Model
{
    use HasUuids;

    protected $table = 'attribute_values';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'attribute_id',
        'value',
    ];

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(ServiceAttribute::class, 'attribute_id');
    }
}
