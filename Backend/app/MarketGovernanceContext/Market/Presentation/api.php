<?php

use App\MarketGovernanceContext\Market\Presentation\Http\MarketController;
use Illuminate\Support\Facades\Route;

Route::prefix('market-governance/markets')->group(function () {
    Route::post('/', [MarketController::class, 'store']);
    Route::get('/{marketId}', [MarketController::class, 'show']);
    Route::patch('/{marketId}', [MarketController::class, 'update']);
});
