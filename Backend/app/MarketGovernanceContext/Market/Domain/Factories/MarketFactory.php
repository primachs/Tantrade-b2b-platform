<?php

namespace App\MarketGovernanceContext\Market\Domain\Factories;

use App\MarketGovernanceContext\Market\Domain\Entities\Market;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\MarketStatus;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

class MarketFactory
{
    public function create(array $payload): Market
    {
        return new Market(
            Uuid::random(),
            $payload['market_name'],
            $payload['region'],
            $payload['district'],
            $payload['ward'] ?? null,
            $payload['address'],
            $payload['status'] ?? MarketStatus::ACTIVE->value,
            null,
            null
        );
    }

    public function fromState(array $state): Market
    {
        return new Market(
            Uuid::fromString($state['id']),
            $state['market_name'],
            $state['region'],
            $state['district'],
            $state['ward'] ?? null,
            $state['address'],
            $state['status'],
            isset($state['created_at']) ? new \DateTimeImmutable($state['created_at']) : null,
            isset($state['updated_at']) ? new \DateTimeImmutable($state['updated_at']) : null
        );
    }
}
