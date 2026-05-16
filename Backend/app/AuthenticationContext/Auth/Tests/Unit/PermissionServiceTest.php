<?php

namespace App\AuthenticationContext\Auth\Tests\Unit;

use App\AuthenticationContext\Auth\Application\PermissionService;
use App\AuthenticationContext\Auth\Application\RoleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_permission_assignment_flow(): void
    {
        $roleService = app(RoleService::class);
        $permissionService = app(PermissionService::class);

        $role = $roleService->create([
            'name' => 'MANAGER',
            'description' => 'Manager role',
        ]);

        $permission = $permissionService->create([
            'key' => 'auth.users.manage',
            'description' => 'Manage auth users',
        ]);

        $permissionService->assignPermission($role['id'], $permission['id']);

        $permissions = $permissionService->listPermissions($role['id']);
        $this->assertCount(1, $permissions);
        $this->assertSame('auth.users.manage', $permissions[0]['key']);

        $permissionService->revokePermission($role['id'], $permission['id']);

        $permissions = $permissionService->listPermissions($role['id']);
        $this->assertCount(0, $permissions);
    }

    public function test_assign_permission_rejects_missing_role(): void
    {
        $permissionService = app(PermissionService::class);

        $permission = $permissionService->create([
            'key' => 'auth.roles.manage',
            'description' => 'Manage roles',
        ]);

        $this->expectException(\RuntimeException::class);

        $permissionService->assignPermission('11111111-1111-1111-1111-111111111111', $permission['id']);
    }

    public function test_assign_permission_rejects_missing_permission(): void
    {
        $roleService = app(RoleService::class);
        $permissionService = app(PermissionService::class);

        $role = $roleService->create([
            'name' => 'AUDITOR',
            'description' => 'Auditor role',
        ]);

        $this->expectException(\RuntimeException::class);

        $permissionService->assignPermission($role['id'], '11111111-1111-1111-1111-111111111111');
    }
}
