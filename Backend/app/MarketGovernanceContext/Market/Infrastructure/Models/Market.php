<?php

namespace App\MarketGovernanceContext\Market\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Market extends Model
{
    use HasUuids;

    protected $table = 'markets';

    protected $fillable = [
        'id',
        'user_id',
        'market_name',
        'region',
        'district',
        'ward',
        'address',
        'status',
    ];
}
