<?php

namespace App\MatchingContext\Business\Infrastructure\Models;

use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceAttribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessCapabilityAttribute extends Model
{
    use HasUuids;

    protected $table = 'business_capability_attributes';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'capability_id',
        'attribute_id',
        'value',
    ];

    public function capability(): BelongsTo
    {
        return $this->belongsTo(BusinessCapability::class, 'capability_id');
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(ServiceAttribute::class, 'attribute_id');
    }
}
