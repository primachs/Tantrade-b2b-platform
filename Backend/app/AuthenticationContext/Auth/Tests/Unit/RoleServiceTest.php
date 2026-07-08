<?php

namespace App\AuthenticationContext\Auth\Tests\Unit;

use App\AuthenticationContext\Auth\Application\AuthService;
use App\AuthenticationContext\Auth\Application\RoleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_role_assignment_flow(): void
    {
        $authService = app(AuthService::class);
        $roleService = app(RoleService::class);

        $user = $authService->register([
            'name' => 'Role User',
            'email' => 'role.user@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        $role = $roleService->create([
            'name' => 'ADMIN',
            'description' => 'Admin role',
        ]);

        $roleService->assignRole($user['id'], $role['id']);
        $roles = $roleService->listRoles($user['id']);

        $this->assertCount(1, $roles);
        $this->assertSame('ADMIN', $roles[0]['name']);

        $roleService->revokeRole($user['id'], $role['id']);

        $roles = $roleService->listRoles($user['id']);
        $this->assertCount(0, $roles);
    }

    public function test_assign_role_rejects_missing_user(): void
    {
        $roleService = app(RoleService::class);

        $role = $roleService->create([
            'name' => 'EDITOR',
            'description' => 'Editor role',
        ]);

        $this->expectException(\RuntimeException::class);

        $roleService->assignRole('11111111-1111-1111-1111-111111111111', $role['id']);
    }

    public function test_assign_role_rejects_missing_role(): void
    {
        $authService = app(AuthService::class);
        $roleService = app(RoleService::class);

        $user = $authService->register([
            'name' => 'Missing Role User',
            'email' => 'missing.role@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        $this->expectException(\RuntimeException::class);

        $roleService->assignRole($user['id'], '11111111-1111-1111-1111-111111111111');
    }
}
