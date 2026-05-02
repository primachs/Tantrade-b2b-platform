<?php

namespace App\MatchingContext\Matching\Domain\Repositories;

use App\MatchingContext\Matching\Domain\Entities\CandidateProfile;
use App\MatchingContext\Matching\Domain\Entities\MatchShortlist;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

interface MatchingRepository
{
    /** @return CandidateProfile[] */
    public function findCandidatesByServiceTypes(array $serviceTypeIds): array;

    public function storeShortlist(MatchShortlist $shortlist): MatchShortlist;

    public function findLatestShortlist(Uuid $rfsId): ?MatchShortlist;
}
