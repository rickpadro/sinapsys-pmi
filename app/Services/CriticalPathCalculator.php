<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Support\Collection;

class CriticalPathCalculator
{
    /**
     * Recalculates and persists on_critical_path for all tasks of a project.
     * Uses CPM (Critical Path Method): forward pass → backward pass → slack = 0 → critical.
     * Excludes tasks in 'continuous' sections (parallel tracks).
     *
     * @return int[] IDs of tasks on the critical path
     */
    public function recalculate(Project $project): array
    {
        $tasks = $project->tasks()
            ->whereHas('section', fn($q) => $q->where('type', '!=', 'continuous'))
            ->with(['dependencies', 'dependents'])
            ->get()
            ->keyBy('id');

        if ($tasks->isEmpty()) return [];

        $graph = $this->buildGraph($tasks);
        $graph = $this->forwardPass($graph);
        $graph = $this->backwardPass($graph);

        $criticalIds = collect($graph)
            ->filter(fn($n) => $n['slack'] <= 0)
            ->keys()
            ->toArray();

        // Always include explicit is_blocker tasks
        $blockerIds = $tasks->filter(fn($t) => $t->is_blocker)->keys()->toArray();
        $criticalIds = array_unique(array_merge($criticalIds, $blockerIds));

        Task::whereIn('id', $criticalIds)->update(['on_critical_path' => true]);
        Task::where('project_id', $project->id)
            ->whereNotIn('id', $criticalIds)
            ->update(['on_critical_path' => false]);

        return $criticalIds;
    }

    private function buildGraph(Collection $tasks): array
    {
        $graph = [];
        foreach ($tasks as $task) {
            $duration = $task->estimated_time
                ? (int) ceil((float) $task->estimated_time / 8) // convert hours to days
                : 1;
            $graph[$task->id] = [
                'id'           => $task->id,
                'duration'     => max(1, $duration),
                'predecessors' => $task->dependencies->pluck('depends_on_task_id')->toArray(),
                'es'           => 0, // earliest start
                'ef'           => 0, // earliest finish
                'ls'           => PHP_INT_MAX, // latest start
                'lf'           => PHP_INT_MAX, // latest finish
                'slack'        => PHP_INT_MAX,
            ];
        }
        return $graph;
    }

    private function forwardPass(array $graph): array
    {
        $visited = [];
        $maxEf   = 0;

        $visit = function (int $id) use (&$graph, &$visited, &$maxEf, &$visit): void {
            if (isset($visited[$id])) return;

            $node = &$graph[$id];
            foreach ($node['predecessors'] as $predId) {
                if (isset($graph[$predId])) $visit($predId);
            }

            $es = 0;
            foreach ($node['predecessors'] as $predId) {
                if (isset($graph[$predId])) {
                    $es = max($es, $graph[$predId]['ef']);
                }
            }

            $node['es'] = $es;
            $node['ef'] = $es + $node['duration'];
            $maxEf       = max($maxEf, $node['ef']);
            $visited[$id] = true;
        };

        foreach (array_keys($graph) as $id) $visit($id);

        $graph['__project_end__'] = ['ef' => $maxEf];

        return $graph;
    }

    private function backwardPass(array $graph): array
    {
        $projectEnd = $graph['__project_end__']['ef'] ?? 0;
        unset($graph['__project_end__']);

        // Build successors map
        $successors = [];
        foreach ($graph as $id => $node) {
            foreach ($node['predecessors'] as $predId) {
                $successors[$predId][] = $id;
            }
        }

        // Initialize end nodes
        foreach ($graph as $id => &$node) {
            if (empty($successors[$id])) {
                $node['lf'] = $projectEnd;
                $node['ls'] = $projectEnd - $node['duration'];
            }
        }
        unset($node);

        // Topological backward
        $processed = [];
        $process = function (int $id) use (&$graph, &$successors, &$processed, &$process): void {
            if (isset($processed[$id])) return;

            foreach ($successors[$id] ?? [] as $succId) {
                if (isset($graph[$succId])) $process($succId);
            }

            if ($graph[$id]['lf'] === PHP_INT_MAX) {
                $minLs = PHP_INT_MAX;
                foreach ($successors[$id] ?? [] as $succId) {
                    if (isset($graph[$succId])) {
                        $minLs = min($minLs, $graph[$succId]['ls']);
                    }
                }
                $graph[$id]['lf'] = $minLs === PHP_INT_MAX ? $graph[$id]['ef'] : $minLs;
                $graph[$id]['ls'] = $graph[$id]['lf'] - $graph[$id]['duration'];
            }

            $graph[$id]['slack'] = $graph[$id]['ls'] - $graph[$id]['es'];
            $processed[$id]      = true;
        };

        foreach (array_keys($graph) as $id) $process($id);

        return $graph;
    }
}
