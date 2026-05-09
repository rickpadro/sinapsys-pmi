<?php

namespace App\Services;

use App\Models\Milestone;
use App\Models\Project;

class MilestoneTracker
{
    /**
     * Evaluates and returns the correct status for a milestone.
     * Does NOT persist — caller decides whether to save.
     */
    public function evaluateStatus(Milestone $milestone): string
    {
        if ($milestone->actual_date) return 'met';

        $today     = today();
        $daysUntil = $today->diffInDays($milestone->target_date, false);

        if ($daysUntil < 0) return 'missed';

        $pendingBlockers = $milestone->linkedTasks()
            ->where('is_blocker', true)
            ->where('done', false)
            ->count();

        if ($daysUntil <= 7 && $pendingBlockers > 0)  return 'at_risk';
        if ($daysUntil <= 14 && $pendingBlockers >= 2) return 'at_risk';

        return 'planned';
    }

    /**
     * Recalculates and persists status for all milestones of a project.
     * Returns array of milestone IDs whose status changed.
     */
    public function recalculateProject(Project $project): array
    {
        $changed = [];

        $project->milestones()->each(function (Milestone $milestone) use (&$changed) {
            $newStatus = $this->evaluateStatus($milestone);
            if ($milestone->status !== $newStatus) {
                $milestone->update(['status' => $newStatus]);
                $changed[] = $milestone->id;
            }
        });

        return $changed;
    }

    /**
     * Returns upcoming milestones (within $days days) for a project.
     */
    public function upcoming(Project $project, int $days = 14): \Illuminate\Support\Collection
    {
        return $project->milestones()
            ->whereNull('actual_date')
            ->where('target_date', '>=', today())
            ->where('target_date', '<=', today()->addDays($days))
            ->orderBy('target_date')
            ->get();
    }

    /**
     * Marks a milestone as met (actual_date = today or given date).
     */
    public function markMet(Milestone $milestone, ?\Carbon\Carbon $date = null): void
    {
        $milestone->update([
            'actual_date' => $date ?? today(),
            'status'      => 'met',
        ]);
    }
}
