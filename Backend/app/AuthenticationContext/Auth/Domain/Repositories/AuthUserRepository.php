<?php

namespace App\AuthenticationContext\Auth\Domain\Repositories;

use App\AuthenticationContext\Auth\Domain\Entities\AuthUser;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

interface AuthUserRepository
{
    public function create(AuthUser $user): AuthUser;

    public function update(AuthUser $user): AuthUser;

    public function findById(Uuid $userId): ?AuthUser;

    public function findByEmail(EmailAddress $email): ?AuthUser;

    public function issueToken(Uuid $userId, string $name, array $abilities): string;

    public function revokeToken(Uuid $userId, ?string $tokenId): void;

    public function revokeAllTokens(Uuid $userId): void;

    public function recordLoginAttempt(?Uuid $userId, string $email, string $ip, bool $success, ?string $userAgent): void;
}
