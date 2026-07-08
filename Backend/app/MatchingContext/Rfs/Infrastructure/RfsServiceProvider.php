<?php

namespace App\MatchingContext\Rfs\Infrastructure;

use App\MatchingContext\Rfs\Domain\Repositories\RfsRepository;
use App\MatchingContext\Rfs\Infrastructure\Repositories\EloquentRfsRepository;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class RfsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(RfsRepository::class, EloquentRfsRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/Persistence/Migrations');

        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__.'/../Presentation/api.php');
    }
}
