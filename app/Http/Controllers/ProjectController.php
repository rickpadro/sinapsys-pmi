<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjectRequest;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Admin ve TODOS los proyectos del sistema
        if ($user->isAdmin()) {
            $allProjects = Project::withCount(['tasks as pending_tasks_count' => fn ($q) => $q->where('done', false)])
                ->withCount(['tasks as total_tasks_count'])
                ->with('user:id,name')
                ->when($request->filled('type'),  fn ($q) => $q->byType($request->type))
                ->when($request->filled('phase'), fn ($q) => $q->where('phase', $request->phase))
                ->orderBy('sort_order')->orderBy('priority')->get();

            return Inertia::render('Projects/Index', [
                'projects'     => $allProjects->where('user_id', $user->id)->values(),
                'teamProjects' => $allProjects->where('user_id', '!=', $user->id)->values(),
                'filters'      => $request->only(['type', 'phase']),
                'isAdmin'      => true,
            ]);
        }

        // Proyectos propios
        $query = $user->projects()
            ->withCount(['tasks as pending_tasks_count' => fn ($q) => $q->where('done', false)])
            ->withCount(['tasks as total_tasks_count']);

        if ($request->filled('type'))  $query->byType($request->type);
        if ($request->filled('phase')) $query->where('phase', $request->phase);

        $projects = $query->orderBy('sort_order')->orderBy('priority')->get();

        // Proyectos de equipo
        $memberIds = $user->projectMemberships()->whereNotNull('accepted_at')->pluck('project_id');

        $teamProjects = Project::whereIn('id', $memberIds)
            ->withCount(['tasks as pending_tasks_count' => fn ($q) => $q->where('done', false)])
            ->orderBy('name')
            ->get()
            ->map(function ($p) use ($user) {
                $p->current_role = $p->members()->where('user_id', $user->id)->value('role');
                return $p;
            });

        return Inertia::render('Projects/Index', [
            'projects'     => $projects,
            'teamProjects' => $teamProjects,
            'filters'      => $request->only(['type', 'phase']),
            'isAdmin'      => false,
        ]);
    }

    public function create()
    {
        return Inertia::render('Projects/Create');
    }

    public function store(ProjectRequest $request)
    {
        $nextSlot = ($request->user()->projects()->max('sort_order') ?? -1) + 1;
        $request->user()->projects()->create(array_merge($request->validated(), ['sort_order' => $nextSlot]));

        return redirect()->route('projects.index')
            ->with('success', 'Proyecto creado.');
    }

    public function show(Request $request, Project $project)
    {
        $role = $project->getRoleFor($request->user()->id);
        abort_if(!$role, 403);

        $project->load([
            'tasks'     => fn ($q) => $q->orderBy('priority')->orderBy('due_date'),
            'user:id,name,email',
        ]);
        $project->loadCount([
            'tasks as pending_tasks_count'   => fn ($q) => $q->where('done', false),
            'tasks as completed_tasks_count' => fn ($q) => $q->where('done', true),
        ]);

        $messages = $project->aiMessages()->orderBy('created_at')->get();

        $members = $project->members()
            ->with(['user:id,name,email', 'inviter:id,name'])
            ->orderByRaw('accepted_at IS NULL, accepted_at ASC')
            ->get();

        return Inertia::render('Projects/Show', [
            'project'     => $project,
            'aiMessages'  => $messages,
            'members'     => $members,
            'currentRole' => $role,
            'isOwner'     => $role === 'owner',
        ]);
    }

    public function edit(Request $request, Project $project)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        return Inertia::render('Projects/Edit', [
            'project' => $project,
        ]);
    }

    public function update(ProjectRequest $request, Project $project)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $project->update($request->validated());

        return redirect()->route('projects.show', $project)
            ->with('success', 'Proyecto actualizado.');
    }

    public function destroy(Request $request, Project $project)
    {
        abort_if($project->user_id !== $request->user()->id, 403);

        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Proyecto eliminado.');
    }

    public function togglePhaseTask(Request $request, Project $project)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $request->validate([
            'key' => ['required', 'string'],
        ]);

        $tasks = $project->phase_tasks ?? [];
        $tasks[$request->key] = !($tasks[$request->key] ?? false);
        $project->update(['phase_tasks' => $tasks]);

        return back();
    }

    public function addLink(Request $request, Project $project)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'url'   => ['required', 'string', 'max:500'],
        ]);

        $links = $project->links ?? [];
        $links[] = ['title' => $request->title, 'url' => $request->url];
        $project->update(['links' => $links]);

        return back();
    }

    public function removeLink(Request $request, Project $project, int $index)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $links = $project->links ?? [];
        array_splice($links, $index, 1);
        $project->update(['links' => array_values($links)]);

        return back();
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'order' => ['required', 'array'],
        ]);

        foreach ($request->order as $projectId => $slotIndex) {
            Project::where('id', $projectId)
                ->where('user_id', $request->user()->id)
                ->update(['sort_order' => (int) $slotIndex]);
        }

        return response()->json(['ok' => true]);
    }
}
