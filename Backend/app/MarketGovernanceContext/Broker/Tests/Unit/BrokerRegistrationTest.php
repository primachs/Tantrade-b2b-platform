<?php

namespace App\MarketGovernanceContext\Broker\Tests\Unit;

use App\MarketGovernanceContext\Broker\Domain\Entities\BrokerRegistration;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class BrokerRegistrationTest extends TestCase
{
    public function test_broker_registration_status_updates(): void
    {
        $registration = new BrokerRegistration(
            Uuid::random(),
            Uuid::random(),
            Uuid::random(),
            'PRODUCE_BROKER',
            'Juma',
            null,
            'Mwana',
            null,
            null,
            null,
            'ACTIVE',
            null,
            null
        );

        $this->assertNotEmpty($registration->id()->value());

        $inactive = $registration->withStatus('INACTIVE');
        $this->assertSame('INACTIVE', $inactive->toArray()['status']);
    }
}
