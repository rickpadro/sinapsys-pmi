<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        $teamProjectIds = $user->projectMemberships()
            ->whereNotNull('accepted_at')
            ->pluck('project_id');

        $teamActiveCount = Project::whereIn('id', $teamProjectIds)->active()->count();

        // Admin ve stats globales de toda la plataforma
        if ($user->isAdmin()) {
            $visible = fn ($q) => $q; // sin filtro — todas las tareas
            $teamActiveCount = Project::where('user_id', '!=', $user->id)->active()->count();
        } else {
            $visible = fn ($q) => $q->where(function ($inner) use ($user, $teamProjectIds) {
                $inner->where('user_id', $user->id)
                      ->orWhereIn('project_id', $teamProjectIds);
            });
        }

        $stats = [
            'active_projects' => $user->projects()->active()->count() + $teamActiveCount,
            'total_tasks'     => Task::tap($visible)->where('done', false)->count(),
            'overdue_tasks'   => Task::tap($visible)->overdue()->count(),
            'today_tasks'     => Task::tap($visible)->today()->count(),
            'completed_week'  => Task::tap($visible)->where('done', true)->where('completed_at', '>=', now()->startOfWeek())->count(),
        ];

        $projects = $user->projects()
            ->withCount(['tasks as pending_tasks_count' => fn ($q) => $q->where('done', false)])
            ->orderBy('priority')
            ->get();

        $todayTasks = Task::with('project:id,name,color')
            ->tap($visible)
            ->where('done', false)
            ->where(function ($q) {
                $q->where('due_date', now()->toDateString())
                  ->orWhere(function ($q2) {
                      $q2->whereNotNull('due_date')->where('due_date', '<', now()->toDateString());
                  });
            })
            ->orderBy('priority')
            ->orderBy('due_date')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard', [
            'stats'      => $stats,
            'projects'   => $projects,
            'todayTasks' => $todayTasks,
        ]);
    }
}
