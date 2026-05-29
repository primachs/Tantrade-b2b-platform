<?php

use App\AuthenticationContext\Auth\Presentation\Http\AuthController;
use App\AuthenticationContext\Auth\Presentation\Http\RoleController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth-register');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth-login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/users', [AuthController::class, 'users']);
        Route::post('/password/change', [AuthController::class, 'changePassword']);
        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles/{roleId}', [RoleController::class, 'assign']);
        Route::delete('/roles/{roleId}', [RoleController::class, 'revoke']);
    });
});
