<?php

use App\MarketGovernanceContext\Governance\Presentation\Http\GovernanceController;
use Illuminate\Support\Facades\Route;

Route::prefix('market-governance')->group(function () {
    Route::post('/markets/{marketId}/offices', [GovernanceController::class, 'createOffice']);
    Route::post('/offices/{officeId}/terms', [GovernanceController::class, 'assignChairperson']);
    Route::patch('/terms/{termId}/end', [GovernanceController::class, 'endTerm']);
});
