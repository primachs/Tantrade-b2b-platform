<?php

namespace App\MatchingContext\SharedKernel\Domain\Enums;

enum ReportedBy: string
{
    case BUYER = 'BUYER';
    case SELLER = 'SELLER';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
