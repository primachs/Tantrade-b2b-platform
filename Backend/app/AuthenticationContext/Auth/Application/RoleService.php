<?php

namespace App\AuthenticationContext\Auth\Application;

use App\AuthenticationContext\Auth\Domain\Factories\RoleFactory;
use App\AuthenticationContext\Auth\Domain\Repositories\AuthUserRepository;
use App\AuthenticationContext\Auth\Domain\Repositories\RoleRepository;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

class RoleService
{
    public function __construct(
        private readonly RoleRepository $repository,
        private readonly AuthUserRepository $authUserRepository,
        private readonly RoleFactory $factory
    ) {}

    public function create(array $payload): array
    {
        $role = $this->factory->create($payload);
        $saved = $this->repository->create($role);

        return $saved->toArray();
    }

    public function assignRole(string $userId, string $roleId): void
    {
        $this->requireUser($userId);
        $this->requireRole($roleId);

        $this->repository->assignToUser(Uuid::fromString($userId), Uuid::fromString($roleId));
    }

    public function revokeRole(string $userId, string $roleId): void
    {
        $this->requireUser($userId);
        $this->requireRole($roleId);

        $this->repository->revokeFromUser(Uuid::fromString($userId), Uuid::fromString($roleId));
    }

    public function listRoles(string $userId): array
    {
        $this->requireUser($userId);

        $roles = $this->repository->listForUser(Uuid::fromString($userId));

        return array_map(static fn ($role) => $role->toArray(), $roles);
    }

    public function listAllRoles(): array
    {
        $roles = $this->repository->listAll();

        return array_map(static fn ($role) => $role->toArray(), $roles);
    }

    private function requireUser(string $userId): void
    {
        if (! $this->authUserRepository->findById(Uuid::fromString($userId))) {
            throw new \RuntimeException('Auth user not found.');
        }
    }

    private function requireRole(string $roleId): void
    {
        if (! $this->repository->findById(Uuid::fromString($roleId))) {
            throw new \RuntimeException('Role not found.');
        }
    }
}
