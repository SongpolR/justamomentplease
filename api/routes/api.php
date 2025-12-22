<?php

use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\StaffInviteController;
use App\Http\Controllers\StaffPasswordResetController;

// Basic health check
Route::get('/health', function () {
  return response()->json(['ok' => true]);
});

/*
|--------------------------------------------------------------------------
| Public / No Auth
|--------------------------------------------------------------------------
*/

// Owner auth
Route::post('/auth/signup', [AuthController::class, 'signup']);
Route::post('/auth/login',  [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

// Email verification
Route::get('/auth/verify-email', [AuthController::class, 'verifyEmail'])->name('auth.verify-email');
Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification'])->middleware('throttle:3,5');

// Optional: Google Sign-in for owner
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// Staff auth
Route::post('/staff/login',  [StaffController::class, 'login'])->middleware('throttle:10,1');
Route::post('/staff/forgot', [StaffPasswordResetController::class, 'initiate'])->middleware('throttle:5,1');
Route::post('/staff/reset',  [StaffPasswordResetController::class, 'perform'])->middleware('throttle:5,1');
Route::post('/staff/accept', [StaffInviteController::class, 'accept'])->middleware('throttle:5,1');

Route::get('/customer/orders/{publicCode}', [OrderController::class, 'showPublic']);

Route::middleware(['owner', 'verified'])->group(function () {
  // Shop management
  Route::get('/shop',  [ShopController::class, 'show']);
  Route::post('/shop',  [ShopController::class, 'update']);

  // Staff management
  Route::get('/staff',                  [StaffController::class, 'index']);
  // Route::post('/staff',                 [StaffController::class, 'create']);
  Route::post('/staff/{id}/activate', [StaffController::class, 'activate']);
  Route::post('/staff/{id}/deactivate', [StaffController::class, 'deactivate']);
  Route::post('/staff/{id}/remove', [StaffController::class, 'remove']);

  // Staff invitations
  Route::post('/staff/invite',         [StaffInviteController::class, 'create']);
  Route::post('/staff/invite/resend',  [StaffInviteController::class, 'resendByOwner']);

  Route::post('/auth/logout',     [AuthController::class, 'logout']);
});

Route::middleware('any')->group(function () {
  // Orders management
  Route::get('/orders',                        [OrderController::class, 'index']);
  Route::post('/orders',                       [OrderController::class, 'store']);
  Route::post('/orders/{id}/ready',       [OrderController::class, 'ready']);
  Route::post('/orders/{id}/done',        [OrderController::class, 'done']);
});

Route::middleware(['staff'])->group(function () {
  // ✅ Staff session
  Route::post('/staff/logout',     [StaffController::class, 'logout']);
});
