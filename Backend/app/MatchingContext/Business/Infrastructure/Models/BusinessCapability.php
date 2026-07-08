<?php

namespace App\MatchingContext\Business\Infrastructure\Models;

use App\MatchingContext\Taxonomy\Infrastructure\Models\ServiceType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessCapability extends Model
{
    use HasUuids;

    protected $table = 'business_capabilities';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'business_id',
        'service_type_id',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class, 'service_type_id');
    }

    public function capabilityAttributes(): HasMany
    {
        return $this->hasMany(BusinessCapabilityAttribute::class, 'capability_id');
    }
}
