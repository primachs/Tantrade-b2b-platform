<?php

namespace App\MatchingContext\Taxonomy\Infrastructure;

use App\MatchingContext\Taxonomy\Domain\Repositories\TaxonomyRepository;
use App\MatchingContext\Taxonomy\Infrastructure\Repositories\EloquentTaxonomyRepository;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class TaxonomyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(TaxonomyRepository::class, EloquentTaxonomyRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Persistence/Migrations');

        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__ . '/../Presentation/api.php');
    }
}
