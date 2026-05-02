<?php

namespace App\MatchingContext\SharedKernel\Domain\Enums;

enum ExpertiseLevel: string
{
    case BASIC = 'BASIC';
    case INTERMEDIATE = 'INTERMEDIATE';
    case ADVANCED = 'ADVANCED';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
