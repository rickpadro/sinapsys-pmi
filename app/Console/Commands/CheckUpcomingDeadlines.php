<?php
namespace App\Console\Commands;

use App\Models\Task;
use App\Services\PushNotificationService;
use Illuminate\Console\Command;

class CheckUpcomingDeadlines extends Command {
    protected $signature   = 'sinapsys:check-deadlines';
    protected $description = 'Notifica a los asignados de tareas que vencen en 24 horas';

    public function handle(PushNotificationService $service): int {
        $tomorrow = today()->addDay();

        $tasks = Task::where('done', false)
            ->whereNotNull('assigned_to')
            ->whereDate('due_date', $tomorrow)
            ->with(['assignee', 'project'])
            ->get();

        $notified = 0;
        foreach ($tasks as $task) {
            if (!$task->assignee) continue;

            $sent = $service->sendToUser($task->assignee, [
                'type'    => 'task_deadline_24h',
                'title'   => "⏰ Vence mañana: {$task->name}",
                'body'    => "Proyecto: {$task->project->name}",
                'url'     => "/projects/{$task->project_id}",
                'task_id' => $task->id,
            ]);
            $notified += count($sent);
        }

        $this->info("✓ {$tasks->count()} tareas revisadas, {$notified} notificaciones enviadas.");
        return Command::SUCCESS;
    }
}
