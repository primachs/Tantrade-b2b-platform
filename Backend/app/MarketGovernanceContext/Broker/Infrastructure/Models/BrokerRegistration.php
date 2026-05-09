<?php

namespace App\MarketGovernanceContext\Broker\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BrokerRegistration extends Model
{
    use HasUuids;

    protected $table = 'broker_registrations';

    protected $fillable = [
        'id',
        'person_id',
        'market_id',
        'broker_type',
        'status',
    ];
}
