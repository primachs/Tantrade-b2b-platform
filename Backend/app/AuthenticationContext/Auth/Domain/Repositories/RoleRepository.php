<?php

namespace App\AuthenticationContext\Auth\Domain\Repositories;

use App\AuthenticationContext\Auth\Domain\Entities\Role;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

interface RoleRepository
{
    public function create(Role $role): Role;

    public function findById(Uuid $roleId): ?Role;

    public function findByName(string $name): ?Role;

    public function assignToUser(Uuid $userId, Uuid $roleId): void;

    public function revokeFromUser(Uuid $userId, Uuid $roleId): void;

    /** @return array<int, Role> */
    public function listForUser(Uuid $userId): array;

    /** @return array<int, Role> */
    public function listAll(): array;
}
