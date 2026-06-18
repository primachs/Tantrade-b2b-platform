<?php

namespace App\AuthenticationContext\Auth\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class AuthUser extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use HasUuids;
    use Notifiable;

    protected $table = 'auth_users';

    protected $fillable = [
        'id',
        'name',
        'email',
        'password',
        'nida_number',
        'first_name',
        'middle_name',
        'surname',
        'gender',
        'mobile',
        'address',
        'status',
        'failed_login_attempts',
        'locked_until',
        'last_login_at',
        'password_changed_at',
        'mfa_enabled',
        'mfa_secret',
        'mfa_recovery_codes',
    ];

    protected $hidden = [
        'password',
        'mfa_secret',
        'mfa_recovery_codes',
        'remember_token',
    ];

    protected $casts = [
        'locked_until' => 'datetime',
        'last_login_at' => 'datetime',
        'password_changed_at' => 'datetime',
        'mfa_enabled' => 'boolean',
        'mfa_recovery_codes' => 'array',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'auth_role_user', 'user_id', 'role_id')
            ->withTimestamps();
    }
}
