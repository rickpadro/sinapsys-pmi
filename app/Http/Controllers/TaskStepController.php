<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReorderTaskStepsRequest;
use App\Http\Requests\StoreTaskStepRequest;
use App\Http\Requests\UpdateTaskStepRequest;
use App\Models\Task;
use App\Models\TaskStep;
use Illuminate\Http\Request;

class TaskStepController extends Controller
{
    public function store(StoreTaskStepRequest $request, Task $task)
    {
        abort_if(!$this->canMutateTask($request->user()->id, $task), 403);

        $maxOrder = $task->taskSteps()->max('order') ?? -1;

        $task->taskSteps()->create(array_merge(
            $request->validated(),
            ['order' => $maxOrder + 1]
        ));

        return back()->with('success', 'Paso creado.');
    }

    public function update(UpdateTaskStepRequest $request, Task $task, TaskStep $step)
    {
        abort_if($step->task_id !== $task->id, 404);
        abort_if(!$this->canMutateTask($request->user()->id, $task), 403);

        $step->update($request->validated());

        return back();
    }

    public function destroy(Request $request, Task $task, TaskStep $step)
    {
        abort_if($step->task_id !== $task->id, 404);
        abort_if(!$this->canMutateTask($request->user()->id, $task), 403);

        $step->delete();

        return back()->with('success', 'Paso eliminado.');
    }

    public function toggle(Request $request, Task $task, TaskStep $step)
    {
        abort_if($step->task_id !== $task->id, 404);
        abort_if(!$this->canMutateTask($request->user()->id, $task), 403);

        $step->update([
            'done'         => !$step->done,
            'completed_at' => !$step->done ? now() : null,
        ]);

        return back();
    }

    public function reorder(ReorderTaskStepsRequest $request, Task $task)
    {
        abort_if(!$this->canMutateTask($request->user()->id, $task), 403);

        foreach ($request->validated()['order'] as $stepId => $position) {
            TaskStep::where('id', $stepId)
                ->where('task_id', $task->id)
                ->update(['order' => (int) $position]);
        }

        return response()->json(['ok' => true]);
    }

    private function canMutateTask(int $userId, Task $task): bool
    {
        if ($task->user_id === $userId) return true;
        if (!$task->project_id) return false;
        return in_array($task->project->getRoleFor($userId), ['owner', 'manager', 'contributor']);
    }
}
