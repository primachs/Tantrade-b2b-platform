<?php

namespace App\AuthenticationContext\Auth\Tests\Unit;

use App\AuthenticationContext\Auth\Domain\Factories\AuthUserFactory;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthUserFactoryTest extends TestCase
{
    #[Test]
    public function it_normalizes_recovery_codes_from_state(): void
    {
        $factory = new AuthUserFactory();

        $state = [
            'id' => '11111111-1111-1111-1111-111111111111',
            'name' => 'Factory User',
            'email' => 'factory.user@example.com',
            'password' => 'hash',
            'status' => 'ACTIVE',
            'failed_login_attempts' => 0,
            'locked_until' => '2026-05-15T10:00:00+00:00',
            'last_login_at' => null,
            'password_changed_at' => '2026-05-15T10:00:00+00:00',
            'mfa_enabled' => true,
            'mfa_secret' => 'secret',
            'mfa_recovery_codes' => json_encode(['code1', 'code2']),
            'created_at' => '2026-05-15T10:00:00+00:00',
            'updated_at' => '2026-05-15T10:00:00+00:00',
        ];

        $user = $factory->fromState($state);
        $data = $user->toArray();

        $this->assertSame(['code1', 'code2'], $data['mfa_recovery_codes']);
        $this->assertSame('factory.user@example.com', $data['email']);
    }
}
