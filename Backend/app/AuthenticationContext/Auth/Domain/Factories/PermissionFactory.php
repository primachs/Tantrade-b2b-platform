<?php

namespace App\AuthenticationContext\Auth\Domain\Factories;

use App\AuthenticationContext\Auth\Domain\Entities\Permission;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

class PermissionFactory
{
    public function create(array $payload): Permission
    {
        return new Permission(
            Uuid::random(),
            $payload['key'],
            $payload['description'] ?? null,
            null,
            null
        );
    }

    public function fromState(array $state): Permission
    {
        return new Permission(
            Uuid::fromString($state['id']),
            $state['key'],
            $state['description'] ?? null,
            isset($state['created_at']) ? new \DateTimeImmutable($state['created_at']) : null,
            isset($state['updated_at']) ? new \DateTimeImmutable($state['updated_at']) : null
        );
    }
}
