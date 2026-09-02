<?php

namespace App\MatchingContext\Engagement\Infrastructure;

use App\MatchingContext\Engagement\Domain\Repositories\EngagementMessageRepository;
use App\MatchingContext\Engagement\Domain\Repositories\EngagementRepository;
use App\MatchingContext\Engagement\Infrastructure\Repositories\EloquentEngagementMessageRepository;
use App\MatchingContext\Engagement\Infrastructure\Repositories\EloquentEngagementRepository;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class EngagementServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(EngagementRepository::class, EloquentEngagementRepository::class);
        $this->app->bind(EngagementMessageRepository::class, EloquentEngagementMessageRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/Persistence/Migrations');

        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__.'/../Presentation/api.php');
    }
}