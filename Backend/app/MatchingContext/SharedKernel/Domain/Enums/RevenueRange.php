<?php

namespace App\MatchingContext\SharedKernel\Domain\Enums;

enum RevenueRange: string
{
    case BELOW_50M = 'BELOW_50M';
    case BETWEEN_50M_500M = 'BETWEEN_50M_500M';
    case BETWEEN_500M_5B = 'BETWEEN_500M_5B';
    case ABOVE_5B = 'ABOVE_5B';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
