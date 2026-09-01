<?php

namespace App\MatchingContext\SharedKernel\Domain\Enums;

enum IndustryType: string
{
    case TECHNOLOGY = 'TECHNOLOGY';
    case OTHER = 'OTHER';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}