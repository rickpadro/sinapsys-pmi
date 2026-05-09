<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTimeEntryRequest;
use App\Models\Task;
use App\Models\TimeEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeEntryController extends Controller
{
    public function index(Request $request, Task $task)
    {
        abort_if(!$task->project->getRoleFor($request->user()->id), 403);

        $task->load(['timeEntries' => fn($q) => $q->with('user:id,name')->orderByDesc('logged_on')]);

        return Inertia::render('Tasks/TimeEntries', [
            'task'             => $task,
            'timeEntries'      => $task->timeEntries,
            'totalMinutes'     => $task->time_entries()->sum('minutes'),
            'estimatedMinutes' => $task->estimated_time ? (int) ($task->estimated_time * 60) : null,
        ]);
    }

    public function store(StoreTimeEntryRequest $request, Task $task)
    {
        abort_if(!in_array($task->project->getRoleFor($request->user()->id), ['owner', 'manager', 'contributor']), 403);

        $task->timeEntries()->create(array_merge($request->validated(), ['user_id' => $request->user()->id]));

        return back()->with('success', 'Tiempo registrado.');
    }

    public function destroy(Request $request, Task $task, TimeEntry $entry)
    {
        abort_if($entry->task_id !== $task->id, 404);
        abort_if(
            $entry->user_id !== $request->user()->id &&
            !in_array($task->project->getRoleFor($request->user()->id), ['owner', 'manager']),
            403
        );

        $entry->delete();

        return back()->with('success', 'Entrada eliminada.');
    }
}
