<?php

namespace App\MatchingContext\Taxonomy\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class ServiceAttribute
{
    public function __construct(
        private readonly Uuid $id,
        private readonly Uuid $serviceTypeId,
        private readonly string $name
    ) {
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'service_type_id' => $this->serviceTypeId->value(),
            'name' => $this->name,
        ];
    }
}
