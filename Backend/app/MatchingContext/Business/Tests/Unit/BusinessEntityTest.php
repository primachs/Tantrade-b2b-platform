<?php

namespace App\MatchingContext\Business\Tests\Unit;

use App\MatchingContext\Business\Domain\Entities\Business;
use App\MatchingContext\Business\Domain\Entities\BusinessCapability;
use App\MatchingContext\Business\Domain\Entities\BusinessCapabilityAttribute;
use App\MatchingContext\Business\Domain\Entities\BusinessTrustMetrics;
use App\MatchingContext\Business\Domain\Entities\BusinessVerification;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class BusinessEntityTest extends TestCase
{
    public function test_business_entity_state_changes(): void
    {
        $businessId = Uuid::random();
        $capabilityId = Uuid::random();
        $serviceTypeId = Uuid::random();
        $attributeId = Uuid::random();

        $attribute = new BusinessCapabilityAttribute(null, $capabilityId, $attributeId, 'Trucks');
        $capability = new BusinessCapability($capabilityId, $businessId, $serviceTypeId, [$attribute]);

        $verification = new BusinessVerification(
            null,
            $businessId,
            'TIN-001',
            'BRELA-001',
            'SMALL',
            true,
            'FEMALE',
            10,
            'BELOW_50M',
            'Dar',
            'Ilala',
            'Street 1',
            'UNVERIFIED'
        );

        $metrics = new BusinessTrustMetrics(
            $businessId,
            0.5,
            0.1,
            0.2,
            0.0,
            null,
            null
        );

        $business = new Business(
            $businessId,
            'Buyer Co',
            'Jane Doe',
            '+255700000000',
            EmailAddress::fromString('buyer@example.com'),
            $verification,
            [$capability],
            $metrics,
            null,
            null
        );

        $this->assertSame($businessId->value(), $business->id()->value());

        $updated = $business->withProfileUpdates([
            'name' => 'Buyer Co Updated',
            'email' => 'buyer.updated@example.com',
        ]);
        $this->assertSame('Buyer Co Updated', $updated->toArray()['name']);

        $withoutVerification = $business->withVerification(null);
        $this->assertNull($withoutVerification->toArray()['verification']);

        $withoutCapabilities = $business->withCapabilities([]);
        $this->assertSame([], $withoutCapabilities->toArray()['capabilities']);

        $withoutMetrics = $business->withTrustMetrics(null);
        $this->assertNull($withoutMetrics->toArray()['trust_metrics']);
    }
}
