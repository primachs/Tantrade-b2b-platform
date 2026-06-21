<?php

namespace App\MatchingContext\Engagement\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class SessionReport
{
    public function __construct(
        private readonly ?Uuid $id,
        private readonly Uuid $sessionId,
        private readonly string $reportedBy,
        private readonly string $outcome,
        private readonly ?string $reason,
        private readonly ?string $notes,
        private readonly \DateTimeImmutable $createdAt
    ) {}

    public function reportedBy(): string
    {
        return $this->reportedBy;
    }

    public function outcome(): string
    {
        return $this->outcome;
    }

    public function reason(): ?string
    {
        return $this->reason;
    }

    public function notes(): ?string
    {
        return $this->notes;
    }

    public function createdAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id?->value(),
            'session_id' => $this->sessionId->value(),
            'reported_by' => $this->reportedBy,
            'outcome' => $this->outcome,
            'reason' => $this->reason,
            'notes' => $this->notes,
            'created_at' => $this->createdAt->format('c'),
        ];
    }
}
