<?php

namespace App\AuthenticationContext\Auth\Tests\Unit;

use App\AuthenticationContext\Auth\Application\AuthService;
use App\AuthenticationContext\Auth\Domain\Factories\RoleFactory;
use App\AuthenticationContext\Auth\Domain\Repositories\RoleRepository;
use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser as AuthUserModel;
use App\AuthenticationContext\SharedKernel\Domain\Enums\AuthUserStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    private function seedRole(string $name): void
    {
        $repository = app(RoleRepository::class);
        $factory = new RoleFactory;
        $repository->create($factory->create([
            'name' => $name,
            'description' => "{$name} role",
        ]));
    }

    public function test_register_assigns_buyer_role_for_matching_service(): void
    {
        $this->seedRole('BUYER');
        $service = app(AuthService::class);

        $registered = $service->register([
            'name' => 'Matching User',
            'email' => 'matching.user@example.com',
            'password' => 'StrongPassw0rd!2026',
            'service' => 'matching',
        ]);

        $userModel = AuthUserModel::query()->with('roles')->find($registered['id']);
        $this->assertSame(['BUYER'], $userModel->roles->pluck('name')->all());
    }

    public function test_register_assigns_governance_role_for_governance_service(): void
    {
        $this->seedRole('GOVERNANCE');
        $service = app(AuthService::class);

        $registered = $service->register([
            'name' => 'Governance User',
            'email' => 'governance.user@example.com',
            'password' => 'StrongPassw0rd!2026',
            'service' => 'governance',
        ]);

        $userModel = AuthUserModel::query()->with('roles')->find($registered['id']);
        $this->assertSame(['GOVERNANCE'], $userModel->roles->pluck('name')->all());
    }

    public function test_register_and_login_flow(): void
    {
        $service = app(AuthService::class);

        $registered = $service->register([
            'name' => 'Auth User',
            'email' => 'auth.user@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        $this->assertSame('auth.user@example.com', $registered['email']);

        $result = $service->login([
            'email' => 'auth.user@example.com',
            'password' => 'StrongPassw0rd!2026',
            'device_name' => 'tests',
            'ip' => '127.0.0.1',
            'user_agent' => 'phpunit',
        ]);

        $this->assertNotEmpty($result['token']);
        $this->assertSame($registered['id'], $result['user']['id']);

        $userModel = AuthUserModel::query()->find($registered['id']);
        $this->assertSame(0, $userModel->failed_login_attempts);
        $this->assertNotNull($userModel->last_login_at);
    }

    public function test_login_lockout_after_failures(): void
    {
        $service = app(AuthService::class);

        $service->register([
            'name' => 'Locked User',
            'email' => 'locked.user@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            try {
                $service->login([
                    'email' => 'locked.user@example.com',
                    'password' => 'WrongPassw0rd!2026',
                    'device_name' => 'tests',
                    'ip' => '127.0.0.1',
                    'user_agent' => 'phpunit',
                ]);
            } catch (\RuntimeException $e) {
                // Expected for invalid credentials.
            }
        }

        $userModel = AuthUserModel::query()->where('email', 'locked.user@example.com')->first();
        $this->assertNotNull($userModel->locked_until);

        $this->expectException(\RuntimeException::class);

        $service->login([
            'email' => 'locked.user@example.com',
            'password' => 'StrongPassw0rd!2026',
            'device_name' => 'tests',
            'ip' => '127.0.0.1',
            'user_agent' => 'phpunit',
        ]);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        $service = app(AuthService::class);

        $service->register([
            'name' => 'Duplicate User',
            'email' => 'duplicate.user@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        $this->expectException(\RuntimeException::class);

        $service->register([
            'name' => 'Duplicate User',
            'email' => 'duplicate.user@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);
    }

    public function test_login_rejects_unknown_user(): void
    {
        $service = app(AuthService::class);

        $this->expectException(\RuntimeException::class);

        $service->login([
            'email' => 'missing.user@example.com',
            'password' => 'StrongPassw0rd!2026',
            'device_name' => 'tests',
            'ip' => '127.0.0.1',
            'user_agent' => 'phpunit',
        ]);
    }

    public function test_login_rejects_disabled_user(): void
    {
        $service = app(AuthService::class);

        $registered = $service->register([
            'name' => 'Disabled User',
            'email' => 'disabled.user@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        AuthUserModel::query()->where('id', $registered['id'])->update([
            'status' => AuthUserStatus::DISABLED->value,
        ]);

        $this->expectException(\RuntimeException::class);

        $service->login([
            'email' => 'disabled.user@example.com',
            'password' => 'StrongPassw0rd!2026',
            'device_name' => 'tests',
            'ip' => '127.0.0.1',
            'user_agent' => 'phpunit',
        ]);
    }

    public function test_login_rejects_locked_user(): void
    {
        $service = app(AuthService::class);

        $registered = $service->register([
            'name' => 'Locked User',
            'email' => 'locked.alt.user@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        AuthUserModel::query()->where('id', $registered['id'])->update([
            'locked_until' => Carbon::now()->addMinutes(10),
        ]);

        $this->expectException(\RuntimeException::class);

        $service->login([
            'email' => 'locked.alt.user@example.com',
            'password' => 'StrongPassw0rd!2026',
            'device_name' => 'tests',
            'ip' => '127.0.0.1',
            'user_agent' => 'phpunit',
        ]);
    }

    public function test_change_password_updates_hash(): void
    {
        $service = app(AuthService::class);

        $registered = $service->register([
            'name' => 'Change User',
            'email' => 'change.user@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        $service->changePassword($registered['id'], [
            'current_password' => 'StrongPassw0rd!2026',
            'new_password' => 'NewStrongPassw0rd!2026',
        ]);

        $userModel = AuthUserModel::query()->find($registered['id']);

        $this->assertTrue(Hash::check('NewStrongPassw0rd!2026', $userModel->password));
        $this->assertNotNull($userModel->password_changed_at);
    }

    public function test_change_password_rejects_invalid_user(): void
    {
        $service = app(AuthService::class);

        $this->expectException(\RuntimeException::class);

        $service->changePassword('11111111-1111-1111-1111-111111111111', [
            'current_password' => 'StrongPassw0rd!2026',
            'new_password' => 'NewStrongPassw0rd!2026',
        ]);
    }

    public function test_change_password_rejects_invalid_current_password(): void
    {
        $service = app(AuthService::class);

        $registered = $service->register([
            'name' => 'Wrong Pass User',
            'email' => 'wrong.pass@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        $this->expectException(\RuntimeException::class);

        $service->changePassword($registered['id'], [
            'current_password' => 'WrongPassw0rd!2026',
            'new_password' => 'NewStrongPassw0rd!2026',
        ]);
    }

    public function test_logout_revokes_token(): void
    {
        $service = app(AuthService::class);

        $registered = $service->register([
            'name' => 'Logout User',
            'email' => 'logout.user@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        $service->login([
            'email' => 'logout.user@example.com',
            'password' => 'StrongPassw0rd!2026',
            'device_name' => 'tests',
            'ip' => '127.0.0.1',
            'user_agent' => 'phpunit',
        ]);

        $userModel = AuthUserModel::query()->find($registered['id']);
        $tokenId = (string) $userModel->tokens()->first()->id;

        $service->logout($registered['id'], $tokenId);

        $this->assertSame(0, $userModel->fresh()->tokens()->count());
    }

    public function test_logout_revokes_all_tokens_when_token_missing(): void
    {
        $service = app(AuthService::class);

        $registered = $service->register([
            'name' => 'Logout All User',
            'email' => 'logout.all@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        $service->login([
            'email' => 'logout.all@example.com',
            'password' => 'StrongPassw0rd!2026',
            'device_name' => 'tests',
            'ip' => '127.0.0.1',
            'user_agent' => 'phpunit',
        ]);

        $service->logout($registered['id'], null);

        $userModel = AuthUserModel::query()->find($registered['id']);
        $this->assertSame(0, $userModel->tokens()->count());
    }
}
