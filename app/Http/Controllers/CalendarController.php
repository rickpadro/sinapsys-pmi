<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $month = $request->input('month', now()->format('Y-m'));
        $start = Carbon::parse($month . '-01')->startOfMonth()->startOfWeek(Carbon::SUNDAY);
        $end   = Carbon::parse($month . '-01')->endOfMonth()->endOfWeek(Carbon::SATURDAY);

        $teamProjectIds = $user->projectMemberships()
            ->whereNotNull('accepted_at')
            ->pluck('project_id');

        $tasks = Task::with('project:id,name,color')
            ->where(function ($q) use ($user, $teamProjectIds) {
                $q->where('user_id', $user->id)
                  ->orWhereIn('project_id', $teamProjectIds);
            })
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [$start->toDateString(), $end->toDateString()])
            ->orderBy('priority')
            ->orderBy('due_date')
            ->get()
            ->map(fn ($t) => [
                'id'             => $t->id,
                'name'           => $t->name,
                'priority'       => $t->priority,
                'category'       => $t->category,
                'due_date'       => $t->due_date->toDateString(),
                'done'           => $t->done,
                'estimated_time' => $t->estimated_time,
                'notes'          => $t->notes,
                'project_id'     => $t->project_id,
                'project'        => $t->project ? [
                    'id'    => $t->project->id,
                    'name'  => $t->project->name,
                    'color' => $t->project->color,
                ] : null,
            ]);

        $ownProjects  = $user->projects()->select('id', 'name', 'color')->orderBy('name')->get();
        $teamProjects = Project::whereIn('id', $teamProjectIds)->select('id', 'name', 'color')->orderBy('name')->get();
        $projects     = $ownProjects->merge($teamProjects)->unique('id')->values();

        return Inertia::render('Calendar/Index', [
            'tasks'    => $tasks,
            'projects' => $projects,
            'month'    => $month,
            'today'    => now()->toDateString(),
        ]);
    }
}
