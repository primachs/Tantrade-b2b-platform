<?php

use App\MatchingContext\Business\Presentation\Http\BusinessController;
use Illuminate\Support\Facades\Route;

Route::prefix('businesses')->group(function () {
    Route::get('/', [BusinessController::class, 'index']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [BusinessController::class, 'store']);
        Route::get('/my-business', [BusinessController::class, 'myBusiness']);
        Route::patch('/{businessId}', [BusinessController::class, 'update']);
        Route::put('/{businessId}/capabilities', [BusinessController::class, 'syncCapabilities']);
        Route::get('/{businessId}/trust-metrics', [BusinessController::class, 'trustMetrics']);
    });

    Route::get('/{businessId}', [BusinessController::class, 'show']);

    Route::middleware(['auth:sanctum', 'role:ADMIN'])->group(function () {
        Route::put('/{businessId}/verification', [BusinessController::class, 'upsertVerification']);
        Route::patch('/{businessId}/verification/review', [BusinessController::class, 'reviewVerification']);
    });
});
