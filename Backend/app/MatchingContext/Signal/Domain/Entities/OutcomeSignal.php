<?php

namespace App\MatchingContext\Signal\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class OutcomeSignal
{
    public function __construct(
        private readonly Uuid $id,
        private readonly Uuid $sessionId,
        private readonly Uuid $sellerId,
        private readonly string $outcome,
        private readonly float $confidenceScore,
        private readonly \DateTimeImmutable $createdAt
    ) {}

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'session_id' => $this->sessionId->value(),
            'seller_id' => $this->sellerId->value(),
            'outcome' => $this->outcome,
            'confidence_score' => $this->confidenceScore,
            'created_at' => $this->createdAt->format('c'),
        ];
    }
}
