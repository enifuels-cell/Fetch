<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'role',
        'latitude',
        'longitude',
        'last_location_update',
        'is_online',
        'profile_image',
        'bio',
        'rating',
        'total_rides',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_location_update' => 'datetime',
        'is_online' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
    ];

    public function bookingsAsPassenger(): HasMany
    {
        return $this->hasMany(Booking::class, 'passenger_id');
    }

    public function bookingsAsRider(): HasMany
    {
        return $this->hasMany(Booking::class, 'rider_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'recipient_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function receivedReviews(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    public function isPassenger(): bool
    {
        return $this->role === 'passenger';
    }

    public function isRider(): bool
    {
        return $this->role === 'rider';
    }

    public function updateLocation(float $latitude, float $longitude): void
    {
        $this->update([
            'latitude' => $latitude,
            'longitude' => $longitude,
            'last_location_update' => now(),
        ]);
    }

    public function getDistanceTo(float $latitude, float $longitude): float
    {
        return $this->calculateDistance(
            $this->latitude,
            $this->longitude,
            $latitude,
            $longitude
        );
    }

    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
