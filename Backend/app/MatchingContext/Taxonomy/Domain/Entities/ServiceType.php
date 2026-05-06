<?php

namespace App\MatchingContext\Taxonomy\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class ServiceType
{
    public function __construct(
        private readonly Uuid $id,
        private readonly string $name,
        private readonly Uuid $categoryId,
        private readonly bool $isActive
    ) {}

    public function id(): Uuid
    {
        return $this->id;
    }

    public function categoryId(): Uuid
    {
        return $this->categoryId;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'name' => $this->name,
            'category_id' => $this->categoryId->value(),
            'is_active' => $this->isActive,
        ];
    }
}
