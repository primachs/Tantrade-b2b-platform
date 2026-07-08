<?php

namespace App\MarketGovernanceContext\Broker\Infrastructure;

use App\MarketGovernanceContext\Broker\Domain\Repositories\BrokerRepository;
use App\MarketGovernanceContext\Broker\Infrastructure\Repositories\EloquentBrokerRepository;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class BrokerServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(BrokerRepository::class, EloquentBrokerRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/Persistence/Migrations');

        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__.'/../Presentation/api.php');
    }
}
