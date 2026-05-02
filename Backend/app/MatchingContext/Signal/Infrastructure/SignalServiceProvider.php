<?php

namespace App\MatchingContext\Signal\Infrastructure;

use App\MatchingContext\Signal\Domain\Repositories\OutcomeSignalRepository;
use App\MatchingContext\Signal\Infrastructure\Repositories\EloquentOutcomeSignalRepository;
use Illuminate\Support\ServiceProvider;

class SignalServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(OutcomeSignalRepository::class, EloquentOutcomeSignalRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Persistence/Migrations');
    }
}
