<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSectionRequest;
use App\Http\Requests\UpdateSectionRequest;
use App\Models\Project;
use App\Models\Section;
use App\Services\SectionReorder;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function store(StoreSectionRequest $request, Project $project)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $maxOrder = $project->sections()->max('order') ?? -1;

        $project->sections()->create(array_merge(
            $request->validated(),
            ['order' => $maxOrder + 1]
        ));

        return back()->with('success', 'Sección creada.');
    }

    public function update(UpdateSectionRequest $request, Project $project, Section $section)
    {
        abort_if($section->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $section->update($request->validated());

        return back()->with('success', 'Sección actualizada.');
    }

    public function destroy(Request $request, Project $project, Section $section)
    {
        abort_if($section->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        // Desasociar tareas antes de eliminar
        $section->tasks()->update(['section_id' => null]);
        $section->delete();

        return back()->with('success', 'Sección eliminada.');
    }

    public function reorder(Request $request, Project $project)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $request->validate(['order' => ['required', 'array']]);

        app(SectionReorder::class)->reorder($project, $request->order);

        return response()->json(['ok' => true]);
    }
}
