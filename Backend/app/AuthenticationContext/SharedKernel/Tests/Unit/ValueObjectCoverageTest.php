<?php

namespace App\AuthenticationContext\SharedKernel\Tests\Unit;

use App\AuthenticationContext\SharedKernel\Domain\Exceptions\DomainException;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ValueObjectCoverageTest extends TestCase
{
    #[Test]
    public function it_accepts_valid_email_addresses(): void
    {
        $email = EmailAddress::fromString('user@example.com');

        $this->assertSame('user@example.com', $email->value());
    }

    #[Test]
    public function it_rejects_invalid_email_addresses(): void
    {
        $this->expectException(DomainException::class);

        EmailAddress::fromString('invalid-email');
    }

    #[Test]
    public function it_accepts_valid_uuids(): void
    {
        $uuid = Uuid::fromString('11111111-1111-1111-1111-111111111111');

        $this->assertSame('11111111-1111-1111-1111-111111111111', $uuid->value());
    }

    #[Test]
    public function it_rejects_invalid_uuids(): void
    {
        $this->expectException(DomainException::class);

        Uuid::fromString('not-a-uuid');
    }
}
