<?php

namespace App\MatchingContext\Rfs\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class RfsAttribute
{
    public function __construct(
        private readonly ?Uuid $id,
        private readonly Uuid $rfsId,
        private readonly Uuid $attributeId,
        private readonly string $value
    ) {
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id?->value(),
            'rfs_id' => $this->rfsId->value(),
            'attribute_id' => $this->attributeId->value(),
            'value' => $this->value,
        ];
    }
}
