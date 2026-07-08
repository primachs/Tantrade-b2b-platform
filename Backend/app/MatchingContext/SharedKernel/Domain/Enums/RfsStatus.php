<?php

namespace App\MatchingContext\SharedKernel\Domain\Enums;

enum RfsStatus: string
{
    case DRAFT = 'DRAFT';
    case OPEN = 'OPEN';
    case MATCHED = 'MATCHED';
    case CLOSED = 'CLOSED';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
