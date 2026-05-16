<?php

namespace App\AuthenticationContext\Auth\Domain\Repositories;

use App\AuthenticationContext\Auth\Domain\Entities\Permission;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

interface PermissionRepository
{
    public function create(Permission $permission): Permission;

    public function findById(Uuid $permissionId): ?Permission;

    public function assignToRole(Uuid $roleId, Uuid $permissionId): void;

    public function revokeFromRole(Uuid $roleId, Uuid $permissionId): void;

    /** @return array<int, Permission> */
    public function listForRole(Uuid $roleId): array;
}
