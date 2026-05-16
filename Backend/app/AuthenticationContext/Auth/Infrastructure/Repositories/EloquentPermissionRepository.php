<?php

namespace App\AuthenticationContext\Auth\Infrastructure\Repositories;

use App\AuthenticationContext\Auth\Domain\Entities\Permission;
use App\AuthenticationContext\Auth\Domain\Factories\PermissionFactory;
use App\AuthenticationContext\Auth\Domain\Repositories\PermissionRepository;
use App\AuthenticationContext\Auth\Infrastructure\Models\Permission as PermissionModel;
use App\AuthenticationContext\Auth\Infrastructure\Models\Role as RoleModel;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

class EloquentPermissionRepository implements PermissionRepository
{
    public function __construct(private readonly PermissionFactory $factory) {}

    public function create(Permission $permission): Permission
    {
        $data = $permission->toArray();

        PermissionModel::create([
            'id' => $data['id'],
            'key' => $data['key'],
            'description' => $data['description'],
        ]);

        return $this->findById(Uuid::fromString($data['id'])) ?? $permission;
    }

    public function findById(Uuid $permissionId): ?Permission
    {
        $model = PermissionModel::query()->find($permissionId->value());
        if (! $model) {
            return null;
        }

        return $this->factory->fromState($model->toArray());
    }

    public function assignToRole(Uuid $roleId, Uuid $permissionId): void
    {
        $role = RoleModel::query()->find($roleId->value());
        if (! $role) {
            return;
        }

        $role->permissions()->syncWithoutDetaching([$permissionId->value()]);
    }

    public function revokeFromRole(Uuid $roleId, Uuid $permissionId): void
    {
        $role = RoleModel::query()->find($roleId->value());
        if (! $role) {
            return;
        }

        $role->permissions()->detach($permissionId->value());
    }

    public function listForRole(Uuid $roleId): array
    {
        $role = RoleModel::query()->find($roleId->value());
        if (! $role) {
            return [];
        }

        return $role->permissions->map(fn (PermissionModel $permission) => $this->factory->fromState($permission->toArray()))->all();
    }
}
