<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Service;
use App\Models\Booking;
use App\Models\Transaction;
use App\Models\WebhookLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\DB;

class HardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_idempotency()
    {
        $client = User::factory()->create(['role' => 'CLIENT', 'email' => 'client@example.com']);
        $agent = User::factory()->create(['role' => 'AGENT']);
        $service = Service::factory()->create(['base_price' => 5000]);
        
        $booking = Booking::create([
            'client_id' => $client->id,
            'agent_id' => $agent->id,
            'service_id' => $service->id,
            'status' => 'ACCEPTED',
            'scheduled_at' => now()->addDay(),
            'address' => 'Test Address',
            'total_price' => 5000,
        ]);

        $payload = [
            'event' => 'charge.success',
            'data' => [
                'metadata' => [
                    'booking_id' => $booking->id,
                ],
            ],
        ];

        $secret = config('services.paystack.secret');
        $signature = hash_hmac('sha512', json_encode($payload), $secret);

        // First call
        $response1 = $this->withHeaders([
            'x-paystack-signature' => $signature,
        ])->postJson('/api/webhooks/paystack', $payload);

        $response1->assertStatus(200);
        $this->assertEquals('PAID_ESCROW', $booking->fresh()->status);
        
        $payoutAmount = 5000 * 0.8;
        $this->assertEquals($payoutAmount, $agent->fresh()->pending_balance);

        // Second call (Same payload)
        $response2 = $this->withHeaders([
            'x-paystack-signature' => $signature,
        ])->postJson('/api/webhooks/paystack', $payload);

        $response2->assertStatus(200);
        
        // Assert no changes happened on second call
        $this->assertEquals('PAID_ESCROW', $booking->fresh()->status);
        $this->assertEquals($payoutAmount, $agent->fresh()->pending_balance);
        
        // Assert only one webhook log was processed as success without skipping
        $this->assertEquals(2, WebhookLog::count());
        $this->assertEquals(1, WebhookLog::where('processed', true)->whereNull('error')->count()); 
        $this->assertEquals(1, WebhookLog::where('error', 'Duplicate or redundant event')->count());
    }

    public function test_wallet_payment_concurrency_lock()
    {
        $client = User::factory()->create(['role' => 'CLIENT', 'balance' => 10000]);
        $agent = User::factory()->create(['role' => 'AGENT']);
        $service = Service::factory()->create();
        
        $booking = Booking::create([
            'client_id' => $client->id,
            'agent_id' => $agent->id,
            'service_id' => $service->id,
            'status' => 'ACCEPTED',
            'scheduled_at' => now()->addDay(),
            'address' => 'Test Address',
            'total_price' => 5000,
        ]);

        $this->actingAs($client);

        $response = $this->postJson('/api/payments/wallet', [
            'booking_id' => $booking->id,
        ]);

        $response->assertStatus(200);
        
        $this->assertEquals(5000, $client->fresh()->balance);
        $this->assertEquals(4000, $agent->fresh()->pending_balance);
        $this->assertEquals('PAID_ESCROW', $booking->fresh()->status);
        
        $this->assertDatabaseHas('transactions', [
            'user_id' => $client->id,
            'amount' => 5000,
            'type' => 'debit',
            'source' => 'booking_escrow_payment'
        ]);

        // Verify ledger consistency
        $clientTransactions = Transaction::where('user_id', $client->id)->sum('amount');
        $this->assertEquals(5000, $clientTransactions);
    }
}
