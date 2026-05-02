<?php

namespace App\MatchingContext\SharedKernel\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DomainEvent extends Model
{
    use HasUuids;

    protected $table = 'domain_events';

    public $timestamps = false;

    protected $fillable = [
        'event_type',
        'aggregate_id',
        'payload',
        'created_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'created_at' => 'datetime',
    ];
}
