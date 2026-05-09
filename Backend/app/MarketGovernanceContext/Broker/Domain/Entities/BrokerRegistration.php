<?php

namespace App\MarketGovernanceContext\Broker\Domain\Entities;

use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

final class BrokerRegistration
{
    public function __construct(
        private readonly Uuid $id,
        private readonly Uuid $personId,
        private readonly Uuid $marketId,
        private readonly string $brokerType,
        private readonly string $status,
        private readonly ?\DateTimeImmutable $createdAt,
        private readonly ?\DateTimeImmutable $updatedAt
    ) {}

    public function id(): Uuid
    {
        return $this->id;
    }

    public function withStatus(string $status): self
    {
        return new self(
            $this->id,
            $this->personId,
            $this->marketId,
            $this->brokerType,
            $status,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'person_id' => $this->personId->value(),
            'market_id' => $this->marketId->value(),
            'broker_type' => $this->brokerType,
            'status' => $this->status,
            'created_at' => $this->createdAt?->format('c'),
            'updated_at' => $this->updatedAt?->format('c'),
        ];
    }
}
