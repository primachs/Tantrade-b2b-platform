<?php

namespace App\AuthenticationContext\Auth\Infrastructure\Repositories;

use App\AuthenticationContext\Auth\Domain\Entities\Role;
use App\AuthenticationContext\Auth\Domain\Factories\RoleFactory;
use App\AuthenticationContext\Auth\Domain\Repositories\RoleRepository;
use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser as AuthUserModel;
use App\AuthenticationContext\Auth\Infrastructure\Models\Role as RoleModel;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

class EloquentRoleRepository implements RoleRepository
{
    public function __construct(private readonly RoleFactory $factory) {}

    public function create(Role $role): Role
    {
        $data = $role->toArray();

        RoleModel::create([
            'id' => $data['id'],
            'name' => $data['name'],
            'description' => $data['description'],
        ]);

        return $this->findById(Uuid::fromString($data['id'])) ?? $role;
    }

    public function findById(Uuid $roleId): ?Role
    {
        $model = RoleModel::query()->find($roleId->value());
        if (! $model) {
            return null;
        }

        return $this->factory->fromState($model->toArray());
    }

    public function findByName(string $name): ?Role
    {
        $model = RoleModel::query()->where('name', $name)->first();
        if (! $model) {
            return null;
        }

        return $this->factory->fromState($model->toArray());
    }

    public function assignToUser(Uuid $userId, Uuid $roleId): void
    {
        $user = AuthUserModel::query()->find($userId->value());
        if (! $user) {
            return;
        }

        $user->roles()->syncWithoutDetaching([$roleId->value()]);
    }

    public function revokeFromUser(Uuid $userId, Uuid $roleId): void
    {
        $user = AuthUserModel::query()->find($userId->value());
        if (! $user) {
            return;
        }

        $user->roles()->detach($roleId->value());
    }

    public function listForUser(Uuid $userId): array
    {
        $user = AuthUserModel::query()->find($userId->value());
        if (! $user) {
            return [];
        }

        return $user->roles->map(fn (RoleModel $role) => $this->factory->fromState($role->toArray()))->all();
    }
}
