<?php

namespace App\MarketGovernanceContext\Person\Infrastructure;

use App\MarketGovernanceContext\Person\Domain\Repositories\PersonRepository;
use App\MarketGovernanceContext\Person\Infrastructure\Repositories\EloquentPersonRepository;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class PersonServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PersonRepository::class, EloquentPersonRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/Persistence/Migrations');

        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__.'/../Presentation/api.php');
    }
}
