<?php

use App\MarketGovernanceContext\Broker\Presentation\Http\BrokerController;
use Illuminate\Support\Facades\Route;

Route::prefix('market-governance/brokers')->group(function () {
    Route::post('/', [BrokerController::class, 'store']);
    Route::get('/{brokerId}', [BrokerController::class, 'show']);
    Route::patch('/{brokerId}/deactivate', [BrokerController::class, 'deactivate']);
});
