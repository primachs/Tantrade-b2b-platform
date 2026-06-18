<?php

use App\Http\Controllers\GeographyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/geography/regions', [GeographyController::class, 'regions']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
