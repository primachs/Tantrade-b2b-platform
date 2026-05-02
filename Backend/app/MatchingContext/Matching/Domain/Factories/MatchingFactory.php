<?php

namespace App\MatchingContext\Matching\Domain\Factories;

use App\MatchingContext\Matching\Domain\Entities\MatchCandidate;
use App\MatchingContext\Matching\Domain\Entities\MatchShortlist;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

class MatchingFactory
{
    /** @param array<int, array{seller_id:string, score:float}> $candidates */
    public function createShortlist(Uuid $rfsId, array $candidates): MatchShortlist
    {
        $shortlistId = Uuid::random();
        $rank = 1;
        $candidateEntities = [];

        foreach ($candidates as $candidate) {
            $candidateEntities[] = new MatchCandidate(
                null,
                Uuid::fromString($candidate['seller_id']),
                (float) $candidate['score'],
                $rank
            );
            $rank++;
        }

        return new MatchShortlist($shortlistId, $rfsId, new \DateTimeImmutable(), $candidateEntities);
    }
}
