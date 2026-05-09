<?php

namespace App\MatchingContext\Rfs\Tests\Unit;

use App\MatchingContext\Rfs\Domain\Entities\Rfs;
use App\MatchingContext\Rfs\Domain\Entities\RfsAttribute;
use App\MatchingContext\Rfs\Domain\Entities\RfsConstraint;
use App\MatchingContext\Rfs\Domain\Entities\RfsPreference;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\DateRange;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Location;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\MoneyRange;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\PreferenceWeights;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class RfsEntityTest extends TestCase
{
    public function test_rfs_state_updates(): void
    {
        $rfsId = Uuid::random();
        $buyerId = Uuid::random();
        $serviceTypeId = Uuid::random();

        $constraint = new RfsConstraint(
            null,
            $rfsId,
            MoneyRange::fromNullable(1000.0, 2000.0),
            DateRange::fromNullable(new \DateTimeImmutable('2026-01-01'), new \DateTimeImmutable('2026-02-01')),
            Location::fromNullable('Dar', 'Ilala')
        );

        $preference = new RfsPreference(
            $rfsId,
            PreferenceWeights::fromArray([
                'cost_weight' => 0.4,
                'quality_weight' => 0.6,
            ])
        );

        $attribute = new RfsAttribute(null, $rfsId, Uuid::random(), 'Trucks');

        $rfs = new Rfs(
            $rfsId,
            $buyerId,
            'Need logistics',
            'Long haul',
            $serviceTypeId,
            'SMALL',
            'BASIC',
            'DRAFT',
            new \DateTimeImmutable('2026-01-01'),
            $constraint,
            $preference,
            [$attribute]
        );

        $this->assertSame($rfsId->value(), $rfs->id()->value());
        $this->assertSame('DRAFT', $rfs->status());
        $this->assertSame($serviceTypeId->value(), $rfs->serviceTypeId()->value());
        $this->assertNotNull($rfs->constraint());
        $this->assertNotNull($rfs->preference());
        $this->assertCount(1, $rfs->attributes());

        $opened = $rfs->withStatus('OPEN');
        $this->assertSame('OPEN', $opened->status());

        $updated = $rfs->withUpdates(['title' => 'Updated title']);
        $this->assertSame('Updated title', $updated->toArray()['title']);

        $withoutConstraint = $rfs->withConstraint(null);
        $this->assertNull($withoutConstraint->toArray()['constraint']);

        $withoutPreference = $rfs->withPreference(null);
        $this->assertNull($withoutPreference->toArray()['preference']);

        $withoutAttributes = $rfs->withAttributes([]);
        $this->assertSame([], $withoutAttributes->toArray()['attributes']);
    }
}
