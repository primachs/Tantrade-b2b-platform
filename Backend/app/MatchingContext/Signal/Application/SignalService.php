<?php

namespace App\MatchingContext\Signal\Application;

use App\MatchingContext\Business\Domain\Repositories\BusinessRepository;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use App\MatchingContext\Signal\Domain\Factories\SignalFactory;
use App\MatchingContext\Signal\Domain\Repositories\OutcomeSignalRepository;
use App\MatchingContext\Signal\Domain\Services\ReliabilityCalculator;

class SignalService
{
    public function __construct(
        private readonly OutcomeSignalRepository $signals,
        private readonly SignalFactory $factory,
        private readonly ReliabilityCalculator $calculator,
        private readonly BusinessRepository $businessRepository
    ) {}

    public function recordSignal(string $sessionId, string $sellerId, string $outcome, float $confidence): array
    {
        $signal = $this->factory->create($sessionId, $sellerId, $outcome, $confidence);
        $this->signals->create($signal);

        $metrics = $this->calculator->recalculateForSeller(Uuid::fromString($sellerId));
        $this->businessRepository->updateTrustMetrics($metrics);

        return $signal->toArray();
    }
}
