<?php

namespace App\MatchingContext\Engagement\Tests\Unit;

use App\MatchingContext\Engagement\Domain\Entities\EngagementSession;
use App\MatchingContext\Engagement\Domain\Entities\SessionReport;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class EngagementEntitiesTest extends TestCase
{
    public function test_engagement_entities_state(): void
    {
        $sessionId = Uuid::random();
        $session = new EngagementSession(
            $sessionId,
            Uuid::random(),
            Uuid::random(),
            Uuid::random(),
            'INITIATED',
            null,
            null,
            null,
            null,
            []
        );

        $this->assertSame('INITIATED', $session->status());
        $this->assertInstanceOf(\DateTimeImmutable::class, $session->createdAt());
        $this->assertSame([], $session->reports());

        $closed = $session->close('NO_AGREEMENT', 0.6, new \DateTimeImmutable('2026-01-02'));
        $this->assertSame('CLOSED', $closed->status());
        $this->assertSame('NO_AGREEMENT', $closed->toArray()['outcome']);

        $report = new SessionReport(
            null,
            $sessionId,
            'BUYER',
            'DEAL_CONFIRMED',
            null,
            null,
            new \DateTimeImmutable('2026-01-01')
        );

        $this->assertSame('BUYER', $report->reportedBy());
        $this->assertSame('DEAL_CONFIRMED', $report->outcome());
        $this->assertSame('DEAL_CONFIRMED', $report->toArray()['outcome']);
        $this->assertInstanceOf(\DateTimeImmutable::class, $report->createdAt());
    }
}
