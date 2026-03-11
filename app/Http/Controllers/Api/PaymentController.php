<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Payments", description: "Gateway and Escrow Management")]
class PaymentController extends Controller
{
    #[OA\Post(
        path: "/api/payments/pay-with-wallet",
        summary: "Pay for a booking using wallet balance (Escrow)",
        tags: ["Payments"],
        security: [["sanctum" => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: "booking_id", type: "integer")
            ]
        )
    )]
    #[OA\Response(response: 200, description: "Payment successful")]
    #[OA\Response(response: 400, description: "Invalid state or insufficient balance")]
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

        if ($booking->status !== 'ACCEPTED') {
            return response()->json(['message' => 'Agent must accept the booking before payment.'], 400);
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($booking, $user) {
            // CRITICAL: Lock user for update to prevent race conditions on balance
            $user = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();

            if ($user->balance < $booking->total_price) {
                throw new \Exception('Insufficient wallet balance');
            }

            // Deduct from Client balance
            $user->balance -= $booking->total_price;
            $user->save();

            // Calculate Agent payout (80%)
            $commissionRate = 0.20; // 20%
            $payoutAmount = $booking->total_price * (1 - $commissionRate);

            // Move to Agent pending_balance
            $agent = $booking->agent;
            $agent->pending_balance += $payoutAmount;
            $agent->save();

            // Update booking status
            $booking->update(['status' => 'PAID_ESCROW']);

            // Create Transaction record (Debit for Client)
            \App\Models\Transaction::create([
                'user_id' => $user->id,
                'amount' => $booking->total_price,
                'type' => 'debit',
                'source' => 'booking_escrow_payment',
                'description' => 'Escrow payment for booking #' . $booking->id,
                'reference' => 'ESC-' . $booking->id . '-' . time(),
                'status' => 'success',
            ]);

            // Send Notifications
            try {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\BookingPaid($booking));
                \Illuminate\Support\Facades\Mail::to($booking->agent->email)->send(new \App\Mail\NewBookingForAgent($booking));
            } catch (\Exception $e) {
                Log::error('Failed to send booking notifications: ' . $e->getMessage());
            }

            event(new \App\Events\BookingStatusChanged($booking->load(['client', 'agent', 'service'])));

            return response()->json([
                'message' => 'Payment secured in escrow!',
                'booking' => $booking,
                'balance' => $user->balance
            ]);
        });
    }

    public function releaseFunds(Request $request)
    {
        $request->validate(['booking_id' => 'required|exists:bookings,id']);
        
        $booking = Booking::with('client', 'agent')->findOrFail($request->booking_id);
        $user = $request->user();

        if ($booking->client_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== 'COMPLETED') {
            return response()->json(['message' => 'Funds can only be released after completion.'], 400);
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($booking) {
            // CRITICAL: Lock Agent for update for balance safety
            $agent = \App\Models\User::where('id', $booking->agent_id)->lockForUpdate()->first();
            
            // Calculate payout again or store it in booking table? 
            // For now, let's recalculate based on the same 80/20 logic
            $commissionRate = 0.20;
            $payoutAmount = $booking->total_price * (1 - $commissionRate);

            // Move from pending to active balance
            $agent->pending_balance -= $payoutAmount;
            $agent->balance += $payoutAmount;
            $agent->save();

            $booking->update(['status' => 'CLOSED']);

            // Create Transaction record (Credit for Agent)
            \App\Models\Transaction::create([
                'user_id' => $agent->id,
                'amount' => $payoutAmount,
                'type' => 'credit',
                'source' => 'job_payout',
                'description' => 'Payout for job #' . $booking->id,
                'reference' => 'PAY-' . $booking->id . '-' . time(),
                'status' => 'success',
            ]);

            event(new \App\Events\BookingStatusChanged($booking->load(['client', 'agent', 'service'])));

            return response()->json([
                'message' => 'Funds released to agent!',
                'booking' => $booking
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

    #[OA\Post(
        path: "/api/webhooks/paystack",
        summary: "Paystack Webhook Handler",
        tags: ["Payments"]
    )]
    #[OA\Response(response: 200, description: "OK")]
    public function webhook(Request $request)
    {
        // Paystack sends a POST request with a signature
        $signature = $request->header('x-paystack-signature');
        $secret = config('services.paystack.secret');

        if ($signature !== hash_hmac('sha512', $request->getContent(), $secret)) {
            Log::warning('Paystack: Invalid Webhook Signature');
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $payload = $request->all();
        $event = $payload['event'] ?? null;
        $data = $payload['data'] ?? null;

        // CRITICAL: Log raw webhook for audit and recovery
        $webhookLog = \App\Models\WebhookLog::create([
            'provider' => 'paystack',
            'event' => $event,
            'payload' => $payload,
            'headers' => $request->headers->all(),
            'processed' => false
        ]);

        if ($event === 'charge.success') {
            try {
                $status = $this->processChargeSuccess($data);
                if ($status === 'skipped') {
                    $webhookLog->update(['processed' => true, 'error' => 'Duplicate or redundant event']);
                } else {
                    $webhookLog->update(['processed' => true]);
                }
            } catch (\Exception $e) {
                Log::error('Webhook Processing Error: ' . $e->getMessage());
                $webhookLog->update(['error' => $e->getMessage()]);
            }
        }

        return response()->json(['status' => 'success']);
    }

    protected function processChargeSuccess($data)
    {
        $bookingId = $data['metadata']['booking_id'] ?? null;
        
        if (!$bookingId) return;

        return \Illuminate\Support\Facades\DB::transaction(function () use ($bookingId) {
            $booking = Booking::where('id', $bookingId)->lockForUpdate()->first();
            
            if (!$booking || $booking->status === 'PAID_ESCROW') {
                return 'skipped'; // Already processed
            }

            if (in_array($booking->status, ['PENDING', 'ACCEPTED'])) {
                // Calculate Payout
                $commissionRate = 0.20;
                $payoutAmount = $booking->total_price * (1 - $commissionRate);

                // Move to Agent pending_balance
                $agent = \App\Models\User::where('id', $booking->agent_id)->lockForUpdate()->first();
                $agent->pending_balance += $payoutAmount;
                $agent->save();

                $booking->update(['status' => 'PAID_ESCROW']); 
                
                // Send Emails (Queued)
                try {
                    \Illuminate\Support\Facades\Mail::to($booking->client->email)->send(new \App\Mail\BookingPaid($booking));
                    \Illuminate\Support\Facades\Mail::to($booking->agent->email)->send(new \App\Mail\NewBookingForAgent($booking));
                } catch (\Exception $e) {
                    Log::error('Failed to send booking notifications: ' . $e->getMessage());
                }

                event(new \App\Events\BookingStatusChanged($booking->load(['client', 'agent', 'service'])));
            }
        });
    }
}
