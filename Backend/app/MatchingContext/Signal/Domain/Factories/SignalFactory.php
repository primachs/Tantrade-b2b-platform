<?php

namespace App\MatchingContext\Signal\Domain\Factories;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\Signal\Domain\Entities\OutcomeSignal;

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
            new \DateTimeImmutable
        );
    }
}
