<?php

namespace App\AuthenticationContext\SharedKernel\Domain\Enums;

enum AuthUserStatus: string
{
    case ACTIVE = 'ACTIVE';
    case LOCKED = 'LOCKED';
    case DISABLED = 'DISABLED';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
