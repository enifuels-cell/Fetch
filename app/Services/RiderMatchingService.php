<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Collection;

class RiderMatchingService
{
    private const SEARCH_RADIUS_KM = 15;

    public function findNearestRiders(Booking $booking, int $limit = 5): Collection
    {
        $riders = User::where('role', 'rider')
            ->where('is_online', true)
            ->whereDoesntHave('bookingsAsRider', function ($query) {
                $query->whereIn('status', ['accepted', 'rider_arriving', 'rider_arrived', 'in_transit']);
            })
            ->get();

        $ridersByDistance = $riders->map(function (User $rider) use ($booking) {
            $distance = $rider->getDistanceTo(
                $booking->pickup_latitude,
                $booking->pickup_longitude
            );

            return [
                'rider' => $rider,
                'distance' => $distance,
            ];
        })
            ->filter(fn($item) => $item['distance'] <= self::SEARCH_RADIUS_KM)
            ->sortBy('distance')
            ->take($limit);

        return $ridersByDistance->pluck('rider');
    }

    public function notifyRidersAboutBooking(Booking $booking, Collection $riders): void
    {
        foreach ($riders as $rider) {
            $notification = Notification::create([
                'booking_id' => $booking->id,
                'recipient_id' => $rider->id,
                'type' => 'booking_request',
                'title' => 'New Ride Request',
                'message' => "New ride request from {$booking->passenger->name} at {$booking->pickup_address}",
                'data' => [
                    'booking_id' => $booking->id,
                    'passenger_name' => $booking->passenger->name,
                    'passenger_rating' => $booking->passenger->rating,
                    'pickup_address' => $booking->pickup_address,
                    'distance_km' => round($rider->getDistanceTo(
                        $booking->pickup_latitude,
                        $booking->pickup_longitude
                    ), 2),
                    'estimated_fare' => $booking->estimated_fare,
                ],
                'sent_at' => now(),
            ]);

            NotificationService::sendPushNotification($rider, $notification);
        }

        $booking->update(['status' => 'notified']);
    }

    public function acceptBooking(Booking $booking, User $rider): void
    {
        $booking->markAsAccepted($rider);

        $passengerNotification = Notification::create([
            'booking_id' => $booking->id,
            'recipient_id' => $booking->passenger_id,
            'type' => 'booking_accepted',
            'title' => 'Rider Accepted Your Ride',
            'message' => "{$rider->name} accepted your ride request",
            'data' => [
                'rider_id' => $rider->id,
                'rider_name' => $rider->name,
                'rider_rating' => $rider->rating,
                'rider_phone' => $rider->phone_number,
            ],
            'sent_at' => now(),
        ]);

        NotificationService::sendPushNotification($booking->passenger, $passengerNotification);
    }
}
