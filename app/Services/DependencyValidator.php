<?php

namespace App\Services;

use App\Models\TaskDependency;

class DependencyValidator
{
    public function wouldCreateCycle(int $taskId, int $dependsOnId): bool
    {
        if ($taskId === $dependsOnId) return true;
        // DFS: check if taskId is reachable from dependsOnId
        $visited = [];
        return $this->dfs($dependsOnId, $taskId, $visited);
    }

    private function dfs(int $current, int $target, array &$visited): bool
    {
        if (isset($visited[$current])) return false;
        $visited[$current] = true;
        $deps = TaskDependency::where('task_id', $current)->pluck('depends_on_task_id');
        foreach ($deps as $depId) {
            if ($depId === $target) return true;
            if ($this->dfs($depId, $target, $visited)) return true;
        }
        return false;
    }
}
