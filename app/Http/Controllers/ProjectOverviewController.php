<?php
namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\MilestoneTracker;
use App\Services\RiskMatrixCalculator;
use App\Services\CapacityPlanner;
use App\Services\CriticalPathCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectOverviewController extends Controller {
    public function show(
        Request $request,
        Project $project,
        MilestoneTracker $milestoneTracker,
        RiskMatrixCalculator $riskCalc,
        CapacityPlanner $capacityPlanner
    ) {
        $role = $project->getRoleFor($request->user()->id);
        abort_if(!$role, 403);

        $project->load(['customFields', 'members.user', 'milestones.linkedTasks', 'risks.mitigations.task', 'decisions']);

        $sections = $project->sections()->with(['tasks'])->get();

        return Inertia::render('Projects/Overview', [
            'project'          => $project,
            'milestones'       => $project->milestones,
            'upcomingMilestones' => $milestoneTracker->upcoming($project, 30),
            'riskMatrix'       => $riskCalc->matrix($project),
            'topRisks'         => $riskCalc->topRisks($project, 5),
            'pendingDecisions' => $project->decisions()->pending()->with(['blocksSection:id,name','blocksMilestone:id,name,target_date'])->get(),
            'capacityHeatmap'  => $capacityPlanner->heatmap($project),
            'criticalTasks'    => $project->tasks()->onCriticalPath()->with('section:id,name')->limit(10)->get(),
            'sections'         => $sections,
            'currentRole'      => $role,
            'isOwner'          => $role === 'owner',
        ]);
    }
}
