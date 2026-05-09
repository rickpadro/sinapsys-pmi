<?php

namespace App\Http\Controllers;

use App\Http\Requests\MoveTaskRequest;
use App\Models\Project;
use App\Models\Task;
use App\Services\TaskMover;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BoardViewController extends Controller
{
    public function show(Request $request, Project $project)
    {
        $role = $project->getRoleFor($request->user()->id);
        abort_if(!$role, 403);

        $project->load('user:id,name,email');

        $sections = $project->sections()
            ->orderBy('order')
            ->with([
                'tasks' => fn ($q) => $q
                    ->orderBy('order_in_section')
                    ->with('assignee:id,name')
                    ->with('customFieldValues.customField'),
            ])
            ->get();

        $customFields = $project->customFields()
            ->where('applies_to', 'task')
            ->orderBy('order')
            ->get();

        $members = $project->members()
            ->with('user:id,name')
            ->whereNotNull('accepted_at')
            ->get();

        return Inertia::render('Projects/BoardView', [
            'project'      => $project,
            'sections'     => $sections,
            'customFields' => $customFields,
            'members'      => $members,
            'currentRole'  => $role,
            'isOwner'      => $role === 'owner',
        ]);
    }

    public function moveTask(MoveTaskRequest $request, Project $project)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager', 'contributor']), 403);

        $data = $request->validated();

        $task = Task::findOrFail($data['task_id']);
        abort_if($task->project_id !== $project->id, 403);

        app(TaskMover::class)->move($task, $data['section_id'], $data['order_in_section']);

        return response()->json(['ok' => true]);
    }
}
