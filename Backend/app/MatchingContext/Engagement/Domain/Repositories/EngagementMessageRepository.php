<?php

namespace App\MatchingContext\Engagement\Domain\Repositories;

use App\MatchingContext\Engagement\Domain\Entities\EngagementMessage;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

interface EngagementMessageRepository
{
    public function create(EngagementMessage $message): EngagementMessage;

    /** @return EngagementMessage[] */
    public function listBySession(Uuid $sessionId): array;
}