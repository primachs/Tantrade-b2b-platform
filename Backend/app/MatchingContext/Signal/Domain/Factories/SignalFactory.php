<?php

namespace App\MatchingContext\Signal\Domain\Factories;

use App\MatchingContext\Signal\Domain\Entities\OutcomeSignal;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

class SignalFactory
{
    public function create(string $sessionId, string $sellerId, string $outcome, float $confidence): OutcomeSignal
    {
        return new OutcomeSignal(
            Uuid::random(),
            Uuid::fromString($sessionId),
            Uuid::fromString($sellerId),
            $outcome,
            $confidence,
            new \DateTimeImmutable()
        );
    }
}
