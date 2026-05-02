<?php

namespace App\MatchingContext\Matching\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class MatchShortlist
{
    /** @var MatchCandidate[] */
    private array $candidates;

    public function __construct(
        private readonly Uuid $id,
        private readonly Uuid $rfsId,
        private readonly \DateTimeImmutable $createdAt,
        array $candidates
    ) {
        $this->candidates = $candidates;
    }

    public function id(): Uuid
    {
        return $this->id;
    }

    /** @return MatchCandidate[] */
    public function candidates(): array
    {
        return $this->candidates;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'rfs_id' => $this->rfsId->value(),
            'created_at' => $this->createdAt->format('c'),
            'candidates' => array_map(static fn (MatchCandidate $candidate) => $candidate->toArray(), $this->candidates),
        ];
    }
}
