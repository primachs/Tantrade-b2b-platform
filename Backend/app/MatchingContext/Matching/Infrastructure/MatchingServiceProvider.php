<?php

namespace App\MatchingContext\Matching\Infrastructure;

use App\MatchingContext\Matching\Domain\Repositories\MatchingRepository;
use App\MatchingContext\Matching\Infrastructure\Repositories\EloquentMatchingRepository;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class MatchingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(MatchingRepository::class, EloquentMatchingRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/Persistence/Migrations');

        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__.'/../Presentation/api.php');
    }
}
