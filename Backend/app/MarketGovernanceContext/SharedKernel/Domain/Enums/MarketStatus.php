<?php

namespace App\MarketGovernanceContext\SharedKernel\Domain\Enums;

enum MarketStatus: string
{
    case ACTIVE = 'ACTIVE';
    case INACTIVE = 'INACTIVE';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
