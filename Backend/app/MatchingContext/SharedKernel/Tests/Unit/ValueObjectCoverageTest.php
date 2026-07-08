<?php

namespace App\MatchingContext\SharedKernel\Tests\Unit;

use App\MatchingContext\SharedKernel\Domain\Exceptions\DomainException;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\DateRange;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\MoneyRange;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class ValueObjectCoverageTest extends TestCase
{
    public function test_value_object_round_trip(): void
    {
        $uuid = Uuid::random();
        $this->assertSame($uuid->value(), (string) $uuid);
        $this->assertSame($uuid->value(), Uuid::fromString($uuid->value())->value());

        $email = EmailAddress::fromString('Owner@Example.com');
        $this->assertSame('owner@example.com', $email->value());
        $this->assertSame('owner@example.com', (string) $email);

        $money = MoneyRange::fromNullable(100.0, 200.0);
        $this->assertSame(100.0, $money->min());
        $this->assertSame(200.0, $money->max());
        $this->assertSame(100.0, $money->toArray()['min_budget']);

        $dateRange = DateRange::fromNullable(
            new \DateTimeImmutable('2026-01-01'),
            new \DateTimeImmutable('2026-02-01')
        );
        $this->assertSame('2026-01-01', $dateRange->toArray()['start_date']);
        $this->assertSame('2026-02-01', $dateRange->toArray()['deadline']);
        $this->assertNotNull($dateRange->start());
        $this->assertNotNull($dateRange->end());
    }

    public function test_email_address_rejects_invalid_value(): void
    {
        $this->expectException(DomainException::class);

        EmailAddress::fromString('invalid-email');
    }

    public function test_money_range_rejects_invalid_bounds(): void
    {
        $this->expectException(DomainException::class);

        MoneyRange::fromNullable(200.0, 100.0);
    }

    public function test_date_range_rejects_invalid_bounds(): void
    {
        $this->expectException(DomainException::class);

        DateRange::fromNullable(
            new \DateTimeImmutable('2026-02-01'),
            new \DateTimeImmutable('2026-01-01')
        );
    }
}
