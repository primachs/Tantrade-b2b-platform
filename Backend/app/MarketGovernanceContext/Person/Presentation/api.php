<?php

use App\MarketGovernanceContext\Person\Presentation\Http\PersonController;
use Illuminate\Support\Facades\Route;

Route::prefix('market-governance/persons')->group(function () {
    Route::post('/', [PersonController::class, 'store']);
    Route::get('/{personId}', [PersonController::class, 'show']);
    Route::patch('/{personId}', [PersonController::class, 'update']);
});
