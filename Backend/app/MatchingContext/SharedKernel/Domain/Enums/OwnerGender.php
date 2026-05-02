<?php

namespace App\MatchingContext\SharedKernel\Domain\Enums;

enum OwnerGender: string
{
    case MALE = 'MALE';
    case FEMALE = 'FEMALE';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
