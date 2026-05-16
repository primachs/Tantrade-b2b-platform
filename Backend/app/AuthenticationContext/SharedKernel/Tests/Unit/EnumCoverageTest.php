<?php

namespace App\AuthenticationContext\SharedKernel\Tests\Unit;

use App\AuthenticationContext\SharedKernel\Domain\Enums\AuthUserStatus;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EnumCoverageTest extends TestCase
{
    #[Test]
    public function it_exposes_auth_user_status_values(): void
    {
        $values = AuthUserStatus::values();

        $this->assertContains('ACTIVE', $values);
        $this->assertContains('LOCKED', $values);
        $this->assertContains('DISABLED', $values);
    }
}
