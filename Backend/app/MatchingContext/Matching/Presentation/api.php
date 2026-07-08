<?php

use App\MatchingContext\Matching\Presentation\Http\MatchingController;
use Illuminate\Support\Facades\Route;

Route::prefix('rfs')->group(function () {
    Route::post('/{rfsId}/match', [MatchingController::class, 'match']);
    Route::get('/{rfsId}/shortlist', [MatchingController::class, 'shortlist']);
});
