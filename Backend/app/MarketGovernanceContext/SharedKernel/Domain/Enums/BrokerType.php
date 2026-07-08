<?php

namespace App\MarketGovernanceContext\SharedKernel\Domain\Enums;

enum BrokerType: string
{
    case PRODUCE_BROKER = 'PRODUCE_BROKER';
    case LIVESTOCK_BROKER = 'LIVESTOCK_BROKER';
    case FREIGHT_BROKER = 'FREIGHT_BROKER';
    case EXPORT_BROKER = 'EXPORT_BROKER';
    case IMPORT_BROKER = 'IMPORT_BROKER';
    case COMMISSION_AGENT = 'COMMISSION_AGENT';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
