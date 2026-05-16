<?php

namespace App\AuthenticationContext\Auth\Tests\Unit;

use App\AuthenticationContext\Auth\Domain\Factories\PermissionFactory;
use App\AuthenticationContext\Auth\Domain\Factories\RoleFactory;
use App\AuthenticationContext\Auth\Domain\Repositories\PermissionRepository;
use App\AuthenticationContext\Auth\Domain\Repositories\RoleRepository;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_permission_repository_paths(): void
    {
        $roleRepository = app(RoleRepository::class);
        $permissionRepository = app(PermissionRepository::class);
        $roleFactory = new RoleFactory;
        $permissionFactory = new PermissionFactory;

        $role = $roleRepository->create($roleFactory->create([
            'name' => 'PERMISSION_ROLE',
            'description' => 'Role for permissions',
        ]));

        $permission = $permissionRepository->create($permissionFactory->create([
            'key' => 'auth.permissions.read',
            'description' => 'Read permissions',
        ]));

        $permissionRepository->assignToRole($role->id(), $permission->id());
        $permissions = $permissionRepository->listForRole($role->id());
        $this->assertCount(1, $permissions);

        $permissionRepository->revokeFromRole($role->id(), $permission->id());
        $permissions = $permissionRepository->listForRole($role->id());
        $this->assertCount(0, $permissions);

        $this->assertNull($permissionRepository->findById(Uuid::fromString('11111111-1111-1111-1111-111111111111')));
        $permissionRepository->assignToRole(Uuid::fromString('11111111-1111-1111-1111-111111111111'), $permission->id());
        $permissionRepository->revokeFromRole(Uuid::fromString('11111111-1111-1111-1111-111111111111'), $permission->id());
        $this->assertCount(0, $permissionRepository->listForRole(Uuid::fromString('11111111-1111-1111-1111-111111111111')));
    }
}
