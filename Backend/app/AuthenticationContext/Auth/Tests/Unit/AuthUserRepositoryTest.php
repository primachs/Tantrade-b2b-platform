<?php

namespace App\AuthenticationContext\Auth\Tests\Unit;

use App\AuthenticationContext\Auth\Application\AuthService;
use App\AuthenticationContext\Auth\Domain\Repositories\AuthUserRepository;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthUserRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_repository_handles_missing_users(): void
    {
        $repository = app(AuthUserRepository::class);

        $this->assertNull($repository->findById(Uuid::fromString('11111111-1111-1111-1111-111111111111')));
        $this->assertNull($repository->findByEmail(EmailAddress::fromString('missing@example.com')));

        $repository->revokeToken(Uuid::fromString('11111111-1111-1111-1111-111111111111'), '1');
        $repository->revokeAllTokens(Uuid::fromString('11111111-1111-1111-1111-111111111111'));

        $this->expectException(\RuntimeException::class);
        $repository->issueToken(Uuid::fromString('11111111-1111-1111-1111-111111111111'), 'tests', ['*']);
    }

    public function test_repository_revokes_tokens(): void
    {
        $service = app(AuthService::class);
        $repository = app(AuthUserRepository::class);

        $user = $service->register([
            'name' => 'Token User',
            'email' => 'token.user@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        $token = $repository->issueToken(Uuid::fromString($user['id']), 'tests', ['*']);
        $this->assertNotEmpty($token);

        $repository->revokeToken(Uuid::fromString($user['id']), null);
        $repository->revokeAllTokens(Uuid::fromString($user['id']));
    }
}
