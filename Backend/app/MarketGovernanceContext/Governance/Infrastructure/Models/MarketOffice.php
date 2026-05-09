<?php

namespace App\MarketGovernanceContext\Governance\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MarketOffice extends Model
{
    use HasUuids;

    protected $table = 'market_offices';

    protected $fillable = [
        'id',
        'market_id',
        'office_type',
    ];

    public function terms(): HasMany
    {
        return $this->hasMany(OfficeTerm::class, 'office_id');
    }
}
