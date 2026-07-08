<?php

namespace App\MatchingContext\Matching\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class MatchCandidate
{
    public function __construct(
        private readonly ?Uuid $id,
        private readonly Uuid $sellerId,
        private readonly ?string $sellerName,
        private readonly float $score,
        private readonly int $rank
    ) {}

    public function toArray(): array
    {
        return [
            'id' => $this->id?->value(),
            'seller_id' => $this->sellerId->value(),
            'seller_name' => $this->sellerName,
            'score' => $this->score,
            'rank' => $this->rank,
        ];
    }
}
