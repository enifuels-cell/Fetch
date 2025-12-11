<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\Http;

class FareCalculationService
{
    private const BASE_FARE = 2.50;
    private const PER_KM_RATE = 1.50;
    private const PER_MINUTE_RATE = 0.30;
    private const MINIMUM_FARE = 5.00;

    public function calculateFare(Booking $booking): float
    {
        $distance = $this->calculateDistance(
            $booking->pickup_latitude,
            $booking->pickup_longitude,
            $booking->dropoff_latitude,
            $booking->dropoff_longitude
        );

        $estimatedTime = $this->estimateTime($distance);

        $distanceFare = $distance * self::PER_KM_RATE;
        $timeFare = $estimatedTime * self::PER_MINUTE_RATE;
        $totalFare = self::BASE_FARE + $distanceFare + $timeFare;

        return max($totalFare, self::MINIMUM_FARE);
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

    private function estimateTime(float $distanceKm): float
    {
        $averageSpeed = 30;
        return ($distanceKm / $averageSpeed) * 60;
    }
}
