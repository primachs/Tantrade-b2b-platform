<?php

namespace App\MarketGovernanceContext\Governance\Tests\Unit;

use App\MarketGovernanceContext\Governance\Domain\Entities\MarketOffice;
use App\MarketGovernanceContext\Governance\Domain\Entities\OfficeTerm;
use App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class GovernanceEntitiesTest extends TestCase
{
    public function test_market_office_and_term_serialization(): void
    {
        $officeId = Uuid::random();
        $marketId = Uuid::random();
        $personId = Uuid::random();

        $office = new MarketOffice(
            $officeId,
            $marketId,
            'CHAIRPERSON',
            null,
            null
        );

        $this->assertSame($officeId->value(), $office->id()->value());
        $this->assertSame('CHAIRPERSON', $office->toArray()['office_type']);

        $term = new OfficeTerm(
            Uuid::random(),
            $officeId,
            $personId,
            new \DateTimeImmutable('2026-01-01'),
            new \DateTimeImmutable('2031-01-01'),
            'ACTIVE',
            null,
            null
        );

        $this->assertNotEmpty($term->id()->value());

        $ended = $term->withEndDate(new \DateTimeImmutable('2026-12-31'))->withStatus('ENDED');
        $data = $ended->toArray();
        $this->assertSame('ENDED', $data['status']);
        $this->assertSame('2026-12-31', $data['end_date']);
    }
}
