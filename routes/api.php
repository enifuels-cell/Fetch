<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReviewController;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->name('register');
        Route::post('/login', [AuthController::class, 'login'])->name('login');
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('logout');
        Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum')->name('me');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::prefix('bookings')->group(function () {
            Route::post('/', [BookingController::class, 'store'])->name('bookings.store');
            Route::get('/{booking}', [BookingController::class, 'show'])->name('bookings.show');
            Route::post('/{booking}/accept', [BookingController::class, 'acceptBooking'])->name('bookings.accept');
            Route::post('/{booking}/cancel', [BookingController::class, 'cancelBooking'])->name('bookings.cancel');
            Route::get('/my-bookings', [BookingController::class, 'getMyBookings'])->name('bookings.my');
        });

        Route::prefix('location')->group(function () {
            Route::post('/update', [LocationController::class, 'updateLocation'])->name('location.update');
            Route::get('/nearby-riders', [LocationController::class, 'getNearbyRiders'])->name('location.nearby-riders');
            Route::post('/go-online', [LocationController::class, 'goOnline'])->name('location.go-online');
            Route::post('/go-offline', [LocationController::class, 'goOffline'])->name('location.go-offline');
        });

        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'getMyNotifications'])->name('notifications.index');
            Route::post('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
            Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
            Route::get('/unread-count', [NotificationController::class, 'getUnreadCount'])->name('notifications.unread-count');
        });

        Route::prefix('reviews')->group(function () {
            Route::post('/', [ReviewController::class, 'store'])->name('reviews.store');
            Route::get('/user/{userId}', [ReviewController::class, 'getUserReviews'])->name('reviews.user');
        });
    });
});

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});
