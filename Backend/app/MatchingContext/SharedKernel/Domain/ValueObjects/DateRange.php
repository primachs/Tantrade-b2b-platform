<?php

namespace App\MatchingContext\SharedKernel\Domain\ValueObjects;

use App\MatchingContext\SharedKernel\Domain\Exceptions\DomainException;

final class DateRange
{
    public function __construct(
        private readonly ?\DateTimeImmutable $start,
        private readonly ?\DateTimeImmutable $end
    ) {
        if ($this->start !== null && $this->end !== null && $this->start > $this->end) {
            throw new DomainException('Timeline must satisfy start <= deadline.');
        }
    }

    public static function fromNullable(?\DateTimeImmutable $start, ?\DateTimeImmutable $end): self
    {
        return new self($start, $end);
    }

    public function start(): ?\DateTimeImmutable
    {
        return $this->start;
    }

    public function end(): ?\DateTimeImmutable
    {
        return $this->end;
    }

    public function toArray(): array
    {
        return [
            'start_date' => $this->start?->format('Y-m-d'),
            'deadline' => $this->end?->format('Y-m-d'),
        ];
    }
}
