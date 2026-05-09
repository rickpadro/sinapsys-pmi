<?php
namespace App\Console\Commands;

use App\Models\Project;
use App\Services\CriticalPathCalculator;
use Illuminate\Console\Command;

class RecalculateCriticalPath extends Command {
    protected $signature   = 'sinapsys:recalculate-critical-path {project? : ID o nombre del proyecto}';
    protected $description = 'Recalcula el critical path para uno o todos los proyectos';

    public function handle(CriticalPathCalculator $calc): int {
        $projectArg = $this->argument('project');

        if ($projectArg) {
            $project = is_numeric($projectArg)
                ? Project::findOrFail($projectArg)
                : Project::where('name', $projectArg)->firstOrFail();

            $criticalIds = $calc->recalculate($project);
            $this->info("✓ {$project->name}: {count($criticalIds)} tareas en critical path.");
            return Command::SUCCESS;
        }

        $projects = Project::all();
        $bar = $this->output->createProgressBar($projects->count());
        $bar->start();

        foreach ($projects as $project) {
            $calc->recalculate($project);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("✓ Critical path recalculado para {$projects->count()} proyectos.");
        return Command::SUCCESS;
    }
}
