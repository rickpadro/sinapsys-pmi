<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimelineViewController extends Controller
{
    public function show(Request $request, Project $project)
    {
        $role = $project->getRoleFor($request->user()->id);
        abort_if(!$role, 403);

        $project->load('user:id,name');

        $sections = $project->sections()
            ->orderBy('order')
            ->with(['tasks' => fn ($q) => $q
                ->whereNotNull('due_date')
                ->orderBy('due_date')
                ->with('assignee:id,name'),
            ])
            ->get();

        return Inertia::render('Projects/TimelineView', [
            'project'     => $project,
            'sections'    => $sections,
            'currentRole' => $role,
            'isOwner'     => $role === 'owner',
        ]);
    }
}
