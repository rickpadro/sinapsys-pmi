<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Section;
use Illuminate\Support\Facades\DB;

class SectionReorder
{
    public function reorder(Project $project, array $order): void
    {
        DB::transaction(function () use ($project, $order) {
            foreach ($order as $position => $sectionId) {
                Section::where('id', $sectionId)
                    ->where('project_id', $project->id)
                    ->update(['order' => (int) $position]);
            }
        });
    }
}
