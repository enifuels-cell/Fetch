<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'passenger_id',
        'rider_id',
        'pickup_latitude',
        'pickup_longitude',
        'pickup_address',
        'dropoff_latitude',
        'dropoff_longitude',
        'dropoff_address',
        'status',
        'booking_time',
        'accepted_time',
        'completed_time',
        'estimated_fare',
        'actual_fare',
        'special_instructions',
        'vehicle_type',
        'cancellation_count',
    ];

    protected $casts = [
        'booking_time' => 'datetime',
        'accepted_time' => 'datetime',
        'completed_time' => 'datetime',
        'pickup_latitude' => 'float',
        'pickup_longitude' => 'float',
        'dropoff_latitude' => 'float',
        'dropoff_longitude' => 'float',
        'estimated_fare' => 'float',
        'actual_fare' => 'float',
    ];

    public function passenger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'passenger_id');
    }

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function markAsAccepted(User $rider): void
    {
        $this->update([
            'rider_id' => $rider->id,
            'status' => 'accepted',
            'accepted_time' => now(),
        ]);
    }

    public function markAsInTransit(): void
    {
        $this->update(['status' => 'in_transit']);
    }

    public function markAsCompleted(float $fare): void
    {
        $this->update([
            'status' => 'completed',
            'completed_time' => now(),
            'actual_fare' => $fare,
        ]);
    }

    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancellation_count' => $this->cancellation_count + 1,
        ]);
    }
}
