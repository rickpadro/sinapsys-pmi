<?php

namespace App\Services;

use App\Models\Section;

class BurndownCalculator
{
    public function calculate(Section $section): array
    {
        if (!$section->start_date || !$section->end_date) return [];

        $spField = $section->project->customFields
            ->firstWhere('slug', 'story_points');

        if (!$spField) return [];

        $tasks = $section->tasks->filter(
            fn ($t) => $t->customFieldValues->where('custom_field_id', $spField->id)->isNotEmpty()
        );

        $total = $tasks->sum(
            fn ($t) => (float) ($t->customFieldValues->where('custom_field_id', $spField->id)->first()?->value ?? 0)
        );

        if ($total <= 0) return [];

        $start     = $section->start_date->copy()->startOfDay();
        $end       = $section->end_date->copy()->startOfDay();
        $totalDays = max(1, $start->diffInDays($end));
        $today     = now()->startOfDay();
        $data      = [];
        $current   = $start->copy();

        while ($current->lte($end)) {
            $dayNum = $start->diffInDays($current);
            $ideal  = round($total * (1 - $dayNum / $totalDays), 1);

            // Actual only up to today
            $actual = null;
            if ($current->lte($today)) {
                $done = $tasks
                    ->filter(fn ($t) => $t->done && $t->completed_at && $t->completed_at->startOfDay()->lte($current))
                    ->sum(fn ($t) => (float) ($t->customFieldValues->where('custom_field_id', $spField->id)->first()?->value ?? 0));
                $actual = round($total - $done, 1);
            }

            $data[] = [
                'date'   => $current->toDateString(),
                'ideal'  => $ideal,
                'actual' => $actual,
            ];

            $current->addDay();
        }

        return ['total' => $total, 'data' => $data];
    }
}
