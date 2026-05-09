<?php

namespace Tests\Feature;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PushSubscribeTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_subscribe(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/push/subscribe', [
            'endpoint'   => 'https://fcm.googleapis.com/fcm/send/fake-endpoint-123',
            'p256dh'     => 'BNcRdreALRFXTkOOUHK1EtK2wtZ3en-zVnzpGpBbcFBk',
            'auth'       => 'tBHIyp0KU0rxqcuhm',
            'user_agent' => 'Mozilla/5.0',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['ok' => true]);

        $this->assertDatabaseCount('push_subscriptions', 1);
        $this->assertDatabaseHas('push_subscriptions', [
            'user_id'  => $user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/fake-endpoint-123',
        ]);
    }

    public function test_user_can_unsubscribe(): void
    {
        $user = User::factory()->create();

        PushSubscription::create([
            'user_id'  => $user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/fake-endpoint-456',
            'p256dh'   => 'BNcRdreALRFXTkOOUHK1EtK2wtZ3en-zVnzpGpBbcFBk',
            'auth'     => 'tBHIyp0KU0rxqcuhm',
        ]);

        $this->assertDatabaseCount('push_subscriptions', 1);

        $response = $this->actingAs($user)->postJson('/push/unsubscribe', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/fake-endpoint-456',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['ok' => true]);

        $this->assertDatabaseCount('push_subscriptions', 0);
    }
}
