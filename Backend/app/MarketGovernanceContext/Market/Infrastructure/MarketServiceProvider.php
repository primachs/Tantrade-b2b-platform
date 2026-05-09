<?php

namespace App\MarketGovernanceContext\Market\Infrastructure;

use App\MarketGovernanceContext\Market\Domain\Repositories\MarketRepository;
use App\MarketGovernanceContext\Market\Infrastructure\Repositories\EloquentMarketRepository;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class MarketServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(MarketRepository::class, EloquentMarketRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/Persistence/Migrations');

        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__.'/../Presentation/api.php');
    }
}
