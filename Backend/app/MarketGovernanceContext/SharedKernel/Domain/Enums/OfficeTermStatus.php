<?php

namespace App\MarketGovernanceContext\SharedKernel\Domain\Enums;

enum OfficeTermStatus: string
{
    case ACTIVE = 'ACTIVE';
    case ENDED = 'ENDED';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
