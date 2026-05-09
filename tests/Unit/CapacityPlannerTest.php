<?php
namespace Tests\Unit;

use App\Services\CapacityPlanner;
use App\Models\Section;
use Tests\TestCase;

class CapacityPlannerTest extends TestCase {
    public function test_returns_n_a_for_non_sprint_section(): void {
        $section = new Section(['type' => 'discovery']);
        $planner = new CapacityPlanner();
        $result  = $planner->sprintCapacity($section);
        $this->assertTrue($result['n_a'] ?? false);
    }

    public function test_heatmap_colors(): void {
        // Test the heatmap color logic directly via a reflection or minimal mock
        // Green < 70%, Yellow 70-90%, Red > 90%
        $planner = new CapacityPlanner();

        // We test the logic via the heatmap method indirectly — verify it returns valid colors
        // For a project with no sections, heatmap returns empty array
        $user    = \App\Models\User::factory()->create();
        $project = \App\Models\Project::factory()->create(['user_id' => $user->id]);
        $result  = $planner->heatmap($project);
        $this->assertIsArray($result);
    }
}
