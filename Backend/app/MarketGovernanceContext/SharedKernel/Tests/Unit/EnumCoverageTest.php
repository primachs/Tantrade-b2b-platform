<?php

namespace App\MarketGovernanceContext\SharedKernel\Tests\Unit;

use App\MarketGovernanceContext\SharedKernel\Domain\Enums\BrokerStatus;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\BrokerType;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\Gender;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\MarketStatus;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\OfficeTermStatus;
use App\MarketGovernanceContext\SharedKernel\Domain\Enums\OfficeType;
use PHPUnit\Framework\TestCase;

class EnumCoverageTest extends TestCase
{
    public function test_enum_value_helpers(): void
    {
        $this->assertNotEmpty(Gender::values());
        $this->assertNotEmpty(MarketStatus::values());
        $this->assertNotEmpty(OfficeType::values());
        $this->assertNotEmpty(OfficeTermStatus::values());
        $this->assertNotEmpty(BrokerStatus::values());
        $this->assertNotEmpty(BrokerType::values());
    }
}
