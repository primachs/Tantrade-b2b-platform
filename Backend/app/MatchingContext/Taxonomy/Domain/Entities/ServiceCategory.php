<?php

namespace App\MatchingContext\Taxonomy\Domain\Entities;

use App\MatchingContext\SharedKernel\Domain\ValueObjects\Uuid;

final class ServiceCategory
{
    public function __construct(
        private readonly Uuid $id,
        private readonly string $name,
        private readonly ?Uuid $parentId,
        private readonly int $level,
        private readonly bool $isActive
    ) {}

    public function id(): Uuid
    {
        return $this->id;
    }

    public function parentId(): ?Uuid
    {
        return $this->parentId;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'name' => $this->name,
            'parent_id' => $this->parentId?->value(),
            'level' => $this->level,
            'is_active' => $this->isActive,
        ];
    }
}
