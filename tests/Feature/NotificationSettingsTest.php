<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationSettingsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that an authenticated user can update their notification preferences.
     */
    public function test_user_can_update_notification_preferences(): void
    {
        $user = User::factory()->create();

        $preferences = [
            'Booking Updates:New booking confirmed:Email' => true,
            'Messages:New message received:Push' => false,
        ];

        $response = $this->actingAs($user)
            ->putJson('/api/notification-settings', [
                'preferences' => $preferences,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Notification preferences updated successfully')
            ->assertJsonPath('preferences', $preferences);

        $this->assertEquals($preferences, $user->fresh()->notification_preferences);
    }

    /**
     * Test that unauthenticated users cannot update preferences.
     */
    public function test_unauthenticated_user_cannot_update_preferences(): void
    {
        $response = $this->putJson('/api/notification-settings', [
            'preferences' => [],
        ]);

        $response->assertStatus(401);
    }
}
