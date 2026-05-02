<?php

namespace App\MatchingContext\SharedKernel\Domain\ValueObjects;

final class PreferenceWeights
{
    public function __construct(
        private readonly float $cost,
        private readonly float $quality,
        private readonly float $speed,
        private readonly float $experience,
        private readonly float $location
    ) {
    }

    public static function fromArray(array $weights): self
    {
        return new self(
            (float) ($weights['cost_weight'] ?? 0.0),
            (float) ($weights['quality_weight'] ?? 0.0),
            (float) ($weights['speed_weight'] ?? 0.0),
            (float) ($weights['experience_weight'] ?? 0.0),
            (float) ($weights['location_weight'] ?? 0.0)
        );
    }

    public function normalized(): array
    {
        $total = $this->cost + $this->quality + $this->speed + $this->experience + $this->location;
        if ($total <= 0.0) {
            return [
                'cost' => 0.0,
                'quality' => 0.0,
                'speed' => 0.0,
                'experience' => 0.0,
                'location' => 0.0,
            ];
        }

        return [
            'cost' => $this->cost / $total,
            'quality' => $this->quality / $total,
            'speed' => $this->speed / $total,
            'experience' => $this->experience / $total,
            'location' => $this->location / $total,
        ];
    }

    public function toArray(): array
    {
        return [
            'cost_weight' => $this->cost,
            'quality_weight' => $this->quality,
            'speed_weight' => $this->speed,
            'experience_weight' => $this->experience,
            'location_weight' => $this->location,
        ];
    }
}
