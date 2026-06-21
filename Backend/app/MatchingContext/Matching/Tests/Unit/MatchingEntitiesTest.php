<?php

namespace App\MatchingContext\Matching\Tests\Unit;

use App\MatchingContext\Matching\Domain\Entities\CandidateAttribute;
use App\MatchingContext\Matching\Domain\Entities\MatchCandidate;
use App\MatchingContext\Matching\Domain\Entities\MatchShortlist;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class MatchingEntitiesTest extends TestCase
{
    public function test_matching_entities_serialization(): void
    {
        $attributeId = Uuid::random();
        $attribute = new CandidateAttribute($attributeId, 'Trucks');

        $this->assertSame($attributeId->value(), $attribute->attributeId()->value());
        $this->assertSame('Trucks', $attribute->value());
        $this->assertSame('Trucks', $attribute->toArray()['value']);

        $candidate = new MatchCandidate(null, Uuid::random(), null, 0.9, 1);
        $shortlist = new MatchShortlist(
            Uuid::random(),
            Uuid::random(),
            new \DateTimeImmutable('2026-01-01'),
            [$candidate]
        );

        $this->assertNotEmpty($shortlist->id()->value());
        $this->assertCount(1, $shortlist->candidates());
        $this->assertCount(1, $shortlist->toArray()['candidates']);
    }
}
