<?php

use App\MatchingContext\Rfs\Presentation\Http\RfsController;
use Illuminate\Support\Facades\Route;

Route::prefix('rfs')->group(function () {
    Route::post('/', [RfsController::class, 'store']);
    Route::get('/{rfsId}', [RfsController::class, 'show']);
    Route::patch('/{rfsId}', [RfsController::class, 'update']);
    Route::post('/{rfsId}/open', [RfsController::class, 'open']);
});
