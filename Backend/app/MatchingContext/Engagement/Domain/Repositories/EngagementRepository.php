<?php

namespace App\MatchingContext\Engagement\Domain\Repositories;

use App\MatchingContext\Engagement\Domain\Entities\EngagementSession;
use App\MatchingContext\Engagement\Domain\Entities\SessionReport;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

interface EngagementRepository
{
    public function create(EngagementSession $session): EngagementSession;

    public function update(EngagementSession $session): EngagementSession;

    public function findById(Uuid $sessionId): ?EngagementSession;

    public function upsertReport(SessionReport $report): SessionReport;

    /** @return SessionReport[] */
    public function listReports(Uuid $sessionId): array;

    public function findReport(Uuid $sessionId, string $reportedBy): ?SessionReport;

    public function countSessionsBySeller(Uuid $sellerId): int;

    public function countSessionsBySellerAndOutcome(Uuid $sellerId, string $outcome): int;

    public function countClosedSessionsBySeller(Uuid $sellerId): int;

    /** @return EngagementSession[] */
    public function listSessionsBySeller(Uuid $sellerId): array;
}
