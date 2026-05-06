<?php

namespace App\MatchingContext\Matching\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class CandidateAttribute
{
    public function __construct(
        private readonly Uuid $attributeId,
        private readonly string $value
    ) {}

    public function attributeId(): Uuid
    {
        return $this->attributeId;
    }

    public function value(): string
    {
        return $this->value;
    }

    public function toArray(): array
    {
        return [
            'attribute_id' => $this->attributeId->value(),
            'value' => $this->value,
        ];
    }
}
