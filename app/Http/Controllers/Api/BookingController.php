<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use OpenApi\Attributes as OA;

#[OA\Tag(name: "Bookings", description: "Service booking management")]
class BookingController extends Controller
{
    #[OA\Get(
        path: "/api/bookings",
        summary: "List user bookings",
        tags: ["Bookings"],
        security: [["sanctum" => []]]
    )]
    #[OA\Response(response: 200, description: "Success")]
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

    #[OA\Post(
        path: "/api/bookings",
        summary: "Create a new booking",
        tags: ["Bookings"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["service_id", "agent_id", "scheduled_at"],
            properties: [
                new OA\Property(property: "service_id", type: "integer", example: 1),
                new OA\Property(property: "agent_id", type: "integer", example: 2),
                new OA\Property(property: "scheduled_at", type: "string", format: "date-time")
            ]
        )
    )]
    #[OA\Response(response: 201, description: "Booking Created")]
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

    #[OA\Patch(
        path: "/api/bookings/{booking}",
        summary: "Update booking status",
        tags: ["Bookings"],
        security: [["sanctum" => []]]
    )]
    #[OA\Parameter(
        name: "booking",
        in: "path",
        required: true,
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["status"],
            properties: [
                new OA\Property(property: "status", type: "string", enum: ["PENDING", "ACCEPTED", "DECLINED", "PAID_ESCROW", "COMPLETED", "CLOSED", "CANCELLED"])
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Success")]
    public function update(Request $request, Booking $booking)
    {
        // Only agent can accept/decline, only client can cancel?
        // Let's keep it simple for now and allow status update if authorized
        $request->validate([
            'status' => 'required|in:PENDING,ACCEPTED,DECLINED,PAID_ESCROW,COMPLETED,CLOSED,CANCELLED',
        ]);

        $user = Auth::user();

        // Basic authorization
        if ($user->id !== $booking->client_id && $user->id !== $booking->agent_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $newStatus = $request->status;

        // Role-based restrictions
        if ($user->role === 'CLIENT') {
            // Clients can cancel pending/accepted bookings or close completed ones
            if ($newStatus === 'CANCELLED') {
                if (!in_array($booking->status, ['PENDING', 'ACCEPTED'])) {
                    return response()->json(['message' => 'This booking cannot be cancelled anymore.'], 403);
                }
            } elseif ($newStatus === 'CLOSED') {
                if ($booking->status !== 'COMPLETED') {
                    return response()->json(['message' => 'You can only close a booking after it is completed.'], 403);
                }
                // Release funds logic will be handled here or in a separate controller
            } else {
                return response()->json(['message' => 'Unauthorized status update for client.'], 403);
            }
        }

        if ($user->role === 'AGENT') {
            // Agents can accept/decline pending bookings or mark paid ones as completed
            if (in_array($newStatus, ['ACCEPTED', 'DECLINED'])) {
                if ($booking->status !== 'PENDING') {
                    return response()->json(['message' => 'Can only accept/decline pending bookings.'], 403);
                }
            } elseif ($newStatus === 'COMPLETED') {
                if ($booking->status !== 'PAID_ESCROW') {
                    return response()->json(['message' => 'Can only complete bookings that have been paid.'], 403);
                }
            } else {
                return response()->json(['message' => 'Invalid status update for agent.'], 403);
            }
        }

        $booking->update(['status' => $newStatus]);

        event(new \App\Events\BookingStatusChanged($booking->load(['client', 'agent', 'service'])));

        return response()->json($booking->load(['client', 'agent', 'service']));
    }
}
