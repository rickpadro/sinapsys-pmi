<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreMilestoneRequest;
use App\Http\Requests\UpdateMilestoneRequest;
use App\Http\Requests\LinkTasksToMilestoneRequest;
use App\Models\Milestone;
use App\Models\Project;
use App\Services\MilestoneTracker;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MilestoneController extends Controller {
    public function index(Request $request, Project $project) {
        $role = $project->getRoleFor($request->user()->id);
        abort_if(!$role, 403);

        return Inertia::render('Projects/Milestones/Index', [
            'project'     => $project,
            'milestones'  => $project->milestones()->with('linkedTasks')->get(),
            'currentRole' => $role,
            'isOwner'     => $role === 'owner',
        ]);
    }

    public function store(StoreMilestoneRequest $request, Project $project) {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $max = $project->milestones()->max('order') ?? -1;
        $project->milestones()->create(array_merge($request->validated(), ['order' => $max + 1]));
        return back()->with('success', 'Hito creado.');
    }

    public function update(UpdateMilestoneRequest $request, Project $project, Milestone $milestone) {
        abort_if($milestone->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $milestone->update($request->validated());
        return back()->with('success', 'Hito actualizado.');
    }

    public function destroy(Request $request, Project $project, Milestone $milestone) {
        abort_if($milestone->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $milestone->delete();
        return back()->with('success', 'Hito eliminado.');
    }

    public function linkTasks(LinkTasksToMilestoneRequest $request, Project $project, Milestone $milestone) {
        abort_if($milestone->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        foreach ($request->validated('task_ids') as $taskId) {
            $project->tasks()->where('id', $taskId)->update(['linked_milestone_id' => $milestone->id]);
        }
        return back()->with('success', 'Tareas vinculadas.');
    }

    public function markMet(Request $request, Project $project, Milestone $milestone, MilestoneTracker $tracker) {
        abort_if($milestone->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $tracker->markMet($milestone);
        return back()->with('success', 'Hito marcado como completado.');
    }
}
