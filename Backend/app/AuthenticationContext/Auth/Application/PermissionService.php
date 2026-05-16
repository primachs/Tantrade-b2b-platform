<?php

namespace App\AuthenticationContext\Auth\Application;

use App\AuthenticationContext\Auth\Domain\Factories\PermissionFactory;
use App\AuthenticationContext\Auth\Domain\Repositories\PermissionRepository;
use App\AuthenticationContext\Auth\Domain\Repositories\RoleRepository;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

class PermissionService
{
    public function __construct(
        private readonly PermissionRepository $repository,
        private readonly RoleRepository $roleRepository,
        private readonly PermissionFactory $factory
    ) {}

    public function create(array $payload): array
    {
        $permission = $this->factory->create($payload);
        $saved = $this->repository->create($permission);

        return $saved->toArray();
    }

    public function assignPermission(string $roleId, string $permissionId): void
    {
        $this->requireRole($roleId);
        $this->requirePermission($permissionId);

        $this->repository->assignToRole(Uuid::fromString($roleId), Uuid::fromString($permissionId));
    }

    public function revokePermission(string $roleId, string $permissionId): void
    {
        $this->requireRole($roleId);
        $this->requirePermission($permissionId);

        $this->repository->revokeFromRole(Uuid::fromString($roleId), Uuid::fromString($permissionId));
    }

    public function listPermissions(string $roleId): array
    {
        $this->requireRole($roleId);

        $permissions = $this->repository->listForRole(Uuid::fromString($roleId));

        return array_map(static fn ($permission) => $permission->toArray(), $permissions);
    }

    private function requireRole(string $roleId): void
    {
        if (! $this->roleRepository->findById(Uuid::fromString($roleId))) {
            throw new \RuntimeException('Role not found.');
        }
    }

    private function requirePermission(string $permissionId): void
    {
        if (! $this->repository->findById(Uuid::fromString($permissionId))) {
            throw new \RuntimeException('Permission not found.');
        }
    }
}
