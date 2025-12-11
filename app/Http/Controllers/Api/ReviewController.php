<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);
        $user = auth()->user();

        if (!$booking->isCompleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Can only review completed bookings',
            ], 400);
        }

        $reviewee = null;

        if ($booking->passenger_id === $user->id) {
            $reviewee = $booking->rider;
        } elseif ($booking->rider_id === $user->id) {
            $reviewee = $booking->passenger;
        } else {
            return response()->json([
                'success' => false,
                'message' => 'You are not part of this booking',
            ], 403);
        }

        $review = Review::create([
            'booking_id' => $booking->id,
            'reviewer_id' => $user->id,
            'reviewee_id' => $reviewee->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        $this->updateUserRating($reviewee);

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully',
            'data' => $review,
        ], 201);
    }

    public function getUserReviews(int $userId): JsonResponse
    {
        $reviews = Review::where('reviewee_id', $userId)
            ->with(['reviewer', 'booking'])
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    private function updateUserRating(object $user): void
    {
        $averageRating = Review::where('reviewee_id', $user->id)->avg('rating');
        $user->update(['rating' => round($averageRating, 2)]);
    }
}
