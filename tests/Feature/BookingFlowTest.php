<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Service;
use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class BookingFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_create_booking()
    {
        $client = User::factory()->create(['role' => 'CLIENT']);
        $agent = User::factory()->create(['role' => 'AGENT']);
        $service = Service::factory()->create(['base_price' => 5000]);

        Sanctum::actingAs($client);

        $response = $this->postJson('/api/bookings', [
            'service_id' => $service->id,
            'agent_id' => $agent->id,
            'scheduled_at' => now()->addDay()->toDateTimeString(),
            'address' => '123 Test St, Abuja',
            'notes' => 'Test notes',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('status', 'PENDING')
                 ->assertJsonPath('total_price', '5000.00');

        $this->assertDatabaseHas('bookings', [
            'client_id' => $client->id,
            'agent_id' => $agent->id,
            'status' => 'PENDING',
        ]);
    }

    public function test_booking_status_changes_on_payment_webhook()
    {
        $client = User::factory()->create(['role' => 'CLIENT', 'email' => 'client@example.com']);
        $agent = User::factory()->create(['role' => 'AGENT']);
        $service = Service::factory()->create();
        
        $booking = Booking::create([
            'client_id' => $client->id,
            'agent_id' => $agent->id,
            'service_id' => $service->id,
            'status' => 'PENDING',
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

        // Simulate Paystack Webhook (Assuming signature verification is bypassed or mocked in test)
        // For this test, we call the controller method directly or mock the signature check.
        // Since we implemented signature verification, we need to provide a header.
        
        $secret = config('services.paystack.secret');
        $signature = hash_hmac('sha512', json_encode($payload), $secret);

        $response = $this->withHeaders([
            'x-paystack-signature' => $signature,
        ])->postJson('/api/webhooks/paystack', $payload);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'ACCEPTED',
        ]);
    }
}
