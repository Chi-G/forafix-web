<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if ($user->role === 'AGENT') {
            $bookings = Booking::where('agent_id', $user->id)
                ->with(['client', 'service'])
                ->latest()
                ->get();
        } else {
            $bookings = Booking::where('client_id', $user->id)
                ->with(['agent', 'service'])
                ->latest()
                ->get();
        }

        return response()->json($bookings);
    }

    public function store(\App\Http\Requests\StoreBookingRequest $request)
    {
        $service = Service::findOrFail($request->service_id);

        $booking = Booking::create(array_merge($request->validated(), [
            'client_id' => Auth::id(),
            'status' => 'PENDING',
            'total_price' => $service->base_price,
        ]));

        event(new \App\Events\BookingCreated($booking->load(['client', 'service'])));

        return response()->json($booking->load(['agent', 'service']), 201);
    }

    public function update(Request $request, Booking $booking)
    {
        // Only agent can accept/decline, only client can cancel?
        // Let's keep it simple for now and allow status update if authorized
        $request->validate([
            'status' => 'required|in:PENDING,ACCEPTED,DECLINED,COMPLETED,CANCELLED',
        ]);

        $user = Auth::user();

        // Basic authorization
        if ($user->id !== $booking->client_id && $user->id !== $booking->agent_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $newStatus = $request->status;

        // Role-based restrictions
        if ($user->role === 'CLIENT') {
            if ($newStatus !== 'CANCELLED') {
                return response()->json(['message' => 'Clients can only cancel bookings.'], 403);
            }
            if (!in_array($booking->status, ['PENDING', 'ACCEPTED'])) {
                return response()->json(['message' => 'This booking cannot be cancelled anymore.'], 403);
            }
        }

        if ($user->role === 'AGENT') {
            if (!in_array($newStatus, ['ACCEPTED', 'DECLINED', 'COMPLETED'])) {
                return response()->json(['message' => 'Invalid status update for agent.'], 403);
            }
        }

        $booking->update(['status' => $newStatus]);

        event(new \App\Events\BookingStatusChanged($booking->load(['client', 'agent', 'service'])));

        return response()->json($booking->load(['client', 'agent', 'service']));
    }
}
