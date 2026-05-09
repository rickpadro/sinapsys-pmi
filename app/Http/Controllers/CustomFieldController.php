<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomFieldRequest;
use App\Http\Requests\UpsertCustomFieldValueRequest;
use App\Models\CustomField;
use App\Models\CustomFieldValue;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomFieldController extends Controller
{
    public function index(Request $request, Project $project)
    {
        $role = $project->getRoleFor($request->user()->id);
        abort_if(!$role, 403);

        return Inertia::render('CustomFields/Index', [
            'project'      => $project,
            'customFields' => $project->customFields()->orderBy('order')->get(),
            'currentRole'  => $role,
            'isOwner'      => $role === 'owner',
        ]);
    }

    public function store(StoreCustomFieldRequest $request, Project $project)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $maxOrder = $project->customFields()->max('order') ?? -1;

        $field = $project->customFields()->create(array_merge(
            $request->validated(),
            ['order' => $maxOrder + 1]
        ));

        return back()->with('success', 'Campo personalizado creado.');
    }

    public function update(StoreCustomFieldRequest $request, Project $project, CustomField $customField)
    {
        abort_if($customField->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $customField->update($request->validated());

        return back()->with('success', 'Campo actualizado.');
    }

    public function destroy(Request $request, Project $project, CustomField $customField)
    {
        abort_if($customField->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $customField->delete();

        return back()->with('success', 'Campo eliminado.');
    }

    public function upsertValue(UpsertCustomFieldValueRequest $request)
    {
        $data = $request->validated();

        CustomFieldValue::updateOrCreate(
            [
                'custom_field_id' => $data['custom_field_id'],
                'target_type'     => $data['target_type'],
                'target_id'       => $data['target_id'],
            ],
            [
                'value'      => $data['value'] ?? null,
                'value_json' => $data['value_json'] ?? null,
            ]
        );

        return back();
    }

    public function listJson(Request $request, Project $project)
    {
        abort_if(!$project->getRoleFor($request->user()->id), 403);

        return response()->json($project->customFields()->orderBy('order')->get());
    }
}
