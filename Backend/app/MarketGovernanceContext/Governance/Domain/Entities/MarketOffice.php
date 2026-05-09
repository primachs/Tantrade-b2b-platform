<?php

namespace App\MarketGovernanceContext\Governance\Domain\Entities;

use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

final class MarketOffice
{
    public function __construct(
        private readonly Uuid $id,
        private readonly Uuid $marketId,
        private readonly string $officeType,
        private readonly ?\DateTimeImmutable $createdAt,
        private readonly ?\DateTimeImmutable $updatedAt
    ) {}

    public function id(): Uuid
    {
        return $this->id;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'market_id' => $this->marketId->value(),
            'office_type' => $this->officeType,
            'created_at' => $this->createdAt?->format('c'),
            'updated_at' => $this->updatedAt?->format('c'),
        ];
    }
}
