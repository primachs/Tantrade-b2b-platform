<?php

namespace App\MatchingContext\SharedKernel\Domain\Enums;

enum EngagementStatus: string
{
    case INITIATED = 'INITIATED';
    case ACCEPTED = 'ACCEPTED';
    case ACTIVE = 'ACTIVE';
    case STALLED = 'STALLED';
    case CLOSED = 'CLOSED';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
