<?php

namespace Tests\Feature;

use App\Jobs\SendPushNotification;
use App\Models\Milestone;
use App\Models\Project;
use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class CheckUpcomingMilestonesTest extends TestCase
{
    use RefreshDatabase;

    public function test_notifies_owner_for_milestone_due_in_7_days(): void
    {
        Queue::fake();

        $owner = User::factory()->create();
        PushSubscription::create([
            'user_id'  => $owner->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/milestone-test-1',
            'p256dh'   => 'BNcRdreALRFXTkOOUHK1EtK2wtZ3en-zVnzpGpBbcFBk',
            'auth'     => 'tBHIyp0KU0rxqcuhm',
        ]);

        $project = Project::factory()->create(['user_id' => $owner->id]);

        Milestone::create([
            'project_id'  => $project->id,
            'name'        => 'Test Milestone',
            'target_date' => today()->addDays(7)->toDateString(),
            'status'      => 'planned',
            'order'       => 1,
        ]);

        $this->artisan('sinapsys:check-milestones')->assertSuccessful();

        Queue::assertPushed(SendPushNotification::class);
    }

    public function test_no_notification_for_distant_milestone(): void
    {
        Queue::fake();

        $owner = User::factory()->create();
        PushSubscription::create([
            'user_id'  => $owner->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/milestone-test-2',
            'p256dh'   => 'BNcRdreALRFXTkOOUHK1EtK2wtZ3en-zVnzpGpBbcFBk',
            'auth'     => 'tBHIyp0KU0rxqcuhm',
        ]);

        $project = Project::factory()->create(['user_id' => $owner->id]);

        Milestone::create([
            'project_id'  => $project->id,
            'name'        => 'Far Future Milestone',
            'target_date' => today()->addDays(30)->toDateString(),
            'status'      => 'planned',
            'order'       => 1,
        ]);

        $this->artisan('sinapsys:check-milestones')->assertSuccessful();

        Queue::assertNothingPushed();
    }
}
