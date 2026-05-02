<?php

namespace App\MatchingContext\SharedKernel\Tests\Unit;

use App\MatchingContext\SharedKernel\Domain\Enums\BusinessSize;
use App\MatchingContext\SharedKernel\Domain\Enums\EngagementOutcome;
use App\MatchingContext\SharedKernel\Domain\Enums\EngagementStatus;
use App\MatchingContext\SharedKernel\Domain\Enums\ExpertiseLevel;
use App\MatchingContext\SharedKernel\Domain\Enums\OwnerGender;
use App\MatchingContext\SharedKernel\Domain\Enums\ProjectSize;
use App\MatchingContext\SharedKernel\Domain\Enums\ReportedBy;
use App\MatchingContext\SharedKernel\Domain\Enums\RevenueRange;
use App\MatchingContext\SharedKernel\Domain\Enums\RfsStatus;
use App\MatchingContext\SharedKernel\Domain\Enums\VerificationStatus;
use PHPUnit\Framework\TestCase;

class EnumCoverageTest extends TestCase
{
    public function test_enum_value_helpers(): void
    {
        $this->assertNotEmpty(BusinessSize::values());
        $this->assertNotEmpty(VerificationStatus::values());
        $this->assertNotEmpty(OwnerGender::values());
        $this->assertNotEmpty(RevenueRange::values());
        $this->assertNotEmpty(ProjectSize::values());
        $this->assertNotEmpty(ExpertiseLevel::values());
        $this->assertNotEmpty(EngagementStatus::values());
        $this->assertNotEmpty(EngagementOutcome::values());
        $this->assertNotEmpty(RfsStatus::values());
        $this->assertNotEmpty(ReportedBy::values());
    }
}
