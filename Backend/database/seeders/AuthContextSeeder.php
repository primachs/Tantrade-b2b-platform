<?php

namespace Database\Seeders;

use App\AuthenticationContext\Auth\Infrastructure\Models\AuthUser;
use App\AuthenticationContext\Auth\Infrastructure\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthContextSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'ADMIN' => 'Platform administrator with full access.',
            'GOVERNANCE' => 'Market governance officer role.',
            'BUYER' => 'Registered buyer account.',
            'SELLER' => 'Registered seller account.',
        ];

        $roleModels = [];
        foreach ($roles as $name => $description) {
            $roleModels[$name] = Role::firstOrCreate(
                ['name' => $name],
                ['id' => (string) Str::uuid(), 'description' => $description]
            );
        }

        $users = [
            [
                'name' => 'TanTrade Platform Admin',
                'email' => 'admin@tantrade.go.tz',
                'password' => 'Admin@2026!',
                'roles' => ['ADMIN'],
            ],
            [
                'name' => 'Mariam Mwinyi',
                'email' => 'governance@tantrade.go.tz',
                'password' => 'Gov@2026!',
                'roles' => ['GOVERNANCE'],
            ],
            [
                'name' => 'Masoko Supermarkets',
                'email' => 'masoko@tantrade.go.tz',
                'password' => 'Business@2026!',
                'roles' => ['BUYER', 'SELLER'],
            ],
            [
                'name' => 'Kariakoo Logistics',
                'email' => 'logistics@tantrade.go.tz',
                'password' => 'Business@2026!',
                'roles' => ['BUYER', 'SELLER'],
            ],
            [
                'name' => 'Kilimanjaro Agro Processors',
                'email' => 'agro@tantrade.go.tz',
                'password' => 'Business@2026!',
                'roles' => ['BUYER', 'SELLER'],
            ],
            [
                'name' => 'Zanzibar Exporters Co-op',
                'email' => 'exporters@tantrade.go.tz',
                'password' => 'Business@2026!',
                'roles' => ['BUYER', 'SELLER'],
            ],
        ];

        foreach ($users as $userData) {
            $user = AuthUser::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'id' => (string) Str::uuid(),
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password']),
                    'status' => 'ACTIVE',
                    'failed_login_attempts' => 0,
                    'password_changed_at' => now(),
                    'mfa_enabled' => false,
                ]
            );

            $user->update([
                'name' => $userData['name'],
                'password' => Hash::make($userData['password']),
                'status' => 'ACTIVE',
                'failed_login_attempts' => 0,
                'password_changed_at' => now(),
                'mfa_enabled' => false,
            ]);

            $roleIds = collect($userData['roles'])
                ->map(fn ($role) => $roleModels[$role]->id)
                ->all();

            $user->roles()->sync($roleIds);
        }
    }
}
