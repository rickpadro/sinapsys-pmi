<?php

namespace Tests\Feature;

use App\Jobs\SendPushNotification;
use App\Models\PushSubscription;
use App\Models\User;
use App\Services\PushNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class PushNotificationServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_sendToUser_dispatches_job_per_subscription(): void
    {
        Queue::fake();

        $user = User::factory()->create();

        PushSubscription::create([
            'user_id'  => $user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/service-test-1',
            'p256dh'   => 'BNcRdreALRFXTkOOUHK1EtK2wtZ3en-zVnzpGpBbcFBk',
            'auth'     => 'tBHIyp0KU0rxqcuhm',
        ]);
        PushSubscription::create([
            'user_id'  => $user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/service-test-2',
            'p256dh'   => 'BNcRdreALRFXTkOOUHK1EtK2wtZ3en-zVnzpGpBbcFBk',
            'auth'     => 'tBHIyp0KU0rxqcuhm',
        ]);

        /** @var PushNotificationService $service */
        $service = app(PushNotificationService::class);
        $sent = $service->sendToUser($user, ['type' => 'test']);

        $this->assertCount(2, $sent);
        Queue::assertPushed(SendPushNotification::class, 2);
    }

    public function test_rawSend_logs_entry_when_library_missing(): void
    {
        if (class_exists(\Minishlink\WebPush\WebPush::class)) {
            $this->markTestSkipped('minishlink/web-push is installed; skipping library-missing guard test.');
        }

        $user = User::factory()->create();
        $sub  = PushSubscription::create([
            'user_id'  => $user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/rawsend-test',
            'p256dh'   => 'BNcRdreALRFXTkOOUHK1EtK2wtZ3en-zVnzpGpBbcFBk',
            'auth'     => 'tBHIyp0KU0rxqcuhm',
        ]);

        /** @var PushNotificationService $service */
        $service = app(PushNotificationService::class);
        $result  = $service->rawSend($sub, ['type' => 'test']);

        $this->assertFalse($result);
        $this->assertDatabaseHas('notification_log', [
            'user_id' => $user->id,
            'type'    => 'test',
            'success' => false,
        ]);
    }
}
