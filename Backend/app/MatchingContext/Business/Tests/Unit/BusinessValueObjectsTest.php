<?php

namespace App\MatchingContext\Business\Tests\Unit;

use App\MatchingContext\Business\Domain\Entities\BusinessTrustMetrics;
use App\MatchingContext\Business\Domain\Entities\BusinessVerification;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class BusinessValueObjectsTest extends TestCase
{
    public function test_business_verification_and_metrics(): void
    {
        $businessId = Uuid::random();

        $verification = new BusinessVerification(
            null,
            $businessId,
            'TIN-100',
            'BRELA-100',
            'SMALL',
            true,
            'MALE',
            5,
            'BELOW_50M',
            'Dar',
            'Ilala',
            'Street 1',
            'VERIFIED'
        );

        $metrics = new BusinessTrustMetrics(
            $businessId,
            0.7,
            0.6,
            0.5,
            0.1,
            2.5,
            0.9
        );

        $this->assertSame($businessId->value(), $verification->businessId()->value());
        $this->assertSame($businessId->value(), $metrics->businessId()->value());
        $this->assertSame('VERIFIED', $verification->toArray()['verification_status']);
        $this->assertSame(0.7, $metrics->toArray()['reliability_score']);
    }
}
