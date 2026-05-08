<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function create(string $token)
    {
        $member = ProjectMember::where('invitation_token', $token)
            ->whereNull('accepted_at')
            ->with(['project:id,name,color', 'inviter:id,name'])
            ->firstOrFail();

        // Ya tiene cuenta → mandar al login
        if (User::where('email', $member->invitation_email)->exists()) {
            session(['url.intended' => url('/invite/' . $token)]);
            return redirect()->route('login')
                ->with('info', 'Ya tienes cuenta. Inicia sesión para aceptar la invitación.');
        }

        // Ya autenticado → procesar directamente
        if (auth()->check()) {
            return redirect(url('/invite/' . $token));
        }

        return Inertia::render('Auth/Register', [
            'token'        => $token,
            'email'        => $member->invitation_email,
            'projectName'  => $member->project->name,
            'projectColor' => $member->project->color,
            'inviterName'  => $member->inviter?->name ?? 'Alguien',
            'role'         => $member->role,
        ]);
    }

    public function store(Request $request, string $token)
    {
        $member = ProjectMember::where('invitation_token', $token)
            ->whereNull('accepted_at')
            ->with('project:id,name')
            ->firstOrFail();

        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'phone'    => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $member->invitation_email,
            'phone'    => $request->filled('phone') ? preg_replace('/[^0-9]/', '', $request->phone) : null,
            'password' => Hash::make($request->password),
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        $member->update([
            'user_id'          => $user->id,
            'accepted_at'      => now(),
            'invitation_token' => null,
        ]);

        return redirect()->route('projects.show', $member->project_id)
            ->with('success', 'Cuenta creada. Te uniste al proyecto "' . $member->project->name . '".');
    }
}
