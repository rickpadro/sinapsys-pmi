<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Risk;

class RiskMatrixCalculator
{
    private const PROB_LEVELS   = ['low', 'medium', 'high'];
    private const IMPACT_LEVELS = ['low', 'medium', 'high', 'critical'];

    /**
     * Returns the full prob×impact matrix for open risks of a project,
     * plus summary metrics.
     */
    public function matrix(Project $project): array
    {
        $risks = $project->risks()
            ->where('status', 'open')
            ->with('mitigations.task')
            ->get();

        $matrix = [];
        foreach (self::PROB_LEVELS as $p) {
            foreach (self::IMPACT_LEVELS as $i) {
                $matrix[$p][$i] = $risks
                    ->where('probability', $p)
                    ->where('impact', $i)
                    ->values()
                    ->all();
            }
        }

        return [
            'matrix'               => $matrix,
            'critical_count'       => $risks->where('impact', 'critical')->where('probability', 'high')->count(),
            'open_total'           => $risks->count(),
            'with_mitigation_plan' => $risks->whereNotNull('mitigation_plan')->count(),
            'with_mitigation_tasks' => $risks->filter(fn($r) => $r->mitigations->isNotEmpty())->count(),
        ];
    }

    /**
     * Returns the heat level for a cell: 'critical', 'high', 'medium', 'low'.
     */
    public function cellHeat(string $probability, string $impact): string
    {
        $pMap = ['low' => 1, 'medium' => 2, 'high' => 3];
        $iMap = ['low' => 1, 'medium' => 2, 'high' => 3, 'critical' => 4];

        $score = ($pMap[$probability] ?? 1) * ($iMap[$impact] ?? 1);

        return match(true) {
            $score >= 9  => 'critical',
            $score >= 6  => 'high',
            $score >= 3  => 'medium',
            default      => 'low',
        };
    }

    /**
     * Top risks by score for the Overview widget.
     */
    public function topRisks(Project $project, int $limit = 5): \Illuminate\Support\Collection
    {
        return $project->risks()
            ->where('status', 'open')
            ->with(['mitigations.task', 'owner'])
            ->get()
            ->sortByDesc(fn($r) => $r->riskScore())
            ->take($limit)
            ->values();
    }
}
