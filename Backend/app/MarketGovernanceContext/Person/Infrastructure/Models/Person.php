<?php

namespace App\MarketGovernanceContext\Person\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    use HasUuids;

    protected $table = 'persons';

    protected $fillable = [
        'id',
        'user_id',
        'nida_number',
        'first_name',
        'middle_name',
        'surname',
        'gender',
        'mobile',
        'email',
        'address',
    ];
}
