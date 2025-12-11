<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function updateLocation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $user = auth()->user();
        $user->updateLocation($validated['latitude'], $validated['longitude']);

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully',
            'data' => $user,
        ]);
    }

    public function getNearbyRiders(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_km' => 'nullable|numeric|min:1',
        ]);

        $radiusKm = $validated['radius_km'] ?? 15;

        $riders = User::where('role', 'rider')
            ->where('is_online', true)
            ->get()
            ->filter(function (User $rider) use ($validated, $radiusKm) {
                $distance = $rider->getDistanceTo($validated['latitude'], $validated['longitude']);
                return $distance <= $radiusKm;
            })
            ->map(function (User $rider) use ($validated) {
                return [
                    'id' => $rider->id,
                    'name' => $rider->name,
                    'rating' => $rider->rating,
                    'total_rides' => $rider->total_rides,
                    'distance_km' => round(
                        $rider->getDistanceTo($validated['latitude'], $validated['longitude']),
                        2
                    ),
                    'latitude' => $rider->latitude,
                    'longitude' => $rider->longitude,
                ];
            })
            ->sortBy('distance_km')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $riders,
        ]);
    }

    public function goOnline(Request $request): JsonResponse
    {
        $user = auth()->user();

        if ($user->role !== 'rider') {
            return response()->json([
                'success' => false,
                'message' => 'Only riders can go online',
            ], 403);
        }

        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $user->update([
            'is_online' => true,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'last_location_update' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'You are now online',
            'data' => $user,
        ]);
    }

    public function goOffline(Request $request): JsonResponse
    {
        $user = auth()->user();

        if ($user->role !== 'rider') {
            return response()->json([
                'success' => false,
                'message' => 'Only riders can go offline',
            ], 403);
        }

        $user->update(['is_online' => false]);

        return response()->json([
            'success' => true,
            'message' => 'You are now offline',
            'data' => $user,
        ]);
    }
}
