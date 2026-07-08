<?php

namespace App\MatchingContext\Signal\Domain\Services;

use App\MatchingContext\SharedKernel\Domain\Enums\EngagementOutcome;

class OutcomeResolver
{
    public function resolve(?string $buyerOutcome, ?string $sellerOutcome): array
    {
        if (! $buyerOutcome && ! $sellerOutcome) {
            throw new \InvalidArgumentException('At least one outcome report is required.');
        }

        if ($buyerOutcome && ! $sellerOutcome) {
            return [
                'outcome' => $buyerOutcome,
                'confidence' => 0.6,
            ];
        }

        if ($sellerOutcome && ! $buyerOutcome) {
            return [
                'outcome' => $sellerOutcome,
                'confidence' => 0.6,
            ];
        }

        if ($buyerOutcome === $sellerOutcome) {
            return [
                'outcome' => $buyerOutcome,
                'confidence' => 1.0,
            ];
        }

        if ($buyerOutcome === EngagementOutcome::NO_RESPONSE->value || $sellerOutcome === EngagementOutcome::NO_RESPONSE->value) {
            return [
                'outcome' => EngagementOutcome::NO_RESPONSE->value,
                'confidence' => 0.6,
            ];
        }

        if ($buyerOutcome === EngagementOutcome::MOVED_OFF_PLATFORM->value || $sellerOutcome === EngagementOutcome::MOVED_OFF_PLATFORM->value) {
            return [
                'outcome' => EngagementOutcome::MOVED_OFF_PLATFORM->value,
                'confidence' => 0.6,
            ];
        }

        return [
            'outcome' => EngagementOutcome::DISPUTED->value,
            'confidence' => 0.3,
        ];
    }
}
