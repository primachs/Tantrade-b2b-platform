<?php

namespace App\AuthenticationContext\Auth\Application;

use App\AuthenticationContext\Auth\Domain\Factories\AuthUserFactory;
use App\AuthenticationContext\Auth\Domain\Repositories\AuthUserRepository;
use App\AuthenticationContext\SharedKernel\Domain\Enums\AuthUserStatus;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    private const MAX_FAILED_ATTEMPTS = 5;
    private const LOCKOUT_MINUTES = 15;

    public function __construct(
        private readonly AuthUserRepository $repository,
        private readonly AuthUserFactory $factory
    ) {}

    public function register(array $payload): array
    {
        $email = EmailAddress::fromString($payload['email']);
        if ($this->repository->findByEmail($email)) {
            throw new \RuntimeException('Email already registered.');
        }

        $user = $this->factory->create([
            'name' => $payload['name'],
            'email' => $email->value(),
            'password_hash' => Hash::make($payload['password']),
            'status' => AuthUserStatus::ACTIVE->value,
            'password_changed_at' => new \DateTimeImmutable(),
        ]);

        $saved = $this->repository->create($user);

        return $this->sanitizeUser($saved);
    }

    public function login(array $payload): array
    {
        $email = EmailAddress::fromString($payload['email']);
        $user = $this->repository->findByEmail($email);
        $now = new \DateTimeImmutable();

        if (! $user) {
            $this->repository->recordLoginAttempt(null, $email->value(), $payload['ip'] ?? '', false, $payload['user_agent'] ?? null);
            throw new \RuntimeException('Invalid credentials.');
        }

        if ($user->status() !== AuthUserStatus::ACTIVE->value) {
            throw new \RuntimeException('Account is not active.');
        }

        if ($user->isLocked($now)) {
            throw new \RuntimeException('Account is temporarily locked.');
        }

        if (! Hash::check($payload['password'], $user->passwordHash())) {
            $attempts = $user->failedLoginAttempts() + 1;
            $lockedUntil = $attempts >= self::MAX_FAILED_ATTEMPTS
                ? $now->modify('+'.self::LOCKOUT_MINUTES.' minutes')
                : null;

            $this->repository->update($user->withLoginFailure($attempts, $lockedUntil));
            $this->repository->recordLoginAttempt($user->id(), $email->value(), $payload['ip'] ?? '', false, $payload['user_agent'] ?? null);

            throw new \RuntimeException('Invalid credentials.');
        }

        $updated = $this->repository->update($user->withLoginSuccess($now));
        $token = $this->repository->issueToken($user->id(), $payload['device_name'] ?? 'api', ['*']);
        $this->repository->recordLoginAttempt($user->id(), $email->value(), $payload['ip'] ?? '', true, $payload['user_agent'] ?? null);

        return [
            'token' => $token,
            'user' => $this->sanitizeUser($updated),
        ];
    }

    public function logout(string $userId, ?string $tokenId): void
    {
        $uuid = Uuid::fromString($userId);

        if ($tokenId) {
            $this->repository->revokeToken($uuid, $tokenId);

            return;
        }

        $this->repository->revokeAllTokens($uuid);
    }

    public function changePassword(string $userId, array $payload): void
    {
        $user = $this->requireUser($userId);

        if (! Hash::check($payload['current_password'], $user->passwordHash())) {
            throw new \RuntimeException('Current password is incorrect.');
        }

        $updated = $user->withPasswordHash(Hash::make($payload['new_password']), new \DateTimeImmutable());

        $this->repository->update($updated);
    }

    private function requireUser(string $userId)
    {
        $user = $this->repository->findById(Uuid::fromString($userId));
        if (! $user) {
            throw new \RuntimeException('Auth user not found.');
        }

        return $user;
    }

    private function sanitizeUser($user): array
    {
        $data = $user->toArray();
        unset($data['password_hash'], $data['mfa_secret'], $data['mfa_recovery_codes']);

        return $data;
    }
}
