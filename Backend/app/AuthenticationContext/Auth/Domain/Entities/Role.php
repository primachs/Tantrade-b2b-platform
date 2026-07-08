<?php

namespace App\AuthenticationContext\Auth\Domain\Entities;

use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

final class Role
{
    public function __construct(
        private readonly Uuid $id,
        private readonly string $name,
        private readonly ?string $description,
        private readonly ?\DateTimeImmutable $createdAt,
        private readonly ?\DateTimeImmutable $updatedAt
    ) {}

    public function id(): Uuid
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'name' => $this->name,
            'description' => $this->description,
            'created_at' => $this->createdAt?->format('c'),
            'updated_at' => $this->updatedAt?->format('c'),
        ];
    }
}
