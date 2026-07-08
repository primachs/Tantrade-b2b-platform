<?php

namespace App\AuthenticationContext\Auth\Tests\Unit;

use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser;
use App\AuthenticationContext\Auth\Infrastructure\Models\Permission;
use App\AuthenticationContext\Auth\Infrastructure\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RoleModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_role_relationships(): void
    {
        $role = Role::create([
            'name' => 'RELATION_ROLE',
            'description' => 'Role for relationship tests',
        ]);

        $user = AuthUser::create([
            'name' => 'Role User',
            'email' => 'role.model@example.com',
            'password' => Hash::make('StrongPassw0rd!2026'),
            'status' => 'ACTIVE',
        ]);

        $permission = Permission::create([
            'key' => 'auth.roles.read',
            'description' => 'Read roles',
        ]);

        $role->users()->attach($user->id);
        $role->permissions()->attach($permission->id);

        $this->assertCount(1, $role->users);
        $this->assertCount(1, $role->permissions);
        $this->assertSame('role.model@example.com', $role->users->first()->email);
        $this->assertSame('auth.roles.read', $role->permissions->first()->key);
    }
}
