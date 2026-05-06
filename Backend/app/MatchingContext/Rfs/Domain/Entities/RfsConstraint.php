<?php

namespace App\MatchingContext\Rfs\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\DateRange;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Location;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\MoneyRange;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class RfsConstraint
{
    public function __construct(
        private readonly ?Uuid $id,
        private readonly Uuid $rfsId,
        private readonly MoneyRange $budget,
        private readonly DateRange $timeline,
        private readonly Location $location
    ) {}

    public function budget(): MoneyRange
    {
        return $this->budget;
    }

    public function timeline(): DateRange
    {
        return $this->timeline;
    }

    public function location(): Location
    {
        return $this->location;
    }

    public function toArray(): array
    {
        return array_merge([
            'id' => $this->id?->value(),
            'rfs_id' => $this->rfsId->value(),
        ], $this->budget->toArray(), $this->timeline->toArray(), $this->location->toArray());
    }
}
