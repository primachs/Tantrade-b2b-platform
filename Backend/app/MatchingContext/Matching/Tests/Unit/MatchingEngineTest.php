<?php

namespace App\MatchingContext\Matching\Tests\Unit;

use App\MatchingContext\Business\Domain\Entities\BusinessTrustMetrics;
use App\MatchingContext\Matching\Domain\Entities\CandidateProfile;
use App\MatchingContext\Matching\Domain\Services\MatchingEngine;
use App\MatchingContext\Rfs\Domain\Entities\Rfs;
use App\MatchingContext\Rfs\Domain\Entities\RfsConstraint;
use App\MatchingContext\Rfs\Domain\Entities\RfsPreference;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\DateRange;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Location;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\MoneyRange;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\PreferenceWeights;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\TestCase;

class MatchingEngineTest extends TestCase
{
    public function test_score_candidate_with_preferences(): void
    {
        $rfsId = Uuid::random();
        $buyerId = Uuid::random();
        $serviceTypeId = Uuid::random();

        $constraint = new RfsConstraint(
            null,
            $rfsId,
            MoneyRange::fromNullable(1000.0, 5000.0),
            DateRange::fromNullable(null, null),
            Location::fromNullable('Dar', 'Ilala')
        );

        $preference = new RfsPreference(
            $rfsId,
            PreferenceWeights::fromArray([
                'cost_weight' => 2,
                'quality_weight' => 3,
                'speed_weight' => 1,
                'experience_weight' => 1,
                'location_weight' => 1,
            ])
        );

        $rfs = new Rfs(
            $rfsId,
            $buyerId,
            'Need maintenance',
            'Fleet support',
            $serviceTypeId,
            'SMALL',
            'BASIC',
            'OPEN',
            new \DateTimeImmutable,
            $constraint,
            $preference,
            []
        );

        $sellerId = Uuid::random();
        $trust = new BusinessTrustMetrics(
            $sellerId,
            1.2,
            0.8,
            -0.4,
            0.0,
            null,
            null
        );

        $candidate = new CandidateProfile(
            $sellerId,
            $serviceTypeId,
            Location::fromNullable('Dar', 'Ilala'),
            $trust,
            []
        );

        $engine = new MatchingEngine;
        $result = $engine->scoreCandidate($rfs, $candidate, [
            'taxonomy_score' => 2.0,
            'attribute_match_ratio' => 1.0,
        ]);

        $this->assertArrayHasKey('score', $result);
        $this->assertArrayHasKey('breakdown', $result);
        $this->assertLessThanOrEqual(1.0, $result['score']);
        $this->assertGreaterThanOrEqual(0.0, $result['score']);
    }

    public function test_score_candidate_with_zero_weights(): void
    {
        $rfsId = Uuid::random();
        $buyerId = Uuid::random();
        $serviceTypeId = Uuid::random();

        $preference = new RfsPreference(
            $rfsId,
            PreferenceWeights::fromArray([
                'cost_weight' => 0,
                'quality_weight' => 0,
                'speed_weight' => 0,
                'experience_weight' => 0,
                'location_weight' => 0,
            ])
        );

        $rfs = new Rfs(
            $rfsId,
            $buyerId,
            'Title',
            'Desc',
            $serviceTypeId,
            'SMALL',
            'BASIC',
            'OPEN',
            new \DateTimeImmutable,
            null,
            $preference,
            []
        );

        $sellerId = Uuid::random();
        $trust = new BusinessTrustMetrics(
            $sellerId,
            0.5,
            0.2,
            0.4,
            0.1,
            null,
            null
        );

        $candidate = new CandidateProfile(
            $sellerId,
            $serviceTypeId,
            Location::fromNullable(null, null),
            $trust,
            []
        );

        $engine = new MatchingEngine;
        $result = $engine->scoreCandidate($rfs, $candidate, [
            'taxonomy_score' => 0.7,
            'attribute_match_ratio' => 0.0,
        ]);

        $this->assertArrayHasKey('score', $result);
    }
}
