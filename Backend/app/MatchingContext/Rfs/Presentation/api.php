<?php

use App\MatchingContext\Rfs\Presentation\Http\RfsController;
use Illuminate\Support\Facades\Route;

Route::prefix('rfs')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [RfsController::class, 'index']);
    Route::post('/', [RfsController::class, 'store']);
    Route::get('/{rfsId}', [RfsController::class, 'show']);
    Route::patch('/{rfsId}', [RfsController::class, 'update']);
    Route::post('/{rfsId}/open', [RfsController::class, 'open']);
});
