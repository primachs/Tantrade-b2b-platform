<?php

use App\MatchingContext\Taxonomy\Presentation\Http\TaxonomyController;
use Illuminate\Support\Facades\Route;

Route::prefix('taxonomy')->group(function () {
    Route::get('/', [TaxonomyController::class, 'index']);
    Route::post('/categories', [TaxonomyController::class, 'storeCategory']);
    Route::post('/service-types', [TaxonomyController::class, 'storeServiceType']);
    Route::post('/attributes', [TaxonomyController::class, 'storeAttribute']);
    Route::post('/attribute-values', [TaxonomyController::class, 'storeAttributeValue']);
});
