<?php
namespace App\Console\Commands;

use App\Models\Milestone;
use App\Services\MilestoneTracker;
use App\Services\PushNotificationService;
use Illuminate\Console\Command;

class CheckUpcomingMilestones extends Command {
    protected $signature   = 'sinapsys:check-milestones';
    protected $description = 'Notifica a owners y managers de milestones que vencen en 7 días';

    public function handle(PushNotificationService $service, MilestoneTracker $tracker): int {
        $deadline = today()->addDays(7);

        $milestones = Milestone::whereDate('target_date', $deadline)
            ->whereNull('actual_date')
            ->with(['project.members.user', 'project.user'])
            ->get();

        foreach ($milestones as $milestone) {
            $status = $tracker->evaluateStatus($milestone);
            if ($milestone->status !== $status) {
                $milestone->update(['status' => $status]);
            }

            $owner    = $milestone->project->user;
            $managers = $milestone->project->members()
                ->whereNotNull('accepted_at')
                ->where('role', 'manager')
                ->with('user')
                ->get()
                ->pluck('user');

            $recipients = collect($owner ? [$owner] : [])->merge($managers)->unique('id');

            foreach ($recipients as $user) {
                $service->sendToUser($user, [
                    'type'         => 'milestone_at_risk_7d',
                    'title'        => "🎯 Hito en 7 días: {$milestone->name}",
                    'body'         => $status === 'at_risk' ? '⚠ AT RISK · revisar bloqueantes' : 'On track',
                    'url'          => "/projects/{$milestone->project_id}",
                    'milestone_id' => $milestone->id,
                ]);
            }
        }

        $this->info("✓ {$milestones->count()} milestones revisados.");
        return Command::SUCCESS;
    }
}
