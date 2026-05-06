<?php

namespace App\MatchingContext\Business\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class BusinessTrustMetrics
{
    public function __construct(
        private readonly Uuid $businessId,
        private readonly float $reliabilityScore,
        private readonly float $successRate,
        private readonly float $responseRate,
        private readonly float $disputeRate,
        private readonly ?float $avgResponseTime,
        private readonly ?float $sessionCompletionRate
    ) {}

    public function businessId(): Uuid
    {
        return $this->businessId;
    }

    public function toArray(): array
    {
        return [
            'business_id' => $this->businessId->value(),
            'reliability_score' => $this->reliabilityScore,
            'success_rate' => $this->successRate,
            'response_rate' => $this->responseRate,
            'dispute_rate' => $this->disputeRate,
            'avg_response_time' => $this->avgResponseTime,
            'session_completion_rate' => $this->sessionCompletionRate,
        ];
    }
}
