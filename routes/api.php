<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OAuthController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\TwoFactorController;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Google OAuth
Route::get('/auth/google', [OAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);

// Email Verification
Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])->name('verification.verify');
Route::post('/email/resend', [VerificationController::class, 'resend'])->middleware(['throttle:6,1']);

// Password Reset
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [ForgotPasswordController::class, 'reset'])->name('password.reset');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Notifications
    Route::get('/users/notifications', [NotificationController::class, 'index']);
    Route::post('/users/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/users/notifications/{uuid}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/users/notifications', [NotificationController::class, 'clearAll']);

    Route::get('/bookings', [\App\Http\Controllers\Api\BookingController::class, 'index']);
    Route::post('/bookings', [\App\Http\Controllers\Api\BookingController::class, 'store']);
    Route::patch('/bookings/{booking}', [\App\Http\Controllers\Api\BookingController::class, 'update']);
    Route::post('/agent/profile', [\App\Http\Controllers\Api\AgentController::class, 'update']);
    Route::post('/upload/avatar', [\App\Http\Controllers\Api\MediaController::class, 'uploadAvatar']);
    Route::post('/payments/initialize', [\App\Http\Controllers\Api\PaymentController::class, 'initialize']);

    // 2FA
    Route::post('/two-factor/enable', [TwoFactorController::class, 'enable']);
    Route::post('/two-factor/confirm', [TwoFactorController::class, 'confirm']);
    Route::post('/two-factor/disable', [TwoFactorController::class, 'disable']);
});

Route::post('/two-factor/challenge', [TwoFactorController::class, 'challenge']);

Route::post('/webhooks/paystack', [\App\Http\Controllers\Api\PaymentController::class, 'webhook']);

Route::get('/services', [\App\Http\Controllers\Api\ServiceController::class, 'index']);
Route::get('/services/{service}', [\App\Http\Controllers\Api\ServiceController::class, 'show']);
Route::get('/agents', [\App\Http\Controllers\Api\AgentController::class, 'index']);
Route::get('/agents/{uuid}', [\App\Http\Controllers\Api\AgentController::class, 'show']);
Route::get('/users/{uuid}', [AuthController::class, 'showByUuid']);
