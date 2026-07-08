<?php

namespace App\AuthenticationContext\Auth\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasUuids;

    protected $table = 'auth_permissions';

    protected $fillable = [
        'id',
        'key',
        'description',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'auth_permission_role', 'permission_id', 'role_id')
            ->withTimestamps();
    }
}
