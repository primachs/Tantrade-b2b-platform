<?php

namespace App\AuthenticationContext\Auth\Domain\Entities;

use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

final class Permission
{
    public function __construct(
        private readonly Uuid $id,
        private readonly string $key,
        private readonly ?string $description,
        private readonly ?\DateTimeImmutable $createdAt,
        private readonly ?\DateTimeImmutable $updatedAt
    ) {}

    public function id(): Uuid
    {
        return $this->id;
    }

    public function key(): string
    {
        return $this->key;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'key' => $this->key,
            'description' => $this->description,
            'created_at' => $this->createdAt?->format('c'),
            'updated_at' => $this->updatedAt?->format('c'),
        ];
    }
}
