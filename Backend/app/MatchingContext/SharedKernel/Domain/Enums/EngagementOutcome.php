<?php

namespace App\MatchingContext\SharedKernel\Domain\Enums;

enum EngagementOutcome: string
{
    case DEAL_CONFIRMED = 'DEAL_CONFIRMED';
    case NO_AGREEMENT = 'NO_AGREEMENT';
    case NO_RESPONSE = 'NO_RESPONSE';
    case OUT_OF_SCOPE = 'OUT_OF_SCOPE';
    case MOVED_OFF_PLATFORM = 'MOVED_OFF_PLATFORM';
    case DISPUTED = 'DISPUTED';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
