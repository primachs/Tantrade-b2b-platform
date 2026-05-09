<?php

namespace App\MarketGovernanceContext\SharedKernel\Domain\ValueObjects;

use App\MarketGovernanceContext\SharedKernel\Domain\Exceptions\DomainException;

final class EmailAddress
{
    private string $value;

    private function __construct(string $value)
    {
        if (! filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new DomainException('Invalid email address.');
        }

        $this->value = strtolower($value);
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
