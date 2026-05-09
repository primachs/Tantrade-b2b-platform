<?php

namespace App\MarketGovernanceContext\Governance\Infrastructure;

use App\MarketGovernanceContext\Governance\Domain\Repositories\GovernanceRepository;
use App\MarketGovernanceContext\Governance\Infrastructure\Repositories\EloquentGovernanceRepository;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class GovernanceServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(GovernanceRepository::class, EloquentGovernanceRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/Persistence/Migrations');

        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__.'/../Presentation/api.php');
    }
}
