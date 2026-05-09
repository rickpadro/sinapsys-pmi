<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRoleRequest;
use App\Http\Requests\UpdateProjectRoleRequest;
use App\Models\Project;
use App\Models\ProjectRoleDefinition;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectRoleController extends Controller
{
    public function index(Request $request, Project $project)
    {
        $role = $project->getRoleFor($request->user()->id);
        abort_if(!$role, 403);

        return Inertia::render('Projects/RolesIndex', [
            'project'     => $project,
            'roles'       => $project->roleDefinitions()->orderBy('order')->get(),
            'currentRole' => $role,
            'isOwner'     => $role === 'owner',
        ]);
    }

    public function store(StoreProjectRoleRequest $request, Project $project)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $data = $request->validated();

        $maxOrder = $project->roleDefinitions()->max('order') ?? -1;

        $project->roleDefinitions()->create(array_merge($data, ['order' => $maxOrder + 1]));

        return back()->with('success', 'Rol creado.');
    }

    public function update(UpdateProjectRoleRequest $request, Project $project, ProjectRoleDefinition $role)
    {
        abort_if($role->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $role->update($request->validated());

        return back()->with('success', 'Rol actualizado.');
    }

    public function destroy(Request $request, Project $project, ProjectRoleDefinition $role)
    {
        abort_if($role->project_id !== $project->id, 404);
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $role->delete();

        return back()->with('success', 'Rol eliminado.');
    }
}
