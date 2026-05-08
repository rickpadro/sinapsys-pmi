<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\BurndownCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BurndownReportController extends Controller
{
    public function show(Request $request, Project $project, BurndownCalculator $calc)
    {
        $role = $project->getRoleFor($request->user()->id);
        abort_if(!$role, 403);

        $project->load('customFields');

        $sections = $project->sections()
            ->orderBy('order')
            ->with([
                'tasks' => fn ($q) => $q->with([
                    'customFieldValues' => fn ($vq) => $vq->with('customField'),
                ]),
            ])
            ->get();

        $sections->each(fn ($s) => $s->setRelation('project', $project));

        $burndowns = $sections
            ->map(fn ($s) => array_merge(
                ['id' => $s->id, 'name' => $s->name, 'status' => $s->status,
                 'start_date' => $s->start_date?->toDateString(),
                 'end_date'   => $s->end_date?->toDateString()],
                $calc->calculate($s)
            ))
            ->filter(fn ($s) => !empty($s['data']))
            ->values();

        return Inertia::render('Reports/Burndown', [
            'project'        => $project,
            'burndowns'      => $burndowns,
            'hasStoryPoints' => $project->customFields->contains('slug', 'story_points'),
            'currentRole'    => $role,
        ]);
    }
}
