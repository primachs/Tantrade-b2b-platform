<?php

namespace App\AuthenticationContext\Auth\Tests\Feature;

use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser;
use App\AuthenticationContext\Auth\Infrastructure\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
    }

    private function seedRole(string $name): Role
    {
        return Role::create([
            'id' => (string) Str::uuid(),
            'name' => $name,
            'description' => "{$name} role",
        ]);
    }

    public function test_auth_endpoints(): void
    {
        $register = $this->postJson('/api/auth/register', [
            'name' => 'Api User',
            'email' => 'api.user@example.com',
            'password' => 'StrongPassw0rd!2026',
            'password_confirmation' => 'StrongPassw0rd!2026',
        ]);

        $register->assertStatus(201);

        $login = $this->postJson('/api/auth/login', [
            'email' => 'api.user@example.com',
            'password' => 'StrongPassw0rd!2026',
            'device_name' => 'tests',
        ]);

        $login->assertStatus(200);
        $token = $login->json('token');
        $this->assertNotEmpty($token);

        $headers = ['Authorization' => 'Bearer '.$token];

        $this->getJson('/api/auth/me', $headers)
            ->assertStatus(200)
            ->assertJson(['email' => 'api.user@example.com']);

        $this->postJson('/api/auth/password/change', [
            'current_password' => 'StrongPassw0rd!2026',
            'new_password' => 'NewStrongPassw0rd!2026',
            'new_password_confirmation' => 'NewStrongPassw0rd!2026',
        ], $headers)->assertStatus(200);

        $this->postJson('/api/auth/logout', [], $headers)->assertStatus(200);
    }

    public function test_register_with_matching_service_assigns_buyer_role(): void
    {
        $this->seedRole('BUYER');

        $this->postJson('/api/auth/register', [
            'name' => 'Matching Api User',
            'email' => 'matching.api@example.com',
            'password' => 'StrongPassw0rd!2026',
            'password_confirmation' => 'StrongPassw0rd!2026',
            'service' => 'matching',
        ])->assertStatus(201);

        $user = AuthUser::query()->with('roles')->where('email', 'matching.api@example.com')->first();
        $this->assertSame(['BUYER'], $user->roles->pluck('name')->all());
    }

    public function test_register_with_governance_service_assigns_governance_role(): void
    {
        $this->seedRole('GOVERNANCE');

        $this->postJson('/api/auth/register', [
            'name' => 'Governance Api User',
            'email' => 'governance.api@example.com',
            'password' => 'StrongPassw0rd!2026',
            'password_confirmation' => 'StrongPassw0rd!2026',
            'service' => 'governance',
        ])->assertStatus(201);

        $user = AuthUser::query()->with('roles')->where('email', 'governance.api@example.com')->first();
        $this->assertSame(['GOVERNANCE'], $user->roles->pluck('name')->all());
    }

    public function test_me_returns_roles_for_registered_matching_user(): void
    {
        $this->seedRole('BUYER');

        $this->postJson('/api/auth/register', [
            'name' => 'Matching Me User',
            'email' => 'matching.me@example.com',
            'password' => 'StrongPassw0rd!2026',
            'password_confirmation' => 'StrongPassw0rd!2026',
            'service' => 'matching',
        ])->assertStatus(201);

        $login = $this->postJson('/api/auth/login', [
            'email' => 'matching.me@example.com',
            'password' => 'StrongPassw0rd!2026',
            'device_name' => 'tests',
        ])->assertStatus(200);

        $this->getJson('/api/auth/me', ['Authorization' => 'Bearer '.$login->json('token')])
            ->assertStatus(200)
            ->assertJson(['email' => 'matching.me@example.com', 'roles' => ['BUYER']]);
    }
}
