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
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\NotificationSettingsController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\SupportController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\WalletController;

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
    Route::put('/notification-settings', [NotificationSettingsController::class, 'update']);

    Route::get('/bookings', [\App\Http\Controllers\Api\BookingController::class, 'index']);
    Route::post('/bookings', [\App\Http\Controllers\Api\BookingController::class, 'store']);
    Route::patch('/bookings/{booking}', [\App\Http\Controllers\Api\BookingController::class, 'update']);
    Route::post('/agent/profile', [\App\Http\Controllers\Api\AgentController::class, 'update']);
    Route::post('/upload/avatar', [\App\Http\Controllers\Api\MediaController::class, 'uploadAvatar']);
    Route::post('/payments/initialize', [\App\Http\Controllers\Api\PaymentController::class, 'initialize']);
    Route::post('/payments/wallet', [\App\Http\Controllers\Api\PaymentController::class, 'payWithWallet']);

    // Password Update
    Route::post('/password/update', [PasswordController::class, 'update']);

    // 2FA
    Route::post('/two-factor/enable', [TwoFactorController::class, 'enable']);
    Route::post('/two-factor/confirm', [TwoFactorController::class, 'confirm']);
    Route::post('/two-factor/disable', [TwoFactorController::class, 'disable']);
    Route::delete('/user', [\App\Http\Controllers\Api\AuthController::class, 'deleteAccount']);
    
    // Sessions
    Route::get('/sessions', [\App\Http\Controllers\Api\SessionController::class, 'index']);
    Route::post('/sessions/revoke-others', [\App\Http\Controllers\Api\SessionController::class, 'revokeOthers']);
    Route::delete('/sessions/{id}', [\App\Http\Controllers\Api\SessionController::class, 'destroy']);

    // Payment Methods
    Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
    Route::post('/payment-methods/initialize', [PaymentMethodController::class, 'initialize']);
    Route::post('/payment-methods', [PaymentMethodController::class, 'store']);
    Route::delete('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy']);
    // Custom set default route
    Route::patch('/payment-methods/{paymentMethod}/default', [PaymentMethodController::class, 'setDefault']);

    // Stats and Support
    Route::get('/stats', [StatsController::class, 'index']);
    Route::get('/help-support', [SupportController::class, 'index']);
    Route::post('/feedback', [SupportController::class, 'storeFeedback']);
    Route::post('/reports', [ReportController::class, 'store']);

    // Wallet System
    Route::get('/wallet/transactions', [WalletController::class, 'index']);
    Route::post('/wallet/fund/initialize', [WalletController::class, 'initialize']);
    Route::post('/wallet/fund/verify', [WalletController::class, 'verify']);
});

Route::post('/two-factor/challenge', [TwoFactorController::class, 'challenge']);

Route::post('/webhooks/paystack', [\App\Http\Controllers\Api\PaymentController::class, 'webhook']);

Route::get('/services', [\App\Http\Controllers\Api\ServiceController::class, 'index']);
Route::get('/services/{service}', [\App\Http\Controllers\Api\ServiceController::class, 'show']);
Route::get('/agents', [\App\Http\Controllers\Api\AgentController::class, 'index']);
Route::get('/agents/{uuid}', [\App\Http\Controllers\Api\AgentController::class, 'show']);
Route::get('/users/{uuid}', [AuthController::class, 'showByUuid']);
