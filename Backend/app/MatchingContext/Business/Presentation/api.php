<?php

use App\MatchingContext\Business\Presentation\Http\BusinessController;
use Illuminate\Support\Facades\Route;

Route::prefix('businesses')->group(function () {
    Route::post('/', [BusinessController::class, 'store']);
    Route::get('/{businessId}', [BusinessController::class, 'show']);
    Route::patch('/{businessId}', [BusinessController::class, 'update']);
    Route::put('/{businessId}/verification', [BusinessController::class, 'upsertVerification']);
    Route::put('/{businessId}/capabilities', [BusinessController::class, 'syncCapabilities']);
    Route::get('/{businessId}/trust-metrics', [BusinessController::class, 'trustMetrics']);
});
