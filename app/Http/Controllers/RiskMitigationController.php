<?php
namespace App\Http\Controllers;

use App\Http\Requests\LinkTaskToRiskRequest;
use App\Models\Project;
use App\Models\Risk;
use App\Models\RiskMitigation;
use Illuminate\Http\Request;

class RiskMitigationController extends Controller {
    public function store(LinkTaskToRiskRequest $request, Project $project, Risk $risk) {
        abort_if($risk->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager','contributor']), 403);
        RiskMitigation::firstOrCreate(
            ['risk_id' => $risk->id, 'task_id' => $request->validated('task_id')],
            ['rationale' => $request->validated('rationale')]
        );
        return back()->with('success', 'Tarea vinculada al riesgo.');
    }

    public function destroy(Request $request, Project $project, Risk $risk, RiskMitigation $mitigation) {
        abort_if($risk->project_id !== $project->id, 404);
        abort_if($mitigation->risk_id !== $risk->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);
        $mitigation->delete();
        return back()->with('success', 'Vínculo eliminado.');
    }
}
