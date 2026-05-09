<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreRiskRequest;
use App\Http\Requests\UpdateRiskRequest;
use App\Models\Project;
use App\Models\Risk;
use App\Services\RiskMatrixCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RiskController extends Controller {
    public function index(Request $request, Project $project, RiskMatrixCalculator $calc) {
        $role = $project->getRoleFor($request->user()->id);
        abort_if(!$role, 403);

        return Inertia::render('Projects/Risks/Index', [
            'project'     => $project,
            'risks'       => $project->risks()->with(['mitigations.task', 'owner:id,name'])->get(),
            'matrix'      => $calc->matrix($project),
            'currentRole' => $role,
            'isOwner'     => $role === 'owner',
        ]);
    }

    public function store(StoreRiskRequest $request, Project $project) {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        // Ensure unique code per project
        abort_if($project->risks()->where('code', $request->validated('code'))->exists(), 422);
        $project->risks()->create($request->validated());
        return back()->with('success', 'Riesgo registrado.');
    }

    public function update(UpdateRiskRequest $request, Project $project, Risk $risk) {
        abort_if($risk->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $risk->update($request->validated());
        return back()->with('success', 'Riesgo actualizado.');
    }

    public function destroy(Request $request, Project $project, Risk $risk) {
        abort_if($risk->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $risk->delete();
        return back()->with('success', 'Riesgo eliminado.');
    }

    public function materialize(Request $request, Project $project, Risk $risk) {
        abort_if($risk->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $risk->update(['status' => 'materialized']);
        return back()->with('success', 'Riesgo marcado como materializado.');
    }

    public function close(Request $request, Project $project, Risk $risk) {
        abort_if($risk->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $risk->update(['status' => 'closed', 'closed_on' => today()]);
        return back()->with('success', 'Riesgo cerrado.');
    }
}
