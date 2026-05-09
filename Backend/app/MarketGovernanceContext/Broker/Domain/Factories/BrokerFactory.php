<?php

namespace App\MarketGovernanceContext\Broker\Domain\Factories;

use App\MarketGovernanceContext\Broker\Domain\Entities\BrokerRegistration;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\BrokerStatus;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

class BrokerFactory
{
    public function create(array $payload): BrokerRegistration
    {
        return new BrokerRegistration(
            Uuid::random(),
            Uuid::fromString($payload['person_id']),
            Uuid::fromString($payload['market_id']),
            $payload['broker_type'],
            $payload['status'] ?? BrokerStatus::ACTIVE->value,
            null,
            null
        );
    }

    public function fromState(array $state): BrokerRegistration
    {
        return new BrokerRegistration(
            Uuid::fromString($state['id']),
            Uuid::fromString($state['person_id']),
            Uuid::fromString($state['market_id']),
            $state['broker_type'],
            $state['status'],
            isset($state['created_at']) ? new \DateTimeImmutable($state['created_at']) : null,
            isset($state['updated_at']) ? new \DateTimeImmutable($state['updated_at']) : null
        );
    }
}
