<?php

namespace App\MatchingContext\SharedKernel\Domain\ValueObjects;

final class Location
{
    public function __construct(
        private readonly ?string $region,
        private readonly ?string $district
    ) {}

    public static function fromNullable(?string $region, ?string $district): self
    {
        return new self($region, $district);
    }

    public function region(): ?string
    {
        return $this->region;
    }

    public function district(): ?string
    {
        return $this->district;
    }

    public function toArray(): array
    {
        return [
            'region' => $this->region,
            'district' => $this->district,
        ];
    }
}
