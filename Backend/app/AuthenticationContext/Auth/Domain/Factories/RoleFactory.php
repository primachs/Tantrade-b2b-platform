<?php

namespace App\AuthenticationContext\Auth\Domain\Factories;

use App\AuthenticationContext\Auth\Domain\Entities\Role;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

class RoleFactory
{
    public function create(array $payload): Role
    {
        return new Role(
            Uuid::random(),
            $payload['name'],
            $payload['description'] ?? null,
            null,
            null
        );
    }

    public function fromState(array $state): Role
    {
        return new Role(
            Uuid::fromString($state['id']),
            $state['name'],
            $state['description'] ?? null,
            isset($state['created_at']) ? new \DateTimeImmutable($state['created_at']) : null,
            isset($state['updated_at']) ? new \DateTimeImmutable($state['updated_at']) : null
        );
    }
}
