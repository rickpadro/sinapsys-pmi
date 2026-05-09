<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreMemberCapacityRequest;
use App\Http\Requests\UpdateMemberCapacityRequest;
use App\Models\MemberCapacity;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Services\CapacityPlanner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberCapacityController extends Controller {
    public function index(Request $request, Project $project, CapacityPlanner $planner) {
        $role = $project->getRoleFor($request->user()->id);
        abort_if(!$role, 403);

        $sections = $project->sections()->sprints()->with('memberCapacities')->get();
        $members  = $project->members()->with('user:id,name')->whereNotNull('accepted_at')->get();

        return Inertia::render('Projects/Capacity/Index', [
            'project'          => $project,
            'sections'         => $sections,
            'members'          => $members,
            'capacityMatrix'   => $planner->projectCapacity($project),
            'heatmap'          => $planner->heatmap($project),
            'currentRole'      => $role,
            'isOwner'          => $role === 'owner',
        ]);
    }

    public function upsert(StoreMemberCapacityRequest $request, Project $project, ProjectMember $member) {
        abort_if($member->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);

        MemberCapacity::updateOrCreate(
            ['project_member_id' => $member->id, 'section_id' => $request->validated('section_id')],
            [
                'dedication_pct'           => $request->validated('dedication_pct', 100),
                'available_hours_per_week' => $request->validated('available_hours_per_week', 40),
                'notes'                    => $request->validated('notes'),
            ]
        );

        return back()->with('success', 'Capacidad actualizada.');
    }

    public function bulkUpsert(Request $request, Project $project) {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner','manager']), 403);

        $request->validate([
            'capacities'                          => ['required', 'array'],
            'capacities.*.project_member_id'      => ['required', 'exists:project_members,id'],
            'capacities.*.section_id'             => ['required', 'exists:sections,id'],
            'capacities.*.dedication_pct'         => ['required', 'numeric', 'min:0', 'max:100'],
            'capacities.*.available_hours_per_week' => ['nullable', 'integer', 'min:1', 'max:80'],
        ]);

        foreach ($request->capacities as $cap) {
            MemberCapacity::updateOrCreate(
                ['project_member_id' => $cap['project_member_id'], 'section_id' => $cap['section_id']],
                ['dedication_pct' => $cap['dedication_pct'], 'available_hours_per_week' => $cap['available_hours_per_week'] ?? 40]
            );
        }

        return back()->with('success', 'Capacidades actualizadas.');
    }
}
