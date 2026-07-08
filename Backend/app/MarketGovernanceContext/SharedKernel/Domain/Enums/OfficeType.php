<?php

namespace App\MarketGovernanceContext\SharedKernel\Domain\Enums;

enum OfficeType: string
{
    case CHAIRPERSON = 'CHAIRPERSON';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
