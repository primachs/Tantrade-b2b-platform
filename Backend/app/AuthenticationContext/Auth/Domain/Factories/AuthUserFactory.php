<?php

namespace App\AuthenticationContext\Auth\Domain\Factories;

use App\AuthenticationContext\Auth\Domain\Entities\AuthUser;
use App\AuthenticationContext\SharedKernel\Domain\Enums\AuthUserStatus;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;

class AuthUserFactory
{
    public function create(array $payload): AuthUser
    {
        return new AuthUser(
            Uuid::random(),
            $payload['name'],
            EmailAddress::fromString($payload['email']),
            $payload['password_hash'],
            $payload['status'] ?? AuthUserStatus::ACTIVE->value,
            0,
            null,
            null,
            $payload['password_changed_at'] ?? new \DateTimeImmutable(),
            $payload['mfa_enabled'] ?? false,
            $payload['mfa_secret'] ?? null,
            $payload['mfa_recovery_codes'] ?? null,
            null,
            null
        );
    }

    public function fromState(array $state): AuthUser
    {
        return new AuthUser(
            Uuid::fromString($state['id']),
            $state['name'],
            EmailAddress::fromString($state['email']),
            $state['password'],
            $state['status'],
            (int) ($state['failed_login_attempts'] ?? 0),
            $this->parseDate($state['locked_until'] ?? null),
            $this->parseDate($state['last_login_at'] ?? null),
            $this->parseDate($state['password_changed_at'] ?? null),
            (bool) ($state['mfa_enabled'] ?? false),
            $state['mfa_secret'] ?? null,
            $this->normalizeRecoveryCodes($state['mfa_recovery_codes'] ?? null),
            $this->parseDate($state['created_at'] ?? null),
            $this->parseDate($state['updated_at'] ?? null)
        );
    }

    private function parseDate($value): ?\DateTimeImmutable
    {
        if (! $value) {
            return null;
        }

        return new \DateTimeImmutable(is_string($value) ? $value : $value->format('c'));
    }

    private function normalizeRecoveryCodes($value): ?array
    {
        if ($value === null) {
            return null;
        }

        if (is_array($value)) {
            return $value;
        }

        $decoded = json_decode((string) $value, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }

        return is_array($decoded) ? $decoded : null;
    }
}
