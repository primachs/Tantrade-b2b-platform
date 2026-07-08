<?php

namespace App\MarketGovernanceContext\SharedKernel\Domain\Enums;

enum Gender: string
{
    case MALE = 'MALE';
    case FEMALE = 'FEMALE';
    case OTHER = 'OTHER';
    case PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
