<?php
namespace Tests\Unit;

use App\Services\RiskMatrixCalculator;
use Tests\TestCase;

class RiskMatrixCalculatorTest extends TestCase {
    private RiskMatrixCalculator $calc;

    protected function setUp(): void {
        parent::setUp();
        $this->calc = new RiskMatrixCalculator();
    }

    public function test_cell_heat_high_prob_critical_impact_is_critical(): void {
        $this->assertEquals('critical', $this->calc->cellHeat('high', 'critical'));
    }

    public function test_cell_heat_low_prob_low_impact_is_low(): void {
        $this->assertEquals('low', $this->calc->cellHeat('low', 'low'));
    }

    public function test_cell_heat_medium_prob_high_impact_is_high(): void {
        $this->assertEquals('high', $this->calc->cellHeat('medium', 'high'));
    }

    public function test_cell_heat_high_prob_medium_impact_is_high(): void {
        $this->assertEquals('high', $this->calc->cellHeat('high', 'medium'));
    }
}
