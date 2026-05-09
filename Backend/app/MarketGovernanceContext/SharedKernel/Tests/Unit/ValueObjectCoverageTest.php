<?php

namespace App\MarketGovernanceContext\SharedKernel\Tests\Unit;

use App\MarketGovernanceContext\SharedKernel\Domain\Exceptions\DomainException;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class ValueObjectCoverageTest extends TestCase
{
    public function test_uuid_and_email_round_trip(): void
    {
        $uuid = Uuid::random();
        $this->assertSame($uuid->value(), (string) $uuid);

        $parsed = Uuid::fromString($uuid->value());
        $this->assertSame($uuid->value(), $parsed->value());

        $email = EmailAddress::fromString('User@Example.com');
        $this->assertSame('user@example.com', $email->value());
        $this->assertSame('user@example.com', (string) $email);
    }

    public function test_uuid_rejects_invalid_value(): void
    {
        $this->expectException(DomainException::class);
        Uuid::fromString('invalid-uuid');
    }

    public function test_email_rejects_invalid_value(): void
    {
        $this->expectException(DomainException::class);
        EmailAddress::fromString('not-an-email');
    }
}
