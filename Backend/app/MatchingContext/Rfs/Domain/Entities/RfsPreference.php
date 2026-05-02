<?php

namespace App\MatchingContext\Rfs\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\PreferenceWeights;
use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class RfsPreference
{
    public function __construct(
        private readonly Uuid $rfsId,
        private readonly PreferenceWeights $weights
    ) {
    }

    public function weights(): PreferenceWeights
    {
        return $this->weights;
    }

    public function toArray(): array
    {
        return array_merge(
            ['rfs_id' => $this->rfsId->value()],
            $this->weights->toArray()
        );
    }
}
