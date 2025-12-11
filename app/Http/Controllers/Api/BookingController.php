<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Services\FareCalculationService;
use App\Services\RiderMatchingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        private RiderMatchingService $riderMatchingService,
        private FareCalculationService $fareCalculationService,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pickup_latitude' => 'required|numeric|between:-90,90',
            'pickup_longitude' => 'required|numeric|between:-180,180',
            'pickup_address' => 'required|string',
            'dropoff_latitude' => 'nullable|numeric|between:-90,90',
            'dropoff_longitude' => 'nullable|numeric|between:-180,180',
            'dropoff_address' => 'nullable|string',
            'special_instructions' => 'nullable|string',
            'vehicle_type' => 'nullable|string|in:motorcycle',
        ]);

        $booking = Booking::create([
            'passenger_id' => auth()->id(),
            'pickup_latitude' => $validated['pickup_latitude'],
            'pickup_longitude' => $validated['pickup_longitude'],
            'pickup_address' => $validated['pickup_address'],
            'dropoff_latitude' => $validated['dropoff_latitude'] ?? null,
            'dropoff_longitude' => $validated['dropoff_longitude'] ?? null,
            'dropoff_address' => $validated['dropoff_address'] ?? null,
            'special_instructions' => $validated['special_instructions'] ?? null,
            'vehicle_type' => $validated['vehicle_type'] ?? 'motorcycle',
            'status' => 'pending',
            'estimated_fare' => $validated['dropoff_latitude'] && $validated['dropoff_longitude'] 
                ? $this->fareCalculationService->calculateFare(
                    new Booking($validated)
                )
                : null,
        ]);

        $nearestRiders = $this->riderMatchingService->findNearestRiders($booking);

        if ($nearestRiders->isNotEmpty()) {
            $this->riderMatchingService->notifyRidersAboutBooking($booking, $nearestRiders);
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking created and riders notified',
            'data' => [
                'booking' => $booking,
                'nearby_riders_count' => $nearestRiders->count(),
            ],
        ], 201);
    }

    public function show(Booking $booking): JsonResponse
    {
        if ($booking->passenger_id !== auth()->id() && $booking->rider_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $booking->load(['passenger', 'rider', 'notifications']),
        ]);
    }

    public function acceptBooking(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->status !== 'notified') {
            return response()->json([
                'success' => false,
                'message' => 'Booking cannot be accepted in its current status',
            ], 400);
        }

        $rider = auth()->user();

        if ($rider->role !== 'rider') {
            return response()->json([
                'success' => false,
                'message' => 'Only riders can accept bookings',
            ], 403);
        }

        $this->riderMatchingService->acceptBooking($booking, $rider);

        return response()->json([
            'success' => true,
            'message' => 'Booking accepted successfully',
            'data' => $booking->load(['passenger', 'rider']),
        ]);
    }

    public function cancelBooking(Booking $booking): JsonResponse
    {
        if ($booking->passenger_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($booking->isCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Booking is already cancelled',
            ], 400);
        }

        $booking->cancel();

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully',
            'data' => $booking,
        ]);
    }

    public function getMyBookings(Request $request): JsonResponse
    {
        $user = auth()->user();

        if ($user->isPassenger()) {
            $bookings = Booking::where('passenger_id', $user->id)->latest()->paginate(15);
        } else {
            $bookings = Booking::where('rider_id', $user->id)->latest()->paginate(15);
        }

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }
}
