<?php

namespace App\Console\Commands;

use App\Models\MethodologyTemplate;
use App\Models\Project;
use App\Models\Section;
use App\Models\Task;
use App\Models\TaskStep;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateToV2 extends Command
{
    protected $signature   = 'sinapsys:migrate-to-v2 {--dry-run : Simular sin cambios}';
    protected $description = 'Migra proyectos PMI al modelo v2.0 (Sections + TaskSteps normalizados)';

    private bool $dryRun = false;
    private array $stats  = [
        'projects'    => 0,
        'sections'    => 0,
        'tasks_linked' => 0,
        'steps'       => 0,
    ];

    public function handle(): int
    {
        $this->dryRun = $this->option('dry-run');

        if ($this->dryRun) {
            $this->warn('🔍 DRY RUN — no se realizarán cambios en la base de datos');
        }

        $this->info('SinapSYS Projects → Migración a v2.0');
        $this->newLine();

        DB::transaction(function () {
            $this->seedTemplates();
            $this->migrateProjects();
            $this->migrateTaskSteps();
            $this->verifyIntegrity();

            if ($this->dryRun) {
                throw new \RuntimeException('DRY_RUN_ABORT');
            }
        }, attempts: 1);

        $this->printStats();

        return Command::SUCCESS;
    }

    private function seedTemplates(): void
    {
        $this->line('→ Seeding methodology templates...');

        if (!$this->dryRun) {
            $this->call('db:seed', ['--class' => 'MethodologyTemplatesSeeder', '--no-interaction' => true]);
        }

        $this->line('  ✓ Templates: scrum, pmi, custom');
    }

    private function migrateProjects(): void
    {
        $pmiTemplate = MethodologyTemplate::where('slug', 'pmi')->first();

        if (!$pmiTemplate && !$this->dryRun) {
            $this->error('Template PMI no encontrado. Ejecuta el seeder primero.');
            return;
        }

        $pmiPhases = ['Inicio', 'Planificación', 'Ejecución', 'Monitoreo', 'Cierre'];

        $projects = Project::whereNull('methodology')
            ->orWhere('methodology', 'pmi')
            ->get();

        $this->line("→ Migrando {$projects->count()} proyectos PMI...");

        foreach ($projects as $project) {
            // Asignar template PMI
            if (!$this->dryRun) {
                $project->update([
                    'methodology'  => 'pmi',
                    'default_view' => 'list',
                    'template_id'  => $pmiTemplate?->id,
                ]);
            }

            // Crear sections si no existen
            if (!$this->dryRun && $project->sections()->count() === 0) {
                foreach ($pmiPhases as $i => $name) {
                    Section::create([
                        'project_id' => $project->id,
                        'name'       => $name,
                        'order'      => $i,
                        'status'     => $project->phase === $i ? 'active' : 'planned',
                    ]);
                    $this->stats['sections']++;
                }

                // Asignar tareas a la section "Ejecución" (índice 2) por defecto
                $execSection = $project->sections()->where('name', 'Ejecución')->first();
                if ($execSection) {
                    $count = $project->tasks()->whereNull('section_id')->count();
                    $project->tasks()->whereNull('section_id')->update(['section_id' => $execSection->id]);
                    $this->stats['tasks_linked'] += $count;
                }
            }

            $this->stats['projects']++;
        }

        $this->line("  ✓ {$this->stats['projects']} proyectos procesados");
    }

    private function migrateTaskSteps(): void
    {
        $this->line('→ Migrando steps JSON → task_steps tabla...');

        $tasks = Task::whereNotNull('steps')
            ->where('steps', '!=', '[]')
            ->where('steps', '!=', 'null')
            ->get();

        foreach ($tasks as $task) {
            $steps = $task->steps ?? [];
            if (empty($steps)) continue;

            if (!$this->dryRun && $task->taskSteps()->count() === 0) {
                foreach ($steps as $i => $step) {
                    TaskStep::create([
                        'task_id'     => $task->id,
                        'description' => $step['text'] ?? $step['description'] ?? 'Paso',
                        'done'        => (bool) ($step['done'] ?? false),
                        'order'       => $i,
                        'completed_at' => ($step['done'] ?? false) ? now() : null,
                    ]);
                    $this->stats['steps']++;
                }
            } else {
                $this->stats['steps'] += count($steps);
            }
        }

        $this->line("  ✓ {$this->stats['steps']} pasos migrados");
    }

    private function verifyIntegrity(): void
    {
        $this->line('→ Verificando integridad...');

        $projectsWithoutSections = Project::where('methodology', 'pmi')
            ->doesntHave('sections')
            ->count();

        if ($projectsWithoutSections > 0 && !$this->dryRun) {
            $this->warn("  ⚠ {$projectsWithoutSections} proyectos PMI sin secciones");
        } else {
            $this->line('  ✓ Integridad verificada');
        }
    }

    private function printStats(): void
    {
        $this->newLine();
        $this->table(
            ['Elemento', 'Cantidad'],
            [
                ['Proyectos migrados', $this->stats['projects']],
                ['Secciones creadas',  $this->stats['sections']],
                ['Tareas vinculadas',  $this->stats['tasks_linked']],
                ['Pasos migrados',     $this->stats['steps']],
            ]
        );
        $this->info('✅ Migración completada.');
    }
}
