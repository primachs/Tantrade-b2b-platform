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
        'user_id',
        'market_id',
        'broker_type',
        'first_name',
        'middle_name',
        'surname',
        'nida_number',
        'mobile',
        'address',
        'status',
    ];
}
