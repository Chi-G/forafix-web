<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function payWithWallet(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::with('client', 'agent', 'service')->findOrFail($request->booking_id);
        $user = $request->user();

        // Ensure only the client who made the booking can pay
        if ($booking->client_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== 'PENDING') {
            return response()->json(['message' => 'Booking is already processed'], 400);
        }

        if ($user->balance < $booking->total_price) {
            return response()->json(['message' => 'Insufficient wallet balance'], 400);
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($booking, $user) {
            // Deduct balance
            $user->balance -= $booking->total_price;
            $user->save();

            // Update booking
            $booking->update(['status' => 'ACCEPTED']);

            // Create Transaction record
            \App\Models\Transaction::create([
                'user_id' => $user->id,
                'amount' => $booking->total_price,
                'type' => 'debit',
                'source' => 'booking_payment',
                'description' => 'Payment for booking #' . $booking->id . ' (' . $booking->service->name . ')',
                'reference' => 'WAL-' . $booking->id . '-' . time(),
                'status' => 'success',
            ]);

            // Send Notifications/Emails
            try {
                // To Client: Receipt
                \Illuminate\Support\Facades\Mail::to($user->email)
                    ->send(new \App\Mail\BookingPaid($booking));
                
                // To Agent: New Job Notification
                \Illuminate\Support\Facades\Mail::to($booking->agent->email)
                    ->send(new \App\Mail\NewBookingForAgent($booking));

            } catch (\Exception $e) {
                Log::error('Failed to send booking notifications: ' . $e->getMessage());
            }

            // Dispatch real-time event
            event(new \App\Events\BookingStatusChanged($booking->load(['client', 'agent', 'service'])));

            return response()->json([
                'message' => 'Payment successful!',
                'booking' => $booking,
                'balance' => $user->balance
            ]);
        });
    }

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
                    
                    // Send Emails
                    try {
                        // To Client: Receipt
                        \Illuminate\Support\Facades\Mail::to($booking->client->email)
                            ->send(new \App\Mail\BookingPaid($booking));
                        
                        // To Agent: New Job Notification
                        \Illuminate\Support\Facades\Mail::to($booking->agent->email)
                            ->send(new \App\Mail\NewBookingForAgent($booking));

                    } catch (\Exception $e) {
                        Log::error('Failed to send booking notifications: ' . $e->getMessage());
                    }

                    // Dispatch real-time Pusher events for both Client and Agent
                    event(new \App\Events\BookingStatusChanged($booking->load(['client', 'agent', 'service'])));
                }
            }
        }

        return response()->json(['status' => 'success']);
    }
}
