<?php

namespace App\AuthenticationContext\Auth\Infrastructure\Repositories;

use App\AuthenticationContext\Auth\Domain\Entities\AuthUser;
use App\AuthenticationContext\Auth\Domain\Factories\AuthUserFactory;
use App\AuthenticationContext\Auth\Domain\Repositories\AuthUserRepository;
use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser as AuthUserModel;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\EmailAddress;
use App\AuthenticationContext\SharedKernel\Domain\ValueObjects\Uuid;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class EloquentAuthUserRepository implements AuthUserRepository
{
    public function __construct(private readonly AuthUserFactory $factory) {}

    public function create(AuthUser $user): AuthUser
    {
        $data = $user->toArray();

        AuthUserModel::create([
            'id' => $data['id'],
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password_hash'],
            'status' => $data['status'],
            'failed_login_attempts' => $data['failed_login_attempts'],
            'locked_until' => $data['locked_until'],
            'last_login_at' => $data['last_login_at'],
            'password_changed_at' => $data['password_changed_at'],
            'mfa_enabled' => $data['mfa_enabled'],
            'mfa_secret' => $data['mfa_secret'],
            'mfa_recovery_codes' => $data['mfa_recovery_codes'],
        ]);

        return $this->findById(Uuid::fromString($data['id'])) ?? $user;
    }

    public function update(AuthUser $user): AuthUser
    {
        $data = $user->toArray();

        AuthUserModel::query()
            ->where('id', $data['id'])
            ->update([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password_hash'],
                'status' => $data['status'],
                'failed_login_attempts' => $data['failed_login_attempts'],
                'locked_until' => $data['locked_until'],
                'last_login_at' => $data['last_login_at'],
                'password_changed_at' => $data['password_changed_at'],
                'mfa_enabled' => $data['mfa_enabled'],
                'mfa_secret' => $data['mfa_secret'],
                'mfa_recovery_codes' => $data['mfa_recovery_codes'],
                'updated_at' => Carbon::now(),
            ]);

        return $this->findById(Uuid::fromString($data['id'])) ?? $user;
    }

    public function findById(Uuid $userId): ?AuthUser
    {
        $model = AuthUserModel::query()->find($userId->value());
        if (! $model) {
            return null;
        }

        return $this->factory->fromState($this->mapAuthUserModel($model));
    }

    public function findByEmail(EmailAddress $email): ?AuthUser
    {
        $model = AuthUserModel::query()->where('email', $email->value())->first();
        if (! $model) {
            return null;
        }

        return $this->factory->fromState($this->mapAuthUserModel($model));
    }

    public function issueToken(Uuid $userId, string $name, array $abilities): string
    {
        $model = AuthUserModel::query()->find($userId->value());
        if (! $model) {
            throw new \RuntimeException('Auth user not found.');
        }

        return $model->createToken($name, $abilities)->plainTextToken;
    }

    public function revokeToken(Uuid $userId, ?string $tokenId): void
    {
        $model = AuthUserModel::query()->find($userId->value());
        if (! $model) {
            return;
        }

        if (! $tokenId) {
            return;
        }

        $model->tokens()->where('id', $tokenId)->delete();
    }

    public function revokeAllTokens(Uuid $userId): void
    {
        $model = AuthUserModel::query()->find($userId->value());
        if (! $model) {
            return;
        }

        $model->tokens()->delete();
    }

    public function recordLoginAttempt(?Uuid $userId, string $email, string $ip, bool $success, ?string $userAgent): void
    {
        DB::table('auth_login_attempts')->insert([
            'user_id' => $userId?->value(),
            'email' => $email,
            'ip' => $ip,
            'user_agent' => $userAgent,
            'success' => $success,
            'created_at' => Carbon::now(),
        ]);
    }

    private function mapAuthUserModel(AuthUserModel $model): array
    {
        $state = $model->toArray();
        $state['password'] = $model->getAuthPassword();
        $state['mfa_secret'] = $model->mfa_secret;
        $state['mfa_recovery_codes'] = $model->mfa_recovery_codes;

        return $state;
    }
}
