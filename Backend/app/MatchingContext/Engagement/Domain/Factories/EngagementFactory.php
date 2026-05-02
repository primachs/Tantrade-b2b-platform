<?php

namespace App\MatchingContext\Engagement\Domain\Factories;

use App\MatchingContext\Engagement\Domain\Entities\EngagementSession;
use App\MatchingContext\Engagement\Domain\Entities\SessionReport;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

class EngagementFactory
{
    public function createSession(array $payload): EngagementSession
    {
        return new EngagementSession(
            Uuid::random(),
            Uuid::fromString($payload['rfs_id']),
            Uuid::fromString($payload['buyer_id']),
            Uuid::fromString($payload['seller_id']),
            'INITIATED',
            null,
            null,
            new \DateTimeImmutable(),
            null,
            []
        );
    }

    public function fromState(array $state): EngagementSession
    {
        $reports = [];
        foreach ($state['reports'] ?? [] as $report) {
            $reports[] = $this->reportFromState($report);
        }

        return new EngagementSession(
            Uuid::fromString($state['id']),
            Uuid::fromString($state['rfs_id']),
            Uuid::fromString($state['buyer_id']),
            Uuid::fromString($state['seller_id']),
            $state['status'],
            $state['outcome'] ?? null,
            isset($state['confidence_score']) ? (float) $state['confidence_score'] : null,
            isset($state['created_at']) ? new \DateTimeImmutable($state['created_at']) : null,
            isset($state['closed_at']) ? new \DateTimeImmutable($state['closed_at']) : null,
            $reports
        );
    }

    public function reportFromPayload(Uuid $sessionId, array $payload): SessionReport
    {
        return new SessionReport(
            null,
            $sessionId,
            $payload['reported_by'],
            $payload['outcome'],
            new \DateTimeImmutable()
        );
    }

    public function reportFromState(array $state): SessionReport
    {
        return new SessionReport(
            isset($state['id']) ? Uuid::fromString($state['id']) : null,
            Uuid::fromString($state['session_id']),
            $state['reported_by'],
            $state['outcome'],
            new \DateTimeImmutable($state['created_at'])
        );
    }
}
