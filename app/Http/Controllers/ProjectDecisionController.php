<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectDecisionRequest;
use App\Http\Requests\UpdateProjectDecisionRequest;
use App\Models\Project;
use App\Models\ProjectDecision;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectDecisionController extends Controller {
    public function index(Request $request, Project $project) {
        $role = $project->getRoleFor($request->user()->id);
        abort_if(!$role, 403);

        return Inertia::render('Projects/Decisions/Index', [
            'project'    => $project,
            'decisions'  => $project->decisions()
                ->with(['blocksSection:id,name', 'blocksMilestone:id,name,target_date', 'decidedBy:id,name'])
                ->orderBy('order')
                ->get(),
            'currentRole' => $role,
            'isOwner'     => $role === 'owner',
        ]);
    }

    public function store(StoreProjectDecisionRequest $request, Project $project) {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        abort_if($project->decisions()->where('code', $request->validated('code'))->exists(), 422);
        $max = $project->decisions()->max('order') ?? -1;
        $project->decisions()->create(array_merge($request->validated(), ['order' => $max + 1]));
        return back()->with('success', 'Decisión registrada.');
    }

    public function update(UpdateProjectDecisionRequest $request, Project $project, ProjectDecision $decision) {
        abort_if($decision->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $decision->update($request->validated());
        return back()->with('success', 'Decisión actualizada.');
    }

    public function destroy(Request $request, Project $project, ProjectDecision $decision) {
        abort_if($decision->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $decision->delete();
        return back()->with('success', 'Decisión eliminada.');
    }

    public function confirm(Request $request, Project $project, ProjectDecision $decision) {
        abort_if($decision->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $decision->update([
            'status'     => 'confirmed',
            'decided_by' => $request->user()->id,
            'decided_on' => today(),
        ]);
        return back()->with('success', 'Decisión confirmada.');
    }

    public function reject(Request $request, Project $project, ProjectDecision $decision) {
        abort_if($decision->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $decision->update(['status' => 'rejected', 'decided_on' => today()]);
        return back()->with('success', 'Decisión rechazada.');
    }
}
