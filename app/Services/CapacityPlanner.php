<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Section;

class CapacityPlanner
{
    private const HOURS_PER_SP = 4; // configurable default: 4h per story point

    /**
     * Calculates capacity data for a single sprint section.
     * Returns ['n_a' => true] if section is not of type 'sprint'.
     */
    public function sprintCapacity(Section $sprint): array
    {
        if ($sprint->type !== 'sprint') return ['n_a' => true];

        $weeks = $sprint->start_date && $sprint->end_date
            ? max(1, $sprint->start_date->diffInWeeks($sprint->end_date))
            : 2; // default sprint length

        $members    = $sprint->project->members()->with('user')->get();
        $totalHours = 0;
        $byMember   = [];

        foreach ($members as $member) {
            $capacity     = $member->capacities()->where('section_id', $sprint->id)->first();
            $pct          = (float) ($capacity?->dedication_pct ?? 100);
            $hoursPerWeek = (int)   ($capacity?->available_hours_per_week ?? 40);
            $hours        = ($pct / 100) * $hoursPerWeek * $weeks;
            $totalHours  += $hours;
            $byMember[$member->user->name] = round($hours, 1);
        }

        $spField      = $sprint->project->customFields()->where('slug', 'story_points')->first();
        $plannedSp    = 0;
        if ($spField) {
            $plannedSp = $sprint->tasks()
                ->join('custom_field_values as cfv', function ($j) use ($spField) {
                    $j->on('cfv.target_id', '=', 'tasks.id')
                      ->where('cfv.target_type', 'App\\Models\\Task')
                      ->where('cfv.custom_field_id', $spField->id);
                })
                ->sum('cfv.value');
        }

        $estimatedHours = $plannedSp * self::HOURS_PER_SP;

        return [
            'total_hours_available' => round($totalHours, 1),
            'planned_story_points'  => (float) $plannedSp,
            'estimated_hours'       => round($estimatedHours, 1),
            'utilization_pct'       => $totalHours > 0
                ? round($estimatedHours / $totalHours * 100, 1)
                : 0,
            'overcommitted'         => $estimatedHours > $totalHours,
            'by_member'             => $byMember,
            'weeks'                 => $weeks,
        ];
    }

    /**
     * Returns capacity for all sprint sections of a project.
     */
    public function projectCapacity(Project $project): array
    {
        return $project->sections()
            ->where('type', 'sprint')
            ->with(['tasks', 'project.customFields', 'project.members.user'])
            ->get()
            ->mapWithKeys(fn($s) => [$s->id => $this->sprintCapacity($s)])
            ->toArray();
    }

    /**
     * Heatmap data: sprint_id => heat level (green/yellow/red).
     */
    public function heatmap(Project $project): array
    {
        $capacities = $this->projectCapacity($project);
        $result = [];
        foreach ($capacities as $sectionId => $data) {
            if (isset($data['n_a'])) { $result[$sectionId] = 'na'; continue; }
            $pct = $data['utilization_pct'];
            $result[$sectionId] = match(true) {
                $pct > 90  => 'red',
                $pct >= 70 => 'yellow',
                default    => 'green',
            };
        }
        return $result;
    }
}
