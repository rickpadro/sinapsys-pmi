<?php

namespace App\Http\Controllers;

use App\Mail\ProjectInvitation;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ProjectMemberController extends Controller
{
    public function invite(Request $request, Project $project)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'role'  => ['required', 'in:manager,contributor,viewer'],
        ]);

        $project->loadMissing('user');

        if ($project->user->email === $request->email) {
            return back()->with('error', 'Este usuario ya es el propietario del proyecto.');
        }

        if ($project->members()->where('invitation_email', $request->email)->exists()) {
            return back()->with('error', 'Ya existe una invitación para este email.');
        }

        $token = Str::random(64);

        $member = $project->members()->create([
            'invited_by'       => $request->user()->id,
            'role'             => $request->role,
            'invitation_email' => $request->email,
            'invitation_token' => $token,
        ]);

        Mail::to($request->email)->send(new ProjectInvitation($project, $member, $request->user()));

        return back()->with('success', 'Invitación enviada a ' . $request->email . '.');
    }

    public function accept(string $token)
    {
        $member = ProjectMember::where('invitation_token', $token)
            ->whereNull('accepted_at')
            ->firstOrFail();

        if (!auth()->check()) {
            $hasAccount = User::where('email', $member->invitation_email)->exists();

            if ($hasAccount) {
                session(['url.intended' => url('/invite/' . $token)]);
                return redirect()->route('login')
                    ->with('info', 'Inicia sesión para aceptar la invitación al proyecto.');
            }

            return redirect()->route('register', $token)
                ->with('info', 'Crea tu cuenta para unirte al proyecto.');
        }

        $user = auth()->user();

        $alreadyMember = ProjectMember::where('project_id', $member->project_id)
            ->where('user_id', $user->id)
            ->whereNotNull('accepted_at')
            ->exists();

        if ($alreadyMember) {
            return redirect()->route('projects.show', $member->project_id)
                ->with('info', 'Ya eres miembro de este proyecto.');
        }

        $member->update([
            'user_id'          => $user->id,
            'accepted_at'      => now(),
            'invitation_token' => null,
        ]);

        return redirect()->route('projects.show', $member->project_id)
            ->with('success', 'Te uniste al proyecto "' . $member->project->name . '".');
    }

    public function updateRole(Request $request, Project $project, ProjectMember $member)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $request->validate(['role' => ['required', 'in:manager,contributor,viewer']]);
        $member->update(['role' => $request->role]);

        return back()->with('success', 'Rol actualizado.');
    }

    public function destroy(Request $request, Project $project, ProjectMember $member)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $member->delete();
        return back()->with('success', 'Miembro removido del proyecto.');
    }

    public function resend(Request $request, Project $project, ProjectMember $member)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);
        abort_if($member->accepted_at !== null, 400);

        $token = Str::random(64);
        $member->update(['invitation_token' => $token]);

        Mail::to($member->invitation_email)->send(new ProjectInvitation($project, $member, $request->user()));

        return back()->with('success', 'Invitación reenviada a ' . $member->invitation_email . '.');
    }
}
