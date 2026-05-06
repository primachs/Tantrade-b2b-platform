<?php

namespace App\MatchingContext\Business\Infrastructure;

use App\MatchingContext\Business\Domain\Repositories\BusinessRepository;
use App\MatchingContext\Business\Infrastructure\Repositories\EloquentBusinessRepository;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class BusinessServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(BusinessRepository::class, EloquentBusinessRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/Persistence/Migrations');

        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__.'/../Presentation/api.php');
    }
}
