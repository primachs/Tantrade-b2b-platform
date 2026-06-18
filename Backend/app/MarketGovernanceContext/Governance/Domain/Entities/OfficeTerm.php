<?php

namespace App\MarketGovernanceContext\Governance\Domain\Entities;

use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;

final class OfficeTerm
{
    public function __construct(
        private readonly Uuid $id,
        private readonly Uuid $officeId,
        private readonly Uuid $userId,
        private readonly \DateTimeImmutable $startDate,
        private readonly \DateTimeImmutable $endDate,
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
            $this->officeId,
            $this->userId,
            $this->startDate,
            $this->endDate,
            $status,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function withEndDate(\DateTimeImmutable $endDate): self
    {
        return new self(
            $this->id,
            $this->officeId,
            $this->userId,
            $this->startDate,
            $endDate,
            $this->status,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'office_id' => $this->officeId->value(),
            'user_id' => $this->userId->value(),
            'start_date' => $this->startDate->format('Y-m-d'),
            'end_date' => $this->endDate->format('Y-m-d'),
            'status' => $this->status,
            'created_at' => $this->createdAt?->format('c'),
            'updated_at' => $this->updatedAt?->format('c'),
        ];
    }
}
