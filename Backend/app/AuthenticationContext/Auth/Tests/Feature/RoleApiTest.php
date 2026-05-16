<?php

namespace App\AuthenticationContext\Auth\Tests\Feature;

use App\AuthenticationContext\Auth\Application\AuthService;
use App\AuthenticationContext\Auth\Application\RoleService;
use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser as AuthUserModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_role_endpoints(): void
    {
        $authService = app(AuthService::class);
        $roleService = app(RoleService::class);

        $authService->register([
            'name' => 'Role Api User',
            'email' => 'role.api.user@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        $role = $roleService->create([
            'name' => 'SUPPORT',
            'description' => 'Support role',
        ]);

        $userModel = AuthUserModel::query()->where('email', 'role.api.user@example.com')->first();
        Sanctum::actingAs($userModel);

        $this->postJson("/api/auth/roles/{$role['id']}")
            ->assertStatus(200);

        $this->getJson('/api/auth/roles')
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $role['id']]);

        $this->deleteJson("/api/auth/roles/{$role['id']}")
            ->assertStatus(200);
    }
}
