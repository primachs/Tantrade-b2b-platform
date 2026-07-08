<?php

namespace App\AuthenticationContext\Auth\Tests\Unit;

use App\AuthenticationContext\Auth\Application\AuthService;
use App\AuthenticationContext\Auth\Domain\Factories\RoleFactory;
use App\AuthenticationContext\Auth\Domain\Repositories\RoleRepository;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_role_repository_paths(): void
    {
        $authService = app(AuthService::class);
        $repository = app(RoleRepository::class);
        $factory = new RoleFactory;

        $user = $authService->register([
            'name' => 'Repo User',
            'email' => 'repo.user@example.com',
            'password' => 'StrongPassw0rd!2026',
        ]);

        $role = $repository->create($factory->create([
            'name' => 'REPO_ROLE',
            'description' => 'Repository role',
        ]));

        $repository->assignToUser(Uuid::fromString($user['id']), $role->id());
        $roles = $repository->listForUser(Uuid::fromString($user['id']));
        $this->assertCount(1, $roles);

        $repository->revokeFromUser(Uuid::fromString($user['id']), $role->id());
        $roles = $repository->listForUser(Uuid::fromString($user['id']));
        $this->assertCount(0, $roles);

        $this->assertNull($repository->findById(Uuid::fromString('11111111-1111-1111-1111-111111111111')));
        $repository->assignToUser(Uuid::fromString('11111111-1111-1111-1111-111111111111'), $role->id());
        $repository->revokeFromUser(Uuid::fromString('11111111-1111-1111-1111-111111111111'), $role->id());
        $this->assertCount(0, $repository->listForUser(Uuid::fromString('11111111-1111-1111-1111-111111111111')));
    }
}
