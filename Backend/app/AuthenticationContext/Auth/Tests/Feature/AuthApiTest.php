<?php

namespace App\AuthenticationContext\Auth\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

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
}
