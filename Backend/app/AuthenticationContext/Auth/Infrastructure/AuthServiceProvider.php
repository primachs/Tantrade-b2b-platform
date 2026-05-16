<?php

namespace App\AuthenticationContext\Auth\Infrastructure;

use App\AuthenticationContext\Auth\Domain\Repositories\AuthUserRepository;
use App\AuthenticationContext\Auth\Domain\Repositories\PermissionRepository;
use App\AuthenticationContext\Auth\Domain\Repositories\RoleRepository;
use App\AuthenticationContext\Auth\Infrastructure\Repositories\EloquentAuthUserRepository;
use App\AuthenticationContext\Auth\Infrastructure\Repositories\EloquentPermissionRepository;
use App\AuthenticationContext\Auth\Infrastructure\Repositories\EloquentRoleRepository;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AuthUserRepository::class, EloquentAuthUserRepository::class);
        $this->app->bind(RoleRepository::class, EloquentRoleRepository::class);
        $this->app->bind(PermissionRepository::class, EloquentPermissionRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/Persistence/Migrations');

        RateLimiter::for('auth-login', function (Request $request) {
            $key = sprintf('login:%s|%s', (string) $request->input('email'), $request->ip());

            return Limit::perMinute(10)->by($key);
        });

        RateLimiter::for('auth-register', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__.'/../Presentation/api.php');
    }
}
