<?php
namespace Tests\Unit;

use App\Models\Milestone;
use App\Models\Project;
use App\Services\MilestoneTracker;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MilestoneTrackerTest extends TestCase {
    use RefreshDatabase;

    private MilestoneTracker $tracker;

    protected function setUp(): void {
        parent::setUp();
        $this->tracker = new MilestoneTracker();
    }

    public function test_met_when_actual_date_set(): void {
        $milestone = new Milestone(['actual_date' => today(), 'target_date' => today()->addDays(5)]);
        $this->assertEquals('met', $this->tracker->evaluateStatus($milestone));
    }

    public function test_missed_when_past_target_date(): void {
        $milestone = new Milestone(['actual_date' => null, 'target_date' => today()->subDay()]);
        $this->assertEquals('missed', $this->tracker->evaluateStatus($milestone));
    }

    public function test_planned_when_no_blockers_and_far(): void {
        $milestone = new Milestone(['actual_date' => null, 'target_date' => today()->addDays(30)]);
        // No linked tasks = no blockers
        $milestone->setRelation('linkedTasks', collect());
        $this->assertEquals('planned', $this->tracker->evaluateStatus($milestone));
    }
}
