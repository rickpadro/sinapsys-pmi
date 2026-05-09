<?php

namespace Tests\Feature;

use App\Jobs\SendPushNotification;
use App\Models\PushSubscription;
use App\Models\Task;
use App\Models\User;
use Database\Factories\ProjectFactory;
use Database\Factories\SectionFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class CheckUpcomingDeadlinesTest extends TestCase
{
    use RefreshDatabase;

    public function test_notifies_assignee_for_task_due_tomorrow(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        PushSubscription::create([
            'user_id'  => $user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/deadline-test-1',
            'p256dh'   => 'BNcRdreALRFXTkOOUHK1EtK2wtZ3en-zVnzpGpBbcFBk',
            'auth'     => 'tBHIyp0KU0rxqcuhm',
        ]);

        Task::factory()->create([
            'assigned_to' => $user->id,
            'due_date'    => today()->addDay()->toDateString(),
            'done'        => false,
        ]);

        $this->artisan('sinapsys:check-deadlines')->assertSuccessful();

        Queue::assertPushed(SendPushNotification::class);
    }

    public function test_does_not_notify_for_completed_task(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        PushSubscription::create([
            'user_id'  => $user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/deadline-test-2',
            'p256dh'   => 'BNcRdreALRFXTkOOUHK1EtK2wtZ3en-zVnzpGpBbcFBk',
            'auth'     => 'tBHIyp0KU0rxqcuhm',
        ]);

        Task::factory()->create([
            'assigned_to' => $user->id,
            'due_date'    => today()->addDay()->toDateString(),
            'done'        => true,
        ]);

        $this->artisan('sinapsys:check-deadlines')->assertSuccessful();

        Queue::assertNothingPushed();
    }
}
