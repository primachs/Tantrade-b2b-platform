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
            isset($payload['user_id']) ? Uuid::fromString($payload['user_id']) : null,
            Uuid::fromString($payload['market_id']),
            $payload['broker_type'],
            $payload['first_name'],
            $payload['middle_name'] ?? null,
            $payload['surname'],
            $payload['nida_number'] ?? null,
            $payload['mobile'] ?? null,
            $payload['address'] ?? null,
            $payload['status'] ?? BrokerStatus::ACTIVE->value,
            null,
            null
        );
    }

    public function fromState(array $state): BrokerRegistration
    {
        return new BrokerRegistration(
            Uuid::fromString($state['id']),
            isset($state['user_id']) ? Uuid::fromString($state['user_id']) : null,
            Uuid::fromString($state['market_id']),
            $state['broker_type'],
            $state['first_name'],
            $state['middle_name'] ?? null,
            $state['surname'],
            $state['nida_number'] ?? null,
            $state['mobile'] ?? null,
            $state['address'] ?? null,
            $state['status'],
            isset($state['created_at']) ? new \DateTimeImmutable($state['created_at']) : null,
            isset($state['updated_at']) ? new \DateTimeImmutable($state['updated_at']) : null
        );
    }
}
