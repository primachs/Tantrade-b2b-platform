<?php

namespace App\AuthenticationContext\Auth\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasUuids;

    protected $table = 'auth_roles';

    protected $fillable = [
        'id',
        'name',
        'description',
    ];

    public function users()
    {
        return $this->belongsToMany(AuthUser::class, 'auth_role_user', 'role_id', 'user_id')
            ->withTimestamps();
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'auth_permission_role', 'role_id', 'permission_id')
            ->withTimestamps();
    }
}
