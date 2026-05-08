<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $teamProjectIds = $user->projectMemberships()
            ->whereNotNull('accepted_at')
            ->pluck('project_id');

        $query = Task::with(['project:id,name,color', 'assignee:id,name'])
            ->where(function ($q) use ($user, $teamProjectIds) {
                $q->where('user_id', $user->id)
                  ->orWhereIn('project_id', $teamProjectIds);
            });

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $tasks = $query->orderBy('priority')->orderBy('due_date')->get();

        $today     = now()->toDateString();
        $weekAhead = now()->addDays(7)->toDateString();

        $grouped = [
            'overdue'   => $tasks->filter(fn ($t) => !$t->done && $t->due_date && $t->due_date->toDateString() < $today)->values(),
            'today'     => $tasks->filter(fn ($t) => !$t->done && $t->due_date && $t->due_date->toDateString() === $today)->values(),
            'upcoming'  => $tasks->filter(fn ($t) => !$t->done && $t->due_date && $t->due_date->toDateString() > $today && $t->due_date->toDateString() <= $weekAhead)->values(),
            'no_date'   => $tasks->filter(fn ($t) => !$t->done && !$t->due_date)->values(),
            'completed' => $tasks->filter(fn ($t) => $t->done)->values(),
        ];

        $ownProjects  = $user->projects()->select('id', 'name', 'color', 'user_id')->orderBy('name')->get();
        $teamProjects = Project::whereIn('id', $teamProjectIds)->select('id', 'name', 'color', 'user_id')->orderBy('name')->get();
        $allProjects  = $ownProjects->merge($teamProjects)->unique('id')->values();

        return Inertia::render('Tasks/Index', [
            'grouped'           => $grouped,
            'projects'          => $allProjects,
            'projectMembersMap' => $this->buildProjectMembersMap($allProjects),
            'filters'           => $request->only(['project_id', 'category']),
        ]);
    }

    public function store(TaskRequest $request)
    {
        if ($request->project_id) {
            $project = Project::findOrFail($request->project_id);
            abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager', 'contributor']), 403);
        }

        $request->user()->tasks()->create($request->validated());

        return back()->with('success', 'Tarea creada.');
    }

    public function update(TaskRequest $request, Task $task)
    {
        abort_if(!$this->canMutate($request->user()->id, $task), 403);

        $task->update($request->validated());

        return back()->with('success', 'Tarea actualizada.');
    }

    public function toggle(Request $request, Task $task)
    {
        abort_if(!$this->canMutate($request->user()->id, $task), 403);

        $task->update([
            'done'         => !$task->done,
            'completed_at' => !$task->done ? now() : null,
        ]);

        return back();
    }

    public function destroy(Request $request, Task $task)
    {
        abort_if(!$this->canDelete($request->user()->id, $task), 403);

        $task->delete();

        return back()->with('success', 'Tarea eliminada.');
    }

    // --- Helpers ---

    private function canMutate(int $userId, Task $task): bool
    {
        if ($task->user_id === $userId) return true;
        if (!$task->project_id) return false;
        return in_array($task->project->getRoleFor($userId), ['owner', 'manager', 'contributor']);
    }

    private function canDelete(int $userId, Task $task): bool
    {
        if ($task->user_id === $userId) return true;
        if (!$task->project_id) return false;
        return in_array($task->project->getRoleFor($userId), ['owner', 'manager']);
    }

    private function buildProjectMembersMap(Collection $projects): array
    {
        if ($projects->isEmpty()) return [];

        $projectIds = $projects->pluck('id');

        $membersByProject = ProjectMember::whereIn('project_id', $projectIds)
            ->whereNotNull('accepted_at')
            ->whereNotNull('user_id')
            ->with('user:id,name')
            ->get()
            ->groupBy('project_id');

        $ownerNames = User::whereIn('id', $projects->pluck('user_id')->unique())
            ->pluck('name', 'id');

        $map = [];
        foreach ($projects as $project) {
            $people = collect([['id' => $project->user_id, 'name' => $ownerNames[$project->user_id] ?? '']]);

            foreach ($membersByProject->get($project->id, collect()) as $m) {
                $people->push(['id' => $m->user_id, 'name' => $m->user->name]);
            }

            $people = $people->unique('id')->values();

            if ($people->count() > 1) {
                $map[$project->id] = $people->toArray();
            }
        }

        return $map;
    }
}
