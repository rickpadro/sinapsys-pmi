<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserAdminController extends Controller
{
    public function index(Request $request)
    {
        abort_if(!$request->user()->isAdmin(), 403);

        $me = $request->user();

        $users = User::orderBy('name')
            ->get()
            ->map(fn ($u) => array_merge($this->formatUser($u, $me), ['is_me' => $u->id === $me->id]));

        return Inertia::render('Users/Index', [
            'users'      => $users,
            'myProjects' => $me->projects()->select('id', 'name', 'color')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->filled('phone') ? preg_replace('/[^0-9]/', '', $request->phone) : null,
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Usuario creado correctamente.');
    }

    public function update(Request $request, User $user)
    {
        abort_if($user->id === $request->user()->id, 403);

        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone'    => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $data = [
            'name'  => $request->name,
            'email' => $request->email,
            'phone' => $request->filled('phone') ? preg_replace('/[^0-9]/', '', $request->phone) : null,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return back()->with('success', 'Usuario actualizado.');
    }

    public function toggleAdmin(Request $request, User $user)
    {
        abort_if(!$request->user()->isAdmin(), 403);
        abort_if($user->id === $request->user()->id, 403);

        $user->update(['is_admin' => !$user->is_admin]);
        return back()->with('success', $user->is_admin ? 'Usuario promovido a Admin.' : 'Permisos de Admin removidos.');
    }

    public function destroy(Request $request, User $user)
    {
        abort_if($user->id === $request->user()->id, 403);

        // Remover de todos los proyectos del admin actual
        ProjectMember::where('user_id', $user->id)
            ->whereIn('project_id', $request->user()->projects()->pluck('id'))
            ->delete();

        $user->delete();

        return back()->with('success', 'Usuario eliminado.');
    }

    public function updateRole(Request $request, ProjectMember $member)
    {
        abort_if($member->project->user_id !== $request->user()->id, 403);
        $request->validate(['role' => ['required', 'in:manager,contributor,viewer']]);
        $member->update(['role' => $request->role]);
        return back()->with('success', 'Rol actualizado.');
    }

    public function removeFromProject(Request $request, ProjectMember $member)
    {
        abort_if($member->project->user_id !== $request->user()->id, 403);
        $member->delete();
        return back()->with('success', 'Usuario removido del proyecto.');
    }

    public function addToProject(Request $request)
    {
        $me = $request->user();

        $request->validate([
            'user_id'    => ['required', 'exists:users,id'],
            'project_id' => ['required', 'exists:projects,id'],
            'role'       => ['required', 'in:manager,contributor,viewer'],
        ]);

        $project = Project::findOrFail($request->project_id);
        abort_if($project->user_id !== $me->id, 403);

        $user = User::findOrFail($request->user_id);

        $exists = ProjectMember::where('project_id', $project->id)
            ->where(fn ($q) => $q->where('user_id', $user->id)->orWhere('invitation_email', $user->email))
            ->exists();

        if ($exists) {
            return back()->with('error', 'El usuario ya está en este proyecto.');
        }

        ProjectMember::create([
            'project_id'       => $project->id,
            'user_id'          => $user->id,
            'invited_by'       => $me->id,
            'role'             => $request->role,
            'invitation_email' => $user->email,
            'invitation_token' => null,
            'accepted_at'      => now(),
        ]);

        return back()->with('success', 'Usuario agregado al proyecto.');
    }

    private function formatUser(User $user, User $me): array
    {
        $myProjectIds = $me->projects()->pluck('id');

        return [
            'id'       => $user->id,
            'name'     => $user->name,
            'email'    => $user->email,
            'phone'    => $user->phone,
            'is_admin' => $user->is_admin,
            'memberships' => ProjectMember::where('user_id', $user->id)
                ->whereIn('project_id', $myProjectIds)
                ->whereNotNull('accepted_at')
                ->with('project:id,name,color')
                ->get()
                ->map(fn ($m) => [
                    'member_id'  => $m->id,
                    'project_id' => $m->project_id,
                    'project'    => $m->project ? ['id' => $m->project->id, 'name' => $m->project->name, 'color' => $m->project->color] : null,
                    'role'       => $m->role,
                ]),
            'pending' => ProjectMember::where('invitation_email', $user->email)
                ->whereIn('project_id', $myProjectIds)
                ->whereNull('accepted_at')
                ->with('project:id,name,color')
                ->get()
                ->map(fn ($m) => [
                    'member_id'  => $m->id,
                    'project_id' => $m->project_id,
                    'project'    => $m->project ? ['id' => $m->project->id, 'name' => $m->project->name, 'color' => $m->project->color] : null,
                    'role'       => $m->role,
                ]),
        ];
    }
}
