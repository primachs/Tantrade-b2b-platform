<?php

use App\MatchingContext\Engagement\Presentation\Http\EngagementController;
use Illuminate\Support\Facades\Route;

Route::prefix('engagement-sessions')->group(function () {
    Route::post('/', [EngagementController::class, 'store']);
    Route::get('/{sessionId}', [EngagementController::class, 'show']);
    Route::post('/{sessionId}/accept', [EngagementController::class, 'accept']);
    Route::post('/{sessionId}/activate', [EngagementController::class, 'activate']);
    Route::post('/{sessionId}/stall', [EngagementController::class, 'stall']);
    Route::post('/{sessionId}/outcomes', [EngagementController::class, 'reportOutcome']);
    Route::post('/{sessionId}/close', [EngagementController::class, 'close']);
});
