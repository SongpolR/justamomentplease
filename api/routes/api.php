<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\GoogleAuthController;

Route::get('/health', fn() => ['ok'=>true, 'service'=>'api']);

// public (customer page and pre-login UI can read)
Route::get('/shop', [ShopController::class, 'show']);

// auth
Route::post('/auth/signup',  [AuthController::class, 'signup']);
Route::post('/auth/login',   [AuthController::class, 'login']);
Route::post('/auth/logout',  [AuthController::class, 'logout'])->middleware('owner');
Route::post('/auth/password',[AuthController::class, 'changePassword'])->middleware('owner');

// login
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// owner-protected shop updates
Route::middleware('owner')->group(function () {
  Route::put('/shop',       [ShopController::class, 'update']);
  Route::post('/shop/logo', [ShopController::class, 'uploadLogo']);
});
