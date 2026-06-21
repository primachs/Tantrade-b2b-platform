<?php

namespace App\MatchingContext\Business\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Business extends Model
{
    use HasUuids;

    protected $table = 'businesses';

    protected $fillable = [
        'id',
        'user_id',
        'name',
        'contact_person',
        'phone',
        'email',
    ];

    public function verification(): HasOne
    {
        return $this->hasOne(BusinessVerification::class, 'business_id');
    }

    public function capabilities(): HasMany
    {
        return $this->hasMany(BusinessCapability::class, 'business_id');
    }

    public function trustMetrics(): HasOne
    {
        return $this->hasOne(BusinessTrustMetrics::class, 'business_id');
    }
}
