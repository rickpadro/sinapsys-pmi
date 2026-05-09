<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskDependencyRequest;
use App\Models\Task;
use App\Models\TaskDependency;
use App\Services\DependencyValidator;
use Illuminate\Http\Request;

class TaskDependencyController extends Controller
{
    public function index(Request $request, Task $task)
    {
        abort_if(!$task->project->getRoleFor($request->user()->id), 403);
        return response()->json(
            $task->dependencies()->with('dependsOn:id,name,done,due_date,priority')->get()
        );
    }

    public function store(StoreTaskDependencyRequest $request, Task $task, DependencyValidator $validator)
    {
        abort_if(!in_array($task->project->getRoleFor($request->user()->id), ['owner', 'manager', 'contributor']), 403);

        $dependsOnId = $request->validated('depends_on_task_id');

        if ($validator->wouldCreateCycle($task->id, $dependsOnId)) {
            return back()->withErrors(['depends_on_task_id' => 'Esta dependencia crearía un ciclo.']);
        }

        TaskDependency::firstOrCreate(
            ['task_id' => $task->id, 'depends_on_task_id' => $dependsOnId],
            ['type' => $request->validated('type'), 'lag_days' => $request->validated('lag_days', 0)]
        );

        return back()->with('success', 'Dependencia agregada.');
    }

    public function destroy(Request $request, Task $task, TaskDependency $dependency)
    {
        abort_if($dependency->task_id !== $task->id, 404);
        abort_if(!in_array($task->project->getRoleFor($request->user()->id), ['owner', 'manager', 'contributor']), 403);
        $dependency->delete();
        return back()->with('success', 'Dependencia eliminada.');
    }
}
