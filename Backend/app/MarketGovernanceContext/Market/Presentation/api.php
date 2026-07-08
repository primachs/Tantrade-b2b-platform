<?php

use App\MarketGovernanceContext\Market\Presentation\Http\MarketController;
use Illuminate\Support\Facades\Route;

Route::prefix('market-governance/markets')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [MarketController::class, 'index']);
    Route::post('/', [MarketController::class, 'store']);
    Route::get('/{marketId}', [MarketController::class, 'show']);
    Route::patch('/{marketId}', [MarketController::class, 'update']);
});
