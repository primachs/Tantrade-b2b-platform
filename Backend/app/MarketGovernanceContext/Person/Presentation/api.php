<?php

use App\MarketGovernanceContext\Person\Presentation\Http\PersonController;
use App\MarketGovernanceContext\Person\Presentation\Http\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('market-governance/persons')->group(function () {
    Route::get('/', [PersonController::class, 'index']);
    Route::post('/', [PersonController::class, 'store']);
    Route::get('/{personId}', [PersonController::class, 'show']);
    Route::patch('/{personId}', [PersonController::class, 'update']);
});

Route::get('market-governance/users', [UserController::class, 'index']);
