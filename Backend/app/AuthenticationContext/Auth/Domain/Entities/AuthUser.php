<?php

namespace App\AuthenticationContext\Auth\Domain\Entities;

use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

final class AuthUser
{
    public function __construct(
        private readonly Uuid $id,
        private readonly string $name,
        private readonly EmailAddress $email,
        private readonly string $passwordHash,
        private readonly string $status,
        private readonly int $failedLoginAttempts,
        private readonly ?\DateTimeImmutable $lockedUntil,
        private readonly ?\DateTimeImmutable $lastLoginAt,
        private readonly ?\DateTimeImmutable $passwordChangedAt,
        private readonly bool $mfaEnabled,
        private readonly ?string $mfaSecret,
        private readonly ?array $mfaRecoveryCodes,
        private readonly ?\DateTimeImmutable $createdAt,
        private readonly ?\DateTimeImmutable $updatedAt
    ) {}

    public function id(): Uuid
    {
        return $this->id;
    }

    public function email(): EmailAddress
    {
        return $this->email;
    }

    public function passwordHash(): string
    {
        return $this->passwordHash;
    }

    public function status(): string
    {
        return $this->status;
    }

    public function failedLoginAttempts(): int
    {
        return $this->failedLoginAttempts;
    }

    public function lockedUntil(): ?\DateTimeImmutable
    {
        return $this->lockedUntil;
    }

    public function isLocked(\DateTimeImmutable $now): bool
    {
        return $this->lockedUntil !== null && $this->lockedUntil > $now;
    }

    public function withLoginFailure(int $attempts, ?\DateTimeImmutable $lockedUntil): self
    {
        return new self(
            $this->id,
            $this->name,
            $this->email,
            $this->passwordHash,
            $this->status,
            $attempts,
            $lockedUntil,
            $this->lastLoginAt,
            $this->passwordChangedAt,
            $this->mfaEnabled,
            $this->mfaSecret,
            $this->mfaRecoveryCodes,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function withLoginSuccess(\DateTimeImmutable $lastLoginAt): self
    {
        return new self(
            $this->id,
            $this->name,
            $this->email,
            $this->passwordHash,
            $this->status,
            0,
            null,
            $lastLoginAt,
            $this->passwordChangedAt,
            $this->mfaEnabled,
            $this->mfaSecret,
            $this->mfaRecoveryCodes,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function withPasswordHash(string $passwordHash, \DateTimeImmutable $changedAt): self
    {
        return new self(
            $this->id,
            $this->name,
            $this->email,
            $passwordHash,
            $this->status,
            $this->failedLoginAttempts,
            $this->lockedUntil,
            $this->lastLoginAt,
            $changedAt,
            $this->mfaEnabled,
            $this->mfaSecret,
            $this->mfaRecoveryCodes,
            $this->createdAt,
            $this->updatedAt
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'name' => $this->name,
            'email' => $this->email->value(),
            'password_hash' => $this->passwordHash,
            'status' => $this->status,
            'failed_login_attempts' => $this->failedLoginAttempts,
            'locked_until' => $this->lockedUntil?->format('c'),
            'last_login_at' => $this->lastLoginAt?->format('c'),
            'password_changed_at' => $this->passwordChangedAt?->format('c'),
            'mfa_enabled' => $this->mfaEnabled,
            'mfa_secret' => $this->mfaSecret,
            'mfa_recovery_codes' => $this->mfaRecoveryCodes,
            'created_at' => $this->createdAt?->format('c'),
            'updated_at' => $this->updatedAt?->format('c'),
        ];
    }
}
