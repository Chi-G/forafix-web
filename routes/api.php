<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\Api\AuthController;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/bookings', [\App\Http\Controllers\Api\BookingController::class, 'index']);
    Route::post('/bookings', [\App\Http\Controllers\Api\BookingController::class, 'store']);
    Route::patch('/bookings/{booking}', [\App\Http\Controllers\Api\BookingController::class, 'update']);
    Route::post('/agent/profile', [\App\Http\Controllers\Api\AgentController::class, 'update']);
    Route::post('/upload/avatar', [\App\Http\Controllers\Api\MediaController::class, 'uploadAvatar']);
    Route::post('/payments/initialize', [\App\Http\Controllers\Api\PaymentController::class, 'initialize']);
});

Route::post('/webhooks/paystack', [\App\Http\Controllers\Api\PaymentController::class, 'webhook']);

Route::get('/services', [\App\Http\Controllers\Api\ServiceController::class, 'index']);
Route::get('/services/{service}', [\App\Http\Controllers\Api\ServiceController::class, 'show']);
Route::get('/agents', [\App\Http\Controllers\Api\AgentController::class, 'index']);
Route::get('/agents/{uuid}', [\App\Http\Controllers\Api\AgentController::class, 'show']);
Route::get('/users/{uuid}', [AuthController::class, 'showByUuid']);
