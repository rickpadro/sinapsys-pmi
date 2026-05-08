<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\VelocityCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VelocityReportController extends Controller
{
    public function show(Request $request, Project $project, VelocityCalculator $calc)
    {
        $role = $project->getRoleFor($request->user()->id);
        abort_if(!$role, 403);

        $project->load('customFields');

        return Inertia::render('Reports/Velocity', [
            'project'        => $project,
            'velocity'       => $calc->calculate($project),
            'hasStoryPoints' => $project->customFields->contains('slug', 'story_points'),
            'currentRole'    => $role,
        ]);
    }
}
