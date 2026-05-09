<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\BoardViewController;
use App\Http\Controllers\PushController;
use App\Http\Controllers\BurndownReportController;
use App\Http\Controllers\CustomFieldController;
use App\Http\Controllers\ProjectRoleController;
use App\Http\Controllers\TimelineViewController;
use App\Http\Controllers\VelocityReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AiProjectController;
use App\Http\Controllers\AssistantController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectMemberController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskDependencyController;
use App\Http\Controllers\TaskStepController;
use App\Http\Controllers\TimeEntryController;
use App\Http\Controllers\UserAdminController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// PWA manifest (public)
Route::get('/manifest.json', function () {
    $base = env('APP_BASE_PATH', '');
    return response()->json([
        'name'             => 'SinapSYS Projects',
        'short_name'       => 'SinapSYS',
        'description'      => 'Gestión de proyectos PMI',
        'start_url'        => $base . '/',
        'scope'            => $base . '/',
        'display'          => 'standalone',
        'orientation'      => 'portrait-primary',
        'background_color' => '#1A1B2E',
        'theme_color'      => '#4A6CF7',
        'lang'             => 'es',
        'categories'       => ['productivity', 'business'],
        'icons'            => [
            ['src' => $base . '/icon_sinapsys.png', 'sizes' => 'any', 'type' => 'image/png', 'purpose' => 'any'],
            ['src' => $base . '/favicon.png',       'sizes' => 'any', 'type' => 'image/png', 'purpose' => 'maskable'],
        ],
        'shortcuts' => [
            ['name' => 'Proyectos', 'url' => $base . '/projects', 'description' => 'Ver proyectos'],
            ['name' => 'Tareas',    'url' => $base . '/tasks',    'description' => 'Ver tareas'],
        ],
    ], 200, ['Content-Type' => 'application/manifest+json']);
})->name('pwa.manifest');

// Invite acceptance (public — no auth required, handled inside controller)
Route::get('/invite/{token}', [ProjectMemberController::class, 'accept'])->name('invite.accept');

// Register via invitation (public — solo accesible desde link de invitación)
Route::get('/register/{token}', [RegisterController::class, 'create'])->name('register');
Route::post('/register/{token}', [RegisterController::class, 'store']);

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login',          [LoginController::class, 'create'])->name('login');
    Route::post('/login',         [LoginController::class, 'store']);
    Route::post('/login/send',    [LoginController::class, 'sendOtp'])->name('login.send');
    Route::get('/login/otp',      [LoginController::class, 'showOtp'])->name('login.otp');
    Route::post('/login/otp',     [LoginController::class, 'verifyOtp'])->name('login.verify');
    Route::post('/login/resend',  [LoginController::class, 'resendOtp'])->name('login.resend');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

// Protected routes
Route::middleware('auth')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::resource('projects', ProjectController::class);
    Route::patch('/projects/{project}/phase-task', [ProjectController::class, 'togglePhaseTask'])
        ->name('projects.phase-task');
    Route::post('/projects/{project}/links', [ProjectController::class, 'addLink'])->name('projects.add-link');
    Route::delete('/projects/{project}/links/{index}', [ProjectController::class, 'removeLink'])->name('projects.remove-link');
    Route::post('/projects/reorder', [ProjectController::class, 'reorder'])->name('projects.reorder');

    Route::post('/projects/{project}/members', [ProjectMemberController::class, 'invite'])->name('projects.members.invite');
    Route::patch('/projects/{project}/members/{member}/role', [ProjectMemberController::class, 'updateRole'])->name('projects.members.update-role');
    Route::post('/projects/{project}/members/{member}/resend', [ProjectMemberController::class, 'resend'])->name('projects.members.resend');
    Route::delete('/projects/{project}/members/{member}', [ProjectMemberController::class, 'destroy'])->name('projects.members.destroy');

    Route::get('/projects-ai/create', [AiProjectController::class, 'create'])->name('projects.create-ai');
    Route::post('/projects-ai/chat', [AiProjectController::class, 'chat'])->name('projects.ai-chat');
    Route::post('/projects-ai/confirm', [AiProjectController::class, 'confirm'])->name('projects.ai-confirm');

    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::patch('/tasks/{task}/toggle', [TaskController::class, 'toggle'])->name('tasks.toggle');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

    Route::post('/projects/{project}/assistant', [AssistantController::class, 'message'])->name('assistant.message');
    Route::delete('/projects/{project}/assistant', [AssistantController::class, 'clear'])->name('assistant.clear');

    Route::get('/export/projects/{format}', [ExportController::class, 'projects'])->name('export.projects');
    Route::get('/export/tasks/{format}', [ExportController::class, 'tasks'])->name('export.tasks');

    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');

    // v2.0 · Sections
    Route::post('/projects/{project}/sections', [SectionController::class, 'store'])->name('sections.store');
    Route::put('/projects/{project}/sections/{section}', [SectionController::class, 'update'])->name('sections.update');
    Route::delete('/projects/{project}/sections/{section}', [SectionController::class, 'destroy'])->name('sections.destroy');
    Route::post('/projects/{project}/sections/reorder', [SectionController::class, 'reorder'])->name('sections.reorder');

    // v2.1 · P-04 Task Dependencies
    Route::get('/tasks/{task}/dependencies', [TaskDependencyController::class, 'index'])->name('task-dependencies.index');
    Route::post('/tasks/{task}/dependencies', [TaskDependencyController::class, 'store'])->name('task-dependencies.store');
    Route::delete('/tasks/{task}/dependencies/{dependency}', [TaskDependencyController::class, 'destroy'])->name('task-dependencies.destroy');

    // v2.1 · P-07 Time Tracking
    Route::get('/tasks/{task}/time-entries', [TimeEntryController::class, 'index'])->name('time-entries.index');
    Route::post('/tasks/{task}/time-entries', [TimeEntryController::class, 'store'])->name('time-entries.store');
    Route::delete('/tasks/{task}/time-entries/{entry}', [TimeEntryController::class, 'destroy'])->name('time-entries.destroy');

    // v2.0 · Task Steps
    Route::post('/tasks/{task}/steps', [TaskStepController::class, 'store'])->name('task-steps.store');
    Route::put('/tasks/{task}/steps/{step}', [TaskStepController::class, 'update'])->name('task-steps.update');
    Route::delete('/tasks/{task}/steps/{step}', [TaskStepController::class, 'destroy'])->name('task-steps.destroy');
    Route::patch('/tasks/{task}/steps/{step}/toggle', [TaskStepController::class, 'toggle'])->name('task-steps.toggle');
    Route::post('/tasks/{task}/steps/reorder', [TaskStepController::class, 'reorder'])->name('task-steps.reorder');

    // v2.0 · Custom Fields
    Route::get('/projects/{project}/custom-fields', [CustomFieldController::class, 'index'])->name('custom-fields.index');
    Route::post('/projects/{project}/custom-fields', [CustomFieldController::class, 'store'])->name('custom-fields.store');
    Route::put('/projects/{project}/custom-fields/{customField}', [CustomFieldController::class, 'update'])->name('custom-fields.update');
    Route::delete('/projects/{project}/custom-fields/{customField}', [CustomFieldController::class, 'destroy'])->name('custom-fields.destroy');
    Route::post('/custom-field-values', [CustomFieldController::class, 'upsertValue'])->name('custom-field-values.upsert');

    // v2.0 · Board View
    Route::get('/projects/{project}/board', [BoardViewController::class, 'show'])->name('projects.board');
    Route::patch('/projects/{project}/board/move-task', [BoardViewController::class, 'moveTask'])->name('projects.board.move');

    // v2.0 · Timeline + Reports
    Route::get('/projects/{project}/timeline', [TimelineViewController::class, 'show'])->name('projects.timeline');
    Route::get('/projects/{project}/reports/burndown', [BurndownReportController::class, 'show'])->name('projects.reports.burndown');
    Route::get('/projects/{project}/reports/velocity', [VelocityReportController::class, 'show'])->name('projects.reports.velocity');

    // JSON endpoints for frontend hooks
    Route::get('/projects/{project}/custom-fields/list', [CustomFieldController::class, 'listJson'])->name('custom-fields.list-json');
    Route::get('/projects/{project}/reports/burndown/data', [BurndownReportController::class, 'data'])->name('reports.burndown.data');

    // v2.0 · Project Roles
    Route::get('/projects/{project}/roles', [ProjectRoleController::class, 'index'])->name('projects.roles.index');
    Route::post('/projects/{project}/roles', [ProjectRoleController::class, 'store'])->name('projects.roles.store');
    Route::put('/projects/{project}/roles/{role}', [ProjectRoleController::class, 'update'])->name('projects.roles.update');
    Route::delete('/projects/{project}/roles/{role}', [ProjectRoleController::class, 'destroy'])->name('projects.roles.destroy');

    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    Route::get('/users', [UserAdminController::class, 'index'])->name('users.index');
    Route::post('/users', [UserAdminController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserAdminController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserAdminController::class, 'destroy'])->name('users.destroy');
    Route::patch('/users/members/{member}/role', [UserAdminController::class, 'updateRole'])->name('users.members.role');
    Route::delete('/users/members/{member}', [UserAdminController::class, 'removeFromProject'])->name('users.members.remove');
    Route::post('/users/add-to-project', [UserAdminController::class, 'addToProject'])->name('users.add-to-project');
    Route::patch('/users/{user}/toggle-admin', [UserAdminController::class, 'toggleAdmin'])->name('users.toggle-admin');

    // v2.1 · P-08 Push Notifications
    Route::post('/push/subscribe',   [PushController::class, 'subscribe'])->name('push.subscribe');
    Route::post('/push/unsubscribe', [PushController::class, 'unsubscribe'])->name('push.unsubscribe');

    Route::get('/matrix', function () {
        $user = request()->user();

        $teamProjectIds = $user->projectMemberships()
            ->whereNotNull('accepted_at')
            ->pluck('project_id');

        $own  = $user->projects()->select('id', 'name', 'type', 'impact', 'effort', 'color', 'priority')->orderBy('priority')->get();
        $team = \App\Models\Project::whereIn('id', $teamProjectIds)->select('id', 'name', 'type', 'impact', 'effort', 'color', 'priority')->orderBy('priority')->get();

        return Inertia::render('Matrix', ['projects' => $own->merge($team)->unique('id')->values()]);
    })->name('matrix');
});
