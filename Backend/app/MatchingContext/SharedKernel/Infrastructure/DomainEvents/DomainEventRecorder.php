<?php

namespace App\MatchingContext\SharedKernel\Infrastructure\DomainEvents;

use App\MatchingContext\SharedKernel\Infrastructure\Models\DomainEvent;
use Illuminate\Support\Carbon;

class DomainEventRecorder
{
    public function record(string $eventType, string $aggregateId, array $payload = []): DomainEvent
    {
        return DomainEvent::create([
            'event_type' => $eventType,
            'aggregate_id' => $aggregateId,
            'payload' => $payload,
            'created_at' => Carbon::now(),
        ]);
    }
}
