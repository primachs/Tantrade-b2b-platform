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
        private readonly ?string $nidaNumber,
        private readonly ?string $firstName,
        private readonly ?string $middleName,
        private readonly ?string $surname,
        private readonly ?string $gender,
        private readonly ?string $mobile,
        private readonly ?string $address,
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

    public function nidaNumber(): ?string
    {
        return $this->nidaNumber;
    }

    public function firstName(): ?string
    {
        return $this->firstName;
    }

    public function middleName(): ?string
    {
        return $this->middleName;
    }

    public function surname(): ?string
    {
        return $this->surname;
    }

    public function gender(): ?string
    {
        return $this->gender;
    }

    public function mobile(): ?string
    {
        return $this->mobile;
    }

    public function address(): ?string
    {
        return $this->address;
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
            $this->nidaNumber,
            $this->firstName,
            $this->middleName,
            $this->surname,
            $this->gender,
            $this->mobile,
            $this->address,
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
            $this->nidaNumber,
            $this->firstName,
            $this->middleName,
            $this->surname,
            $this->gender,
            $this->mobile,
            $this->address,
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
            $this->nidaNumber,
            $this->firstName,
            $this->middleName,
            $this->surname,
            $this->gender,
            $this->mobile,
            $this->address,
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
            'nida_number' => $this->nidaNumber,
            'first_name' => $this->firstName,
            'middle_name' => $this->middleName,
            'surname' => $this->surname,
            'gender' => $this->gender,
            'mobile' => $this->mobile,
            'address' => $this->address,
            'created_at' => $this->createdAt?->format('c'),
            'updated_at' => $this->updatedAt?->format('c'),
        ];
    }
}
