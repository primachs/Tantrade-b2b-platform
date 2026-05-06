<?php

namespace App\MatchingContext\Signal\Domain\Services;

use App\MatchingContext\Business\Domain\Entities\BusinessTrustMetrics;
use App\MatchingContext\Engagement\Domain\Repositories\EngagementRepository;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

class ReliabilityCalculator
{
    public function __construct(private readonly EngagementRepository $engagementRepository) {}

    public function recalculateForSeller(Uuid $sellerId): BusinessTrustMetrics
    {
        $totalSessions = $this->engagementRepository->countSessionsBySeller($sellerId);
        $successes = $this->engagementRepository->countSessionsBySellerAndOutcome($sellerId, 'DEAL_CONFIRMED');
        $disputes = $this->engagementRepository->countSessionsBySellerAndOutcome($sellerId, 'DISPUTED');
        $noResponses = $this->engagementRepository->countSessionsBySellerAndOutcome($sellerId, 'NO_RESPONSE');

        $responded = max($totalSessions - $noResponses, 0);

        $successRate = $totalSessions > 0 ? $successes / $totalSessions : 0.0;
        $responseRate = $totalSessions > 0 ? $responded / $totalSessions : 0.0;
        $disputeRate = $totalSessions > 0 ? $disputes / $totalSessions : 0.0;

        $avgResponseTime = $this->calculateAverageResponseTime($sellerId);
        $sessionCompletionRate = $totalSessions > 0
            ? $this->engagementRepository->countClosedSessionsBySeller($sellerId) / $totalSessions
            : 0.0;

        $reliabilityScore = 0.5;
        if ($totalSessions >= 5) {
            $reliabilityScore = (0.5 * $successRate) + (0.3 * $responseRate) + (0.2 * (1 - $disputeRate));
        }

        return new BusinessTrustMetrics(
            $sellerId,
            $this->clamp($reliabilityScore),
            $this->clamp($successRate),
            $this->clamp($responseRate),
            $this->clamp($disputeRate),
            $avgResponseTime,
            $this->clamp($sessionCompletionRate)
        );
    }

    private function calculateAverageResponseTime(Uuid $sellerId): ?float
    {
        $sessions = $this->engagementRepository->listSessionsBySeller($sellerId);
        if ($sessions === []) {
            return null;
        }

        $durations = [];
        foreach ($sessions as $session) {
            $firstResponse = $this->engagementRepository->findReport($session->id(), 'SELLER');
            if (! $firstResponse) {
                continue;
            }

            $createdAt = $session->createdAt();
            $respondedAt = $firstResponse->createdAt();
            $durations[] = $respondedAt->getTimestamp() - $createdAt->getTimestamp();
        }

        if (count($durations) === 0) {
            return null;
        }

        return array_sum($durations) / count($durations);
    }

    private function clamp(float $value): float
    {
        if ($value < 0.0) {
            return 0.0;
        }

        if ($value > 1.0) {
            return 1.0;
        }

        return $value;
    }
}
