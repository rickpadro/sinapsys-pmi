<?php

namespace App\Services;

use App\Models\Project;

class VelocityCalculator
{
    public function calculate(Project $project): array
    {
        $spField = $project->customFields->firstWhere('slug', 'story_points');
        if (!$spField) return [];

        return $project->sections()
            ->where('type', 'sprint')
            ->orderBy('order')
            ->with(['tasks' => fn ($q) => $q->with([
                'customFieldValues' => fn ($vq) => $vq->where('custom_field_id', $spField->id),
            ])])
            ->get()
            ->map(function ($section) {
                $total = $section->tasks->sum(
                    fn ($t) => (float) ($t->customFieldValues->first()?->value ?? 0)
                );
                $done = $section->tasks
                    ->where('done', true)
                    ->sum(fn ($t) => (float) ($t->customFieldValues->first()?->value ?? 0));

                return [
                    'id'               => $section->id,
                    'name'             => $section->name,
                    'status'           => $section->status,
                    'total_points'     => round($total, 1),
                    'completed_points' => round($done, 1),
                ];
            })
            ->filter(fn ($s) => $s['total_points'] > 0)
            ->values()
            ->toArray();
    }
}
