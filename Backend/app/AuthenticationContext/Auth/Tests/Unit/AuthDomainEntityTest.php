<?php

namespace App\AuthenticationContext\Auth\Tests\Unit;

use App\AuthenticationContext\Auth\Domain\Entities\AuthUser;
use App\AuthenticationContext\Auth\Domain\Entities\Permission;
use App\AuthenticationContext\Auth\Domain\Entities\Role;
use App\AuthenticationContext\SharedKernel\Domain\Enums\AuthUserStatus;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthDomainEntityTest extends TestCase
{
    #[Test]
    public function it_exposes_auth_user_state(): void
    {
        $user = new AuthUser(
            Uuid::fromString('11111111-1111-1111-1111-111111111111'),
            'Auth User',
            EmailAddress::fromString('auth.entity@example.com'),
            'hash',
            AuthUserStatus::ACTIVE->value,
            2,
            new \DateTimeImmutable('2026-05-15T10:00:00+00:00'),
            null, // lastLoginAt
            null, // passwordChangedAt
            false, // mfaEnabled
            null, // mfaSecret
            null, // mfaRecoveryCodes
            null, // nidaNumber
            null, // firstName
            null, // middleName
            null, // surname
            null, // gender
            null, // mobile
            null, // address
            null, // createdAt
            null  // updatedAt
        );

        $this->assertSame('11111111-1111-1111-1111-111111111111', $user->id()->value());
        $this->assertSame('auth.entity@example.com', $user->email()->value());
        $this->assertSame('hash', $user->passwordHash());
        $this->assertSame(AuthUserStatus::ACTIVE->value, $user->status());
        $this->assertSame(2, $user->failedLoginAttempts());
        $this->assertNotNull($user->lockedUntil());
        $this->assertTrue($user->isLocked(new \DateTimeImmutable('2026-05-15T09:00:00+00:00')));
    }

    #[Test]
    public function it_exposes_role_and_permission_state(): void
    {
        $role = new Role(
            Uuid::fromString('22222222-2222-2222-2222-222222222222'),
            'ADMIN',
            'Admin role',
            null,
            null
        );

        $permission = new Permission(
            Uuid::fromString('33333333-3333-3333-3333-333333333333'),
            'auth.users.manage',
            'Manage users',
            null,
            null
        );

        $this->assertSame('ADMIN', $role->name());
        $this->assertSame('auth.users.manage', $permission->key());
    }
}
