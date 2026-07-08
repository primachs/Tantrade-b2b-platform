<?php

namespace App\MatchingContext\Matching\Domain\Entities;

use App\MatchingContext\Business\Domain\Entities\BusinessTrustMetrics;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Location;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class CandidateProfile
{
    /** @var CandidateAttribute[] */
    private array $attributes;

    public function __construct(
        private readonly Uuid $sellerId,
        private readonly Uuid $serviceTypeId,
        private readonly Location $location,
        private readonly ?BusinessTrustMetrics $trustMetrics,
        array $attributes
    ) {
        $this->attributes = $attributes;
    }

    public function sellerId(): Uuid
    {
        return $this->sellerId;
    }

    public function serviceTypeId(): Uuid
    {
        return $this->serviceTypeId;
    }

    public function location(): Location
    {
        return $this->location;
    }

    public function trustMetrics(): ?BusinessTrustMetrics
    {
        return $this->trustMetrics;
    }

    /** @return CandidateAttribute[] */
    public function attributes(): array
    {
        return $this->attributes;
    }
}
