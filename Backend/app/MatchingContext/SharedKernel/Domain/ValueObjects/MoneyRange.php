<?php

namespace App\MatchingContext\SharedKernel\Domain\ValueObjects;

use App\MatchingContext\SharedKernel\Domain\Exceptions\DomainException;

final class MoneyRange
{
    public function __construct(
        private readonly ?float $min,
        private readonly ?float $max
    ) {
        if ($this->min !== null && $this->max !== null && $this->min > $this->max) {
            throw new DomainException('Budget range must satisfy min <= max.');
        }
    }

    public static function fromNullable(?float $min, ?float $max): self
    {
        return new self($min, $max);
    }

    public function min(): ?float
    {
        return $this->min;
    }

    public function max(): ?float
    {
        return $this->max;
    }

    public function toArray(): array
    {
        return [
            'min_budget' => $this->min,
            'max_budget' => $this->max,
        ];
    }
}
