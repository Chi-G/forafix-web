<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function initialize(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::with('client', 'service')->findOrFail($request->booking_id);

        // Ensure only the client who made the booking can pay
        if ($booking->client_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $url = config('services.paystack.url') . '/transaction/initialize';
        
        $response = Http::withToken(config('services.paystack.secret'))
            ->post($url, [
                'amount' => $booking->total_price * 100, // Paystack expects kobo
                'email' => $booking->client->email,
                'reference' => 'B-' . $booking->id . '-' . time(),
                'callback_url' => env('PAYSTACK_CALLBACK_URL', url('/dashboard')), // Frontend callback
                'metadata' => [
                    'booking_id' => $booking->id,
                ]
            ]);

        if ($response->successful()) {
            return response()->json($response->json());
        }

        return response()->json([
            'message' => 'Failed to initialize payment',
            'error' => $response->json()
        ], 500);
    }

    public function webhook(Request $request)
    {
        // Paystack sends a POST request with a signature
        $signature = $request->header('x-paystack-signature');
        $secret = config('services.paystack.secret');

        if ($signature !== hash_hmac('sha512', $request->getContent(), $secret)) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');
        $data = $request->input('data');

        if ($event === 'charge.success') {
            $bookingId = $data['metadata']['booking_id'] ?? null;
            if ($bookingId) {
                $booking = Booking::with(['client', 'agent', 'service'])->find($bookingId);
                if ($booking) {
                    $booking->update(['status' => 'ACCEPTED']); // Or something like 'PAID'
                    
                    // Send Email Notification to Client
                    try {
                        \Illuminate\Support\Facades\Mail::to($booking->client->email)
                            ->send(new \App\Mail\BookingPaid($booking));
                    } catch (\Exception $e) {
                        Log::error('Failed to send booking paid email: ' . $e->getMessage());
                    }

                    // Dispatch notification for real-time UI updates
                    event(new \App\Events\BookingStatusChanged($booking->load(['client', 'agent', 'service'])));
                }
            }
        }

        return response()->json(['status' => 'success']);
    }
}
