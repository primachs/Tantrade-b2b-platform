<?php

namespace App\MatchingContext\SharedKernel\Domain\Enums;

enum VerificationStatus: string
{
    case UNVERIFIED = 'UNVERIFIED';
    case PARTIALLY_VERIFIED = 'PARTIALLY_VERIFIED';
    case VERIFIED = 'VERIFIED';
    case REJECTED = 'REJECTED';

    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
