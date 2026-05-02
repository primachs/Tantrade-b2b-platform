<?php

namespace App\MatchingContext\Taxonomy\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class AttributeValue
{
    public function __construct(
        private readonly Uuid $id,
        private readonly Uuid $attributeId,
        private readonly string $value
    ) {
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'attribute_id' => $this->attributeId->value(),
            'value' => $this->value,
        ];
    }
}
