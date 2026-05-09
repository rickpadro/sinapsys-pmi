<?php
namespace Tests\Unit;

use App\Services\CriticalPathCalculator;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CriticalPathCalculatorTest extends TestCase {
    use RefreshDatabase;

    /**
     * Test scenario: linear chain A→B→C — all must be on critical path.
     * We test the graph-building and CPM logic indirectly via recalculate().
     * Uses minimal mock: 3 tasks with dependencies in a project.
     */
    public function test_linear_chain_all_tasks_critical(): void {
        $user    = \App\Models\User::factory()->create();
        $project = \App\Models\Project::factory()->create(['user_id' => $user->id]);
        $section = \App\Models\Section::factory()->create(['project_id' => $project->id, 'type' => 'sprint']);

        $taskA = \App\Models\Task::factory()->create(['project_id' => $project->id, 'section_id' => $section->id, 'estimated_time' => 8]);
        $taskB = \App\Models\Task::factory()->create(['project_id' => $project->id, 'section_id' => $section->id, 'estimated_time' => 8]);
        $taskC = \App\Models\Task::factory()->create(['project_id' => $project->id, 'section_id' => $section->id, 'estimated_time' => 8]);

        \App\Models\TaskDependency::create(['task_id' => $taskB->id, 'depends_on_task_id' => $taskA->id, 'type' => 'finish_to_start']);
        \App\Models\TaskDependency::create(['task_id' => $taskC->id, 'depends_on_task_id' => $taskB->id, 'type' => 'finish_to_start']);

        $calc = new CriticalPathCalculator();
        $criticalIds = $calc->recalculate($project);

        $this->assertContains($taskA->id, $criticalIds);
        $this->assertContains($taskB->id, $criticalIds);
        $this->assertContains($taskC->id, $criticalIds);
    }

    /**
     * Diamond A→B,A→C,B→D,C→D where B (8d) > C (3d).
     * Only A, B, D should be critical. C has 5 days of slack.
     */
    public function test_diamond_only_longest_branch_critical(): void {
        $user    = \App\Models\User::factory()->create();
        $project = \App\Models\Project::factory()->create(['user_id' => $user->id]);
        $section = \App\Models\Section::factory()->create(['project_id' => $project->id, 'type' => 'sprint']);

        $taskA = \App\Models\Task::factory()->create(['project_id' => $project->id, 'section_id' => $section->id, 'estimated_time' => 8]);   // 1 day
        $taskB = \App\Models\Task::factory()->create(['project_id' => $project->id, 'section_id' => $section->id, 'estimated_time' => 64]);  // 8 days
        $taskC = \App\Models\Task::factory()->create(['project_id' => $project->id, 'section_id' => $section->id, 'estimated_time' => 24]);  // 3 days
        $taskD = \App\Models\Task::factory()->create(['project_id' => $project->id, 'section_id' => $section->id, 'estimated_time' => 8]);   // 1 day

        \App\Models\TaskDependency::create(['task_id' => $taskB->id, 'depends_on_task_id' => $taskA->id, 'type' => 'finish_to_start']);
        \App\Models\TaskDependency::create(['task_id' => $taskC->id, 'depends_on_task_id' => $taskA->id, 'type' => 'finish_to_start']);
        \App\Models\TaskDependency::create(['task_id' => $taskD->id, 'depends_on_task_id' => $taskB->id, 'type' => 'finish_to_start']);
        \App\Models\TaskDependency::create(['task_id' => $taskD->id, 'depends_on_task_id' => $taskC->id, 'type' => 'finish_to_start']);

        $calc = new CriticalPathCalculator();
        $criticalIds = $calc->recalculate($project);

        $this->assertContains($taskA->id, $criticalIds, 'A (start) must be critical');
        $this->assertContains($taskB->id, $criticalIds, 'B (longest branch) must be critical');
        $this->assertNotContains($taskC->id, $criticalIds, 'C (short branch, 5d slack) must NOT be critical');
        $this->assertContains($taskD->id, $criticalIds, 'D (end) must be critical');
    }

    public function test_blocker_always_included_even_with_slack(): void {
        $user    = \App\Models\User::factory()->create();
        $project = \App\Models\Project::factory()->create(['user_id' => $user->id]);
        $section = \App\Models\Section::factory()->create(['project_id' => $project->id, 'type' => 'sprint']);

        // Standalone task with no deps but is_blocker = true
        $blocker = \App\Models\Task::factory()->create([
            'project_id' => $project->id,
            'section_id' => $section->id,
            'is_blocker'  => true,
            'estimated_time' => 8,
        ]);

        $calc = new CriticalPathCalculator();
        $criticalIds = $calc->recalculate($project);

        $this->assertContains($blocker->id, $criticalIds);
    }
}
